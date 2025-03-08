const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this for ObjectId validation
const User = require('../models/User');

// Get matches for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Console log current user preferences
    console.log('Current user preferences:', currentUser.preferences);

    // Construct match query
    const matchQuery = {
      _id: { $ne: userId }, // Exclude the current user
      'preferences.activities': { $in: currentUser.preferences.activities },
      'preferences.food': { $in: currentUser.preferences.food },
      
    };

    // Log the match query for debugging
    console.log('Match query:', matchQuery);

    // Find users with similar preferences
    const matches = await User.find(matchQuery);
    res.status(200).json({ message: 'Matches retrieved successfully!', matches });
  } catch (error) {
    console.error('Error retrieving matches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
