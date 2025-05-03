const mongoose = require('mongoose');

const userAssetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  },
  boughtAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserAsset', userAssetSchema);
