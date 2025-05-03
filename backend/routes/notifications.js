// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../middlewares/authenticateToken'); // assuming you have a token-based middleware

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, isRead: false }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.patch('/mark-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
