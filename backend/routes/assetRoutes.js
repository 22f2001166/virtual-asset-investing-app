const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Card = require('../models/Card');
const UserAsset = require('../models/UserAsset');

router.post('/buy/:cardId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.cardId;

    const user = await User.findById(userId);
    const card = await Card.findById(cardId);

    if (!card || card.amount <= 0) {
      return res.status(400).json({ message: 'Asset not available' });
    }

    if (user.coins < card.coins) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    const existingPurchase = await UserAsset.findOne({ userId, cardId });

    let firstPurchaseBonus = 0;
    if (!existingPurchase) {
      // This is their first time buying this card
      firstPurchaseBonus = 50; // You can customize the bonus amount
      user.coins += firstPurchaseBonus; // Add bonus to user's coins
    }

    // Deduct coins and reduce card quantity
    user.coins -= card.coins;
    card.amount -= 1;

    // Save the user asset
    const userAsset = new UserAsset({ userId, cardId });
    await Promise.all([user.save(), card.save(), userAsset.save()]);

    res.status(200).json({
    message: 'Asset purchased successfully', 
    newCoins: user.coins, 
    firstPurchaseBonus: firstPurchaseBonus > 0 ? `You received a First Purchase bonus of ${firstPurchaseBonus} coins!` : null, 
    card: card,
    });
  } catch (err) {
    console.error('Buy error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch all bought assets for a user
router.get('/my-assets', authenticateToken, async (req, res) => {
  try {
    // Fetch assets owned by the user
    const userAssets = await UserAsset.find({ userId: req.user.id }).populate('cardId');
    
    // Count the number of each asset owned by the user
    const assetsWithAmount = userAssets.reduce((acc, userAsset) => {
      const card = userAsset.cardId;
      if (!acc[card._id]) {
        acc[card._id] = { ...card.toObject(), amountOwned: 0 };
      }
      acc[card._id].amountOwned += 1;
      return acc;
    }, {});
    
    // Convert to an array of assets with amounts
    const assets = Object.values(assetsWithAmount);

    res.json(assets);
  } catch (err) {
    console.error('Fetch assets error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET all user assets
router.get('/', async (req, res) => {
  try {
    const assets = await UserAsset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

module.exports = router;

// Sell card route
router.post('/sell/:cardId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.cardId;

    // Find a UserAsset to remove
    const userAsset = await UserAsset.findOne({ userId, cardId });
    if (!userAsset) {
      return res.status(400).json({ message: 'You do not own this asset' });
    }

    // Remove one instance of the card from user's assets
    await UserAsset.findByIdAndDelete(userAsset._id);

    // Add coins back to user and increment card amount
    const user = await User.findById(userId);
    const card = await Card.findById(cardId);

    user.coins += card.coins;
    card.amount += 1;

    await Promise.all([user.save(), card.save()]);

    res.status(200).json({ message: 'Asset sold successfully', newCoins: user.coins });
  } catch (err) {
    console.error('Sell error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

