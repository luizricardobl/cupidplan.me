const express = require("express");
const router = express.Router();
const SharedDate = require("../models/SharedDate");
const User = require("../models/User");

// Save new shared date
router.post("/create", async (req, res) => {
  const { senderEmail, receiverEmail, message } = req.body;

  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "Users not found" });
    }

    const newDate = await SharedDate.create({
      participants: [sender._id, receiver._id],
      message,
      sender: sender._id,
      message
    });

    res.status(200).json({ success: true, sharedDate: newDate });
  } catch (err) {
    console.error("❌ Error creating shared date:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch shared dates for user
router.get("/for/:email", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const dates = await SharedDate.find({ participants: user._id })
      .populate("participants", "name email")
      .populate("sender", "name email") // 🟢 Include the sender
      .sort({ createdAt: -1 });

  
      const formattedDates = dates.map((d) => {
        return {
          message: d.message,
          senderEmail: d.sender?.email || "Unknown",
          senderName: d.sender?.name || "Unknown",
          isFromCurrentUser: d.sender?.email === req.params.email,
          createdAt: d.createdAt,
        };
      });
      
  
      res.status(200).json({ success: true, dates: formattedDates });
    } catch (err) {
      console.error("❌ Failed to fetch shared dates:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  

module.exports = router;
