const express = require('express');
const router = express.Router();
const User = require('../models/User'); // or correct path
const authenticate = require('../middleware/auth'); // assuming you use JWT

// GET /api/user/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
        name: user.name,
        email: user.email,
        dob: user.dob,
        location: user.location,
        aboutMe: user.aboutMe,
        profilePicUrl: user.profilePicUrl,
        hobbies: user.hobbies,
        dealbreakers: user.dealbreakers,
        minAge: user.minAge,
        maxAge: user.maxAge,
        distance: user.distance,
        types: user.types,
        hideProfile: user.hideProfile,           
        chatNotifications: user.chatNotifications, 
      });
      
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
  
  // PUT /api/user/settings/toggles
router.put("/settings/toggles", authenticate, async (req, res) => {
    const { hideProfile, chatNotifications } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          ...(hideProfile !== undefined && { hideProfile }),
          ...(chatNotifications !== undefined && { chatNotifications }),
        },
        { new: true }
      );
  
      res.json({
        message: "Settings updated",
        hideProfile: user.hideProfile,
        chatNotifications: user.chatNotifications,
      });
    } catch (err) {
      console.error("Error updating toggle settings:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get("/by-email/:email", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      return res.json({ success: true, name: user.name });
    } catch (err) {
      console.error("❌ Error fetching user by email:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ✅ Get last seen timestamp for a user
router.get("/last-seen/:email", (req, res) => {
  const email = req.params.email;

  if (global.lastSeenMap && global.lastSeenMap[email]) {
    return res.json({ success: true, lastSeen: global.lastSeenMap[email] });
  } else {
    return res.json({ success: false, message: "No last seen recorded" });
  }
});

module.exports = router;
