const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  customerAddress: { type: String },
  serviceType: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  referenceNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', function() {
  if (!this.referenceNumber) {
    this.referenceNumber = 'ACW-' + Date.now().toString(36).toUpperCase();
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
