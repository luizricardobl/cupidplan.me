const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const authenticateUser = require('../middleware/auth');

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
      _id: msg._id, 
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

// ✅ DELETE message by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.updateOne(
      { "messages._id": id },
      { $pull: { messages: { _id: id } } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false });
  }
});
// ✅ CORRECT EXPORT
router.get("/unread", authenticateUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!currentUser.chatNotifications) {
      return res.status(200).json({ showNotification: false });
    }

    const chats = await Chat.find({ participants: currentUser._id }).populate("messages.sender participants");

    const unreadSenders = [];

    for (const chat of chats) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      
      if (
        lastMsg &&
        lastMsg.sender &&
        lastMsg.sender._id &&
        String(lastMsg.sender._id) !== String(currentUser._id)
      ) {
        const sender = chat.participants.find(p => String(p._id) === String(lastMsg.sender._id));
        if (sender && !unreadSenders.some(s => String(s._id) === String(sender._id))) {
          unreadSenders.push({ _id: sender._id, name: sender.name, email: sender.email });
        }
      }
    }
    

    return res.status(200).json({ showNotification: true, senders: unreadSenders });
  } catch (err) {
    console.error("❌ Error in unread route:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

