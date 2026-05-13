import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';
import api from '../utils/api';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const visionModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

// Analyze image using Google Gemini Vision API
const analyzeImageWithAI = async (imageData) => {
  if (!visionModel) {
    return generateMockAnalysis();
  }

  try {
    let base64Data = imageData;
    if (imageData.startsWith('data:image/')) {
      base64Data = imageData.split(',')[1];
    }

    const prompt = `Analyze this welding/metal structure image for damage or defects. Provide a detailed assessment including:

1. Damage Type: Identify the specific type of weld defect or structural damage (e.g., crack, porosity, undercut, burn-through, incomplete fusion, etc.)
2. Severity Level: Classify as "High Alert", "Medium", or "Low" based on safety and structural integrity impact
3. Estimated Cost: Provide a realistic cost range in Indian Rupees (₹) for professional repair
4. Repair Method: Suggest the appropriate welding repair technique
5. Estimated Time: Provide time estimate for the repair work

Format your response as a JSON object with keys: damageType, severity, estimatedCost, method, time.`;

    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      return {
        damageType: analysis.damageType || 'Unknown Damage',
        severity: analysis.severity || 'Medium',
        estimatedCost: analysis.estimatedCost || '₹ 2,000 - ₹ 3,000',
        method: analysis.method || 'Professional Assessment Required',
        time: analysis.time || '2-4 hrs'
      };
    } catch {
      return parseAnalysisFromText(text);
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return generateMockAnalysis();
  }
};

const parseAnalysisFromText = (text) => {
  const analysis = {
    damageType: 'Structural Damage',
    severity: 'Medium',
    estimatedCost: '₹ 2,000 - ₹ 3,000',
    method: 'Professional Welding Repair',
    time: '2-4 hrs'
  };

  const lowerText = text.toLowerCase();
  if (lowerText.includes('crack')) analysis.damageType = 'Structural Crack';
  else if (lowerText.includes('porosity')) analysis.damageType = 'Porosity Defect';
  else if (lowerText.includes('undercut')) analysis.damageType = 'Weld Undercut';
  else if (lowerText.includes('burn')) analysis.damageType = 'Burn-Through';
  else if (lowerText.includes('fusion')) analysis.damageType = 'Incomplete Fusion';

  if (lowerText.includes('high') || lowerText.includes('critical') || lowerText.includes('severe')) {
    analysis.severity = 'High Alert';
    analysis.estimatedCost = '₹ 4,000 - ₹ 6,000';
  } else if (lowerText.includes('low') || lowerText.includes('minor')) {
    analysis.severity = 'Low';
    analysis.estimatedCost = '₹ 1,000 - ₹ 2,000';
  }

  return analysis;
};

const generateMockAnalysis = () => {
  const analyses = [
    { damageType: 'Structural Crack', severity: 'High Alert', estimatedCost: '₹ 4,500 - ₹ 5,200', method: 'TIG Welding Repair', time: '4-6 hrs' },
    { damageType: 'Porosity Defect', severity: 'Medium', estimatedCost: '₹ 2,800 - ₹ 3,400', method: 'MIG Welding + Grind', time: '2-3 hrs' },
    { damageType: 'Weld Undercut', severity: 'Low', estimatedCost: '₹ 1,200 - ₹ 1,800', method: 'Fill Weld Pass', time: '1-2 hrs' },
    { damageType: 'Burn-Through', severity: 'High Alert', estimatedCost: '₹ 5,000 - ₹ 6,500', method: 'Patch & Re-weld', time: '5-8 hrs' },
    { damageType: 'Incomplete Fusion', severity: 'Medium', estimatedCost: '₹ 3,000 - ₹ 3,800', method: 'Root Pass Re-weld', time: '3-4 hrs' },
  ];
  return analyses[Math.floor(Math.random() * analyses.length)];
};

const useScanStore = create((set, get) => ({
  currentScan: null,
  scanHistory: [],
  isAnalyzing: false,
  isLoading: false,
  error: null,

  fetchScanHistory: async (token) => {
    set({ isLoading: true });
    try {
      const scans = await api.get('/scans', token);
      set({ scanHistory: scans, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch scans:', error);
      set({ error: 'Failed to load scan history', isLoading: false });
    }
  },

  setScanResult: async (imageUrl, token) => {
    set({ isAnalyzing: true });

    try {
      const analysis = await analyzeImageWithAI(imageUrl);
      
      const scanData = {
        imageUrl,
        imageAnalysis: analysis,
        costBreakdown: { estimatedCost: analysis.estimatedCost },
        location: null, // Can be added from geolocation hook
        deviceInfo: { platform: navigator.platform, userAgent: navigator.userAgent }
      };

      let result;
      if (token) {
        // Save to backend if authenticated
        result = await api.post('/scans', scanData, token);
      } else {
        // Mock result if not authenticated
        result = {
          ...scanData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
      }

      set((state) => ({
        currentScan: result,
        scanHistory: [result, ...state.scanHistory].slice(0, 10),
        isAnalyzing: false,
      }));

      return result;
    } catch (error) {
      console.error('Scan analysis failed:', error);
      set({ isAnalyzing: false });
      return null;
    }
  },

  clearCurrentScan: () => set({ currentScan: null }),
}));

export default useScanStore;
