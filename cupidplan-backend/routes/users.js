const express = require('express');
const router = express.Router();
const User = require('../models/User');

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password, preferences } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ name, email, password, preferences });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;