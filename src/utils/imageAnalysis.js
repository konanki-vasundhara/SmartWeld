/**
 * Image Analysis Utility for Smart Weld
 * Analyzes images to determine if they are blank and estimates repair costs
 */

export const analyzeImage = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Analyze image for content
      const analysis = analyzeImageData(data, canvas.width, canvas.height);

      resolve({
        isBlank: analysis.isBlank,
        hasContent: analysis.hasContent,
        severity: analysis.severity,
        damageType: analysis.damageType,
        confidence: analysis.confidence
      });
    };

    img.onerror = () => {
      // If image fails to load, assume it's blank
      resolve({
        isBlank: true,
        hasContent: false,
        severity: 'None',
        damageType: 'No Damage Detected',
        confidence: 0
      });
    };

    img.src = imageUrl;
  });
};

const analyzeImageData = (data, width, height) => {
  let totalPixels = width * height;
  let nonWhitePixels = 0;
  let darkPixels = 0;
  let edgePixels = 0;

  // Sample pixels (not all for performance)
  const sampleRate = Math.max(1, Math.floor(totalPixels / 1)); // Sample ~10k pixels max

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    // Count non-white pixels (assuming white background)
    if (brightness < 240) { // Not pure white
      nonWhitePixels++;
    }

    // Count dark pixels (potential damage)
    if (brightness < 1) {
      darkPixels++;
    }

    // Simple edge detection (basic)
    const x = Math.floor((i / 4) % width);
    const y = Math.floor((i / 4) / width);

    if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
      const currentBrightness = brightness;
      const rightBrightness = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      const bottomBrightness = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;

      if (Math.abs(currentBrightness - rightBrightness) > 30 || Math.abs(currentBrightness - bottomBrightness) > 30) {
        edgePixels++;
      }
    }
  }

  const nonWhiteRatio = nonWhitePixels / (totalPixels / sampleRate);
  const darkRatio = darkPixels / (totalPixels / sampleRate);
  const edgeRatio = edgePixels / (totalPixels / sampleRate);

  // Determine if image is blank
  const isBlank = nonWhiteRatio < 0.01; // Less than 1% non-white pixels

  if (isBlank) {
    return {
      isBlank: true,
      hasContent: false,
      severity: 'None',
      damageType: 'No Damage Detected',
      confidence: 0.95
    };
  }

  // Analyze damage based on image characteristics
  let severity = 'Low';
  let damageType = 'Minor Surface Issues';

  if (darkRatio > 0.1) {
    severity = 'High Alert';
    damageType = 'Structural Crack';
  } else if (darkRatio > 0.05) {
    severity = 'Medium';
    damageType = 'Surface Damage';
  } else if (edgeRatio > 0.15) {
    severity = 'Medium';
    damageType = 'Edge Wear';
  }

  return {
    isBlank: false,
    hasContent: true,
    severity,
    damageType,
    confidence: Math.min(0.9, nonWhiteRatio * 2) // Confidence based on content
  };
};

/**
 * Calculate dynamic costs based on image analysis
 * @param {object} analysis - Result from analyzeImage
 * @param {array} baseCostItems - Base cost items from store
 * @returns {object} - Dynamic cost breakdown
 */
export const calculateDynamicCosts = (analysis, baseCostItems) => {
  if (analysis.isBlank || analysis.severity === 'None') {
    return {
      costItems: [],
      totals: { subtotal: 0, gst: 0, total: 0 },
      severity: 'None',
      damageType: 'No Damage Detected',
      confidence: analysis.confidence
    };
  }

  // Scale costs based on severity
  const severityMultipliers = {
    'High Alert': 1.0,
    'Medium': 0.6,
    'Low': 0.3,
    'None': 0
  };
  
  const scaleFactor = severityMultipliers[analysis.severity] || 0.5;

  const dynamicCostItems = baseCostItems.map(item => ({
    ...item,
    total: Math.round(item.unitPrice * item.quantity * scaleFactor),
    unitPrice: Math.round(item.unitPrice * scaleFactor)
  }));

  const subtotal = dynamicCostItems.reduce((sum, item) => sum + item.total, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return {
    costItems: dynamicCostItems,
    totals: { subtotal, gst, total },
    severity: analysis.severity,
    damageType: analysis.damageType,
    confidence: analysis.confidence
  };
};

/**
 * Get severity color based on analysis
 */
export const getSeverityColor = (severity) => {
  const colors = {
    'High Alert': 'text-error',
    'Medium': 'text-safety-orange',
    'Low': 'text-green-5',
    'None': 'text-gray-5'
  };
  return colors[severity] || 'text-gray-5';
};

/**
 * Get severity bars count
 */
export const getSeverityBars = (severity) => {
  const bars = {
    'High Alert': 4,
    'Medium': 3,
    'Low': 2,
    'None': 0
  };
  return bars[severity] || 0;
};