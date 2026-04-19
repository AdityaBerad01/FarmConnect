const express = require('express');
const PreOrder = require('../models/PreOrder');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/preorders
// @desc    Create a pre-order
// @access  Private (Buyer)
router.post('/', protect, async (req, res) => {
  try {
    const { farmerId, cropId, cropName, quantity, unit, lockedPrice, expectedDate, notes } = req.body;

    const preOrder = await PreOrder.create({
      buyer: req.user._id,
      farmer: farmerId,
      crop: cropId || undefined,
      cropName,
      quantity,
      unit,
      lockedPrice,
      expectedDate,
      notes
    });

    // Notify farmer
    await Notification.create({
      user: farmerId,
      type: 'preorder',
      title: 'New Pre-Order Request',
      message: `${req.user.name} wants to pre-order ${quantity} ${unit} of ${cropName}`,
      link: '/dashboard',
      icon: '📅'
    });

    const populated = await PreOrder.findById(preOrder._id)
      .populate('buyer', 'name email phone avatar')
      .populate('farmer', 'name email phone avatar')
      .populate('crop', 'title price unit images');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/preorders
// @desc    Get user's pre-orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'buyer') {
      query = { buyer: req.user._id };
    } else {
      query = { farmer: req.user._id };
    }

    const { status } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }

    const preOrders = await PreOrder.find(query)
      .populate('buyer', 'name email phone avatar')
      .populate('farmer', 'name email phone avatar')
      .populate('crop', 'title price unit images')
      .sort({ createdAt: -1 });

    res.json(preOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/preorders/:id/status
// @desc    Update pre-order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const preOrder = await PreOrder.findById(req.params.id);

    if (!preOrder) {
      return res.status(404).json({ message: 'Pre-order not found' });
    }

    // Farmer can accept/reject
    if (req.user.role === 'farmer' && preOrder.farmer.toString() === req.user._id.toString()) {
      if (['accepted', 'rejected', 'fulfilled'].includes(status)) {
        preOrder.status = status;

        await Notification.create({
          user: preOrder.buyer,
          type: 'preorder',
          title: `Pre-Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your pre-order for ${preOrder.cropName} has been ${status}`,
          link: '/dashboard',
          icon: status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '📦'
        });
      } else {
        return res.status(400).json({ message: 'Invalid status for farmer' });
      }
    }
    // Buyer can cancel
    else if (req.user.role === 'buyer' && preOrder.buyer.toString() === req.user._id.toString()) {
      if (status === 'cancelled' && preOrder.status === 'requested') {
        preOrder.status = 'cancelled';
      } else {
        return res.status(400).json({ message: 'Can only cancel pending pre-orders' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await preOrder.save();

    const updated = await PreOrder.findById(preOrder._id)
      .populate('buyer', 'name email phone avatar')
      .populate('farmer', 'name email phone avatar')
      .populate('crop', 'title price unit images');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
