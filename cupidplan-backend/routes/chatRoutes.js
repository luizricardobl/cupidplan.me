const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");

// ✅ Create or Get Existing Chat Between Two Users
router.post("/start", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if a chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If not, create new chat
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ success: false, message: "Error starting chat" });
  }
});

// ✅ Send a Message
router.post("/send", async (req, res) => {
  const { chatId, senderId, text } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    chat.messages.push({
      sender: senderId,
      text,
    });

    await chat.save();
    res.status(200).json({ success: true, message: "Message sent", chat });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
});

// ✅ Get Messages for a Chat
router.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate("messages.sender", "name email");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
});

module.exports = router;
