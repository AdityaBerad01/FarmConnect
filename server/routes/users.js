const express = require('express');
const User = require('../models/User');
const Crop = require('../models/Crop');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/farmers
// @desc    Get all farmers
// @access  Public
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('name avatar bio address createdAt isVerified averageRating totalReviews location')
      .sort({ createdAt: -1 });

    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/nearby
// @desc    Get nearby users based on coordinates
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lng = 73.8567, lat = 18.5204, radius = 50, role, limit = 20 } = req.query;
    const baseQuery = {};
    if (role) baseQuery.role = role;

    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distanceMeters',
          maxDistance: parseInt(radius, 10) * 1000,
          spherical: true,
          query: baseQuery
        }
      },
      {
        $project: {
          name: 1,
          avatar: 1,
          bio: 1,
          role: 1,
          address: 1,
          createdAt: 1,
          isVerified: 1,
          averageRating: 1,
          totalReviews: 1,
          location: 1,
          distanceMeters: 1
        }
      },
      { $limit: parseInt(limit, 10) }
    ]);

    res.json(users.map((u) => ({
      ...u,
      distanceKm: Number((u.distanceMeters / 1000).toFixed(2))
    })));
  } catch (error) {
    // If geo index fails, fallback to regular query
    const { role, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('name avatar bio role address createdAt isVerified averageRating totalReviews location')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(users);
  }
});

// @route   GET /api/users/search
// @desc    Search users with filters
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { name, city, state, role, verified, minRating } = req.query;
    let query = {};

    if (name) query.name = new RegExp(name, 'i');
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (role) query.role = role;
    if (verified === 'true') query.isVerified = true;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    const users = await User.find(query)
      .select('name avatar bio role address createdAt isVerified averageRating totalReviews')
      .sort({ averageRating: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/favorites
// @desc    Get current user's favorite crops and farmers
// @access  Private
router.get('/me/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteCrops',
        match: { status: 'available' },
        populate: { path: 'farmer', select: 'name avatar isVerified averageRating totalReviews address' }
      })
      .populate('favoriteFarmers', 'name avatar bio role address isVerified averageRating totalReviews createdAt');

    res.json({
      favoriteCrops: user.favoriteCrops || [],
      favoriteFarmers: user.favoriteFarmers || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/favorites/crops/:cropId
// @desc    Toggle crop in favorites
// @access  Private
router.put('/favorites/crops/:cropId', protect, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.favoriteCrops.findIndex((id) => id.toString() === req.params.cropId);

    let action = 'added';
    if (index >= 0) {
      user.favoriteCrops.splice(index, 1);
      action = 'removed';
    } else {
      user.favoriteCrops.push(req.params.cropId);
    }

    await user.save();
    res.json({
      message: `Crop ${action} ${action === 'added' ? 'to' : 'from'} favorites`,
      action,
      favoriteCrops: user.favoriteCrops
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/favorites/farmers/:farmerId
// @desc    Toggle farmer in favorites
// @access  Private
router.put('/favorites/farmers/:farmerId', protect, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (farmer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot favorite yourself' });
    }

    const user = await User.findById(req.user._id);
    const index = user.favoriteFarmers.findIndex((id) => id.toString() === req.params.farmerId);

    let action = 'added';
    if (index >= 0) {
      user.favoriteFarmers.splice(index, 1);
      action = 'removed';
    } else {
      user.favoriteFarmers.push(req.params.farmerId);
    }

    await user.save();
    res.json({
      message: `Farmer ${action} ${action === 'added' ? 'to' : 'from'} favorites`,
      action,
      favoriteFarmers: user.favoriteFarmers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio role address createdAt isVerified averageRating totalReviews location');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's crop count if farmer
    let cropCount = 0;
    if (user.role === 'farmer') {
      cropCount = await Crop.countDocuments({ farmer: user._id, status: 'available' });
    }

    res.json({ ...user.toObject(), cropCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bio, address, avatar, language, coordinates } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;
    if (language) user.language = language;
    if (coordinates && coordinates.length === 2) {
      user.location = { coordinates };
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      address: user.address,
      language: user.language,
      isVerified: user.isVerified,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      location: user.location,
      favoriteCrops: user.favoriteCrops || [],
      favoriteFarmers: user.favoriteFarmers || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/verify
// @desc    Request/grant verification
// @access  Private
router.put('/verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isVerified) {
      return res.status(400).json({ message: 'Already verified' });
    }

    // Auto-verify if user has: profile complete, at least 1 crop listed (farmer), 5+ orders
    let eligible = false;
    if (user.phone && user.address?.city && user.address?.state) {
      if (user.role === 'farmer') {
        const cropCount = await Crop.countDocuments({ farmer: user._id });
        eligible = cropCount >= 1;
      } else {
        eligible = true;
      }
    }

    if (eligible) {
      user.isVerified = true;
      user.verificationDate = new Date();
      await user.save();
      res.json({ message: 'Verification granted!', isVerified: true });
    } else {
      res.status(400).json({
        message: 'Complete your profile (phone, city, state) and list at least 1 crop to get verified'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
