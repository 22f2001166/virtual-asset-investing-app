// Example: routes/userRoutes.js or inside your app.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // adjust path to your User model
const authenticateToken = require('../middlewares/authenticateToken');

// GET all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Add filtering or pagination if needed
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:userId/add-coins', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { coins } = req.body;
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add coins to the user
    user.coins += coins;
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating coins' });
  }
});

router.patch('/users/:userId/toggle-flag', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.flagged = !user.flagged;
    await user.save();

    res.status(200).json({ userId: user._id, flagged: user.flagged });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling flag' });
  }
});

module.exports = router;
