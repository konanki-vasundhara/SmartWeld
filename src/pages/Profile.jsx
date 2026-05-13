import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useAuthStore from '../store/useAuthStore';

export default function Profile() {
  const navigate = useNavigate();
  const { userProfile, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <TopAppBar title="Smart Weld" />
      {/* Guest Banner */}
      {!isAuthenticated && (
        <div className="bg-primary-container border-b border-primary/20 px-margin-mobile md:px-margin-desktop py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">person_off</span>
            <p className="text-sm text-on-primary-container font-medium">
              You're browsing as a guest. Log in to save your profile & scan history.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="shrink-0 text-sm font-bold text-white bg-primary px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Log In
          </button>
        </div>
      )}
<main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-base space-y-md">
{/*  Profile Header  */}
<section className="mt-md">
<div className="bg-surface-container-highest rounded-xl p-md border border-outline-variant relative overflow-hidden">
<div className="absolute top-0 right-0 p-base">
<span className="bg-primary text-on-primary text-label-bold font-label-bold px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="verified" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>verified</span>
                        Certified Welder
                    </span>
</div>
<div className="flex flex-col md:flex-row items-center gap-md">
<div className="relative">
<img alt="User Profile" className="w-24 h-24 rounded-xl object-cover border-2 border-primary" src={userProfile?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuA0XWfLufJOy_Kq5oVd5WI4Ne95bOWjng086gDDCkbVjSCFUPqRv5Zo2THmajG7CHeWhPSh5HXZsMt7Zrsw7YIzMmYVAyZ_usefvv5-ZbL7Ua5q2eiFOJuEj8ZXqmW31_MwNcCMCSBrtuzSte-BrGe4DAHa_bkiitlDYbT15cIGpecnLJc2IpBDj8Pdv_gk66-yX-0FY1f_D_v-rfoYRbtEdYOy2NaFPwxvz9cqgBv03q8iKftV-9Q2WN7Cifb5znZuAOlWxoLmtWWo"}/>
<div className="absolute -bottom-2 -right-2 bg-safety-orange text-white p-1 rounded-lg">
<span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
</div>
</div>
<div className="text-center md:text-left">
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{userProfile?.name || 'Guest User'}</h2>
<p className="text-on-surface-variant font-body-sm">{userProfile?.title || 'User'} • ID: {userProfile?.id || 'N/A'}</p>
<div className="flex gap-2 mt-2 justify-center md:justify-start">
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded border border-outline-variant">
<span className="material-symbols-outlined text-[16px] mr-1 text-primary" data-icon="bolt">bolt</span>
<span className="text-label-bold">98% Quality Score</span>
</div>
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded border border-outline-variant">
<span className="material-symbols-outlined text-[16px] mr-1 text-primary" data-icon="construction">construction</span>
<span className="text-label-bold">4.2k Repairs</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Account Settings Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
{/*  Account Actions  */}
<section className="space-y-sm">
<h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-widest px-xs">Account Settings</h3>
<div className="bg-surface rounded-xl border border-outline-variant divide-y divide-outline-variant">
<div className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="person">person</span>
</div>
<div>
<p className="font-button-text text-button-text">Personal Details</p>
<p className="text-body-sm text-on-surface-variant">Update identity and credentials</p>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="home_pin">home_pin</span>
</div>
<div>
<p className="font-button-text text-button-text">Saved Addresses</p>
<p className="text-body-sm text-on-surface-variant">Manage field site locations</p>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
</div>
<div>
<p className="font-button-text text-button-text">Payment History</p>
<p className="text-body-sm text-on-surface-variant">Invoices and equipment leasing</p>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="translate">translate</span>
</div>
<div>
<p className="font-button-text text-button-text">Language Settings (Multilingual)</p>
<p className="text-body-sm text-on-surface-variant">English, German, French</p>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</section>
{/*  Toggles & Industrial Controls  */}
<section className="space-y-sm">
<h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-widest px-xs">System Preferences</h3>
<div className="bg-surface rounded-xl border border-outline-variant divide-y divide-outline-variant">
<div className="flex items-center justify-between p-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="dark_mode">dark_mode</span>
</div>
<div>
<p className="font-button-text text-button-text">Dark Mode</p>
<p className="text-body-sm text-on-surface-variant">Reduce eye strain in field</p>
</div>
</div>
<button className="w-12 h-6 bg-surface-container-highest rounded-full relative border border-outline-variant">
<div className="absolute left-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
</button>
</div>
<div className="flex items-center justify-between p-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="notifications_active">notifications_active</span>
</div>
<div>
<p className="font-button-text text-button-text">Push Notifications</p>
<p className="text-body-sm text-on-surface-variant">Safety alerts &amp; scan results</p>
</div>
</div>
<button className="w-12 h-6 bg-primary rounded-full relative">
<div className="absolute right-1 top-1 w-4 h-4 bg-on-primary rounded-full"></div>
</button>
</div>
<div className="p-md">
<div className="glass-effect rounded-lg p-sm border border-secondary-container bg-secondary-container/10">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="smart_toy">smart_toy</span>
<span className="font-label-bold text-primary">AI Diagnostic Assistant</span>
</div>
<p className="text-body-sm text-on-secondary-container">Assistant is active and learning your welding patterns to optimize machine voltage automatically.</p>
</div>
</div>
</div>
</section>
</div>
{/*  Footer Actions  */}
<section className="pt-md pb-xl space-y-base">
<button className="w-full h-12 flex items-center justify-center gap-2 bg-surface border border-outline-variant rounded-lg font-button-text text-button-text text-primary hover:bg-surface-container-low transition-all active:scale-[0.98]">
<span className="material-symbols-outlined" data-icon="help">help</span>
                Help &amp; Support
            </button>
<button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 bg-white border-2 border-error rounded-lg font-button-text text-button-text text-error hover:bg-error/5 transition-all active:scale-[0.98]">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
                Logout
            </button>
<p className="text-center text-body-sm text-outline mt-md">App Version 4.8.2 (Stable Build)</p>
</section>
</main>
    </>
  );
}
