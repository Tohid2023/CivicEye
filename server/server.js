const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");
const Message = require("./models/Message");
const Booking = require("./models/Booking");
const Notification = require("./models/Notification");

dotenv.config();

// Connect database
connectDB();

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Setup socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Expose io to routes/controllers
app.set("io", io);

// Helper function to handle chat notifications
const handleChatNotification = async (newMessage, data) => {
  try {
    const booking = await Booking.findById(newMessage.booking)
      .populate("user")
      .populate("helper");

    if (!booking) {
      console.warn(`[Socket] Booking not found for notification: ${newMessage.booking}`);
      return;
    }

    let recipient = null;
    let recipientModel = "";
    let senderModel = "";

    // Determine recipient and sender models based on senderId
    if (newMessage.senderId) {
      if (booking.user._id.toString() === newMessage.senderId.toString()) {
        recipient = booking.helper._id;
        recipientModel = "Helper";
        senderModel = "User";
      } else if (booking.helper._id.toString() === newMessage.senderId.toString()) {
        recipient = booking.user._id;
        recipientModel = "User";
        senderModel = "Helper";
      }
    } else {
      // Fallback role checking
      if (data.sender === "user" || data.sender === "citizen") {
        recipient = booking.helper._id;
        recipientModel = "Helper";
        senderModel = "User";
      } else {
        recipient = booking.user._id;
        recipientModel = "User";
        senderModel = "Helper";
      }
    }

    if (recipient) {
      const senderName = senderModel === "User" ? booking.user.fullName : booking.helper.fullName;
      
      const notification = await Notification.create({
        recipient,
        recipientModel,
        sender: newMessage.senderId || null,
        senderModel: senderModel || null,
        booking: booking._id,
        type: "chat",
        title: "New Message",
        message: `New message from ${senderName}: "${newMessage.text}"`,
        isRead: false,
      });

      // Emit real-time notification to recipient's room
      io.to(recipient.toString()).emit("notification", notification);
      console.info(`[Socket] Chat notification sent to ${recipientModel} ${recipient}`);
    }
  } catch (err) {
    console.error(`[Socket] Error generating chat notification: ${err.message}`);
  }
};

io.on("connection", (socket) => {
  console.info(`[Socket] Client connected: ${socket.id}`);

  // Join User room for notifications
  socket.on("join_user", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.info(`[Socket] Client ${socket.id} joined personal room for user: ${userId}`);
    }
  });

  // Join Room event
  socket.on("join_room", async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error("bookingId is required to join a room");
      }
      socket.join(bookingId.toString());
      console.info(`[Socket] Client ${socket.id} joined room for booking: ${bookingId}`);

      // Fetch and emit message history for this booking so they are retrievable after page refresh
      const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 1 });
      socket.emit("message_history", messages);
    } catch (err) {
      console.error(`[Socket] Error joining room: ${err.message}`);
      socket.emit("chat_error", { error: err.message });
    }
  });

  // Support both "join_room" and "join" events to be compatible
  socket.on("join", async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error("bookingId is required to join a room");
      }
      socket.join(bookingId.toString());
      console.info(`[Socket] Client ${socket.id} joined (via join event) room for booking: ${bookingId}`);

      // Fetch and emit message history for this booking so they are retrievable after page refresh
      const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 1 });
      socket.emit("message_history", messages);
    } catch (err) {
      console.error(`[Socket] Error in join event: ${err.message}`);
      socket.emit("chat_error", { error: err.message });
    }
  });

  // Message Handler event
  socket.on("send_message", async (data) => {
    try {
      const bookingRef = data.booking || data.bookingId;
      if (!bookingRef) {
        throw new Error("Validation failed: booking or bookingId is required");
      }

      const messageObj = {
        booking: bookingRef,
        sender: data.sender,
        senderId: data.senderId || null,
        text: data.text || data.message || data.content,
      };

      const newMessage = new Message(messageObj);
      await newMessage.save();

      console.info(`[Socket] Message saved successfully for booking ${bookingRef}`);

      // Emit instantly to both sender and receiver in the room
      io.to(bookingRef.toString()).emit("receive_message", newMessage);
      io.to(bookingRef.toString()).emit("message", newMessage);

      // Create notification and emit to recipient
      await handleChatNotification(newMessage, data);
    } catch (err) {
      console.error(`[Socket] Message handler failed: ${err.message}`);
      if (err.name === "ValidationError") {
        console.error(`[Socket] Mongoose ValidationError details:`, err.errors);
      }
      socket.emit("chat_error", { error: err.message });
    }
  });

  // Support "sendMessage" event name as well
  socket.on("sendMessage", async (data) => {
    try {
      const bookingRef = data.booking || data.bookingId;
      if (!bookingRef) {
        throw new Error("Validation failed: booking or bookingId is required");
      }

      const messageObj = {
        booking: bookingRef,
        sender: data.sender,
        senderId: data.senderId || null,
        text: data.text || data.message || data.content,
      };

      const newMessage = new Message(messageObj);
      await newMessage.save();

      console.info(`[Socket] Message (via sendMessage) saved successfully for booking ${bookingRef}`);

      io.to(bookingRef.toString()).emit("receive_message", newMessage);
      io.to(bookingRef.toString()).emit("message", newMessage);

      // Create notification and emit to recipient
      await handleChatNotification(newMessage, data);
    } catch (err) {
      console.error(`[Socket] sendMessage handler failed: ${err.message}`);
      if (err.name === "ValidationError") {
        console.error(`[Socket] Mongoose ValidationError details:`, err.errors);
      }
      socket.emit("chat_error", { error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.info(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});