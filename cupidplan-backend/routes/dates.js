const express = require('express');
const router = express.Router();
const { generateDateIdea } = require('../shared/aiService');
const User = require('../models/User'); // Make sure this path matches your project structure

// Generate a date idea
router.post('/generate', async (req, res) => {
  const { preferences, userEmail } = req.body;

  try {
    // Step 1: Fetch user to get their city/location
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const city = user.location || "your city";

    // Step 2: Inject user's city into preferences
    const enhancedPreferences = {
      ...preferences,
      location: city
    };

    // Step 3: Generate the date idea with city-aware preferences
    const dateIdea = await generateDateIdea(enhancedPreferences);
    res.status(200).json({ message: 'Date idea generated successfully!', dateIdea });
  } catch (error) {
    console.error('Server error while generating date idea:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

