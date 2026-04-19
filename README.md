# 🌾 FarmConnect — Farm to Table, Direct & Fresh

A full-stack web application that connects farmers directly with buyers, enabling crop listing, ordering, real-time messaging, and transparent agricultural commerce.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-darkgreen?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4+-black?logo=socket.io)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based register/login with Farmer & Buyer roles |
| 🌾 **Crop Marketplace** | Browse, search, filter, sort crops with pagination |
| 📝 **Crop Management** | Farmers can create, edit, delete crop listings |
| 🛒 **Order System** | Place orders with status tracking (pending → confirmed → shipped → delivered) |
| 💬 **Real-time Chat** | Socket.IO powered messaging between farmers and buyers |
| 📊 **Dashboard** | Role-based dashboard with stats, orders & crop management |
| 👤 **User Profiles** | View and edit profile with address, bio, phone |
| 🌙☀️ **Dark/Light Mode** | Toggle between dark and light themes with smooth transitions |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 🎨 **Premium UI** | Glassmorphism, gradients, micro-animations, earth-tone palette |

---

## 🛠 Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — Build tool & dev server
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **Socket.IO Client** — Real-time communication
- **React Icons** — Icon library
- **Vanilla CSS** — Custom design system (no frameworks)

### Backend
- **Node.js** — Runtime
- **Express.js** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM for MongoDB
- **JSON Web Token (JWT)** — Authentication
- **bcrypt.js** — Password hashing
- **Socket.IO** — Real-time messaging
- **Multer** — File upload handling
- **CORS** — Cross-origin resource sharing

---

## 📌 Prerequisites

Before you begin, ensure you have the following installed on your machine:

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | v18 or higher | [https://nodejs.org](https://nodejs.org) |
| **npm** | v9 or higher | Comes with Node.js |
| **MongoDB** | v6 or higher | [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Git** | Latest | [https://git-scm.com/downloads](https://git-scm.com/downloads) |

### Check if already installed:
```bash
node --version      # Should show v18.x.x or higher
npm --version       # Should show 9.x.x or higher
mongod --version    # Should show v6.x or higher
git --version       # Should show git version 2.x.x
```

---

## 📁 Project Structure

```
FarmConnect/
│
├── README.md                  # This file
│
├── server/                    # 🔧 Backend (Node.js + Express)
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── index.js               # Server entry point
│   ├── middleware/
│   │   └── auth.js            # JWT auth + role-based access
│   ├── models/
│   │   ├── User.js            # User schema (farmer/buyer)
│   │   ├── Crop.js            # Crop listing schema
│   │   ├── Order.js           # Order tracking schema
│   │   └── Message.js         # Chat message schema
│   └── routes/
│       ├── auth.js            # Register, Login, Get Me
│       ├── crops.js           # CRUD + search/filter/pagination
│       ├── orders.js          # Create order, update status
│       ├── messages.js        # Conversations + chat messages
│       └── users.js           # Profiles + farmers list
│
└── client/                    # 🎨 Frontend (React + Vite)
    ├── package.json           # Frontend dependencies
    ├── index.html             # HTML entry point
    ├── vite.config.js         # Vite configuration
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Router + context providers
        ├── index.css          # Complete design system (1800+ lines)
        ├── context/
        │   ├── AuthContext.jsx    # Authentication state
        │   ├── SocketContext.jsx  # Real-time socket state
        │   └── ThemeContext.jsx   # Dark/Light theme state
        ├── components/
        │   ├── Navbar.jsx         # Responsive navigation
        │   ├── Footer.jsx         # Site footer
        │   ├── CropCard.jsx       # Crop display card
        │   ├── LoadingSpinner.jsx  # Loading indicator
        │   └── ProtectedRoute.jsx # Auth-guarded routes
        └── pages/
            ├── Home.jsx           # Landing page
            ├── Login.jsx          # Login form
            ├── Register.jsx       # Registration + role select
            ├── Marketplace.jsx    # Crop grid + filters
            ├── CropDetail.jsx     # Single crop view + order
            ├── AddCrop.jsx        # Create crop listing
            ├── Dashboard.jsx      # Stats + order management
            ├── Messages.jsx       # Real-time chat
            └── Profile.jsx        # User profile
```

---

## 🚀 Installation & Setup

### ⚡ Quick Start (Windows)
If you are on Windows, you can simply:
1. Double-click `setup_windows.bat` to install everything.
2. Double-click `run_project.bat` to start the app.

---

### 🛠 Manual Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/FarmConnect.git
cd FarmConnect
```

#### Step 2: One-Command Installation
From the root directory, run:
```bash
npm run setup
```
*This will automatically install dependencies for the Root, Server, and Client.*

This installs: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `socket.io`, `cors`, `dotenv`, `multer`

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

This installs: `react`, `react-router-dom`, `axios`, `socket.io-client`, `react-icons`, `react-hot-toast`

### Step 4: Configure Environment Variables

The backend `.env` file is located at `server/.env`. Update it if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmconnect
JWT_SECRET=farmconnect_super_secret_key_2024_change_in_production
NODE_ENV=development
```

> ⚠️ **For production:** Change `JWT_SECRET` to a strong random string and use a MongoDB Atlas URI.

### Step 5: Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# Windows (if installed as service, it auto-starts)
# Or start manually:
mongod

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

## ▶️ Running the Project

You need **two terminal windows** — one for backend, one for frontend.

### Terminal 1 — Start Backend Server

```bash
cd FarmConnect/server
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Terminal 2 — Start Frontend Dev Server

```bash
cd FarmConnect/client
npm run dev
```

You should see:
```
VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### Step 3 — Open in Browser

Open your browser and go to:

**👉 http://localhost:5173**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Crops
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crops` | List all crops (search, filter, sort, paginate) | ❌ |
| GET | `/api/crops/:id` | Get single crop details | ❌ |
| POST | `/api/crops` | Create crop listing | ✅ Farmer |
| PUT | `/api/crops/:id` | Update crop listing | ✅ Owner |
| DELETE | `/api/crops/:id` | Delete crop listing | ✅ Owner |
| GET | `/api/crops/farmer/me` | Get my crops | ✅ Farmer |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Place a new order | ✅ |
| GET | `/api/orders` | Get my orders | ✅ |
| GET | `/api/orders/:id` | Get order details | ✅ |
| PUT | `/api/orders/:id/status` | Update order status | ✅ |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/conversations` | Get my conversations | ✅ |
| GET | `/api/messages/:userId` | Get messages with user | ✅ |
| POST | `/api/messages` | Send a message | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/farmers` | List all farmers | ❌ |
| GET | `/api/users/:id` | Get user profile | ❌ |
| PUT | `/api/users/profile` | Update my profile | ✅ |

---

## 🔐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/farmconnect` | MongoDB connection string |
| `JWT_SECRET` | `farmconnect_super_secret_key_...` | Secret key for JWT signing |
| `NODE_ENV` | `development` | Environment mode |

---

## 📸 Screenshots

### 🏠 Home Page
Premium landing page with animated hero section, floating orbs, feature cards, and call-to-action.

### 🛒 Marketplace
Browse crops with search, category filters, price sorting, and organic toggle.

### 📊 Dashboard
Role-based dashboard with stats cards, order management, and crop listings.

### 💬 Messages
Real-time chat interface with conversation list and online status indicators.

### 🌙☀️ Dark / Light Mode
Smooth theme toggle with animated switch button in the navbar.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with ❤️ for Indian Farmers
- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Fonts: [Inter](https://fonts.google.com/specimen/Inter) & [Outfit](https://fonts.google.com/specimen/Outfit)

---

## ❓ Troubleshooting

### MongoDB connection error
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Make sure MongoDB is running. On Windows, check Services → MongoDB. Or start it with `mongod`.

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix:** Kill the process using port 5000 or change `PORT` in `.env`:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### npm install fails
**Fix:** Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**⭐ Star this repo if you found it helpful!**
