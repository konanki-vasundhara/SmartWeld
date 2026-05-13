import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import MapReview from '../components/MapReview';
import useCurrentLocation from '../hooks/useCurrentLocation';

export default function Dashboard() {
  const navigate = useNavigate();
  const { coords, locationName, loading, error, nearbyPlaces } = useCurrentLocation();
  return (
    <>
      <TopAppBar title="Smart Weld" />
<main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-base space-y-md">
{/*  Hero: AI Scanning Section  */}
<section className="relative w-full aspect-[16/10] md:aspect-[21/9] rounded-xl overflow-hidden shadow-xl industrial-card group">
<img className="absolute inset-0 w-full h-full object-cover" data-alt="A macro photograph of a high-quality industrial weld on a dark metallic surface. The lighting is dramatic, with bright white highlights reflecting off the metallic texture and deep blue shadows. A glowing electric blue scanning laser line horizontally traverses the weld, suggesting advanced AI analysis. The overall mood is futuristic, professional, and technologically sophisticated." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqJOxt44LLvuizghcVXnHHfXSZw4h8MB1PBBHU2M4bSYRjNwzcxuQNu1EnhkOIC56e9radLdwEoE2fdNIAzPHlWxbTNlM6fr3BifZxqyyaI2TGsVGYM-hbPVcodxX3XRKQp5eDn7pYNnz76AHXnmZ_w8pt6J1cnfviJ_2EaVT13HFuMnm7J93MWhBL-wvY0cgubGLdto4gzwLCduWtGRraSvuxe2xK9NBa2cdwNSlTttk3vi9gZakzTsc55LiUeJ1MeJX_Yd683632"/>
<div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-transparent to-transparent"></div>
<div className="absolute inset-0 flex flex-col justify-end p-md md:p-lg space-y-sm">
<div className="glass-ai p-md rounded-xl max-w-lg">
<h2 className="font-headline-lg-mobile md:font-headline-lg text-primary-fixed mb-xs">Next-Gen Inspection</h2>
<p className="text-primary-fixed-dim text-body-sm mb-base">Analyze structural integrity with 99.8% precision using our proprietary AI vision engine.</p>
<button onClick={() => navigate('/scanner')} className="flex items-center justify-center gap-base bg-[#ff6b00] text-white px-md h-[56px] rounded-lg font-button-text text-button-text active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,107,0,0.4)]">
<span className="material-symbols-outlined" data-icon="biotech">biotech</span>
                        Scan Damage
                    </button>
</div>
</div>
{/*  AI Glow Animation Effect Placeholder  */}
<div className="absolute top-0 left-0 w-full h-1 bg-primary-fixed-dim/40 shadow-[0_0_15px_#b9c7e4]"></div>
</section>
{/*  Live location map and nearby suppliers  */}
<section className="grid gap-base lg:grid-cols-[1.7fr_1fr]">
  <div className="industrial-card bg-surface-container-lowest border border-outline-variant p-md shadow-sm rounded-3xl">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-on-surface-variant uppercase tracking-[0.24em] text-[10px] font-bold">Live Location</p>
          <h2 className="font-headline-lg-mobile text-on-surface font-bold mt-2">{loading ? 'Detecting your location...' : locationName || 'Location unavailable'}</h2>
        </div>
        <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
      </div>
      <div className="rounded-[32px] overflow-hidden border border-outline-variant h-72">
        {coords ? (
          <MapReview lat={coords.lat} lon={coords.lon} zoom={14} />
        ) : (
          <div className="flex h-72 items-center justify-center bg-surface border border-dashed border-outline-variant text-on-surface-variant rounded-[32px]">
            {error || 'Enable location to see your map preview.'}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
          <p className="text-on-surface-variant text-sm">Current coordinates</p>
          <p className="font-semibold text-on-surface mt-2">{coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : 'N/A'}</p>
        </div>
        <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
          <p className="text-on-surface-variant text-sm">Nearby weld services</p>
          <p className="font-semibold text-on-surface mt-2">{nearbyPlaces?.length ?? 0} found</p>
        </div>
      </div>
    </div>
  </div>
  <div className="industrial-card bg-surface-container-lowest border border-outline-variant p-md shadow-sm rounded-3xl">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-on-surface-variant uppercase tracking-[0.24em] text-[10px] font-bold">Nearby Welders</p>
        <h3 className="font-headline-lg-mobile text-on-surface font-bold mt-2">Recommended near you</h3>
      </div>
      <button onClick={() => window.location.reload()} className="text-primary text-sm font-semibold">Refresh</button>
    </div>
    <div className="space-y-3">
      {nearbyPlaces?.length > 0 ? nearbyPlaces.map((place) => (
        <div key={place.id} className="rounded-3xl bg-surface p-4 border border-outline-variant">
          <h4 className="font-semibold text-on-surface">{place.name}</h4>
          <p className="text-body-sm text-on-surface-variant mt-1">{place.address}</p>
        </div>
      )) : (
        <div className="rounded-3xl bg-surface p-4 border border-outline-variant text-on-surface-variant">
          {loading ? 'Looking for nearby welding shops…' : 'No nearby welding shops found. Try again or enable location services.'}
        </div>
      )}
    </div>
  </div>
</section>
{/*  Service Grid: Bento Style  */}
<section className="grid grid-cols-2 md:grid-cols-4 gap-base">
<div onClick={() => navigate('/emergency-booking')} className="industrial-card bg-surface-container-lowest p-md flex flex-col justify-between aspect-square md:aspect-auto md:h-48 hover:bg-surface-container-high transition-colors cursor-pointer group">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="storefront">storefront</span>
<div>
<h3 className="font-label-bold text-label-bold uppercase tracking-widest text-on-surface-variant">Nearby Shops</h3>
<p className="text-body-sm text-outline mt-xs">Certified experts within 5km</p>
</div>
</div>
<div onClick={() => navigate('/emergency-booking')} className="industrial-card bg-surface-container-lowest p-md flex flex-col justify-between aspect-square md:aspect-auto md:h-48 hover:bg-surface-container-high transition-colors cursor-pointer">
<span className="material-symbols-outlined text-error text-3xl" data-icon="emergency_home">emergency_home</span>
<div>
<h3 className="font-label-bold text-label-bold uppercase tracking-widest text-on-surface-variant">Emergency Repair</h3>
<p className="text-body-sm text-outline mt-xs">24/7 Field dispatch</p>
</div>
</div>
<div onClick={() => navigate('/repair-cost-estimation')} className="industrial-card bg-surface-container-lowest p-md flex flex-col justify-between aspect-square md:aspect-auto md:h-48 hover:bg-surface-container-high transition-colors cursor-pointer">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="calculate">calculate</span>
<div>
<h3 className="font-label-bold text-label-bold uppercase tracking-widest text-on-surface-variant">Cost Estimator</h3>
<p className="text-body-sm text-outline mt-xs">Instant quote generation</p>
</div>
</div>
<div onClick={() => navigate('/knowledge-center')} className="industrial-card bg-surface-container-lowest p-md flex flex-col justify-between aspect-square md:aspect-auto md:h-48 hover:bg-surface-container-high transition-colors cursor-pointer">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="menu_book">menu_book</span>
<div>
<h3 className="font-label-bold text-label-bold uppercase tracking-widest text-on-surface-variant">Knowledge Center</h3>
<p className="text-body-sm text-outline mt-xs">Weld standards &amp; logs</p>
</div>
</div>
</section>
{/*  Vassu AI Section  */}
<section className="glass-ai rounded-xl p-md flex items-center gap-md border-primary-fixed-dim/30">
<div className="relative w-16 h-16 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-primary-fixed text-3xl" data-icon="smart_toy">smart_toy</span>
<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-surface rounded-full"></div>
</div>
<div className="flex-grow">
<h3 className="font-headline-lg-mobile text-on-surface font-bold">Meet Vassu</h3>
<p className="text-on-surface-variant text-body-sm italic">"Ready to analyze your structural data. How can I help you today?"</p>
</div>
<button onClick={() => navigate('/vassu-ai')} className="industrial-card px-md py-xs text-label-bold uppercase bg-surface-container-highest hover:bg-surface-container-low transition-all">Chat</button>
</section>
{/*  Recent Scans  */}
<section className="space-y-sm">
<div className="flex justify-between items-end">
<h2 className="font-headline-lg-mobile font-bold text-on-surface">Recent Scans</h2>
<button onClick={() => navigate('/scan-results')} className="text-primary text-label-bold border-b border-primary">View History</button>
</div>
<div className="space-y-base">
{/*  Scan Card 1  */}
<div className="industrial-card bg-surface-container p-sm flex items-center gap-md hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="w-16 h-16 rounded-lg overflow-hidden bg-outline-variant flex-shrink-0">
<img className="w-full h-full object-cover grayscale" data-alt="Close up image of an industrial pipe weld with a metallic gray color scheme. The lighting is harsh and industrial, emphasizing the texture of the metal. The image has a scientific, diagnostic feel suitable for a report." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjflm6rZsC_kqaWhtZUp6ZXpuEpjzf6YXr_V2NpUBDZr-gO8RxD_tW_UCudPFI-AMWq9pLds6q5ugXSqH6BpWboRj6n9jevXXplgzKwoFgUozzoOFyrnsdLS44XqNRwU6bVyTCofkYWwGw_3PgeLUzVAGJ7KWCYsVfInPqNrnK387s6h9eEfBEzXP9Eem34GKAeL7ggSG3fz3a_couU0vQF981Hfyt9pWfUiw5bbld-DLpsDn4LtGPT18EegMJYgjJy5efJr-zHx-I"/>
</div>
<div className="flex-grow">
<h4 className="font-button-text text-on-surface">Pipe-X7 Structural</h4>
<p className="text-body-sm text-on-surface-variant">Oct 24 • 09:12 AM</p>
</div>
<div className="flex items-center gap-xs text-green-700 bg-green-100 px-sm py-xs rounded-full">
<span className="material-symbols-outlined text-sm" data-icon="check_circle" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>check_circle</span>
<span className="text-[10px] font-bold uppercase">Passed</span>
</div>
</div>
{/*  Scan Card 2  */}
<div className="industrial-card bg-surface-container p-sm flex items-center gap-md hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="w-16 h-16 rounded-lg overflow-hidden bg-outline-variant flex-shrink-0">
<img className="w-full h-full object-cover grayscale" data-alt="Industrial metal beam connection with visible welding marks. The scene is shot in a construction environment with neutral, cool lighting and a focus on the precision of the joints. Professional industrial photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyL5ViZI6fxvpMC4SmW2cFtRj7G6C3LW0CYRdFGA7IsEDO5SFs00B2xyeQCVNwBrk82lNGbngryvJpQowjROLwB5huQopDVZSh2U6BHQI9h0vjqOhfxRxFW4HdpRlZ3tAqjgKLz25qjHlAtYniVpIo04Id3XwSHyu0sjRKh3UQJwAba9b4GVz7XXPhnHspEJFhEreVsRdhHDdCGUJ-3Iaat3izwZS7LTv3X2feDglO7S6-g8oZjFXpNw-9kblZ0lcRuOK-xWJXYxyY"/>
</div>
<div className="flex-grow">
<h4 className="font-button-text text-on-surface">Main Support Girders</h4>
<p className="text-body-sm text-on-surface-variant">Oct 23 • 04:45 PM</p>
</div>
<div className="flex items-center gap-xs text-error bg-error-container px-sm py-xs rounded-full">
<span className="material-symbols-outlined text-sm" data-icon="warning" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>warning</span>
<span className="text-[10px] font-bold uppercase">Review</span>
</div>
</div>
</div>
</section>
</main>
    </>
  );
}
