const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    let reviewee;
    let reviewerRole;

    if (req.user.role === 'buyer' && order.buyer.toString() === req.user._id.toString()) {
      reviewee = order.farmer;
      reviewerRole = 'buyer';
      if (order.buyerReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this order' });
      }
      order.buyerReviewed = true;
    } else if (req.user.role === 'farmer' && order.farmer.toString() === req.user._id.toString()) {
      reviewee = order.buyer;
      reviewerRole = 'farmer';
      if (order.farmerReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this order' });
      }
      order.farmerReviewed = true;
    } else {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      order: orderId,
      rating,
      comment,
      reviewerRole
    });

    await order.save();

    // Create notification for reviewee
    await Notification.create({
      user: reviewee,
      type: 'review',
      title: 'New Review Received',
      message: `${req.user.name} gave you a ${rating}-star review`,
      link: '/profile',
      icon: '⭐'
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar role')
      .populate('reviewee', 'name avatar role');

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/stats/:userId
// @desc    Get rating statistics for a user
// @access  Public
router.get('/stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('averageRating totalReviews');
    const reviews = await Review.find({ reviewee: req.params.userId });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({
      averageRating: user?.averageRating || 0,
      totalReviews: user?.totalReviews || 0,
      distribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
