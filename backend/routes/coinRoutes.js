const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// POST /api/earn-coins
router.post('/earn-coins', authenticateToken, async (req, res) => {
  try {
    const coinsToAdd = req.body.coins || 50; // Default to 50 coins if not specified

    // Find user by ID from token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already watched an ad today
    const today = new Date().toISOString().split('T')[0];
    if (user.lastAdWatchDate === today) {
      return res.status(400).json({ message: 'You have already earned from the ad today!' });
    }

    user.coins += coinsToAdd;
    user.lastAdWatchDate = today;
    await user.save();

    res.json({ message: `Successfully earned ${coinsToAdd} coins!`, coins: user.coins });
  } catch (err) {
    console.error('Error earning coins:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/daily-check-in
router.post('/daily-check-in', authenticateToken, async (req, res) => {
  try {
    // Find user by ID from token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already checked in today
    const today = new Date().toISOString().split('T')[0]; // format as YYYY-MM-DD
    if (user.lastCheckInDate === today) {
      return res.status(400).json({ message: 'You have already redeem today!' });
    }

    // Update user's coins and last check-in date
    user.coins += 50;
    user.lastCheckInDate = today; // Store today's date as the last check-in date
    await user.save();

    res.json({ message: 'Daily check-in successful! You earned 50 coins!' });
  } catch (err) {
    console.error('Error with daily check-in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const { v4: uuidv4 } = require('uuid');

// GET /api/referral-code
router.get('/referral-code', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate referral code if not exists
    if (!user.referralCode) {
      user.referralCode = uuidv4().split('-')[0]; // short code
      await user.save();
    }

    res.json({ referralCode: user.referralCode });
  } catch (err) {
    console.error('Error fetching referral code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/use-referral
router.post('/use-referral', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.hasUsedReferral) {
      return res.status(400).json({ message: 'You have already used a referral code.' });
    }

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer || referrer.id === user.id) {
      return res.status(400).json({ message: 'Invalid referral code.' });
    }

    // Reward both users
    referrer.coins += 50;
    user.coins += 50;
    user.hasUsedReferral = true;

    await referrer.save();
    await user.save();

    res.json({ message: 'Referral successful! Both you and your referrer earned 50 coins.' });
  } catch (err) {
    console.error('Error using referral code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/submit-feedback
router.post('/submit-feedback', authenticateToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    const coinsToAdd = 50;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ message: 'Feedback cannot be empty.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if the user has already given feedback
    if (user.hasGivenFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback.' });
    }

    await Feedback.create({ userId: user._id, feedback });

    // You can later save feedbacks to a new Feedback model or database
    user.hasGivenFeedback = true;
    user.coins += coinsToAdd;
    await user.save();

    res.json({ message: `Thank you for your feedback! You've earned ${coinsToAdd} coins.`, coins: user.coins });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/get-feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'username') // or 'username' depending on your User model
      .sort({ date: -1 })
      .limit(10); // optional: limit to latest 10 feedbacks

    const formattedFeedbacks = feedbacks.map(fb => ({
      text: fb.feedback,
      author: fb.userId?.username || 'Anonymous',
    }));

    res.json(formattedFeedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ message: 'Failed to load feedbacks' });
  }
});

// POST /api/avatar-reward
router.post('/avatar-reward', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;

    const user = await User.findById(userId);

    if (user.avatarRewarded) {
      return res.status(400).json({ message: 'You have already claimed avatar reward.' });
    }

    user.coins += 50;
    user.avatar = avatar;
    user.avatarRewarded = true;  // Flag so it's one-time
    await user.save();

    return res.json({ message: '🎉 Avatar submitted! You earned 50 coins.' });
  } catch (err) {
    console.error('Avatar reward error:', err);
    res.status(500).json({ message: 'Server error while submitting avatar' });
  }
});

router.post('/spin-wheel', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user has already spun the wheel
    if (user.hasSpunWheel) {
      return res.status(400).json({ message: 'You have already spun the wheel!' });
    }

    // Randomly decide how many coins to award (e.g., between 10 and 50)
    const coinsAwarded = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

    user.coins += coinsAwarded;
    user.hasSpunWheel = true; // Mark the user as having spun the wheel
    await user.save();

    res.json({ message: `You won ${coinsAwarded} coins from the wheel!`, coins: user.coins });
  } catch (err) {
    console.error('Error spinning wheel:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/daily-top-bonus
router.post('/daily-top-bonus', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const users = await User.find({ role: { $ne: 'admin' } }).sort({ coins: -1 }).limit(3);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No eligible users found' });
    }

    const bonusValues = [500, 400, 300];
    const updatedUsers = [];

    for (let i = 0; i < users.length && i < 3; i++) {
      const user = users[i];

      if (user.lastTopBonusDate === today) continue; // Already rewarded today

      user.coins += bonusValues[i];
      user.lastTopBonusDate = today;
      await user.save();
      updatedUsers.push({ username: user.username, coins: user.coins });
    }

    res.json({
      message: 'Daily top user bonuses distributed!',
      updatedUsers,
    });
  } catch (err) {
    console.error('Error awarding daily top bonuses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




