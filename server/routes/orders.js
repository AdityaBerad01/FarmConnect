const express = require('express');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Buyer)
router.post('/', protect, async (req, res) => {
  try {
    const { cropId, quantity, shippingAddress, paymentMethod, upiId, notes } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.status !== 'available') {
      return res.status(400).json({ message: 'Crop is not available' });
    }

    if (quantity > crop.quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
    }

    const totalPrice = crop.price * quantity;

    const order = await Order.create({
      buyer: req.user._id,
      farmer: crop.farmer,
      crop: cropId,
      quantity,
      totalPrice,
      shippingAddress,
      paymentMethod,
      upiId,
      notes
    });

    // Update crop quantity
    crop.quantity -= quantity;
    if (crop.quantity === 0) {
      crop.status = 'sold';
    }
    await crop.save();

    // Create notification for farmer
    await Notification.create({
      user: crop.farmer,
      type: 'order_update',
      title: 'New Order Received!',
      message: `${req.user.name} ordered ${quantity} ${crop.unit} of ${crop.title} for ₹${totalPrice.toLocaleString()}`,
      link: '/dashboard',
      icon: '🛒'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('crop', 'title price unit images');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
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

    const orders = await Order.find(query)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('crop', 'title price unit images category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order with tracking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name email phone address')
      .populate('crop', 'title description price unit images category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer or farmer of this order
    if (order.buyer._id.toString() !== req.user._id.toString() &&
        order.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status with tracking
// @access  Private (Farmer for confirm/ship, Buyer for cancel)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const statusNotes = {
      confirmed: 'Order confirmed by farmer',
      shipped: 'Order has been shipped',
      delivered: 'Order delivered successfully',
      cancelled: 'Order was cancelled'
    };

    // Farmers can confirm, ship, deliver
    if (req.user.role === 'farmer' && order.farmer.toString() === req.user._id.toString()) {
      if (['confirmed', 'shipped', 'delivered'].includes(status)) {
        order.status = status;
        order.trackingHistory.push({
          status,
          timestamp: new Date(),
          note: statusNotes[status]
        });

        // Notify buyer
        await Notification.create({
          user: order.buyer,
          type: 'order_update',
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your order has been ${status}`,
          link: `/order/${order._id}`,
          icon: status === 'confirmed' ? '✅' : status === 'shipped' ? '🚚' : '📦'
        });
      } else {
        return res.status(400).json({ message: 'Invalid status transition for farmer' });
      }
    }
    // Buyers can cancel
    else if (req.user.role === 'buyer' && order.buyer.toString() === req.user._id.toString()) {
      if (status === 'cancelled' && order.status === 'pending') {
        order.status = 'cancelled';
        order.trackingHistory.push({
          status: 'cancelled',
          timestamp: new Date(),
          note: statusNotes.cancelled
        });

        // Restore crop quantity
        const crop = await Crop.findById(order.crop);
        if (crop) {
          crop.quantity += order.quantity;
          if (crop.status === 'sold') crop.status = 'available';
          await crop.save();
        }

        // Notify farmer
        await Notification.create({
          user: order.farmer,
          type: 'order_update',
          title: 'Order Cancelled',
          message: `An order has been cancelled by the buyer`,
          link: '/dashboard',
          icon: '❌'
        });
      } else {
        return res.status(400).json({ message: 'Can only cancel pending orders' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('crop', 'title price unit images');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
