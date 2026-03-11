const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameArabic: { type: String, required: true },
  description: { type: String },
  descriptionArabic: { type: String },
  icon: { type: String },
  image: { type: String },
  issues: [{ type: String }],
  issuesArabic: [{ type: String }],
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
