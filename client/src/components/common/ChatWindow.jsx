import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { markChatNotificationsRead } from "../../services/notificationService";
import { Send, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const ChatWindow = ({ bookingId, onClose }) => {
  const { authUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Automatically scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark chat notifications read on load and dispatch sync event
  const clearChatNotifications = async () => {
    try {
      await markChatNotificationsRead(bookingId);
      // Dispatch custom window event so Navbar updates instantly
      window.dispatchEvent(
        new CustomEvent("notifications_read", { detail: { bookingId } })
      );
    } catch (err) {
      console.error("Failed to mark chat notifications as read:", err);
    }
  };

  useEffect(() => {
    if (!bookingId || !authUser) return;

    clearChatNotifications();

    // Setup socket connection
    const socket = io("http://localhost:8080");
    socketRef.current = socket;

    // Join room for this booking
    socket.emit("join_room", bookingId);

    // Listen for message history
    socket.on("message_history", (history) => {
      setMessages(history || []);
      setLoading(false);
    });

    // Listen for incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages if received via multiple events
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      // Clear notifications if we are actively viewing the chat
      clearChatNotifications();
    });

    socket.on("chat_error", (err) => {
      console.error("Socket chat error:", err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId, authUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socketRef.current) return;

    const messageData = {
      booking: bookingId,
      sender: authUser.role,
      senderId: authUser._id,
      text: messageText.trim(),
    };

    // Emit send_message event to room
    socketRef.current.emit("send_message", messageData);
    setMessageText("");
  };

  return (
    <div className="glass rounded-[2.5rem] p-4 border border-white/60 shadow-xl bg-white/70 backdrop-blur-xl flex flex-col h-[550px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-600 animate-pulse" />
              Live Chat
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Secure Consultation Channel
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xs font-semibold uppercase tracking-widest">Loading history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
              <MessageCircle size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">No Messages Yet</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Start the conversation! Introduce yourself or discuss specific details about the booking.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?.toString() === authUser._id.toString();
            return (
              <div
                key={msg._id || Math.random()}
                className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm leading-relaxed break-words w-full",
                    isMe
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-100"
                      : "bg-white border border-slate-150 text-slate-800 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 px-1">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-200/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-white/50 border border-slate-200 rounded-full pl-6 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all shadow-md shadow-blue-100 flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
