// backend/models/Discourse.js
const mongoose = require('mongoose');

const discourseSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Discourse', discourseSchema);
