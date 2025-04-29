const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Swipe = require("../models/Swipe");

// 🔧 Helper: Calculate distance-based score (0-100)
const calculateDistanceScore = (current, other) => {
  if (!current || !other || !current.coordinates || !other.coordinates) return 0;

  const [lon1, lat1] = current.coordinates;
  const [lon2, lat2] = other.coordinates;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Convert distance to a score: closer = higher
  return Math.max(100 - distance, 0); // Cap at 0 for long distances
};
router.get("/recent/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const allUsers = await User.find({
      _id: { $ne: user._id },
      "hideProfile": false,
    });

    const uniqueMatches = [];
    const seenEmails = new Set();

    for (const otherUser of allUsers) {
      const shared = (otherUser.hobbies || []).filter((h) =>
        (user.hobbies || []).map(h => h.toLowerCase()).includes(h.toLowerCase())
      );
      

      //if (shared.length > 0 && !seenEmails.has(otherUser.email)) {//
      if (!seenEmails.has(otherUser.email)) {
        uniqueMatches.push({
          name: otherUser.name,
          email: otherUser.email,
          profilePicUrl: otherUser.profilePicUrl,
          sharedHobbies: shared,
        });
        seenEmails.add(otherUser.email);
      }

      if (uniqueMatches.length >= 20) break; 
    }

    res.json({ success: true, recentMatches: uniqueMatches });
  } catch (err) {
    console.error("❌ Error fetching recent matches:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// GET /api/matches/:email
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allUsers = await User.find({
      email: { $ne: email },
      $or: [{ hideProfile: { $exists: false } }, { hideProfile: false }]
    });
    
    const matches = allUsers.map((user) => {
      const sharedHobbies = user.hobbies.filter(hobby =>
        currentUser.hobbies.includes(hobby)
      );

      const sharedDealbreakers = user.dealbreakers.filter(d =>
        currentUser.dealbreakers.includes(d)
      );
      const dealbreakerPenalty = sharedDealbreakers.length * 10;

      const sharedTypes = Object.entries(currentUser.types).filter(
        ([key, value]) => value && user.types && user.types[key]
      ).length;

      const typeScore = sharedTypes * 20;

      const hobbyScore = (sharedHobbies.length / (currentUser.hobbies.length || 1)) * 100;
      

      // ✅ Add location score only if both users have geoLocation
      let locationScore = 0;
      if (currentUser.geoLocation && user.geoLocation) {
        locationScore = calculateDistanceScore(currentUser.geoLocation, user.geoLocation);
      }

      // ✅ Final weighted match score
      const matchPercentage = Math.max(
        Math.round(
          0.4 * typeScore +   // more weight on shared types
          0.35 * hobbyScore + // more weight on shared hobbies
          0.15 * locationScore - 
          dealbreakerPenalty  // heavier penalty now
        ),
        0
      );
     
      return {
        ...user.toObject(),
        matchPercentage,
      };
    });

    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔍 GET /api/matches/discover/:email
router.get("/discover/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Get users already swiped on (left or right)
    const swipes = await Swipe.find({ swiperEmail: email });
    const swipedEmails = swipes.map((s) => s.swipeeEmail);

    // ✅ Filter out users already swiped and self
    const allUsers = await User.find({
      email: { $ne: email, $nin: swipedEmails },
      $or: [{ hideProfile: { $exists: false } }, { hideProfile: false }]
    });

    // ✅ Match logic (like your current /:email route but simplified)
    const matches = allUsers.map((user) => {
      const sharedHobbies = (user.hobbies || []).filter((hobby) =>
        (currentUser.hobbies || []).includes(hobby)
      );

      const sharedDealbreakers = (user.dealbreakers || []).filter((d) =>
        (currentUser.dealbreakers || []).includes(d)
      );
      const dealbreakerPenalty = sharedDealbreakers.length * 10;

      const sharedTypes = Object.entries(currentUser.types || {}).filter(
        ([key, value]) => value && user.types && user.types[key]
      ).length;

      const typeScore = sharedTypes * 20;

      const hobbyScore = (sharedHobbies.length / (currentUser.hobbies?.length || 1)) * 100;

      let locationScore = 0;
      if (currentUser.geoLocation && user.geoLocation) {
        locationScore = calculateDistanceScore(currentUser.geoLocation, user.geoLocation);
      }

      const matchPercentage = Math.max(
        Math.round(
          0.4 * typeScore +
          0.35 * hobbyScore +
          0.15 * locationScore -
          dealbreakerPenalty
        ),
        0
      );

      return {
        ...user.toObject(),
        matchPercentage,
      };
    });

    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("❌ Error in /discover route:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ GET /api/matches/confirmed/:email
router.get("/confirmed/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const rightSwipes = await Swipe.find({ swiperEmail: email, direction: "right" });

    const mutualMatches = [];

    for (const swipe of rightSwipes) {
      const matchBack = await Swipe.findOne({
        swiperEmail: swipe.swipeeEmail,
        swipeeEmail: email,
        direction: "right",
      });

      if (matchBack) {
        const matchedUser = await User.findOne({ email: swipe.swipeeEmail });
        if (matchedUser && (!matchedUser.hideProfile || matchedUser.hideProfile === false)) {
          mutualMatches.push(matchedUser);
        }
      }
    }

    res.status(200).json({ success: true, matches: mutualMatches });
  } catch (err) {
    console.error("Error fetching confirmed matches:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

