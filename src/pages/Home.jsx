import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initializeAuth();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initializeAuth]);

  const [activeFeature, setActiveFeature] = useState(null);

  const services = [
    { 
      id: 'ai-detection',
      title: 'AI Defect Detection', 
      icon: 'biotech', 
      desc: 'Utilizing neural networks to identify cracks, porosity, and slag inclusions with 99.2% accuracy.',
      color: 'bg-blue-500/10 text-blue-400',
      details: {
        innovation: 'Deep Learning Vision',
        dataPoints: ['3.5M+ Training Samples', 'Real-time 60FPS Analysis', 'ISO 5817 Compliance Check'],
        techStack: 'TensorFlow, OpenCV, CUDA'
      }
    },
    { 
      id: 'costing',
      title: 'Precision Costing', 
      icon: 'calculate', 
      desc: 'Real-time market data integration providing instant repair and material estimations.',
      color: 'bg-orange-500/10 text-orange-400',
      details: {
        innovation: 'Predictive Market Analysis',
        dataPoints: ['Live LME Metal Pricing', 'Regional Labor Indexing', 'Predictive Material Waste Reduction'],
        techStack: 'Real-time Market APIs, Regression Models'
      }
    },
    { 
      id: 'experts',
      title: 'Expert Network', 
      icon: 'engineering', 
      desc: 'Connect with ISO-certified welding specialists and nearby fabrication hubs instantly.',
      color: 'bg-green-500/10 text-green-400',
      details: {
        innovation: 'Verified Hub Ecosystem',
        dataPoints: ['GPS-based Proximity Routing', 'Blockchain-verified Certificates', '98% Service Fulfillment Rate'],
        techStack: 'Geo-Spatial Mapping, Smart Verification'
      }
    },
    { 
      id: 'vassu',
      title: 'Industrial AI (Vassu)', 
      icon: 'psychology', 
      desc: 'A specialized LLM trained on 50+ years of welding standards and metalurgy data.',
      color: 'bg-purple-500/10 text-purple-400',
      details: {
        innovation: 'Domain-Specific LLM',
        dataPoints: ['AWS D1.1 Knowledge Base', 'Multilingual Support (12 Languages)', 'Safety Protocol Synthesis'],
        techStack: 'Custom Fine-tuned LLM, RAG Architecture'
      }
    }
  ];

  const stats = [
    { label: 'Defects Detected', value: '1.2M+' },
    { label: 'Certified Welders', value: '15k+' },
    { label: 'Processing Speed', value: '< 2s' },
    { label: 'Accuracy Rate', value: '99.2%' },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white selection:bg-safety-orange selection:text-white">
      {/* ── Feature Detail Modal ── */}
      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveFeature(null)} />
          <div className="relative w-full max-w-4xl bg-[#161B22] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in-up">
            <button 
              onClick={() => setActiveFeature(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/50 hover:text-white z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex flex-col md:flex-row h-full">
              <div className="flex-1 p-10 md:p-14">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${activeFeature.color}`}>
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{activeFeature.icon}</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">{activeFeature.title}</h3>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">{activeFeature.desc}</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-safety-orange font-bold text-xs uppercase tracking-widest mb-3">Core Innovation</h4>
                    <p className="text-xl font-semibold">{activeFeature.details.innovation}</p>
                  </div>
                  <div>
                    <h4 className="text-safety-orange font-bold text-xs uppercase tracking-widest mb-3">Technical Data</h4>
                    <ul className="space-y-3">
                      {activeFeature.details.dataPoints.map(point => (
                        <li key={point} className="flex items-center gap-3 text-white/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-safety-orange" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-[#1C2128] p-10 md:p-14 flex flex-col justify-center">
                <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
                  <h4 className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-6">Internal Tech Stack</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {activeFeature.details.techStack.split(', ').map(tech => (
                      <div key={tech} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-safety-orange/30 transition-all">
                        <span className="font-mono text-sm text-white/80">{tech}</span>
                        <span className="text-[10px] font-bold text-safety-orange">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12">
                    <button 
                      onClick={() => { 
                        const routes = {
                          'ai-detection': '/scanner',
                          'costing': '/repair-cost-estimation',
                          'experts': '/emergency-booking',
                          'vassu': '/vassu-ai'
                        };
                        navigate(routes[activeFeature.id]); 
                        setActiveFeature(null); 
                      }}
                      className="w-full h-14 bg-safety-orange text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {activeFeature.id === 'ai-detection' ? 'START LIVE SCAN' : 'OPEN PLATFORM'}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 h-20 flex items-center justify-between ${scrolled ? 'bg-[#0D1117]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-10 h-10 bg-safety-orange rounded-lg flex items-center justify-center shadow-lg shadow-safety-orange/20">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
          </div>
          <span className="font-bold text-2xl tracking-tighter">SMART<span className="text-safety-orange">WELD</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-white/70">
          <a href="#services" className="hover:text-safety-orange transition-colors">Services</a>
          <a href="#how-it-works" className="hover:text-safety-orange transition-colors">Technology</a>
          <a href="#about" className="hover:text-safety-orange transition-colors">About</a>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
        
        {/* Mobile menu button could go here */}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/60 via-[#0D1117]/40 to-[#0D1117] z-10" />
          <img
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            src="/images/hero-bg.png"
            alt="Industrial Welding Hero"
          />
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Industry 4.0 Standard</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9] animate-fade-in-up delay-100">
            ENGINEERING THE<br />
            <span className="text-safety-orange">FUTURE OF WELDS</span>
          </h1>
          
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Harness the power of Computer Vision and Neural Networks to ensure structural integrity. The world's most advanced AI welding inspector.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/scanner')}
              className="px-8 h-14 bg-safety-orange text-white font-bold rounded-full shadow-2xl shadow-safety-orange/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
            >
              LAUNCH AI SCANNER
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 h-14 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
            >
              EXPLORE PLATFORM
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-safety-orange to-transparent" />
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="relative z-20 py-20 border-y border-white/5 bg-[#0D1117]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{s.value}</div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-safety-orange font-bold text-sm uppercase tracking-widest mb-4">Core Ecosystem</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">A unified intelligence for industrial fabrication.</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div 
                key={s.title}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-safety-orange/30 hover:bg-white/[0.07] transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-4">{s.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  {s.desc}
                </p>
                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setActiveFeature(s)}
                    className="text-xs font-bold text-safety-orange uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    View Capabilities <span className="material-symbols-outlined text-sm">east</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-32 bg-white/5 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1">
              <h2 className="text-safety-orange font-bold text-sm uppercase tracking-widest mb-4">The Process</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">From visual scan to structural report.</h3>
              
              <div className="space-y-12">
                {[
                  { step: '01', title: 'High-Res Data Acquisition', desc: 'Upload images or use live camera feed from any mobile device or industrial inspection camera.' },
                  { step: '02', title: 'Neural Analysis', desc: 'Our proprietary models analyze pixel data to identify weld bead quality and internal defects.' },
                  { step: '03', title: 'Actionable Intelligence', desc: 'Receive instant grading based on ISO standards and a predictive repair cost estimation.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="text-4xl font-black text-white/10">{item.step}</div>
                    <div>
                      <h5 className="text-lg font-bold mb-2">{item.title}</h5>
                      <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800" 
                  alt="AI Analysis Preview"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-safety-orange/10 mix-blend-overlay" />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-effect rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">Live Analysis Status</span>
                    <span className="text-xs font-bold text-green-400">OPTIMAL</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-safety-orange w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-safety-orange/20 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto p-16 rounded-[3rem] bg-gradient-to-br from-safety-orange/20 to-transparent border border-safety-orange/30">
            <h3 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready to modernize your inspection workflow?</h3>
            <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
              Experience the precision of Smart Weld today. No hardware installation required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/scanner')}
                className="px-10 h-16 bg-white text-[#0D1117] font-bold rounded-full hover:scale-105 transition-all"
              >
                Try Free Demo
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-10 h-16 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-safety-orange text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
                <span className="font-bold text-xl text-white tracking-tighter">SMARTWELD</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Empowering the welding industry with precision AI analysis and secure data management.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Platform</h5>
                <ul className="space-y-4 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Weld Scanner</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cost Estimator</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Company</h5>
                <ul className="space-y-4 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Legal</h5>
                <ul className="space-y-4 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-white/30 text-[10px] font-bold uppercase tracking-widest">
            <div>© 2024 SMART WELD TECHNOLOGIES. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-8">
              <span>ISO 9606-1 CERTIFIED</span>
              <span>PCI-DSS SECURE</span>
              <span>GDPR COMPLIANT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
