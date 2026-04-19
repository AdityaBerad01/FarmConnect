const express = require('express');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to get or create wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
  }
  return wallet;
};

// @route   GET /api/wallet
// @desc    Get wallet balance and transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);
    
    // Return last 50 transactions
    const recentTransactions = wallet.transactions
      .sort((a, b) => b.date - a.date)
      .slice(0, 50);

    res.json({
      balance: wallet.balance,
      transactions: recentTransactions,
      totalTransactions: wallet.transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wallet/add-funds
// @desc    Add funds to wallet (simulated)
// @access  Private
router.post('/add-funds', protect, async (req, res) => {
  try {
    const { amount, method = 'upi' } = req.body;

    if (!amount || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid amount. Must be between ₹1 and ₹1,00,000' });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Added funds via ${method.toUpperCase()}`,
      method,
      date: new Date()
    });

    await wallet.save();

    res.json({
      message: 'Funds added successfully',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wallet/pay
// @desc    Pay for order from wallet
// @access  Private
router.post('/pay', protect, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      description: description || 'Order payment',
      orderId,
      method: 'wallet',
      date: new Date()
    });

    await wallet.save();

    res.json({
      message: 'Payment successful',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wallet/refund
// @desc    Refund to wallet
// @access  Private
router.post('/refund', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const wallet = await getOrCreateWallet(req.user._id);

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: 'Order refund',
      orderId,
      method: 'refund',
      date: new Date()
    });

    await wallet.save();

    res.json({
      message: 'Refund processed',
      balance: wallet.balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
