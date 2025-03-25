const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");

// ✅ GET chat history between two users (by email)
router.get("/history/:senderEmail/:receiverEmail", async (req, res) => {
  const { senderEmail, receiverEmail } = req.params;

  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const chat = await Chat.findOne({
      participants: { $all: [sender._id, receiver._id] },
    }).populate("messages.sender", "email");

    if (!chat) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = chat.messages.map((msg) => ({
      sender: msg.sender.email,
      message: msg.text,
      timestamp: msg.timestamp,
    }));

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
