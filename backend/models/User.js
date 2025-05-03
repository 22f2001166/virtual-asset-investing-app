const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  avatar: { type: String, default: null }, // Add this field to store the avatar
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  coins: {
    type: Number,
    default: function () {
      return this.role === 'user' ? 300 : 0;
    }
  },
  flagged: { type: Boolean, default: false },
  lastCheckInDate: { type: String, default: null },
  lastAdWatchDate: { type: String, default: null },
  referralCode: { type: String, unique: true, sparse: true },
  hasUsedReferral: { type: Boolean, default: false },
  hasGivenFeedback: { type: Boolean, default: false }, // Add this field to store feedback submission status
  avatarRewarded: { type: Boolean, default: false },
  hasSpunWheel: { type: Boolean, default: false }, // Track if user has spun the wheel
  lastTopBonusDate: { type: String, default: null },  
});

module.exports = mongoose.model('User', userSchema);