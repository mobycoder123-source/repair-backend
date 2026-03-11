const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [{ type: String }],
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

availabilitySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
