// routes/dateIdeaRoutes.js
const express = require("express");
const router = express.Router();
const { generateGuestDateIdea } = require("../shared/guestDateService"); // ✅ NEW service for guest page

router.post("/", async (req, res) => {
  const {
    gender,
    setting,
    occasion,
    timing,
    vibe = [],
    activities = [],
    city,
    preferences = "",
    budget,
  } = req.body;

  console.log("🎯 Received Guest Date Generator input:", req.body);

  const guestPreferences = {
    gender,
    setting,
    occasion,
    timing,
    vibe,
    activities,
    city,
    preferences,
    budget,
  };

  try {
    const idea = await generateGuestDateIdea(guestPreferences);
    res.json({ success: true, idea });
  } catch (error) {
    console.error("💥 Failed to generate guest date idea:", error);
    res.status(500).json({ success: false, message: "AI date generation failed." });
  }
});

module.exports = router;

