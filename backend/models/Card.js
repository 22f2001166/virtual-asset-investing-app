const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coins: {
    type: Number,
    required: true,
    min: [0, 'Coins must be a non-negative number'],
  },
  image: { type: String },
  description: { type: String, required: true },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be a non-negative number'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', cardSchema);
