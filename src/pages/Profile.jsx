import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useAuthStore from '../store/useAuthStore';
import useScanStore from '../store/useScanStore';
import useBookingStore from '../store/useBookingStore';

export default function Profile() {
  const navigate = useNavigate();
  
  // Use Selectors for guaranteed re-renders
  const userProfile = useAuthStore(state => state.userProfile);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const token = useAuthStore(state => state.token) || userProfile?.token;
  const updateProfile = useAuthStore(state => state.updateProfile);
  const isUpdating = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.error);
  const logout = useAuthStore(state => state.logout);

  const scanHistory = useScanStore(state => state.scanHistory);
  const fetchScanHistory = useScanStore(state => state.fetchScanHistory);
  const userBookings = useBookingStore(state => state.userBookings);
  const fetchUserBookings = useBookingStore(state => state.fetchUserBookings);

  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    workshopName: '',
    phoneNumber: '',
    avatar: ''
  });

  // Sync form data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        title: userProfile.title || '',
        workshopName: userProfile.workshopName || '',
        phoneNumber: userProfile.phoneNumber || '',
        avatar: userProfile.avatar || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchScanHistory(token).catch(err => {
        if (err.status === 401) setLocalError("Your session has expired. Please log in again.");
      });
      fetchUserBookings(token);
    }
  }, [isAuthenticated, token, fetchScanHistory, fetchUserBookings]);

  const handleSave = async () => {
    setLocalError(null);
    if (!token) {
      setLocalError("No valid session found. Please re-login.");
      return;
    }

    const result = await updateProfile({
      displayName: formData.name,
      specialization: formData.title,
      workshopName: formData.workshopName,
      phoneNumber: formData.phoneNumber,
      avatar: formData.avatar
    }, token);

    if (result.success) {
      setIsEditing(false);
    } else {
      setLocalError(result.error || "Connection to site core lost.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dName = userProfile?.name || 'TECHNICIAN';
  const dTitle = userProfile?.title || 'INDUSTRIAL SPECIALIST';
  const dSite = userProfile?.workshopName || 'NO SITE ASSIGNED';
  const dAvatar = userProfile?.avatar || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200";

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
      <TopAppBar title="Operator Profile" />
      
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        {/* LIGHT GREY PROFESSIONAL HEADER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
            
            {/* AVATAR */}
            <div className="relative">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
                <img src={dAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
              </div>
            </div>

            {/* INFO */}
            <div className="flex-grow text-center md:text-left space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician Identity</p>
                {isEditing ? (
                  <input 
                    className="w-full text-4xl md:text-5xl font-black text-slate-900 border-b-2 border-primary outline-none py-1 bg-transparent"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    autoFocus
                  />
                ) : (
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{dName}</h2>
                )}
              </div>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization</p>
                  {isEditing ? (
                    <input className="border border-slate-200 rounded px-2 py-1 text-sm w-40" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  ) : (
                    <p className="font-bold text-slate-600 italic">{dTitle}</p>
                  )}
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Site</p>
                  {isEditing ? (
                    <input className="border border-slate-200 rounded px-2 py-1 text-sm w-40" value={formData.workshopName} onChange={e => setFormData({...formData, workshopName: e.target.value})} />
                  ) : (
                    <p className="font-bold text-slate-600 italic">{dSite}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-center md:justify-start">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Modify Account
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={isUpdating} className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-green-700 transition-all">
                      {isUpdating ? 'Synchronizing...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all">
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {localError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {localError}
                  </div>
                  {localError.includes('expired') && (
                    <button onClick={handleLogout} className="mt-2 text-primary underline">Logout & Refresh Session Now</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVITY LOG: LIGHT THEME */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">System Health</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Database Link</span>
                  <span className="w-3 h-3 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Auth Token</span>
                  <span className={`w-3 h-3 rounded-full ${localError ? 'bg-error' : 'bg-success'}`}></span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Neural Scan Credits</p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-4/5" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full py-4 bg-white text-error border border-error/20 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-error/5 transition-all">
              Sign Out of Portal
            </button>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity History</h4>
              <span className="text-[10px] font-bold text-slate-400">{scanHistory.length} Total Records</span>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {scanHistory.length > 0 ? (
                scanHistory.slice(0, 10).map((scan, i) => (
                  <div key={scan.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all rounded-2xl">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-slate-800 uppercase">{scan.imageAnalysis?.damageType || 'Structural Scan'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(scan.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-md uppercase">Recorded</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-300 italic text-sm font-medium">
                  No activity logs detected on this terminal.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
