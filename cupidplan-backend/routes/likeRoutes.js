const express = require("express");
const authenticate = require("../middleware/auth");
const Like = require("../models/Like");

const router = express.Router();

// POST: Like a user
router.post("/", authenticate, async (req, res) => {
  const { receiverId } = req.body;

  try {
    const existingLike = await Like.findOne({
      sender: req.user.id,
      receiver: receiverId,
    });

    if (existingLike) {
      return res.status(400).json({ message: "You already liked this user." });
    }

    const newLike = new Like({
      sender: req.user.id,
      receiver: receiverId,
    });

    await newLike.save();
    res.status(201).json({ message: "User liked!" });
  } catch (err) {
    console.error("Error liking user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get likes received in the past 7 days


router.get("/received/count", authenticate, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await Like.countDocuments({
      receiver: req.user.id,
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({ count });
  } catch (error) {
    console.error("Failed to get like count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

