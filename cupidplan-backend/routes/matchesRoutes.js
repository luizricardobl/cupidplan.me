const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/matches/:email
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allUsers = await User.find({ email: { $ne: email } });

    const matches = allUsers.map((user) => {
      const sharedHobbies = user.hobbies.filter(hobby =>
        currentUser.hobbies.includes(hobby)
      );

      const sharedDealbreakers = user.dealbreakers.filter(d =>
        currentUser.dealbreakers.includes(d)
      );

      const matchPercentage = Math.max(
        Math.round((sharedHobbies.length / (currentUser.hobbies.length || 1)) * 100) - sharedDealbreakers.length * 10,
        0
      );

      return {
        ...user.toObject(),
        matchPercentage,
      };
    });

    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
