import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useCostStore from '../store/useCostStore';

import useScanStore from '../store/useScanStore';

export default function RepairCostEstimation() {
  const navigate = useNavigate();
  const currentScan = useScanStore(state => state.currentScan);
  const { costItems, getTotals, initializeRealTimeCosts, cleanup, isLoading, error, estimationNumber, issueDate } = useCostStore();
  const [totals, setTotals] = useState({ subtotal: 0, gst: 0, total: 0 });

  // Initialize real-time cost listener on component mount
  useEffect(() => {
    initializeRealTimeCosts();
    return () => cleanup(); // Cleanup on unmount
  }, [initializeRealTimeCosts, cleanup]);

  // Update totals when cost items change
  useEffect(() => {
    const newTotals = getTotals();
    setTotals(newTotals);
  }, [costItems, getTotals]);
  return (
    <>
      <TopAppBar title="Smart Weld" />
<main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
{/*  AI Insight Overlay (Glassmorphism)  */}
<section className="glass-ai rounded-xl p-md mb-lg flex flex-col md:flex-row items-center gap-md border border-outline-variant/30">
<div className="h-16 w-16 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-white text-3xl" data-icon="smart_toy">smart_toy</span>
</div>
<div>
<h2 className="font-headline-lg text-lg text-primary mb-1">AI Cost Analysis Complete</h2>
<p className="text-on-surface-variant font-body-sm">Our precision algorithms have analyzed the structural weld fatigue. The following estimation reflects the industrial-grade materials and certified labor required for a permanent fix.</p>
</div>
</section>
{/*  Invoice Structure  */}
<div className="bg-white border border-outline-variant rounded-lg industrial-shadow overflow-hidden">
{/*  Invoice Header  */}
<div className="p-md bg-surface-container-low border-b border-outline-variant flex flex-col md:flex-row justify-between gap-md">
<div>
<p className="font-label-bold text-outline uppercase tracking-widest mb-1">Estimation Number</p>
<p className="font-headline-lg text-xl font-bold">{estimationNumber}</p>
</div>
<div className="text-left md:text-right">
<p className="font-label-bold text-outline uppercase tracking-widest mb-1">Date Issued</p>
<p className="font-body-md font-medium">{issueDate}</p>
</div>
</div>
{/*  Industrial Table  */}
<div className="overflow-x-auto">
<table className="w-full border-collapse">
<thead>
<tr className="bg-surface-container-highest">
<th className="text-left py-md px-md font-label-bold text-on-surface-variant uppercase">Service &amp; Materials</th>
<th className="text-right py-md px-md font-label-bold text-on-surface-variant uppercase">Quantity</th>
<th className="text-right py-md px-md font-label-bold text-on-surface-variant uppercase">Unit Price</th>
<th className="text-right py-md px-md font-label-bold text-on-surface-variant uppercase">Total</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{costItems.map((item) => (
  <tr key={item.id}>
    <td className="py-md px-md">
      <p className="font-body-md font-bold text-primary">{item.name}</p>
      <p className="text-body-sm text-on-surface-variant">{item.description}</p>
    </td>
    <td className="py-md px-md text-right font-body-md">{item.quantity} {item.unit}</td>
    <td className="py-md px-md text-right font-body-md">₹ {item.unitPrice.toLocaleString('en-IN')}</td>
    <td className="py-md px-md text-right font-body-md">₹ {item.total.toLocaleString('en-IN')}</td>
  </tr>
))}
</tbody>
</table>
</div>
{/*  Totals Section  */}
<div className="p-md bg-surface-container-lowest border-t border-outline-variant flex flex-col items-end gap-sm">
<div className="flex justify-between w-full gap-md">
<span className="text-on-surface-variant font-body-md">Subtotal</span>
<span className="font-body-md font-medium text-primary text-right">₹ {totals.subtotal.toLocaleString('en-IN')}</span>
</div>
<div className="flex justify-between w-full gap-md">
<span className="text-on-surface-variant font-body-md">GST (18%)</span>
<span className="font-body-md font-medium text-primary text-right">₹ {totals.gst.toLocaleString('en-IN')}</span>
</div>
<div className="flex justify-between w-full gap-md mt-base pt-base border-t border-outline-variant">
<span className="text-primary font-headline-lg text-lg font-bold">Total Estimate</span>
<span className="font-headline-lg font-extrabold text-safety-orange tracking-tight text-right">₹ {totals.total.toLocaleString('en-IN')}</span>
</div>
{isLoading && (
<p className="text-sm text-on-surface-variant mt-md">Loading real-time pricing...</p>
)}
{error && (
<p className="text-sm text-error mt-md">Error loading pricing: {error}</p>
)}
</div>
</div>
{/*  Safety Disclaimer & Inspection Photo  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-md mt-lg">
<div className="md:col-span-1">
<div className="rounded-lg overflow-hidden border border-outline-variant aspect-square bg-surface-container">
<img 
  alt="Weld Scan Result" 
  className="w-full h-full object-cover" 
  src={currentScan?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDFddH73yxm1dJNMGVH_waQmuXT32706xKdXipTMLEeMZ5d6mwcHg1KyymKmlyf83sbEyuY0sfK0drCx0jMzrHO4HUJvI-sQtrKkZm2vTfLDUx-GyVlVk2Q8XlvgRVgdwCR70XnABAtAygsXTGsECBKdzPWhu0bFDyDv8gN7F-WeaWtydk8FZC4RmQ8GkdPE5m1b69Hf3jzxRWIjvoqvhi4VdR4zuyStj6QYr9jNEca4Fu81TAPhH1XtDSYgKE5MnSByD7cPSG2-GuN"} 
/>
</div>
</div>
<div className="md:col-span-2 flex flex-col justify-center">
<div className="flex items-start gap-sm p-md bg-secondary-container/30 rounded-lg border border-secondary-container">
<span className="material-symbols-outlined text-secondary" data-icon="info">info</span>
<div>
<p className="font-label-bold text-secondary uppercase mb-1">Standard Compliance</p>
<p className="text-body-sm text-on-secondary-container">This estimate complies with ISO 9606-1 fusion welding standards. Price includes a 6-month integrity guarantee on all work performed.</p>
</div>
</div>
</div>
</div>
{/*  Primary Action Buttons  */}
<div className="mt-xl flex flex-col sm:flex-row gap-md">
<button onClick={() => navigate('/checkout')} className="flex-1 bg-safety-orange text-white h-12 rounded-lg font-button-text text-button-text flex items-center justify-center gap-base active:scale-95 transition-all shadow-md">
<span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                Confirm Booking
            </button>
<button className="flex-1 border-2 border-primary text-primary h-12 rounded-lg font-button-text text-button-text flex items-center justify-center gap-base active:scale-95 transition-all hover:bg-surface-container-high">
<span className="material-symbols-outlined" data-icon="download">download</span>
                Download Estimate (PDF)
            </button>
</div>
</main>
    </>
  );
}
