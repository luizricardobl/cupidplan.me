const express = require('express');
const { generateDateIdea } = require('../services/aiService');
const router = express.Router();

router.post('/generate-date-idea', async (req, res) => {
    const preferences = req.body;
    try {
        const dateIdea = await generateDateIdea(preferences);
        res.json({ success: true, dateIdea });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;