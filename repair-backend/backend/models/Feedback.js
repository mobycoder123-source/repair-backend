const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  feedback: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
