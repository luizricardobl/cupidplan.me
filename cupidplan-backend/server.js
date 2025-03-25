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
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('All modules loaded successfully.');

// ✅ Initialize Express and HTTP server for Socket.IO
const app = express();
const http = require("http");
const server = http.createServer(app);

// ✅ Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

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

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const dateRoutes = require("./routes/dates");
const matchRoutes = require("./routes/matchesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/dates", dateRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat", chatHistoryRoutes);

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

// ✅ Socket.IO real-time chat
const ChatModel = require("./models/Chat");
const User = require("./models/User");

io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🟢 User ${socket.id} joined room: ${room}`);

    socket.on("typing", ({ room, sender }) => {
      socket.to(room).emit("partnerTyping", { sender, room });
    });
  });

  socket.on("sendMessage", async ({ room, sender, receiver, message }) => {
    const timestamp = new Date().toISOString();

    console.log(`📨 ${sender}: ${message} (room: ${room})`);

    // Emit message to other participants
    io.to(room).emit("receiveMessage", {
      sender,
      receiver,
      message,
      timestamp,
    });

    // Save message in DB using ObjectId references
    try {
      const senderUser = await User.findOne({ email: sender });
      const receiverUser = await User.findOne({ email: receiver });

      if (!senderUser || !receiverUser) {
        console.log("❌ Sender or receiver not found.");
        return;
      }

      const existingChat = await ChatModel.findOne({
        participants: { $all: [senderUser._id, receiverUser._id] },
      });

      if (existingChat) {
        existingChat.messages.push({
          sender: senderUser._id,
          text: message,
          timestamp,
        });
        await existingChat.save();
      } else {
        const newChat = new ChatModel({
          participants: [senderUser._id, receiverUser._id],
          messages: [
            {
              sender: senderUser._id,
              text: message,
              timestamp,
            },
          ],
        });
        await newChat.save();
      }

      console.log("✅ Message saved to DB");
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
});
