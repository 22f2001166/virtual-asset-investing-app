// backend/routes/discourseRoutes.js
const express = require('express');
const router = express.Router();
const Discourse = require('../models/Discourse');
const authenticateToken = require('../middlewares/authenticateToken');

// POST a new message (admin only)
router.post('/', authenticateToken, async (req, res) => {
  const { message } = req.body;

  try {
    const newMessage = new Discourse({
      message,
      createdBy: req.user.id,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Error posting message' });
  }
});

// GET all messages from the last 2 days (any user)
router.get('/', async (req, res) => {
  try {
    // const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds
    const twoDaysAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes in milliseconds
    const messages = await Discourse.find({ createdAt: { $gte: twoDaysAgo } })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching recent messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

module.exports = router;
