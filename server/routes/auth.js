const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({ name, email, password, role, phone, authProvider: 'local' });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        favoriteCrops: user.favoriteCrops || [],
        favoriteFarmers: user.favoriteFarmers || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user signed up with Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ 
        message: 'This account was created with Google. Please use Google Sign-In.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        favoriteCrops: user.favoriteCrops || [],
        favoriteFarmers: user.favoriteFarmers || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/register using access token
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { googleAccessToken, googleUser, role } = req.body;

    if (!googleAccessToken || !googleUser) {
      return res.status(400).json({ message: 'Google authentication data is required' });
    }

    // Verify the access token by fetching user info from Google
    const axios = require('axios');
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    });

    const verifiedUser = googleRes.data;
    
    if (!verifiedUser.email) {
      return res.status(401).json({ message: 'Google authentication failed - no email returned' });
    }

    const { sub: googleId, email, name, picture } = verifiedUser;

    // Check if user exists with this googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Existing user — update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    } else {
      // New user — create account
      const userRole = role || 'farmer';
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        role: userRole,
        authProvider: 'google'
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        favoriteCrops: user.favoriteCrops || [],
        favoriteFarmers: user.favoriteFarmers || []
      },
      isNewUser: !user.phone
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Handle forgot password request
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // In production, you would send an email with a reset token here
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // TODO: Integrate email service (e.g., Nodemailer, SendGrid) to send reset link
    console.log(`Password reset requested for ${email}. Reset token: ${resetToken}`);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      address: user.address,
      createdAt: user.createdAt,
      authProvider: user.authProvider,
      favoriteCrops: user.favoriteCrops || [],
      favoriteFarmers: user.favoriteFarmers || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
