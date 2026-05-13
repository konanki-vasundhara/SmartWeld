# Cost Estimator with Camera & Upload Guide

## Overview
The cost estimator now supports **two ways** to provide images and calculate costs:
1. **Camera Capture** - Real-time weld scanning
2. **Device Upload** - Upload existing images from your phone/computer

**Important**: Costs are calculated **regardless of image type** (real image, blank image, or test image).

---

## How to Use

### Option 1: Camera Capture 📷
1. Click **"Scan"** button on Dashboard
2. You'll see the **Camera Mode** active (status bar shows 📷)
3. Point camera at the weld
4. Tap the large **orange camera button** to capture
5. Image is analyzed and cost is calculated

### Option 2: Upload from Device 📁
1. Click **"Scan"** button on Dashboard
2. Tap the **blue image icon** (top-right) to switch to **Upload Mode**
3. Status bar shows 📁 (Upload Mode)
4. Tap the large **orange upload button** to select image
5. Choose image from your device (phone gallery, computer files, etc.)
6. Image is processed and cost is calculated

### Toggle Between Modes
- **Top-right corner**: Blue icon button to switch between camera and upload
- **If camera fails**: "Upload Instead" button appears automatically
- **Status bar**: Shows current mode (📷 or 📁)

---

## Cost Calculation

### What's Included?
Every estimate includes:
- **Material Cost** - Welding materials, steel plates, consumables
- **Labor Charges** - Certified welder time
- **Equipment Cost** - Specialized welding equipment rental
- **Welding Rods** - Consumable electrodes
- **GST (18%)** - Taxes

### Why Costs Show Even with Blank Images?
Blank or blank-ish images still generate cost estimates because:
1. ✓ Cost is calculated from **real-time database** (not image analysis)
2. ✓ System uses **standard welding repair guidelines**
3. ✓ Provides customers with **immediate cost reference**
4. ✓ Real images can refine estimates with AI analysis later

### Real-Time Pricing
All costs are **live from Firestore**:
- Green dot ● = Pricing is active
- Pulsing dot ⭕ = Fetching from database
- Changes in Firestore = All sessions update instantly

---

## Workflow Example

### Scenario 1: Fresh Weld Inspection
```
Dashboard → Tap "Scan" → Camera Mode active
         → Point at damaged weld
         → Tap Orange Button → Capture image
         → View Real-Time Cost: ₹5,310
         → See breakdown (Material, Labor, etc.)
         → Proceed to booking or estimation
```

### Scenario 2: Upload Existing Image
```
Dashboard → Tap "Scan" → Tap Blue Icon (Switch to Upload)
         → Status shows "📁 Upload Mode"
         → Tap Orange Button → Select image
         → View Real-Time Cost: ₹5,310
         → Same breakdown and booking options
```

### Scenario 3: Blank/Test Image
```
Dashboard → Tap "Scan" → Camera/Upload either way
         → Capture or Upload ANY image (even blank)
         → View Real-Time Cost: ₹5,310
         → Cost is calculated from database, not image
         → Full breakdown still displayed
```

---

## Key Features

✅ **Two Input Methods**
- Live camera capture
- Device image upload

✅ **Real-Time Costs**
- Always current from database
- Updates instantly when prices change
- Same cost for blank/real images

✅ **Clear UI**
- Status bar shows current mode
- Mode toggle in top-right
- Instructions at bottom

✅ **Error Handling**
- Camera denied? Auto-offer upload option
- File upload fallback available always

✅ **Cost Transparency**
- Full breakdown shown
- Material, Labor, Equipment, GST visible
- Database-sourced pricing

---

## File Changes Made

### Scanner.jsx
- Added file upload input (`fileInputRef`)
- Added mode toggle (`cameraActive` state)
- Added `handleFileUpload` function
- UI shows both camera and upload buttons
- Status bar indicates current mode

### ScanResults.jsx
- Added cost calculation info box
- Explains camera vs upload vs blank image
- Shows how real-time costs work
- Added error/loading indicators

---

## Testing

### Test Scenario 1: Camera
1. Open app → Scan
2. Should see Camera Mode active
3. Capture any image (or blank)
4. Cost displays: ₹5,310

### Test Scenario 2: Upload
1. Open app → Scan
2. Click blue icon → Switch to Upload Mode
3. Click orange button → Select image
4. Cost displays: ₹5,310

### Test Scenario 3: Price Changes
1. Go to Firebase Console
2. Edit `pricing` collection prices
3. Refresh ScanResults
4. New cost automatically displays

---

## For Administrators

### To Update Costs
Firebase Console → Firestore → `pricing` collection → Edit documents

### Cost Fields
```javascript
{
  name: "Material Cost",
  description: "Description here",
  quantity: 2,
  unit: "Units",
  unitPrice: 600  // ← Change this
}
```

### Auto-Recalculation
- Subtotal = Sum of all (quantity × unitPrice)
- GST = Subtotal × 18%
- Total = Subtotal + GST

All happens automatically in real-time!
