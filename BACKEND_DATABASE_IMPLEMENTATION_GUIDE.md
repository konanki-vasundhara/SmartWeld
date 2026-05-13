# Backend & Database Implementation Guide - Smart Weld

## Current Backend Status
✅ **Implemented:**
- Firebase Authentication (Phone + Google)
- Firestore for real-time cost data
- Google Gemini AI for image analysis
- Basic user profiles and booking system

❌ **Missing/Incomplete:**
- User data persistence
- Scan history storage
- Booking management system
- Payment integration
- Admin dashboard backend
- Analytics and reporting
- Image storage and processing
- Notification system

---

## STEP 1: Enhanced Database Schema Design

### 1.1 Create Firestore Collections

```javascript
// collections to create in Firestore
const collections = {
  users: 'users',
  scans: 'scans',
  bookings: 'bookings',
  payments: 'payments',
  notifications: 'notifications',
  analytics: 'analytics',
  settings: 'settings'
};
```

### 1.2 User Collection Schema
```javascript
// /users/{userId}
{
  uid: "firebase_user_id",
  phoneNumber: "+91xxxxxxxxxx",
  email: "user@example.com", // optional
  displayName: "John Doe",
  profileImage: "https://...",
  createdAt: "2024-01-01T00:00:00Z",
  lastLoginAt: "2024-01-01T00:00:00Z",
  preferences: {
    notifications: true,
    language: "en",
    currency: "INR"
  },
  stats: {
    totalScans: 0,
    totalBookings: 0,
    totalSpent: 0
  },
  location: {
    lat: 12.9716,
    lng: 77.5946,
    address: "Bangalore, Karnataka"
  }
}
```

### 1.3 Scans Collection Schema
```javascript
// /scans/{scanId}
{
  scanId: "scan_123456",
  userId: "user_123",
  imageUrl: "https://storage.googleapis.com/...",
  imageAnalysis: {
    isBlank: false,
    damageType: "Structural Crack",
    severity: "High Alert",
    confidence: 0.95,
    estimatedCost: 5310
  },
  costBreakdown: {
    items: [...],
    totals: {
      subtotal: 4500,
      gst: 810,
      total: 5310
    }
  },
  location: {
    lat: 12.9716,
    lng: 77.5946,
    address: "Bangalore, Karnataka"
  },
  deviceInfo: {
    platform: "web",
    userAgent: "Mozilla/5.0...",
    timestamp: "2024-01-01T00:00:00Z"
  },
  status: "completed", // pending, processing, completed, failed
  createdAt: "2024-01-01T00:00:00Z"
}
```

### 1.4 Bookings Collection Schema
```javascript
// /bookings/{bookingId}
{
  bookingId: "booking_123456",
  userId: "user_123",
  scanId: "scan_123", // optional, linked to scan
  issue: "Broken Chassis",
  description: "Structural damage in main chassis",
  location: {
    lat: 12.9716,
    lng: 77.5946,
    address: "Bangalore, Karnataka"
  },
  assignedTechnician: {
    id: "tech_123",
    name: "Rajesh Kumar",
    phone: "+91xxxxxxxxxx",
    rating: 4.8
  },
  schedule: {
    requestedDate: "2024-01-01",
    requestedTime: "10:00",
    estimatedArrival: "2024-01-01T10:30:00Z",
    actualArrival: null,
    completionTime: null
  },
  pricing: {
    lineItems: [
      { label: "Labor Cost", amount: 3500 },
      { label: "Materials", amount: 1000 }
    ],
    subtotal: 4500,
    gst: 810,
    total: 5310
  },
  payment: {
    method: "GPay",
    status: "pending", // pending, completed, failed, refunded
    transactionId: null,
    paidAt: null
  },
  status: "confirmed", // draft, confirmed, in_progress, completed, cancelled
  priority: "high", // low, medium, high, emergency
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

---

## STEP 2: Firebase Storage Setup

### 2.1 Configure Cloud Storage
```javascript
// Add to firebase.js
import { getStorage } from 'firebase/storage';

export const storage = getStorage(app);
```

### 2.2 Image Upload Utility
```javascript
// src/utils/storage.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadScanImage = async (file, userId) => {
  const timestamp = Date.now();
  const fileName = `scans/${userId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const deleteScanImage = async (path) => {
  const imageRef = ref(storage, path);
  try {
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

---

## STEP 3: Enhanced Authentication System

### 3.1 User Profile Management
```javascript
// src/store/useAuthStore.js - Add these methods
createUserProfile: async (userData) => {
  const userRef = doc(db, 'users', userData.uid);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date().toISOString(),
    stats: { totalScans: 0, totalBookings: 0, totalSpent: 0 }
  });
},

updateUserProfile: async (updates) => {
  const user = get().userProfile;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  set({ userProfile: { ...user, ...updates } });
},

loadUserProfile: async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    set({ userProfile: userData });
    return userData;
  }
  return null;
}
```

### 3.2 Authentication Guards
```javascript
// src/hooks/useAuthGuard.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export const useAuthGuard = (requireAuth = true) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        navigate('/login');
      } else if (!requireAuth && isAuthenticated) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);

  return { isAuthenticated, isLoading };
};
```

---

## STEP 4: Scan Management System

### 4.1 Scan Store Enhancement
```javascript
// src/store/useScanStore.js - Add these methods
saveScanResult: async (scanData) => {
  const scanRef = doc(collection(db, 'scans'));
  const scanId = scanRef.id;

  const scanDoc = {
    scanId,
    userId: scanData.userId,
    imageUrl: scanData.imageUrl,
    imageAnalysis: scanData.analysis,
    costBreakdown: scanData.costs,
    location: scanData.location,
    deviceInfo: {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    },
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  await setDoc(scanRef, scanDoc);

  // Update user stats
  const userRef = doc(db, 'users', scanData.userId);
  await updateDoc(userRef, {
    'stats.totalScans': increment(1),
    lastActivity: new Date().toISOString()
  });

  return scanId;
},

getScanHistory: async (userId, limit = 20) => {
  const q = query(
    collection(db, 'scans'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
},

getScanById: async (scanId) => {
  const scanRef = doc(db, 'scans', scanId);
  const scanSnap = await getDoc(scanRef);

  if (scanSnap.exists()) {
    return { id: scanSnap.id, ...scanSnap.data() };
  }
  return null;
}
```

### 4.2 Scan Results Persistence
```javascript
// Update Scanner.jsx to save results
const handleCapture = async () => {
  // ... existing capture logic ...

  // After analysis, save to database
  try {
    const user = useAuthStore.getState().userProfile;
    if (user) {
      const scanData = {
        userId: user.uid,
        imageUrl: imageUrl,
        analysis: analysis,
        costs: costs,
        location: user.location
      };

      const scanId = await saveScanResult(scanData);
      setScanResult({ ...scanResult, scanId });

      // Navigate to results with scan ID
      navigate('/scan-results');
    }
  } catch (error) {
    console.error('Failed to save scan:', error);
  }
};
```

---

## STEP 5: Booking Management System

### 5.1 Booking Store Enhancement
```javascript
// src/store/useBookingStore.js - Complete implementation
import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

const useBookingStore = create((set, get) => ({
  currentBooking: null,
  bookings: [],
  isLoading: false,
  error: null,

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });

    try {
      const bookingRef = doc(collection(db, 'bookings'));
      const bookingId = bookingRef.id;

      const booking = {
        bookingId,
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(bookingRef, booking);

      // Update user stats
      const userRef = doc(db, 'users', bookingData.userId);
      await updateDoc(userRef, {
        'stats.totalBookings': increment(1),
        'stats.totalSpent': increment(booking.pricing.total)
      });

      set({ currentBooking: booking });
      return bookingId;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserBookings: async (userId) => {
    set({ isLoading: true });

    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ bookings });
      return bookings;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBookingStatus: async (bookingId, status, updates = {}) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status,
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const bookings = get().bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status, ...updates }
          : booking
      );
      set({ bookings });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));

export default useBookingStore;
```

---

## STEP 6: Payment Integration

### 6.1 Payment Store
```javascript
// src/store/usePaymentStore.js
import { create } from 'zustand';

const usePaymentStore = create((set, get) => ({
  paymentMethods: ['GPay', 'PhonePe', 'Paytm', 'Card', 'Net Banking'],
  currentTransaction: null,
  isProcessing: false,
  error: null,

  // Mock payment processing (replace with real payment gateway)
  processPayment: async (paymentData) => {
    set({ isProcessing: true, error: null });

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transaction = {
        transactionId,
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'completed',
        timestamp: new Date().toISOString(),
        bookingId: paymentData.bookingId
      };

      // Save to Firestore
      await setDoc(doc(collection(db, 'payments'), transactionId), transaction);

      set({ currentTransaction: transaction });
      return transaction;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },

  getPaymentHistory: async (userId) => {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}));

export default usePaymentStore;
```

### 6.2 Real Payment Gateway Integration
```javascript
// For production, integrate with:
// - Razorpay (India)
// - Stripe (International)
// - PayPal
// - PhonePe/GPay SDK

// Example Razorpay integration:
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

---

## STEP 7: Notification System

### 7.1 Notification Store
```javascript
// src/store/useNotificationStore.js
import { create } from 'zustand';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  subscribeToNotifications: (userId) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const unreadCount = notifications.filter(n => !n.read).length;

      set({ notifications, unreadCount });
    });

    return unsubscribe;
  },

  markAsRead: async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });

    const notifications = get().notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    set({
      notifications,
      unreadCount: get().unreadCount - 1
    });
  },

  createNotification: async (notificationData) => {
    const notificationRef = doc(collection(db, 'notifications'));

    const notification = {
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(notificationRef, notification);
    return notificationRef.id;
  }
}));

export default useNotificationStore;
```

---

## STEP 8: Analytics & Reporting

### 8.1 Analytics Collection
```javascript
// src/utils/analytics.js
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const trackEvent = async (eventType, eventData) => {
  try {
    await addDoc(collection(db, 'analytics'), {
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      userId: eventData.userId || 'anonymous',
      sessionId: getSessionId()
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

export const trackScanEvent = (scanData) => {
  trackEvent('scan_completed', {
    scanId: scanData.scanId,
    damageType: scanData.analysis.damageType,
    severity: scanData.analysis.severity,
    estimatedCost: scanData.analysis.estimatedCost,
    location: scanData.location
  });
};

export const trackBookingEvent = (bookingData) => {
  trackEvent('booking_created', {
    bookingId: bookingData.bookingId,
    issue: bookingData.issue,
    totalAmount: bookingData.pricing.total,
    paymentMethod: bookingData.payment.method
  });
};
```

---

## STEP 9: Admin Dashboard Backend

### 9.1 Admin Store
```javascript
// src/store/useAdminStore.js
import { create } from 'zustand';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

const useAdminStore = create((set, get) => ({
  dashboardStats: {
    totalUsers: 0,
    totalScans: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentScans: [],
    recentBookings: []
  },
  isLoading: false,

  loadDashboardStats: async () => {
    set({ isLoading: true });

    try {
      // Get counts from collections
      const [usersSnap, scansSnap, bookingsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'scans')),
        getDocs(collection(db, 'bookings'))
      ]);

      const totalUsers = usersSnap.size;
      const totalScans = scansSnap.size;
      const totalBookings = bookingsSnap.size;

      // Calculate revenue
      let totalRevenue = 0;
      bookingsSnap.forEach(doc => {
        const booking = doc.data();
        if (booking.payment?.status === 'completed') {
          totalRevenue += booking.pricing.total;
        }
      });

      // Get recent activity
      const recentScansQuery = query(
        collection(db, 'scans'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const recentBookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const [recentScansSnap, recentBookingsSnap] = await Promise.all([
        getDocs(recentScansQuery),
        getDocs(recentBookingsQuery)
      ]);

      const recentScans = recentScansSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const recentBookings = recentBookingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({
        dashboardStats: {
          totalUsers,
          totalScans,
          totalBookings,
          totalRevenue,
          recentScans,
          recentBookings
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePricing: async (updates) => {
    try {
      const settingsRef = doc(db, 'settings', 'pricing');
      await updateDoc(settingsRef, updates);
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  }
}));

export default useAdminStore;
```

---

## STEP 10: Security & Performance

### 10.1 Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
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

    // Admin only operations
    match /analytics/{document} {
      allow read, write: if request.auth != null &&
        request.auth.token.admin == true;
    }

    // Settings (read-only for users, write for admin)
    match /settings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}
```

### 10.2 Firebase Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /scans/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## STEP 11: Deployment & Production Setup

### 11.1 Environment Variables
```bash
# .env.production
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 11.2 Build Optimization
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['zustand', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
```

### 11.3 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: firebase deploy --only hosting
```

---

## STEP 12: Testing & Monitoring

### 12.1 Unit Tests
```javascript
// src/__tests__/stores.test.js
import { renderHook } from '@testing-library/react';
import { useAuthStore } from '../store/useAuthStore';

test('should initialize auth state', () => {
  const { result } = renderHook(() => useAuthStore());
  expect(result.current.isAuthenticated).toBe(false);
});
```

### 12.2 Integration Tests
```javascript
// src/__tests__/scanFlow.test.js
test('complete scan flow', async () => {
  // Mock camera capture
  // Test image analysis
  // Verify database storage
  // Check cost calculation
});
```

### 12.3 Error Monitoring
```javascript
// src/utils/errorReporting.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
});

export const reportError = (error, context) => {
  Sentry.captureException(error, { contexts: { custom: context } });
};
```

---

## Implementation Timeline

### Phase 1 (Week 1-2): Core Database & Auth
- ✅ Enhanced user profiles
- ✅ Scan history storage
- ✅ Authentication improvements

### Phase 2 (Week 3-4): Booking & Payment
- ✅ Complete booking system
- ✅ Payment integration
- ✅ Notification system

### Phase 3 (Week 5-6): Admin & Analytics
- ✅ Admin dashboard
- ✅ Analytics tracking
- ✅ Reporting features

### Phase 4 (Week 7-8): Production & Security
- ✅ Security rules
- ✅ Performance optimization
- ✅ Deployment setup

---

## Cost Estimation

### Firebase Costs (Monthly)
- Firestore: $0.18/GB stored + $0.06/GB transferred
- Storage: $0.026/GB stored + $0.12/GB downloaded
- Authentication: Free for first 50k users
- Hosting: $0.015/GB stored

### Third-party Services
- Google Gemini AI: $0.0025 per image analysis
- Razorpay: 2% + ₹3 per transaction
- Sentry: $26/month for error monitoring

### Total Estimated Monthly Cost
- Development: $50-100
- Production (100 users): $20-50
- Production (1000 users): $100-300

---

## Next Steps

1. **Start with Phase 1**: Enhance user profiles and scan storage
2. **Set up Firebase Security Rules**: Protect your data
3. **Implement Booking System**: Complete the service workflow
4. **Add Payment Integration**: Enable monetization
5. **Build Admin Dashboard**: For business management
6. **Deploy to Production**: Set up CI/CD and monitoring

This comprehensive backend implementation will transform your Smart Weld app from a prototype into a production-ready SaaS platform! 🚀