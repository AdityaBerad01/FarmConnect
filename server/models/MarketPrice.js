const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other'],
    required: true
  },
  market: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  date: {
    type: Date,
    default: Date.now
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  changePercent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

marketPriceSchema.index({ crop: 1, date: -1 });
marketPriceSchema.index({ state: 1, district: 1 });
marketPriceSchema.index({ category: 1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
