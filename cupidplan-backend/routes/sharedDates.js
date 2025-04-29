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
// 📁 Grouped fetch: Shared dates grouped by chat partner
router.get("/for/:email", async (req, res) => {
    try {
      const currentUser = await User.findOne({ email: req.params.email });
      if (!currentUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const dates = await SharedDate.find({ participants: currentUser._id })
        .populate("participants", "name email")
        .populate("sender", "name email")
        .sort({ createdAt: -1 });
  
      
      const groupedDates = {};
  
      for (const d of dates) {
        const otherUser = d.participants.find((p) => p.email !== req.params.email);
        const otherKey = otherUser?.email || "Unknown";
        const otherName = otherUser?.name || "Unknown";
      
        if (!groupedDates[otherKey]) {
          groupedDates[otherKey] = {
            partnerName: otherName,
            partnerEmail: otherKey,
            dates: [],
          };
        }
      
        groupedDates[otherKey].dates.push({
          _id: d._id, 
          message: d.message,
          createdAt: d.createdAt,
          isFromCurrentUser: d.sender.email === req.params.email,
        });
      }
      
  
      res.status(200).json({ success: true, grouped: Object.values(groupedDates) });
    } catch (err) {
      console.error("❌ Failed to group shared dates:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  // DELETE /api/shared-dates/delete/:id
router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await SharedDate.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Date not found." });
      }
      res.json({ success: true, message: "Date deleted." });
    } catch (err) {
      console.error("❌ Error deleting shared date:", err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  });
  

module.exports = router;

