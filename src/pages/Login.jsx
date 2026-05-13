import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    otpSent,
    error,
    requestOTP,
    verifyOTP,
    loginWithGoogle,
    resetAuth,
    initializeAuth
  } = useAuthStore();

  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [timer, setTimer] = useState(0);
  
  // Registration Fields (For new users)
  const [showRegFields, setShowRegFields] = useState(false);
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    workshopName: '',
    specialization: 'Industrial Welding'
  });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const success = await requestOTP(emailInput);
    if (success) {
      setTimer(30);
    }
  };

  const handleResendOTP = async () => {
    if (timer === 0) {
      const success = await requestOTP(emailInput);
      if (success) setTimer(30);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const success = await verifyOTP(otpInput, regData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleBackToEmail = () => {
    resetAuth();
    setEmailInput('');
    setOtpInput('');
    setTimer(0);
    setShowRegFields(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#06101d] flex flex-col items-center justify-center p-6 relative font-sans selection:bg-safety-orange selection:text-white">
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-safety-orange/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-industrial-blue/20 blur-[120px] rounded-full" />
      
      {/* ── Logo (Now Flow-Based to prevent overlap) ── */}
      <div className="flex items-center gap-3 cursor-pointer z-20 mb-8" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-safety-orange rounded-lg flex items-center justify-center shadow-lg shadow-safety-orange/20">
          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
        </div>
        <span className="font-bold text-2xl tracking-tighter text-white uppercase">Smart<span className="text-safety-orange">Weld</span></span>
      </div>

      {/* ── Main Card ── */}
      <div className="w-full max-w-[520px] z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12 shadow-2xl backdrop-blur-3xl">
          
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center rounded-full bg-safety-orange/20 px-4 py-1.5 text-safety-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                Industrial OTP Access
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
                {otpSent ? 'Verify Access' : 'Official Portal'}
              </h2>
              <div className="max-w-[320px] mx-auto">
                <p className="text-white/90 text-sm leading-relaxed break-words">
                  {otpSent 
                    ? `An industrial access code has been sent to` : 'Enter your work email to receive a secure login code.'}
                </p>
                {otpSent && (
                  <p className="text-safety-orange font-bold text-sm mt-1 break-all">
                    {emailInput}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3 animate-fade-in-up">
                <span className="material-symbols-outlined text-sm">info</span>
                {error}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-3 ml-1">Work Email Identity</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@workshop.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg font-medium text-white outline-none focus:border-safety-orange transition-all focus:bg-white/[0.08] placeholder:text-white/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !emailInput.includes('@')}
                  className="w-full bg-safety-orange text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-safety-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>REQUEST ACCESS CODE <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-fade-in-up">
                {/* ── Registration Fields (Only shown if user wants to pre-fill) ── */}
                <div className="flex flex-col gap-6">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Profile Details</span>
                      <button 
                        onClick={() => setShowRegFields(!showRegFields)}
                        className="text-[10px] font-bold text-safety-orange uppercase tracking-widest hover:underline"
                      >
                        {showRegFields ? 'Hide Details' : 'Add Name/Workshop'}
                      </button>
                   </div>

                   {showRegFields && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={regData.name}
                          onChange={(e) => setRegData({...regData, name: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={regData.phone}
                          onChange={(e) => setRegData({...regData, phone: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                        />
                        <input
                          type="text"
                          placeholder="Workshop Name"
                          value={regData.workshopName}
                          onChange={(e) => setRegData({...regData, workshopName: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                        />
                        <select 
                          value={regData.specialization}
                          onChange={(e) => setRegData({...regData, specialization: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                        >
                          <option value="Industrial Welding">Industrial Welding</option>
                          <option value="Fabrication">Fabrication</option>
                          <option value="Inspection">Inspection</option>
                        </select>
                      </div>
                   )}

                  <input
                    autoFocus
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-5xl font-black tracking-[0.4em] text-white outline-none focus:border-safety-orange transition-all focus:bg-white/[0.08]"
                  />
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleOtpSubmit}
                    disabled={isLoading || otpInput.length !== 6}
                    className="w-full bg-white text-[#06101d] py-5 rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'VERIFYING...' : 'AUTHORIZE & ENTER'}
                  </button>

                  <div className="flex flex-col items-center gap-4">
                    {timer > 0 ? (
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        New code available in <span className="text-safety-orange">{timer}s</span>
                      </p>
                    ) : (
                      <button type="button" onClick={handleResendOTP} className="text-[10px] font-bold text-safety-orange hover:text-white transition-colors uppercase tracking-widest">
                        Resend Code
                      </button>
                    )}
                    
                    <button type="button" onClick={handleBackToEmail} className="text-[10px] font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">
                      Change email address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          End-to-End Encrypted • SQL Data Vault
        </div>
      </div>

      <button onClick={() => navigate('/')} className="mt-8 text-white/60 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:gap-3">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Return to Portal
      </button>
    </div>
  );
}