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

    const prompt = `Analyze this image for welding or industrial metal damage. 
    If the image is a person, a face, or a non-industrial object (like a fan), return:
    {"damageType": "Non-Industrial Content", "severity": "None", "method": "No Repair Needed", "time": "0 hrs", "confidence": 1}
    
    Otherwise, provide details on the weld defect:
    Format your response as a JSON object with keys: damageType, severity, method, time.`;

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
        damageType: analysis.damageType || 'Structural Damage',
        severity: analysis.severity || 'Medium',
        method: analysis.method || 'Professional Repair',
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
    method: 'Professional Welding Repair',
    time: '2-4 hrs'
  };

  const lowerText = text.toLowerCase();
  if (lowerText.includes('person') || lowerText.includes('human') || lowerText.includes('face')) {
    analysis.damageType = 'Non-Industrial Content';
    analysis.severity = 'None';
    analysis.method = 'No Repair Needed';
    analysis.time = '0 hrs';
  } else if (lowerText.includes('crack')) analysis.damageType = 'Structural Crack';
  else if (lowerText.includes('porosity')) analysis.damageType = 'Porosity Defect';
  
  return analysis;
};

const generateMockAnalysis = () => {
  const analyses = [
    { damageType: 'Structural Crack', severity: 'High Alert', method: 'TIG Welding Repair', time: '4-6 hrs' },
    { damageType: 'Porosity Defect', severity: 'Medium', method: 'MIG Welding + Grind', time: '2-3 hrs' },
    { damageType: 'Weld Undercut', severity: 'Low', method: 'Fill Weld Pass', time: '1-2 hrs' },
  ];
  return analyses[Math.floor(Math.random() * analyses.length)];
};

const useScanStore = create((set, get) => ({
  currentScan: null,
  scanHistory: [],
  isAnalyzing: false,
  isLoading: false,
  error: null,

  setScanResult: async (imageUrl, token) => {
    set({ isAnalyzing: true });

    try {
      const analysis = await analyzeImageWithAI(imageUrl);
      
      const scanData = {
        imageUrl,
        imageAnalysis: analysis,
        location: null, 
        deviceInfo: { platform: navigator.platform, userAgent: navigator.userAgent }
      };

      const result = {
        ...scanData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

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
