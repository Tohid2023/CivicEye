const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");
const Message = require("./models/Message");

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

io.on("connection", (socket) => {
  console.info(`[Socket] Client connected: ${socket.id}`);

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
      // The schema expects "booking", but the handler might receive "bookingId" or "booking"
      const bookingRef = data.booking || data.bookingId;
      if (!bookingRef) {
        throw new Error("Validation failed: booking or bookingId is required");
      }

      // Map incoming fields safely to schema fields
      const messageObj = {
        booking: bookingRef,
        sender: data.sender,
        senderId: data.senderId || null,
        text: data.text || data.message || data.content,
      };

      // Create message inside try/catch block
      const newMessage = new Message(messageObj);
      await newMessage.save();

      console.info(`[Socket] Message saved successfully for booking ${bookingRef}`);

      // Emit instantly to both sender and receiver in the room
      io.to(bookingRef.toString()).emit("receive_message", newMessage);
      
      // Also emit to alternative event names just in case
      io.to(bookingRef.toString()).emit("message", newMessage);
    } catch (err) {
      // Return meaningful error logs if validation fails
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