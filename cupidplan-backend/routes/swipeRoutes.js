const express = require("express");
const router = express.Router();
const Swipe = require("../models/Swipe");
const User = require("../models/User");
//const Match = require("../models/Match"); // Optional: if you track matched pairs

// ✅ POST /api/swipes/like
router.post("/like", async (req, res) => {
  const { swiperEmail, swipeeEmail } = req.body;

  if (!swiperEmail || !swipeeEmail) {
    return res.status(400).json({ success: false, message: "Missing emails" });
  }

  try {
    // Save the right swipe
    await Swipe.create({ swiperEmail, swipeeEmail, direction: "right" });

    // Check if it's a mutual right swipe
    const mutual = await Swipe.findOne({
      swiperEmail: swipeeEmail,
      swipeeEmail: swiperEmail,
      direction: "right",
    });

    if (mutual) {
      // You can create a Match model if needed
      // Optional: create mutual match record
      // await Match.create({ users: [swiperEmail, swipeeEmail], createdAt: Date.now() });

      return res.status(200).json({ success: true, matched: true });
    }

    res.status(200).json({ success: true, matched: false });
  } catch (err) {
    console.error("Error in swipe like:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST /api/swipes/pass
router.post("/pass", async (req, res) => {
  const { swiperEmail, swipeeEmail } = req.body;

  if (!swiperEmail || !swipeeEmail) {
    return res.status(400).json({ success: false, message: "Missing emails" });
  }

  try {
    await Swipe.create({ swiperEmail, swipeeEmail, direction: "left" });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in swipe pass:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
