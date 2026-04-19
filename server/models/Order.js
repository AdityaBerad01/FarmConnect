const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    ref: 'Crop',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'wallet'],
    default: 'COD'
  },
  upiId: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  trackingHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  estimatedDelivery: {
    type: Date
  },
  buyerReviewed: {
    type: Boolean,
    default: false
  },
  farmerReviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ farmer: 1, status: 1 });

// Auto-add initial tracking entry on create
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.trackingHistory = [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Order placed successfully'
    }];
    // Set estimated delivery to 5 days from now
    const est = new Date();
    est.setDate(est.getDate() + 5);
    this.estimatedDelivery = est;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
