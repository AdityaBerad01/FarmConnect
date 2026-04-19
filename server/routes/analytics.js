const express = require('express');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const MarketPrice = require('../models/MarketPrice');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/farmer
// @desc    Get farmer analytics
// @access  Private (Farmer)
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Get all orders for this farmer
    const orders = await Order.find({ farmer: farmerId })
      .populate('crop', 'title category price unit')
      .sort({ createdAt: -1 });

    // Total revenue
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          farmer: farmerId,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Best selling crops
    const bestSelling = await Order.aggregate([
      { $match: { farmer: farmerId, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$crop',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Populate the crop details for best selling
    const populatedBestSelling = await Crop.populate(bestSelling, {
      path: '_id',
      select: 'title category unit'
    });

    // Order status distribution
    const statusDist = await Order.aggregate([
      { $match: { farmer: farmerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Active listings count
    const activeListings = await Crop.countDocuments({ farmer: farmerId, status: 'available' });
    const totalListings = await Crop.countDocuments({ farmer: farmerId });

    // Category distribution
    const categoryDist = await Crop.aggregate([
      { $match: { farmer: farmerId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      activeListings,
      totalListings,
      monthlyRevenue,
      bestSelling: populatedBestSelling,
      statusDistribution: statusDist,
      categoryDistribution: categoryDist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/recommendations
// @desc    Get crop recommendations
// @access  Private (Farmer)
router.get('/recommendations', protect, authorize('farmer'), async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;

    // Determine current season
    let season;
    if (currentMonth >= 6 && currentMonth <= 10) season = 'kharif';
    else if (currentMonth >= 11 || currentMonth <= 3) season = 'rabi';
    else season = 'zaid';

    // Season-based recommendations
    const seasonCrops = {
      kharif: [
        { name: 'Rice', category: 'grains', profit: 'High', demand: 'Very High', tip: 'Best sown in June-July with monsoon rains' },
        { name: 'Maize', category: 'grains', profit: 'Medium', demand: 'High', tip: 'Good for animal feed and consumption' },
        { name: 'Cotton', category: 'other', profit: 'High', demand: 'High', tip: 'Major cash crop, needs warm climate' },
        { name: 'Soybean', category: 'pulses', profit: 'Medium', demand: 'High', tip: 'Good rotation crop, fixes nitrogen' },
        { name: 'Groundnut', category: 'other', profit: 'Medium', demand: 'Medium', tip: 'Sandy loam soil preferred' },
        { name: 'Turmeric', category: 'spices', profit: 'Very High', demand: 'High', tip: 'Needs 7-9 months, high value crop' },
        { name: 'Lady Finger', category: 'vegetables', profit: 'Medium', demand: 'High', tip: 'Quick growing, ready in 45-60 days' },
        { name: 'Tomato', category: 'vegetables', profit: 'High', demand: 'Very High', tip: 'Year-round demand, price volatile' },
      ],
      rabi: [
        { name: 'Wheat', category: 'grains', profit: 'Medium', demand: 'Very High', tip: 'Staple crop, MSP support available' },
        { name: 'Mustard', category: 'other', profit: 'High', demand: 'High', tip: 'Oil seed, good returns in North India' },
        { name: 'Gram (Chana)', category: 'pulses', profit: 'High', demand: 'Very High', tip: 'Low water requirement, high protein' },
        { name: 'Potato', category: 'vegetables', profit: 'Medium', demand: 'Very High', tip: 'Cold storage available widely' },
        { name: 'Onion', category: 'vegetables', profit: 'High', demand: 'Very High', tip: 'Can store for months, volatile price' },
        { name: 'Cauliflower', category: 'vegetables', profit: 'Medium', demand: 'High', tip: 'Best grown in cool weather' },
        { name: 'Green Peas', category: 'vegetables', profit: 'High', demand: 'High', tip: 'Premium vegetable, good returns' },
        { name: 'Coriander', category: 'spices', profit: 'High', demand: 'Medium', tip: 'Dual use: seeds and leaves' },
      ],
      zaid: [
        { name: 'Watermelon', category: 'fruits', profit: 'High', demand: 'Very High', tip: 'Summer seasonal, high demand' },
        { name: 'Muskmelon', category: 'fruits', profit: 'High', demand: 'High', tip: 'Quick crop, 60-90 days' },
        { name: 'Cucumber', category: 'vegetables', profit: 'Medium', demand: 'High', tip: 'Fast growing, good summer crop' },
        { name: 'Bitter Gourd', category: 'vegetables', profit: 'Medium', demand: 'Medium', tip: 'Medicinal value adds premium' },
        { name: 'Pumpkin', category: 'vegetables', profit: 'Low', demand: 'Medium', tip: 'Long storage life' },
        { name: 'Moong Dal', category: 'pulses', profit: 'High', demand: 'High', tip: 'Short duration, 60-65 days' },
        { name: 'Sunflower', category: 'other', profit: 'Medium', demand: 'Medium', tip: 'Oil seed, drought tolerant' },
        { name: 'Fodder Crops', category: 'other', profit: 'Low', demand: 'High', tip: 'Always in demand for dairy' },
      ]
    };

    // Get market price trends for suggested crops
    const recommendations = seasonCrops[season] || seasonCrops.kharif;

    // Get highest demand crops on platform
    const demandTrends = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $lookup: {
          from: 'crops',
          localField: 'crop',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$cropInfo.category',
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { totalOrders: -1 } }
    ]);

    res.json({
      season,
      recommendations,
      demandTrends,
      tip: `Current season: ${season.charAt(0).toUpperCase() + season.slice(1)}. Plan your next crop based on these recommendations and market demand.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
