const express = require('express');
const MarketPrice = require('../models/MarketPrice');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/market-prices
// @desc    Get market prices with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { crop, category, state, district, days = 7 } = req.query;
    let query = {};

    if (crop) query.crop = new RegExp(crop, 'i');
    if (category && category !== 'all') query.category = category;
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - Number(days));
    query.date = { $gte: dateLimit };

    const prices = await MarketPrice.find(query)
      .sort({ date: -1, crop: 1 })
      .limit(200);

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/market-prices/trending
// @desc    Get trending crop prices
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const prices = await MarketPrice.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      {
        $group: {
          _id: '$crop',
          category: { $first: '$category' },
          avgPrice: { $avg: '$modalPrice' },
          minPrice: { $min: '$minPrice' },
          maxPrice: { $max: '$maxPrice' },
          trend: { $last: '$trend' },
          changePercent: { $last: '$changePercent' },
          latestDate: { $max: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/market-prices/crop/:cropName
// @desc    Get price history for a specific crop
// @access  Public
router.get('/crop/:cropName', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const prices = await MarketPrice.find({
      crop: new RegExp(req.params.cropName, 'i'),
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/market-prices/seed
// @desc    Seed market price data
// @access  Public (for development)
router.post('/seed', async (req, res) => {
  try {
    const existing = await MarketPrice.countDocuments();
    if (existing > 50) {
      return res.json({ message: 'Market data already seeded', count: existing });
    }

    const crops = [
      { crop: 'Tomato', category: 'vegetables', basePrice: 2500 },
      { crop: 'Onion', category: 'vegetables', basePrice: 1800 },
      { crop: 'Potato', category: 'vegetables', basePrice: 1200 },
      { crop: 'Cauliflower', category: 'vegetables', basePrice: 2200 },
      { crop: 'Cabbage', category: 'vegetables', basePrice: 1000 },
      { crop: 'Green Peas', category: 'vegetables', basePrice: 4500 },
      { crop: 'Brinjal', category: 'vegetables', basePrice: 1600 },
      { crop: 'Lady Finger', category: 'vegetables', basePrice: 2800 },
      { crop: 'Apple', category: 'fruits', basePrice: 8000 },
      { crop: 'Banana', category: 'fruits', basePrice: 2000 },
      { crop: 'Mango', category: 'fruits', basePrice: 6000 },
      { crop: 'Grapes', category: 'fruits', basePrice: 5500 },
      { crop: 'Orange', category: 'fruits', basePrice: 4000 },
      { crop: 'Pomegranate', category: 'fruits', basePrice: 7000 },
      { crop: 'Wheat', category: 'grains', basePrice: 2200 },
      { crop: 'Rice (Basmati)', category: 'grains', basePrice: 3500 },
      { crop: 'Rice (Common)', category: 'grains', basePrice: 2000 },
      { crop: 'Jowar', category: 'grains', basePrice: 2800 },
      { crop: 'Bajra', category: 'grains', basePrice: 2400 },
      { crop: 'Maize', category: 'grains', basePrice: 1900 },
      { crop: 'Toor Dal', category: 'pulses', basePrice: 6500 },
      { crop: 'Moong Dal', category: 'pulses', basePrice: 7200 },
      { crop: 'Urad Dal', category: 'pulses', basePrice: 6800 },
      { crop: 'Chana Dal', category: 'pulses', basePrice: 5500 },
      { crop: 'Turmeric', category: 'spices', basePrice: 8500 },
      { crop: 'Red Chilli', category: 'spices', basePrice: 12000 },
      { crop: 'Coriander', category: 'spices', basePrice: 7000 },
      { crop: 'Cumin', category: 'spices', basePrice: 25000 },
      { crop: 'Milk', category: 'dairy', basePrice: 4200 },
      { crop: 'Curd', category: 'dairy', basePrice: 4800 },
    ];

    const markets = [
      { market: 'Pune (Market Yard)', state: 'Maharashtra', district: 'Pune' },
      { market: 'Vashi APMC', state: 'Maharashtra', district: 'Mumbai' },
      { market: 'Nashik Mandi', state: 'Maharashtra', district: 'Nashik' },
      { market: 'Azadpur Mandi', state: 'Delhi', district: 'Delhi' },
      { market: 'Koyambedu Market', state: 'Tamil Nadu', district: 'Chennai' },
      { market: 'Yeshwantpur APMC', state: 'Karnataka', district: 'Bangalore' },
    ];

    const seedData = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(8, 0, 0, 0);

      for (const cropInfo of crops) {
        const market = markets[Math.floor(Math.random() * markets.length)];
        const variation = (Math.random() - 0.5) * 0.3;
        const modalPrice = Math.round(cropInfo.basePrice * (1 + variation));
        const minPrice = Math.round(modalPrice * 0.85);
        const maxPrice = Math.round(modalPrice * 1.15);
        const changePercent = Math.round((Math.random() - 0.45) * 10 * 100) / 100;
        const trend = changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable';

        seedData.push({
          crop: cropInfo.crop,
          category: cropInfo.category,
          market: market.market,
          state: market.state,
          district: market.district,
          minPrice,
          maxPrice,
          modalPrice,
          unit: 'quintal',
          date,
          trend,
          changePercent
        });
      }
    }

    await MarketPrice.insertMany(seedData);
    res.json({ message: 'Market data seeded successfully', count: seedData.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
