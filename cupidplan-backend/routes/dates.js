const express = require('express');
const router = express.Router();
const { generateDateIdea } = require('../../shared/aiService');

// Generate a date idea
router.post('/generate', async (req, res) => {
  const { preferences } = req.body;

  try {
    const dateIdea = await generateDateIdea(preferences);
    res.status(200).json({ message: 'Date idea generated successfully!', dateIdea });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;