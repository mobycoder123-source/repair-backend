const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  section: { type: String, required: true },
  language: { type: String, enum: ['en', 'ar'], default: 'en' },
  content: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now }
});

contentSchema.index({ page: 1, section: 1, language: 1 });

module.exports = mongoose.model('Content', contentSchema);
