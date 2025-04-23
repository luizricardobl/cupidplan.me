// routes/dateIdeaRoutes.js
const express = require("express");
const router = express.Router();
const { generateDateIdea } = require("../shared/aiService");


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

  console.log("🎯 Received AI Date Generator input:", req.body);

  // ✅ Format input to match what aiService.js expects
  const aiPreferences = {
    location: city,
    hobbies: [...activities, ...vibe],
    favoriteFood: [], // Optional: you can add this later via form
    relationshipStage: "dating", // Optional: can make this user-selectable later
    budget: budget || "moderate",
    dateFrequency: "occasional", // Optional default
    specialOccasion: occasion || false,
    preferences, // Free-form user notes (e.g. vegan, accessibility, etc.)
  };

  try {
    const idea = await generateDateIdea(aiPreferences);
    res.json({ success: true, idea });
  } catch (error) {
    console.error("❌ Failed to generate AI date idea:", error);
    res.status(500).json({ success: false, message: "AI generation failed." });
  }
});

module.exports = router;
