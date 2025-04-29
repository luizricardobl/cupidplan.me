// Debugging logs
console.log('Loading express...');
const express = require('express');

console.log('Loading mongoose...');
const mongoose = require('mongoose');

console.log('Loading cors...');
const cors = require('cors');

console.log('Loading dotenv...');
require('dotenv').config();

console.log('Loading nodemailer...');
const nodemailer = require('nodemailer');

console.log('Loading socket.io and HTTP...');
const http = require('http');
const { Server } = require('socket.io');

console.log('Loading sendgrid...');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Load routes (no functional changes, just organized better)
console.log('Loading routes...');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoute = require('./routes/uploadRoute');
const swipeRoutes = require('./routes/swipeRoutes');
const likeRoutes = require('./routes/likeRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatHistoryRoutes = require('./routes/chatHistoryRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
const datesRoutes = require('./routes/dates');
const sharedDatesRoutes = require('./routes/sharedDates');
const dateIdeaRoutes = require('./routes/dateIdeaRoutes');

// ✅ Load models (needed for WebSocket functionality)
console.log('Loading models...');
const ChatModel = require('./models/Chat');
const User = require('./models/User');

// ✅ Set up global variables
console.log('Setting global variables...');
global.lastSeenMap = {}; 
const onlineUsers = {};

console.log('All modules loaded successfully.');


// ✅ Initialize Express and HTTP server for Socket.IO
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});
app.set("io", io); 


// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/likes", require("./routes/likeRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/swipes", swipeRoutes);


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Store OTPs in memory
const otpStorage = {}; // { email: otp }

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});


// ✅ Proper API route mounting
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/likes", likeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat-history", chatHistoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/dates", datesRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/date-generator", dateIdeaRoutes);
app.use("/api/shared-dates", sharedDatesRoutes);


// ✅ OTP Verification Route
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  console.log(`Verifying OTP for ${email}: ${otp}`);

  if (otpStorage[email] && otpStorage[email] == otp) {
    delete otpStorage[email];
    return res.json({ success: true, message: "OTP verified successfully!" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});


io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);
  socket.on("userOnline", (email) => {
    if (email) {
      onlineUsers[email] = socket.id;
      delete lastSeenMap[email]; 
      console.log(`✅ ${email} is now online`);
      io.emit("updateOnlineStatus", onlineUsers); // Broadcast to all
    }
  });
  

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🟢 User ${socket.id} joined room: ${room}`);
  
    const [userA, userB] = room.split("_");
    const viewerEmail = socket.handshake.query.email;
  
    const notifySender = userA === viewerEmail ? userB : userA;
  
    // Notify sender in room that their message has been seen
    io.to(room).emit("messageSeen", {
      viewer: viewerEmail,
      sender: notifySender,
      room,
    });
  });
  
  
  socket.on("profileVisibilityChanged", ({ email, hidden }) => {
    console.log(`👤 Profile visibility changed for ${email}: ${hidden ? "HIDDEN" : "VISIBLE"}`);
    
    socket.broadcast.emit("profileVisibilityChanged", { email, hidden });
  });
  socket.on("chatNotificationsToggled", ({ email, enabled }) => {
    console.log(`🔔 Chat notifications for ${email}: ${enabled ? "ON" : "OFF"}`);
    socket.broadcast.emit("chatNotificationsToggled", { email, enabled });
  });
  
  socket.on("typing", ({ room, sender }) => {
    socket.to(room).emit("partnerTyping", { sender, room });
  });

  socket.on("deleteMessage", ({ messageId, room }) => {
    socket.to(room).emit("messageDeleted", { messageId });
    console.log(`🗑️ Message ${messageId} deleted in room: ${room}`);
  });

  socket.on("sendMessage", async ({ room, sender, receiver, message }) => {
    const timestamp = new Date().toISOString();

    try {
      const senderUser = await User.findOne({ email: sender });
      const receiverUser = await User.findOne({ email: receiver });

      if (!senderUser || !receiverUser) {
        console.log("❌ Sender or receiver not found.");
        return;
      }

      let chat = await ChatModel.findOne({
        participants: { $all: [senderUser._id, receiverUser._id] },
      });

      const newMessage = {
        sender: senderUser._id,
        text: message,
        timestamp,
        
      };

      if (chat) {
        chat.messages.push(newMessage);
      } else {
        chat = new ChatModel({
          participants: [senderUser._id, receiverUser._id],
          messages: [newMessage],
        });
      }

      await chat.save();

      const savedMessage = chat.messages[chat.messages.length - 1];

      const enrichedMessage = {
        _id: savedMessage._id,
        sender,
        receiver,
        message: savedMessage.text,
        timestamp: savedMessage.timestamp,
      };

      io.to(room).emit("receiveMessage", enrichedMessage);
      // 🔔 Notify Profile page listeners if receiver has chat notifications enabled
if (receiverUser.chatNotifications) {
  io.emit("newChatNotification", {
    name: senderUser.name,
    email: receiver,
    senderEmail: sender,
  });
}

      console.log("✅ Message saved & emitted:", enrichedMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  
    // Remove user from online list
    for (const email in onlineUsers) {
      if (onlineUsers[email] === socket.id) {
        console.log(`🔴 ${email} went offline`);
        delete onlineUsers[email];
        lastSeenMap[email] = new Date().toISOString(); // ✅ Save last seen timestamp
        break;
      }
    }
    
  
    io.emit("updateOnlineStatus", onlineUsers); 
  });
  
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
});
