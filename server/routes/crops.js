const express = require('express');
const Crop = require('../models/Crop');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/crops
// @desc    Get all crops with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, organic, sort, page = 1, limit = 12, city, state, season, quality } = req.query;

    let query = { status: 'available' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (organic === 'true') {
      query.isOrganic = true;
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    if (season && season !== 'all') {
      query.season = season;
    }

    if (quality && quality !== 'all') {
      query.qualityGrade = quality;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const crops = await Crop.find(query)
      .populate('farmer', 'name avatar address isVerified averageRating totalReviews')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Crop.countDocuments(query);

    res.json({
      crops,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name email phone avatar address bio createdAt isVerified averageRating totalReviews');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/crops
// @desc    Create a crop listing
// @access  Private (Farmer only)
router.post('/', protect, authorize('farmer'), async (req, res) => {
  try {
    const { title, description, category, price, quantity, unit, location, isOrganic, harvestDate, images, qualityGrade, qualityDetails, season, preOrderAvailable } = req.body;

    const crop = await Crop.create({
      title,
      description,
      category,
      price,
      quantity,
      unit,
      location,
      isOrganic,
      harvestDate,
      images: images || [],
      farmer: req.user._id,
      qualityGrade: qualityGrade || '',
      qualityDetails: qualityDetails || '',
      season: season || '',
      preOrderAvailable: preOrderAvailable || false
    });

    const populatedCrop = await Crop.findById(crop._id).populate('farmer', 'name avatar address isVerified averageRating');

    res.status(201).json(populatedCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update a crop listing
// @access  Private (Owner only)
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('farmer', 'name avatar address isVerified averageRating');

    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete a crop listing
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Crop removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/crops/farmer/me
// @desc    Get current farmer's crops
// @access  Private (Farmer only)
router.get('/farmer/me', protect, authorize('farmer'), async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
