const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  reviewerRole: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ reviewer: 1, order: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function(userId) {
  const stats = await this.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: '$reviewee',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
};

// Update rating after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', reviewSchema);
