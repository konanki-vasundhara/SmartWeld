# PostgreSQL Database Integration Guide - Smart Weld

## Overview
This guide covers migrating from Firebase/Firestore to PostgreSQL database with a Node.js/Express backend API.

## Architecture Changes
- **Frontend**: React + Zustand (unchanged)
- **Backend**: Node.js + Express + PostgreSQL (NEW)
- **Database**: PostgreSQL (replaces Firestore)
- **Storage**: AWS S3 or local storage (replaces Firebase Storage)
- **Auth**: JWT tokens (replaces Firebase Auth)
- **Real-time**: WebSockets or polling (replaces Firestore real-time)

---

## STEP 1: PostgreSQL Setup

### 1.1 Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.2 Create Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE smart_weld;
CREATE USER smart_weld_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE smart_weld TO smart_weld_user;

# Exit PostgreSQL
\q
```

### 1.3 Install PostgreSQL Client Tools
```bash
npm install -g pg pg-hstore sequelize sequelize-cli
```

---

## STEP 2: Backend API Setup (Express.js)

### 2.1 Initialize Backend Project
```bash
# Create backend directory
mkdir backend
cd backend
npm init -y

# Install dependencies
npm install express cors helmet dotenv bcryptjs jsonwebtoken multer aws-sdk socket.io compression
npm install -D nodemon concurrently

# Create directory structure
mkdir -p src/controllers src/models src/routes src/middleware src/services src/utils src/config
```

### 2.2 Package.json Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "db:create": "sequelize db:create",
    "db:migrate": "sequelize db:migrate",
    "db:seed": "sequelize db:seed:all"
  }
}
```

### 2.3 Environment Configuration
```javascript
// backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://smart_weld_user:your_password@localhost:5432/smart_weld
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=smart-weld-images

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## STEP 3: Database Schema Design

### 3.1 Sequelize Configuration
```javascript
// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

### 3.2 User Model
```javascript
// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // For social auth users
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: true,
      language: 'en',
      currency: 'INR'
    }
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalScans: 0,
      totalBookings: 0,
      totalSpent: 0
    }
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['phoneNumber'] },
    { fields: ['email'] },
    { fields: ['createdAt'] }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
```

### 3.3 Scan Model
```javascript
// backend/src/models/Scan.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  scanId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true // For S3 storage
  },
  imageAnalysis: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  costBreakdown: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  processingTime: {
    type: DataTypes.INTEGER, // milliseconds
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['scanId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Scan;
```

### 3.4 Booking Model
```javascript
// backend/src/models/Booking.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  scanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Scans',
      key: 'id'
    }
  },
  issue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  assignedTechnician: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  schedule: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  pricing: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  payment: {
    type: DataTypes.JSONB,
    defaultValue: {
      method: 'GPay',
      status: 'pending',
      transactionId: null,
      paidAt: null
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
    defaultValue: 'medium'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['bookingId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Booking;
```

### 3.5 Database Migration Script
```javascript
// backend/src/scripts/initDB.js
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Scan = require('../models/Scan');
const Booking = require('../models/Booking');

const initDatabase = async () => {
  try {
    await connectDB();

    // Define associations
    User.hasMany(Scan, { foreignKey: 'userId', as: 'scans' });
    Scan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    Scan.hasMany(Booking, { foreignKey: 'scanId', as: 'bookings' });
    Booking.belongsTo(Scan, { foreignKey: 'scanId', as: 'scan' });

    // Sync database (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = initDatabase;

// Run if called directly
if (require.main === module) {
  initDatabase();
}
```

---

## STEP 4: Authentication System (JWT)

### 4.1 JWT Middleware
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    next(); // Continue without authentication
  }
};

module.exports = { authenticate, optionalAuth };
```

### 4.2 Auth Controller
```javascript
// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const register = async (req, res) => {
  try {
    const { phoneNumber, email, displayName, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { phoneNumber },
          email ? { email } : {}
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      phoneNumber,
      email,
      displayName,
      password
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ where: { phoneNumber } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      phoneNumber: req.user.phoneNumber,
      email: req.user.email,
      displayName: req.user.displayName,
      profileImage: req.user.profileImage,
      preferences: req.user.preferences,
      stats: req.user.stats,
      location: req.user.location,
      createdAt: req.user.createdAt
    }
  });
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = req.user;

    // Remove sensitive fields
    delete updates.password;
    delete updates.id;

    await user.update(updates);

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        preferences: user.preferences,
        stats: user.stats,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
```

---

## STEP 5: API Routes

### 5.1 Auth Routes
```javascript
// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
```

### 5.2 Scan Routes
```javascript
// backend/src/routes/scans.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Scan = require('../models/Scan');
const { uploadScanImage } = require('../services/fileService');

router.get('/', authenticate, async (req, res) => {
  try {
    const scans = await Scan.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: req.query.limit || 20
    });
    res.json({ scans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

router.get('/:scanId', authenticate, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      where: { scanId: req.params.scanId, userId: req.user.id }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({ scan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { imageUrl, imageAnalysis, costBreakdown, location, deviceInfo } = req.body;

    const scan = await Scan.create({
      scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.id,
      imageUrl,
      imageAnalysis,
      costBreakdown,
      location,
      deviceInfo,
      status: 'completed'
    });

    // Update user stats
    await req.user.increment('stats.totalScans');

    res.status(201).json({ scan });
  } catch (error) {
    console.error('Scan creation error:', error);
    res.status(500).json({ error: 'Failed to create scan' });
  }
});

module.exports = router;
```

### 5.3 Booking Routes
```javascript
// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');

router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await Booking.create({
      bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.id,
      ...bookingData
    });

    // Update user stats
    await req.user.increment('stats.totalBookings');
    await req.user.increment('stats.totalSpent', { by: bookingData.pricing.total });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.put('/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({
      where: { bookingId: req.params.bookingId, userId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.update({ status, updatedAt: new Date() });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;
```

---

## STEP 6: File Storage (AWS S3)

### 6.1 S3 Service
```javascript
// backend/src/services/fileService.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const filename = `scans/${userId}/${timestamp}_${uuidv4()}.${extension}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const uploadScanImage = upload.single('image');

const deleteFile = async (key) => {
  try {
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: key
    }).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
  }
};

module.exports = {
  uploadScanImage,
  deleteFile
};
```

### 6.2 File Upload Route
```javascript
// backend/src/routes/upload.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadScanImage } = require('../services/fileService');

router.post('/scan-image', authenticate, (req, res) => {
  uploadScanImage(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      imageUrl: req.file.location,
      imagePath: req.file.key,
      size: req.file.size,
      type: req.file.mimetype
    });
  });
});

module.exports = router;
```

---

## STEP 7: Main Server Setup

### 7.1 Express Server
```javascript
// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');
const bookingRoutes = require('./routes/bookings');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
```

### 7.2 Error Handler Middleware
```javascript
// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: 'Validation Error', details: errors });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
```

---

## STEP 8: Frontend Migration

### 8.1 Update API Service
```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(updates) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Scan methods
  async getScans(limit = 20) {
    return await this.request(`/scans?limit=${limit}`);
  }

  async getScan(scanId) {
    return await this.request(`/scans/${scanId}`);
  }

  async createScan(scanData) {
    return await this.request('/scans', {
      method: 'POST',
      body: JSON.stringify(scanData)
    });
  }

  // Booking methods
  async getBookings() {
    return await this.request('/bookings');
  }

  async createBooking(bookingData) {
    return await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async updateBookingStatus(bookingId, status) {
    return await this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // File upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return await this.request('/upload/scan-image', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData
    });
  }
}

export const apiService = new ApiService();
```

### 8.2 Update Auth Store
```javascript
// src/store/useAuthStore.js
import { create } from 'zustand';
import { apiService } from '../services/api';

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  userProfile: null,
  isLoading: false,
  error: null,

  // Initialize auth on app start
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await apiService.getProfile();
        set({
          isAuthenticated: true,
          userProfile: response.user
        });
      } catch (error) {
        // Token invalid, clear it
        apiService.clearToken();
        set({ isAuthenticated: false, userProfile: null });
      }
    }
  },

  // Login with phone/password
  login: async (phoneNumber, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.login({ phoneNumber, password });
      set({
        isAuthenticated: true,
        userProfile: response.user
      });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Register new user
  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.register(userData);
      set({
        isAuthenticated: true,
        userProfile: response.user
      });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: () => {
    apiService.clearToken();
    set({
      isAuthenticated: false,
      userProfile: null,
      error: null
    });
  },

  // Update profile
  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.updateProfile(updates);
      set({ userProfile: response.user });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;
```

### 8.3 Update Scan Store
```javascript
// src/store/useScanStore.js
import { create } from 'zustand';
import { apiService } from '../services/api';

const useScanStore = create((set, get) => ({
  currentScan: null,
  scans: [],
  isAnalyzing: false,
  error: null,

  // Get user's scan history
  getScanHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.getScans();
      set({ scans: response.scans });
      return response.scans;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Set current scan result
  setScanResult: (scanData) => {
    set({ currentScan: scanData });
  },

  // Save scan to database
  saveScanResult: async (scanData) => {
    try {
      const response = await apiService.createScan(scanData);
      return response.scan.scanId;
    } catch (error) {
      console.error('Failed to save scan:', error);
      throw error;
    }
  },

  // Upload image to server
  uploadImage: async (file) => {
    try {
      const response = await apiService.uploadImage(file);
      return response;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }
}));

export default useScanStore;
```

---

## STEP 9: Real-time Features (WebSockets)

### 9.1 Socket.io Setup
```javascript
// backend/src/services/socketService.js
const socketIo = require('socket.io');

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for personalized updates
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Handle booking status updates
    socket.on('booking_update', (data) => {
      // Broadcast to user room
      io.to(`user_${data.userId}`).emit('booking_status_changed', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };
```

### 9.2 Update Server with WebSockets
```javascript
// backend/src/server.js
const http = require('http');
const { initSocket } = require('./services/socketService');

const server = http.createServer(app);
const io = initSocket(server);

// Make io available to routes
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 9.3 Frontend Socket Integration
```javascript
// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join', userId);
    });

    this.socket.on('booking_status_changed', (data) => {
      // Handle real-time booking updates
      console.log('Booking status changed:', data);
      // Update zustand store
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Emit events
  updateBookingStatus(bookingData) {
    if (this.socket) {
      this.socket.emit('booking_update', bookingData);
    }
  }
}

export const socketService = new SocketService();
```

---

## STEP 10: Deployment & Production

### 10.1 Docker Setup
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
```

```dockerfile
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: smart_weld
      POSTGRES_USER: smart_weld_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://smart_weld_user:your_password@postgres:5432/smart_weld
      JWT_SECRET: your_jwt_secret
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 10.2 Production Environment
```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your_db_host:5432/smart_weld
JWT_SECRET=your_production_jwt_secret
AWS_ACCESS_KEY_ID=your_production_aws_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret
S3_BUCKET=your_production_bucket
```

### 10.3 PM2 Process Manager
```javascript
// backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'smart-weld-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## STEP 11: Database Migration & Seeding

### 11.1 Migration Script
```javascript
// backend/scripts/migrateData.js
const { connectDB } = require('../src/config/database');
const User = require('../src/models/User');
const Scan = require('../src/models/Scan');
const Booking = require('../src/models/Booking');

const migrateFromFirebase = async () => {
  try {
    await connectDB();
    console.log('Starting data migration from Firebase...');

    // Note: You'll need to export data from Firebase first
    // This is a template for migration logic

    // 1. Migrate users
    console.log('Migrating users...');
    // const firebaseUsers = await exportUsersFromFirebase();
    // for (const userData of firebaseUsers) {
    //   await User.create(userData);
    // }

    // 2. Migrate scans
    console.log('Migrating scans...');
    // const firebaseScans = await exportScansFromFirebase();
    // for (const scanData of firebaseScans) {
    //   await Scan.create(scanData);
    // }

    // 3. Migrate bookings
    console.log('Migrating bookings...');
    // const firebaseBookings = await exportBookingsFromFirebase();
    // for (const bookingData of firebaseBookings) {
    //   await Booking.create(bookingData);
    // }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

module.exports = migrateFromFirebase;

// Run migration
if (require.main === module) {
  migrateFromFirebase();
}
```

### 11.2 Seed Data
```javascript
// backend/scripts/seed.js
const { connectDB } = require('../src/config/database');
const User = require('../src/models/User');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Create admin user
    const adminUser = await User.create({
      phoneNumber: '+919876543210',
      email: 'admin@smartweld.com',
      displayName: 'Admin User',
      password: 'admin123',
      isVerified: true,
      preferences: {
        notifications: true,
        language: 'en',
        currency: 'INR'
      }
    });

    console.log('✅ Admin user created:', adminUser.id);

    // Add more seed data as needed

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
```

---

## STEP 12: Testing & Monitoring

### 12.1 API Tests
```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/config/database');

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phoneNumber: '+919876543210',
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'password123'
      })
      .expect(201);

    expect(response.body.user).toHaveProperty('id');
    expect(response.body).toHaveProperty('token');
  });

  it('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phoneNumber: '+919876543210',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.user).toHaveProperty('phoneNumber');
    expect(response.body).toHaveProperty('token');
  });
});
```

### 12.2 Monitoring Setup
```javascript
// backend/src/utils/monitoring.js
const os = require('os');
const { sequelize } = require('../config/database');

const getSystemStats = () => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.cpus(),
    loadAverage: os.loadavg(),
    platform: os.platform(),
    arch: os.arch()
  };
};

const logApiMetrics = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

module.exports = {
  getSystemStats,
  logApiMetrics
};
```

---

## Implementation Timeline

### Phase 1 (Week 1): Database & Models
- ✅ PostgreSQL setup and configuration
- ✅ Sequelize models and associations
- ✅ Database migrations and seeding

### Phase 2 (Week 2): Backend API
- ✅ Express server setup
- ✅ Authentication with JWT
- ✅ CRUD operations for users, scans, bookings
- ✅ File upload with AWS S3

### Phase 3 (Week 3): Frontend Migration
- ✅ Replace Firebase with REST API calls
- ✅ Update all Zustand stores
- ✅ Implement JWT authentication
- ✅ File upload integration

### Phase 4 (Week 4): Real-time & Production
- ✅ WebSocket integration
- ✅ Docker containerization
- ✅ Production deployment
- ✅ Monitoring and logging

---

## Cost Estimation (PostgreSQL)

### Database Costs
- **AWS RDS PostgreSQL** (db.t3.micro): $15-25/month
- **Storage**: $0.10/GB/month
- **Backup**: $0.095/GB/month

### Infrastructure Costs
- **AWS EC2** (t3.micro): $8-12/month
- **AWS S3**: $0.023/GB/month
- **CloudFront CDN**: $0.085/GB transferred

### Total Monthly Cost: $30-50/month

---

## Quick Start Commands

```bash
# 1. Setup PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql
CREATE DATABASE smart_weld;
CREATE USER smart_weld_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE smart_weld TO smart_weld_user;

# 2. Setup Backend
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run db:init      # Initialize database
npm run seed         # Add seed data
npm run dev          # Start development server

# 3. Setup Frontend
cd ../
npm install
cp .env.example .env  # Add API URL
npm run dev          # Start frontend

# 4. Test API
curl http://localhost:3001/health
```

This comprehensive PostgreSQL integration transforms your Smart Weld app into a robust, scalable SaaS platform with enterprise-grade database architecture! 🏗️