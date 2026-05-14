import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useScanStore from '../store/useScanStore';
import useCostStore from '../store/useCostStore';
import { analyzeImage, calculateDynamicCosts, getSeverityColor, getSeverityBars } from '../utils/imageAnalysis';

export default function ScanResults() {
  const currentScan = useScanStore(state => state.currentScan);
  const navigate = useNavigate();

  // Real-time cost store - get all needed data
  const baseCostItems = useCostStore(state => state.costItems);
  const isLoading = useCostStore(state => state.isLoading);
  const error = useCostStore(state => state.error);
  const { getTotals, initializeRealTimeCosts, cleanup } = useCostStore();

  // Image analysis state
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(true);
  const [dynamicCosts, setDynamicCosts] = useState({
    costItems: [],
    totals: { subtotal: 0, gst: 0, total: 0 },
    severity: 'None',
    damageType: 'Analyzing...'
  });

  // Initialize real-time costs on mount
  useEffect(() => {
    initializeRealTimeCosts();
    return () => cleanup();
  }, [initializeRealTimeCosts, cleanup]);

  // Analyze image when component loads or scan changes
  useEffect(() => {
    const processScan = async () => {
      if (currentScan?.imageUrl) {
        setAnalyzingImage(true);
        try {
          let analysis;
          
          // Use existing analysis from store if available (Gemini)
          if (currentScan.imageAnalysis) {
            analysis = currentScan.imageAnalysis;
          } else {
            // Fallback to basic local analysis
            analysis = await analyzeImage(currentScan.imageUrl);
          }
          
          const costs = calculateDynamicCosts(analysis, baseCostItems);
          setImageAnalysis(analysis);
          setDynamicCosts(costs);
          
          // Sync with global store for the detailed estimate page
          useCostStore.getState().syncWithScanResult(analysis);
        } catch (err) {
          console.error('Processing failed:', err);
          setImageAnalysis({ isBlank: true, confidence: 0 });
          setDynamicCosts({
            costItems: [],
            totals: { subtotal: 0, gst: 0, total: 0 },
            severity: 'None',
            damageType: 'Analysis Failed'
          });
        } finally {
          setAnalyzingImage(false);
        }
      }
    };

    processScan();
  }, [currentScan, baseCostItems]);

  // Severity color and bars based on analysis
  const severityColor = getSeverityColor(dynamicCosts.severity);
  const severityBars = getSeverityBars(dynamicCosts.severity);

  return (
    <>
      <TopAppBar title="Smart Weld" />
<main className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
{/*  Hero Section: AI Analysis Result  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Left Column: Detection Thumbnail  */}
<div className="lg:col-span-7 space-y-gutter">
<div className="relative group overflow-hidden rounded-xl industrial-border bg-surface-container-highest shadow-md">
<img 
  className="w-full h-[400px] object-cover grayscale-[0.2] contrast-125" 
  src={currentScan?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAnnKN7V0V3EXiTwJB-w5UsfG031AVqeCC70WtFG7clY4kNllmkqcfFVP329-1xYXNB7Iqa_EYsI5fXDzsavZDnxPJV418iZOT1mGSSeMfGLP-nvc8Iyd6YycwxHfKw4QGw1TD833tV5DQcbHIJ65lJk8Oc45PuKeXJqE8MK0wpEPaAg6KpqDLJ9cwO3TX7dRoVfrjlG5iaQ0VQQ0Y3KM6S7jzJzYL1Qvm6T9VAGqRgvi1chpiS7rtJZ1WZB1XkH6W5xJhQnNsZ3N3P"}
  alt="Analysis Result"
/>
{/*  AI Overlay  */}
<div className="absolute inset-0 flex items-center justify-center">
<div className="w-48 h-32 border-2 border-electric-blue border-dashed rounded-lg flex flex-col items-center justify-center bg-electric-blue/10 backdrop-blur-sm">
<span className="font-label-bold text-electric-blue bg-white px-2 py-0.5 rounded text-[10px] mb-1">
  {analyzingImage ? 'ANALYZING...' : (dynamicCosts.severity?.toUpperCase() || 'NO DAMAGE')}
</span>
<div className="w-full px-4">
<div className="h-1 bg-electric-blue/30 rounded-full overflow-hidden">
<div className="h-full bg-electric-blue" style={{ width: analyzingImage ? '50%' : `${(imageAnalysis?.confidence || 0) * 100}%` }}></div>
</div>
</div>
{!analyzingImage && imageAnalysis?.confidence && (
  <div className="text-[8px] text-electric-blue mt-1">
    {Math.round((imageAnalysis.confidence || 0) * 100)}% confidence
  </div>
)}
</div>
</div>
{/*  Analysis Scanning Effect  */}
<div className="absolute top-0 left-0 w-full scan-line opacity-50"></div>
<div className="absolute bottom-4 left-4 glass-panel px-4 py-2 rounded-lg">
<p className="font-label-bold text-electric-blue flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="biotech">biotech</span>
              AI ANALYSIS: COMPLETE
            </p>
</div>
{currentScan?.timestamp && (
  <div className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-lg">
    <p className="text-[10px] text-on-primary font-label-bold">{currentScan.timestamp}</p>
  </div>
)}
</div>
{/*  Detailed Results List  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-6 rounded-xl industrial-border shadow-sm">
<p className="text-on-surface-variant font-label-bold mb-1">DAMAGE TYPE</p>
<h3 className="font-headline-lg text-headline-lg-mobile text-primary">{dynamicCosts.damageType}</h3>
<p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
  {analyzingImage ? 'Analyzing image content...' :
   imageAnalysis?.isBlank ? 'No structural issues detected in the uploaded image.' :
   `Detected ${dynamicCosts.damageType.toLowerCase()} based on image analysis.`}
</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border-2 border-error/20 shadow-sm relative overflow-hidden">
<div className="absolute top-0 right-0 p-2">
<span className={`material-symbols-outlined ${severityColor}`} data-icon="report" data-weight="fill">report</span>
</div>
<p className="text-on-surface-variant font-label-bold mb-1">SEVERITY LEVEL</p>
<h3 className={`font-headline-lg text-headline-lg-mobile ${severityColor}`}>{dynamicCosts.severity}</h3>
<div className="flex gap-1 mt-3">
  {[1,2,3,4].map(i => (
    <div key={i} className={`h-2 w-full rounded-full ${i <= severityBars ? (severityColor.includes('error') ? 'bg-error' : severityColor.includes('safety-orange') ? 'bg-safety-orange' : 'bg-green-500') : 'bg-gray-200'}`}></div>
  ))}
</div>
</div>
</div>
</div>
{/*  Right Column: Cost and Actions  */}
<div className="lg:col-span-5 space-y-gutter">
{/*  Cost & Method Card  */}
<div className="bg-surface-container p-8 rounded-xl industrial-border shadow-sm border-l-4 border-safety-orange">
<div className="flex justify-between items-start mb-6">
<div>
<p className="text-on-surface-variant font-label-bold">ESTIMATED REPAIR COST</p>
<h2 className="font-headline-xl text-headline-xl text-primary mt-2">₹ {dynamicCosts.totals.total.toLocaleString('en-IN')}</h2>
<p className="text-sm text-on-surface-variant mt-2 flex items-center gap-2">
  {analyzingImage ? (
    <>
      <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
      Analyzing image...
    </>
  ) : imageAnalysis?.isBlank ? (
    <>
      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
      No damage detected
    </>
  ) : (
    <>
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      Analysis complete
    </>
  )}
</p>
</div>
<span className="bg-white p-2 rounded-lg industrial-border">
<span className="material-symbols-outlined text-primary" data-icon="payments">payments</span>
</span>
</div>
<div className="space-y-4">
{dynamicCosts.totals.subtotal > 0 ? (
  <>
    <div className="flex items-center justify-between py-3 border-b border-outline-variant">
      <span className="text-on-surface-variant">Subtotal</span>
      <span className="font-label-bold text-primary">₹ {dynamicCosts.totals.subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div className="flex items-center justify-between py-3 border-b border-outline-variant">
      <span className="text-on-surface-variant">GST (18%)</span>
      <span className="font-label-bold text-primary">₹ {dynamicCosts.totals.gst.toLocaleString('en-IN')}</span>
    </div>
    <div className="flex items-center justify-between py-3">
      <span className="text-on-surface-variant">Total Amount</span>
      <span className="font-label-bold text-primary">₹ {dynamicCosts.totals.total.toLocaleString('en-IN')}</span>
    </div>
  </>
) : (
  <div className="flex items-center justify-center py-8 text-center">
    <div>
      <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">check_circle</span>
      <p className="text-gray-500 font-label-bold">No Repair Needed</p>
      <p className="text-sm text-gray-400 mt-1">Image analysis shows no damage</p>
    </div>
  </div>
)}
{error && (
  <p className="text-xs text-error mt-2">Note: Using default pricing</p>
)}
</div>
</div>
{/*  Spare Parts Bento Card  */}
<div className="bg-surface-container-highest p-6 rounded-xl industrial-border">
<h4 className="font-label-bold text-primary mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-[20px]" data-icon="extension">extension</span>
            COST BREAKDOWN
          </h4>
<div className="space-y-3">
{dynamicCosts.costItems && dynamicCosts.costItems.length > 0 ? (
  dynamicCosts.costItems.map((item) => (
    <div key={item.id} className="flex items-center gap-4 bg-surface p-3 rounded-lg border border-outline-variant hover:border-primary transition-all">
      <div className="w-12 h-12 bg-surface-container rounded-md flex items-center justify-center font-bold text-primary border border-outline-variant text-sm">
        {item.quantity}
      </div>
      <div className="flex-1">
        <p className="font-label-bold text-primary">{item.name}</p>
        <p className="text-xs text-on-surface-variant">{item.description}</p>
      </div>
      <p className="font-bold text-primary">₹ {item.total.toLocaleString('en-IN')}</p>
    </div>
  ))
) : (
  <div className="text-center py-8">
    <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">info</span>
    <p className="text-gray-500 font-label-bold">No Costs Required</p>
    <p className="text-sm text-gray-400 mt-1">Image analysis detected no damage</p>
  </div>
)}
</div>
</div>
{/*  CTA Buttons  */}
<div className="space-y-3">
<button onClick={() => navigate('/emergency-booking')} className="w-full h-[56px] bg-safety-orange text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md">
<span className="material-symbols-outlined" data-icon="storefront">storefront</span>
            Find Nearby Shops
          </button>
<button onClick={() => navigate('/repair-cost-estimation')} className="w-full h-[56px] bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-on-surface-variant active:scale-95 transition-all shadow-sm">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
            Detailed Cost Estimate
          </button>
</div>

{/*  Cost Calculation Info  */}
<div className="bg-secondary-container/20 border border-secondary-container/50 rounded-lg p-4 mt-4">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary text-xl shrink-0">info</span>
<div>
<h4 className="font-label-bold text-secondary mb-1">How Cost is Calculated</h4>
<p className="text-sm text-on-surface-variant leading-relaxed">
  ✓ <strong>Blank Images</strong> = ₹0 (No damage detected)<br/>
  ✓ <strong>Real Images</strong> = Dynamic cost based on damage severity<br/>
  ✓ <strong>AI Analysis</strong> = Automatic detection of cracks, porosity, and wear<br/>
  ✓ <strong>Real-time Pricing</strong> = Costs update instantly from database<br/>
  <br/>
  <strong>Cost Scale:</strong> Low damage (₹1,500) → High damage (₹5,310)
</p>
</div>
</div>
</div>
</div>
</div>
</main>
    </>
  );
}
