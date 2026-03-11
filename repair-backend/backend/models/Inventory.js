const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  partNumber: { type: String },
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  minStock: { type: Number, default: 5 },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
