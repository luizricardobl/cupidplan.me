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
        favoriteFood: user.favoriteFood,
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

// GET /api/user/by-email/:email
// ✅ Fixed: /api/user/by-email/:email
router.get("/by-email/:email", async (req, res) => {
  try {
    const user = await User.findOne(
      { email: req.params.email },
      "name email hobbies favoriteFood location profilePicUrl"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user, // ✅ Now includes name, email, etc.
    });
  } catch (err) {
    console.error("❌ Error fetching user by email:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// PUT /api/user/preferences
router.put("/preferences", authenticate, async (req, res) => {
    try {
      const { minAge, maxAge, distance, types, hobbies, foodPreferences, dealbreakers } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          minAge,
          maxAge,
          distance,
          types,
          hobbies,
          foodPreferences,
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
  
  // ✅ Fixed: /api/user/by-email/:email
router.get("/by-email/:email", async (req, res) => {
  try {
    const user = await User.findOne(
      { email: req.params.email },
      "name email hobbies favoriteFood location profilePicUrl"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user, // ✅ Now includes name, email, etc.
    });
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

// ✅ Get photo album by email
router.get("/album/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, album: user.album || [] });
  } catch (err) {
    console.error("❌ Failed to fetch album:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Update name and location
router.put("/update-basic-info", authenticate, async (req, res) => {
  try {
    const { name, location } = req.body;
    const user = await User.findById(req.user.id);
    const io = req.app.get("io");

    if (name) user.name = name;
    if (location) user.location = location;

    await user.save();
    io.emit("userInfoUpdated", {
      email: user.email,
      name: user.name,
      location: user.location,
    });
    
    res.status(200).json({ success: true, message: "Basic info updated" });
  } catch (err) {
    console.error("❌ Failed to update basic info:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get user by email (for feedback, profile, etc.)
router.get("/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error getting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




module.exports = router;

