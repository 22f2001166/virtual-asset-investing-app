const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Card = require('../models/Card');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Set up multer to store uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Route to create a new card with image upload
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, coins, description, amount } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const card = new Card({ name, coins, image, description, amount });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Fetch cards
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Update card (except name)
router.put('/:id', async (req, res) => {
  try {
    const { coins, amount, description } = req.body;
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      { coins, amount, description },
      { new: true }
    );
    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

module.exports = router;
