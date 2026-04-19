const mongoose = require('mongoose');

const preOrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  cropName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre']
  },
  lockedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  expectedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'fulfilled', 'cancelled'],
    default: 'requested'
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

preOrderSchema.index({ buyer: 1, status: 1 });
preOrderSchema.index({ farmer: 1, status: 1 });

module.exports = mongoose.model('PreOrder', preOrderSchema);
