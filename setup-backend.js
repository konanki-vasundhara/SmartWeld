#!/usr/bin/env node

/**
 * Smart Weld Backend Setup Script
 * Run this to initialize the backend infrastructure
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Smart Weld Backend Setup Starting...\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  execSync('npm install -g firebase-tools', { stdio: 'inherit' });
  console.log('✅ Firebase CLI installed');
}

// Initialize Firebase project
console.log('🔥 Setting up Firebase project...');
try {
  // Check if already initialized
  if (!fs.existsSync('firebase.json')) {
    execSync('firebase init --project smart-weld-b4c44', { stdio: 'inherit' });
  } else {
    console.log('✅ Firebase already initialized');
  }
} catch (error) {
  console.log('⚠️  Firebase initialization skipped (may already be configured)');
}

// Install additional dependencies
console.log('📦 Installing backend dependencies...');
const dependencies = [
  'firebase-admin',
  '@sentry/react',
  '@sentry/tracing',
  'razorpay',
  'uuid'
];

execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
console.log('✅ Dependencies installed');

// Create backend directory structure
console.log('📁 Creating backend directory structure...');
const dirs = [
  'src/services',
  'src/middleware',
  'src/controllers',
  'src/models',
  'src/utils',
  'src/config',
  'functions/src',
  'functions/src/controllers',
  'functions/src/middleware'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('✅ Directory structure created');

// Create Firebase Functions setup
console.log('⚡ Setting up Firebase Functions...');
const functionsPackage = {
  "name": "functions",
  "description": "Cloud Functions for Smart Weld",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express": "^4.18.2",
    "razorpay": "^2.9.2"
  },
  "devDependencies": {
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
};

fs.writeFileSync('functions/package.json', JSON.stringify(functionsPackage, null, 2));

// Create Firebase Functions index.js
const functionsIndex = `const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

admin.initializeApp();

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// Import controllers
const bookingController = require('./controllers/bookingController');
const paymentController = require('./controllers/paymentController');
const notificationController = require('./controllers/notificationController');

// Routes
app.use('/bookings', bookingController);
app.use('/payments', paymentController);
app.use('/notifications', notificationController);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

exports.api = functions.https.onRequest(app);

// Scheduled functions
exports.cleanupOldScans = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    const scansRef = admin.firestore().collection('scans');
    const oldScans = await scansRef
      .where('createdAt', '<', cutoffDate.toISOString())
      .where('status', '==', 'completed')
      .limit(100)
      .get();

    const batch = admin.firestore().batch();
    oldScans.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(\`Cleaned up \${oldScans.size} old scans\`);

    return null;
  });
`;

fs.writeFileSync('functions/src/index.js', functionsIndex);

// Create sample controller
const bookingController = `const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Create booking
router.post('/', async (req, res) => {
  try {
    const { userId, issue, location, pricing } = req.body;

    if (!userId || !issue || !location || !pricing) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingRef = admin.firestore().collection('bookings').doc();
    const booking = {
      bookingId: bookingRef.id,
      userId,
      issue,
      location,
      pricing,
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await bookingRef.set(booking);

    // Update user stats
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      'stats.totalBookings': admin.firestore.FieldValue.increment(1),
      'stats.totalSpent': admin.firestore.FieldValue.increment(pricing.total)
    });

    res.json({ success: true, bookingId: bookingRef.id });
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookingsRef = admin.firestore().collection('bookings');
    const snapshot = await bookingsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
`;

fs.writeFileSync('functions/src/controllers/bookingController.js', bookingController);

// Create environment variables template
const envTemplate = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=smart-weld-b4c44.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-weld-b4c44
VITE_STORAGE_BUCKET=smart-weld-b4c44.firebasestorage.app
VITE_MESSAGING_SENDER_ID=285659832607
VITE_APP_ID=1:285659832607:web:580f50d7dbca409a83102a
VITE_MEASUREMENT_ID=G-NXL6JXPQGH

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Payment Gateway
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Error Monitoring
VITE_SENTRY_DSN=your_sentry_dsn_here

# Environment
NODE_ENV=development
`;

if (!fs.existsSync('.env.example')) {
  fs.writeFileSync('.env.example', envTemplate);
  console.log('✅ Environment template created (.env.example)');
}

// Create Firebase configuration files
const firebaseJson = {
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true
    }
  }
};

if (!fs.existsSync('firebase.json')) {
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseJson, null, 2));
  console.log('✅ Firebase configuration created');
}

// Create Firestore security rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own scans
    match /scans/{scanId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Users can read/write their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Users can read/write their own payments
    match /payments/{paymentId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Users can read/write their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Public settings (read-only)
    match /settings/{document} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }

    // Analytics (admin only)
    match /analytics/{document} {
      allow read, write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}`;

fs.writeFileSync('firestore.rules', firestoreRules);
console.log('✅ Firestore security rules created');

// Create Storage security rules
const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User scan images
    match /scans/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public assets (read-only)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}`;

fs.writeFileSync('storage.rules', storageRules);
console.log('✅ Storage security rules created');

console.log('\n🎉 Backend setup completed!');
console.log('\n📋 Next Steps:');
console.log('1. Copy .env.example to .env and fill in your API keys');
console.log('2. Run: cd functions && npm install');
console.log('3. Run: firebase deploy --only firestore:rules,storage:rules');
console.log('4. Run: firebase deploy --only functions (when ready)');
console.log('5. Start developing with: firebase emulators:start');
console.log('\n📚 Check BACKEND_DATABASE_IMPLEMENTATION_GUIDE.md for detailed instructions');

process.exit(0);