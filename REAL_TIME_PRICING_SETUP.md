# Real-Time Cost Estimator Setup Guide

## Overview
The cost estimator now supports **real-time pricing updates** from Firebase Firestore. When pricing data changes in the database, the estimates will automatically update across all active client sessions.

## Features
✅ Real-time price updates via Firestore  
✅ Automatic listener management  
✅ Fallback to default prices if Firestore unavailable  
✅ Dynamic calculation with 18% GST  
✅ Error handling and loading states  

## Setup Instructions

### 1. Initialize Firestore Collection
Create a `pricing` collection in your Firebase Firestore with the following documents:

#### Document: `material`
```json
{
  "name": "Material Cost",
  "description": "High-grade structural steel plate inserts",
  "quantity": 2,
  "unit": "Units",
  "unitPrice": 600
}
```

#### Document: `labor`
```json
{
  "name": "Labor Charges",
  "description": "Certified Grade-A Welder (Site Visit + 3 hrs Ops)",
  "quantity": 1,
  "unit": "Job",
  "unitPrice": 2500
}
```

#### Document: `equipment`
```json
{
  "name": "Equipment Cost",
  "description": "Plasma cutter & specialized TIG welding rig",
  "quantity": 1,
  "unit": "Set",
  "unitPrice": 500
}
```

#### Document: `welding-rods`
```json
{
  "name": "Welding Rods",
  "description": "E7018 low-hydrogen electrodes (Pack of 10)",
  "quantity": 1,
  "unit": "Pack",
  "unitPrice": 300
}
```

### 2. Component Usage
The `RepairCostEstimation` component automatically:
- Initializes real-time Firestore listeners on mount
- Updates totals when data changes
- Cleans up listeners on unmount

### 3. Updating Prices
To update pricing in real-time:

1. **Via Firebase Console:**
   - Go to Firestore Database
   - Navigate to `pricing` collection
   - Edit any document field
   - Changes appear instantly in the app

2. **Via Code (Backend API):**
```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Update material cost
await updateDoc(doc(db, 'pricing', 'material'), {
  unitPrice: 650,
  quantity: 3
});
```

### 4. Store Usage
Access the cost store directly:

```javascript
import useCostStore from './store/useCostStore';

function MyComponent() {
  const { costItems, getTotals } = useCostStore();
  const totals = getTotals();
  
  return (
    <div>
      Subtotal: ₹{totals.subtotal}
      GST: ₹{totals.gst}
      Total: ₹{totals.total}
    </div>
  );
}
```

### 5. Adding New Cost Items
To add a new cost category:

1. Add document in Firestore `pricing` collection
2. The app automatically includes it in calculations
3. No code changes needed!

### 6. Manual Updates (if needed)
```javascript
const { updateCostItem } = useCostStore();

// Update a specific item
updateCostItem('material', {
  unitPrice: 700,
  quantity: 2
});
```

## Firestore Security Rules
Add these rules to protect pricing data (adjust as needed):

```javascript
match /pricing/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}
```

## Troubleshooting

**Prices not updating?**
- Check Firestore rules allow read access
- Verify document IDs match exactly
- Check browser console for errors

**Slow performance?**
- Firestore queries are optimized with real-time listeners
- Only active components maintain listeners
- Listeners clean up automatically on unmount

**Want to test locally?**
- Use default prices (fallback works offline)
- Update Firestore and refresh page to see changes

## Files Modified
- `src/store/useCostStore.js` - New store for real-time pricing
- `src/pages/RepairCostEstimation.jsx` - Updated to use real-time data
- `src/firebase.js` - Added Firestore configuration
