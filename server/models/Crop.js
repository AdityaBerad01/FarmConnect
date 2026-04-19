const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Crop title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre']
  },
  images: [{
    type: String
  }],
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [73.8567, 18.5204]
    }
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  harvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'expired'],
    default: 'available'
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C', ''],
    default: ''
  },
  qualityDetails: {
    type: String,
    maxlength: 500,
    default: ''
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'year-round', ''],
    default: ''
  },
  preOrderAvailable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
cropSchema.index({ title: 'text', description: 'text' });
cropSchema.index({ category: 1, status: 1 });
cropSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Crop', cropSchema);
