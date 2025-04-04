const express = require('express');
const router = express.Router();
const User = require('../models/User'); // or correct path
const authenticate = require('../middleware/auth'); // assuming you use JWT

// GET /api/user/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// PUT /api/user/preferences
router.put("/preferences", authenticate, async (req, res) => {
    try {
      const { minAge, maxAge, distance, types, hobbies, dealbreakers } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          minAge,
          maxAge,
          distance,
          types,
          hobbies,
          dealbreakers, // ✅ make sure this is here!
        },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Preferences updated",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating preferences:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  router.put("/about-me", authenticate, async (req, res) => {
    try {
      const { aboutMe } = req.body;
      const User = require("../models/User");
  
      await User.findByIdAndUpdate(req.user.id, { aboutMe });
  
      res.status(200).json({ success: true, message: "About Me updated!" });
    } catch (err) {
      console.error("❌ Failed to update About Me:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  
  
module.exports = router;
