import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AiDetectionIntro() {
  const navigate = useNavigate();
  return (
    <>
      {/*  Hero Visual Section  */}
<section className="relative w-full h-[486px] md:h-[530px] bg-industrial-blue overflow-hidden">
<div className="absolute inset-0 opacity-40">
<img alt="Industrial welding environment" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXUrxf9L2bK7Fb05ccc7xmmsnAdDiC_1Bn-KT3a4hNfiZJovcD4jCg7SttyXRdyxxDyBbpcm3kzZ6xZ7cBzLwA5oYvkT36buJqt9GeG8NfX400_vzBaZpQ9eZYleQlX9oMrsbdA7c8xzbhz7gNX3fZVKRKM5AfBSc9NoLqTI3thPrdGbNnqbiVAT3kFZBvt1RMKAhrqTCGJ6vAAy8dgiW2fBMKTIWr19Ib4aickAeMtC0KSpFhr_hf3ada4xinRcygHMtxex6z1dAR"/>
</div>
<div className="absolute inset-0 flex items-center justify-center p-margin-mobile">
<div className="relative w-full max-w-sm aspect-[9/16] rounded-xl border-4 border-outline bg-black/20 shadow-2xl overflow-hidden">
<img alt="Metal texture scanning" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0Qy6duvnjl-8GxSEaoci5BeT06MtxPzH1g_Yjo2Zgsb6pZVXDInthZtCv944vvShAumLMiQXYuqZkC7z5O2KIDI79l9GcBIT27mXLzOZdzFL3q7AjKzLx1wlncThO32FP6dLq5WaDRE_POVGOioN5CaCO0zEXp4cPnhGY8apHBquhQ3GiWIu74FyoqP9Vl-Gh648jB5j6Go6J4MTGTR-cmtNLXB-OjZIqN4DCmlUhpwDCYdCSesvkrTNBTlyXy2xQlbDNc0_H4VCG"/>
<div className="absolute inset-0 flex flex-col justify-between p-base">
<div className="flex justify-between items-start">
<div className="glass-overlay rounded px-xs py-1 text-[10px] text-white flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">biotech</span>AI ANALYZING...
</div>
<div className="glass-overlay rounded px-xs py-1 text-[10px] text-white">98% CONFIDENCE</div>
</div>
<div className="relative h-2/3 flex items-center justify-center">
<div className="absolute inset-x-4 top-1/4 scan-line animate-pulse"></div>
<div className="w-32 h-32 border-2 border-safety-orange rounded-sm flex items-center justify-center relative">
<div className="absolute -top-6 left-0 bg-safety-orange text-white text-[10px] px-1 font-bold">STRUCTURAL CRACK</div>
<span className="material-symbols-outlined text-safety-orange text-3xl opacity-50">warning</span>
</div>
</div>
<div className="glass-overlay rounded-lg p-sm">
<div className="h-1.5 w-full bg-white/20 rounded-full mb-xs">
<div className="h-full bg-safety-orange w-3/4 rounded-full"></div>
</div>
<div className="text-[10px] text-white/80">Processing Weld Integrity...</div>
</div>
</div>
</div>
</div>
<div className="absolute top-0 left-0 w-full p-margin-mobile flex justify-between items-center">
<span className="font-headline-lg text-headline-lg-mobile text-white font-bold tracking-tight">Smart Weld</span>
<button onClick={() => navigate('/dashboard')} className="text-white/70 font-button-text text-body-sm px-base py-xs hover:text-white transition-colors">Skip</button>
</div>
</section>
<main className="relative bg-surface -mt-xl rounded-t-[32px] px-margin-mobile pt-xl pb-margin-mobile min-h-[397px] flex flex-col items-center text-center">
<div className="flex gap-2 mb-lg">
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
<div className="w-6 h-2 rounded-full bg-safety-orange"></div>
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
</div>
<div className="max-w-md space-y-md mb-xl">
<h1 className="font-headline-lg text-headline-lg md:text-headline-xl text-primary leading-tight">AI Damage Detection</h1>
<p className="font-body-md text-body-md text-on-surface-variant px-base">
  Identify cracks, dents, and corrosion instantly with our advanced AI scanner. Get precise reports in seconds.
</p>
</div>
<div className="w-full max-w-sm flex flex-col gap-sm">
<button onClick={() => navigate('/scanner')} className="w-full h-14 bg-safety-orange text-white font-button-text text-button-text rounded-xl shadow-lg shadow-safety-orange/20 active:scale-95 transition-all flex items-center justify-center gap-base">
  Get Started
  <span className="material-symbols-outlined">arrow_forward</span>
</button>
<div className="grid grid-cols-2 gap-sm">
<div className="bg-surface-container-low border border-outline-variant rounded-xl p-sm flex items-center gap-sm">
<div className="bg-industrial-blue/10 p-xs rounded-lg"><span className="material-symbols-outlined text-industrial-blue">verified</span></div>
<span className="text-label-bold font-label-bold text-on-surface-variant text-left leading-tight">ASTM Compliant</span>
</div>
<div className="bg-surface-container-low border border-outline-variant rounded-xl p-sm flex items-center gap-sm">
<div className="bg-industrial-blue/10 p-xs rounded-lg"><span className="material-symbols-outlined text-industrial-blue">speed</span></div>
<span className="text-label-bold font-label-bold text-on-surface-variant text-left leading-tight">Instant Audit</span>
</div>
</div>
</div>
<div className="mt-xl text-label-bold font-label-bold text-outline uppercase tracking-widest flex items-center gap-xs">
<span className="material-symbols-outlined text-sm">shield</span>
Standardized Engineering Protocol
</div>
</main>
    </>
  );
}
