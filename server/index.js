const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const marketPriceRoutes = require('./routes/market-prices');
const walletRoutes = require('./routes/wallet');
const preorderRoutes = require('./routes/preorders');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message);
    }
  });

  socket.on('typing', ({ receiverId, senderName }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { senderName });
    }
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStopTyping');
    }
  });

  // Notification events
  socket.on('sendNotification', ({ userId, notification }) => {
    const targetSocketId = onlineUsers.get(userId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('newNotification', notification);
    }
  });

  // Order update events
  socket.on('orderUpdate', ({ userId, order }) => {
    const targetSocketId = onlineUsers.get(userId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('orderUpdated', order);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Auto-seed market price data on first run
    try {
      const MarketPrice = require('./models/MarketPrice');
      const count = await MarketPrice.countDocuments();
      if (count === 0) {
        console.log('Seeding market price data...');
        const crops = [
          { crop: 'Tomato', category: 'vegetables', basePrice: 2500 },
          { crop: 'Onion', category: 'vegetables', basePrice: 1800 },
          { crop: 'Potato', category: 'vegetables', basePrice: 1200 },
          { crop: 'Cauliflower', category: 'vegetables', basePrice: 2200 },
          { crop: 'Green Peas', category: 'vegetables', basePrice: 4500 },
          { crop: 'Apple', category: 'fruits', basePrice: 8000 },
          { crop: 'Banana', category: 'fruits', basePrice: 2000 },
          { crop: 'Mango', category: 'fruits', basePrice: 6000 },
          { crop: 'Grapes', category: 'fruits', basePrice: 5500 },
          { crop: 'Wheat', category: 'grains', basePrice: 2200 },
          { crop: 'Rice (Basmati)', category: 'grains', basePrice: 3500 },
          { crop: 'Bajra', category: 'grains', basePrice: 2400 },
          { crop: 'Toor Dal', category: 'pulses', basePrice: 6500 },
          { crop: 'Moong Dal', category: 'pulses', basePrice: 7200 },
          { crop: 'Chana Dal', category: 'pulses', basePrice: 5500 },
          { crop: 'Turmeric', category: 'spices', basePrice: 8500 },
          { crop: 'Red Chilli', category: 'spices', basePrice: 12000 },
          { crop: 'Cumin', category: 'spices', basePrice: 25000 },
          { crop: 'Milk', category: 'dairy', basePrice: 4200 },
        ];
        const markets = [
          { market: 'Pune (Market Yard)', state: 'Maharashtra', district: 'Pune' },
          { market: 'Vashi APMC', state: 'Maharashtra', district: 'Mumbai' },
          { market: 'Azadpur Mandi', state: 'Delhi', district: 'Delhi' },
          { market: 'Yeshwantpur APMC', state: 'Karnataka', district: 'Bangalore' },
        ];
        const seedData = [];
        const now = new Date();
        for (let d = 0; d < 14; d++) {
          const date = new Date(now); date.setDate(date.getDate() - d); date.setHours(8,0,0,0);
          for (const c of crops) {
            const m = markets[Math.floor(Math.random() * markets.length)];
            const v = (Math.random() - 0.5) * 0.3;
            const modal = Math.round(c.basePrice * (1 + v));
            const cp = Math.round((Math.random() - 0.45) * 10 * 100) / 100;
            seedData.push({ crop: c.crop, category: c.category, market: m.market, state: m.state, district: m.district,
              minPrice: Math.round(modal * 0.85), maxPrice: Math.round(modal * 1.15), modalPrice: modal, unit: 'quintal',
              date, trend: cp > 1 ? 'up' : cp < -1 ? 'down' : 'stable', changePercent: cp });
          }
        }
        await MarketPrice.insertMany(seedData);
        console.log(`Market data seeded: ${seedData.length} entries`);
      }
    } catch (seedErr) {
      console.log('Market seed skipped:', seedErr.message);
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  });

module.exports = { app, io };
