import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import MapReview from '../components/MapReview';
import useCurrentLocation from '../hooks/useCurrentLocation';
import useBookingStore from '../store/useBookingStore';

const getTravelMinutes = (origin, place) => {
  if (!origin || !place?.lat || !place?.lon) return null;
  const lat1 = origin.lat * (Math.PI / 180);
  const lon1 = origin.lon * (Math.PI / 180);
  const lat2 = parseFloat(place.lat) * (Math.PI / 180);
  const lon2 = parseFloat(place.lon) * (Math.PI / 180);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = 6371 * c;
  const minutes = Math.max(4, Math.round(distanceKm / 0.75));
  return minutes;
};

export default function EmergencyBooking() {
  const navigate = useNavigate();
  const { booking, setBooking, initializeBookingPricing } = useBookingStore();
  
  useEffect(() => {
    initializeBookingPricing();
  }, [initializeBookingPricing]);

  const { coords, locationName, loading, error, nearbyPlaces, retryLocation } = useCurrentLocation();
  const nearestUnit = nearbyPlaces?.[0];
  const liveWorker = nearestUnit
    ? {
        name: nearestUnit.technician?.name || 'Onsite Welding Technician',
        role: nearestUnit.technician?.role || 'Welding Specialist',
        experience: nearestUnit.technician?.experience || '10 years exp.',
        phone: nearestUnit.phone || '+91 98765 43210',
        shopName: nearestUnit.name,
        shopAddress: nearestUnit.address
      }
    : {
        name: booking.nearbyUnit?.technician?.name || 'Local Welding Response Team',
        role: booking.nearbyUnit?.technician?.role || 'Emergency Welding Crew',
        experience: booking.nearbyUnit?.technician?.experience || 'Available now',
        phone: booking.nearbyUnit?.phone || nearbyPlaces?.[0]?.phone || '+91 98765 43210',
        shopName: booking.nearbyUnit?.name || nearbyPlaces?.[0]?.name || 'Nearest Welding Unit',
        shopAddress: booking.nearbyUnit?.address || nearbyPlaces?.[0]?.address || locationName || 'Current area'
      };
  const baseEta = coords
    ? Math.max(5, Math.min(18, Math.round(10 + ((Math.abs(coords.lat) + Math.abs(coords.lon)) % 6))))
    : null;
  const [liveEta, setLiveEta] = useState(baseEta);

  useEffect(() => {
    if (baseEta == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiveEta(baseEta);
  }, [baseEta]);

  useEffect(() => {
    if (!coords || liveEta == null) return;
    const interval = setInterval(() => {
      setLiveEta((prev) => {
        if (prev == null) return prev;
        return Math.max(2, prev - 1);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [coords, liveEta]);

  const liveStatus = useMemo(() => {
    if (loading) return 'Acquiring GPS and route details...';
    if (!coords) return 'Waiting for location permission...';
    if (liveEta > 12) return 'Dispatch is en route to your site.';
    if (liveEta > 7) return 'Technician is nearing your location.';
    if (liveEta > 4) return 'Almost there — stay ready.';
    return 'Arriving shortly at your location.';
  }, [loading, coords, liveEta]);

  useEffect(() => {
    if (!coords) return;

    setBooking({
      locationName: locationName || booking.locationName,
      coords,
      nearbyUnit: nearestUnit || booking.nearbyUnit,
      etaMinutes: baseEta || booking.etaMinutes
    });
  }, [coords, locationName, nearestUnit, baseEta, setBooking, booking.locationName, booking.nearbyUnit, booking.etaMinutes]);

  const handleIssueSelect = (issue) => {
    setBooking({ issue, status: 'draft' });
  };

  const handleConfirmBooking = () => {
    setBooking({
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      transactionId: `EMR${Date.now()}`
    });
    navigate('/checkout');
  };

  return (
    <>
      <TopAppBar title="Emergency Booking" showBack />
      <main className="pt-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
        <div className="bg-error-container border-l-4 border-error p-md rounded-lg mb-lg flex items-center gap-md">
          <span className="material-symbols-outlined text-error text-3xl" data-icon="warning" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div>
            <p className="font-label-bold text-on-error-container uppercase tracking-widest">Urgent Maintenance Required</p>
            <p className="font-body-md text-on-error-container">Technician dispatching is prioritized for emergency repairs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-7 space-y-gutter">
            <div className="relative rounded-xl overflow-hidden industrial-shadow h-[400px] bg-surface-container-highest border border-outline-variant">
              {coords ? (
                <MapReview lat={coords.lat} lon={coords.lon} zoom={14} />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface to-surface-container-highest border border-dashed border-outline-variant text-on-surface-variant p-md text-center flex-col gap-md">
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-4xl animate-spin">location_searching</span>
                      <p>Acquiring live location…</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl">location_on</span>
                      <p>{error || 'Enable location access to show the live dispatch map.'}</p>
                      {error && (
                        <button
                          onClick={retryLocation}
                          className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90"
                        >
                          Retry Location
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="absolute inset-x-0 top-4 px-4">
                <div className="glass-ai p-md rounded-3xl industrial-shadow max-w-[320px]">
                  <div className="flex items-center gap-xs mb-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-label-bold text-[10px] uppercase text-on-surface-variant">Live Dispatch Active</span>
                  </div>
                  <p className="font-label-bold text-primary mb-1">ETA: {liveEta ? `${liveEta} Minutes` : 'Calculating...'}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {nearestUnit
                      ? `${nearestUnit.name} is routing from the closest service area.`
                      : 'Dispatch is locating the fastest technician to your coordinates.'}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 rounded-3xl bg-surface-container-highest/90 border border-outline-variant p-md shadow-lg max-w-[300px]">
                <p className="text-on-surface-variant text-xs uppercase tracking-[0.24em] mb-2">Current location</p>
                <p className="font-bold text-on-surface text-lg">{loading ? 'Detecting...' : locationName || 'Location unavailable'}</p>
                <p className="text-body-sm text-on-surface-variant mt-2">
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'Waiting for GPS signal.'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md industrial-shadow">
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="A professional portrait of a highly skilled industrial technician wearing a clean, high-visibility welding vest and a modern hard hat. The man is middle-aged with a focused, reliable expression, set against a blurred background of a modern industrial facility. The lighting is cinematic and clean, emphasizing a sense of expert craftsmanship and high-tech professionalism."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoY23xukkHO8PgPBnw--71LrxwtyR_EXQODJeJEtUEVJPvbcNaTc4_GkL_5uIptj7uzf2JURKz63CxjCpwCTTGFvPYE2_5l3JzoP-q81c47kEfUKvBO2C5aSh48szdgHWm-WOgEcz2L0F4BpI2JvD3FbkEjXdSgbK9beYmRSG-OWAOa2t3-k667YjdhBdLVx5BB06Ri9beIeVURzLSs9LiPvEXF_Ktu231xCTmUJA4P8uX-SY0SMdqxmLBTi-R3BzRuNogvsGfpSwL"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-label-bold text-on-surface text-lg">{liveWorker.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">{`${liveWorker.role} • ${liveWorker.experience}`}</p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-body-sm text-on-surface-variant">
                    <div>
                      <p className="font-bold text-on-surface">{liveWorker.shopName}</p>
                      <p>{liveWorker.shopAddress}</p>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">ETA</p>
                      <p>{liveEta ? `${liveEta} min` : 'TBD'}</p>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${liveWorker.phone.replace(/\D/g, '')}`}
                  className="bg-surface-container-high hover:bg-outline-variant transition-colors p-3 rounded-xl border border-outline-variant flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-primary" data-icon="call">call</span>
                  <span>{liveWorker.phone}</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <p className="text-on-surface-variant text-sm">Live status</p>
                  <p className="font-semibold text-on-surface mt-2">{loading ? 'Acquiring GPS' : liveStatus}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <p className="text-on-surface-variant text-sm">Location</p>
                  <p className="font-semibold text-on-surface mt-2">{locationName || 'Unavailable'}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <p className="text-on-surface-variant text-sm">Nearby services</p>
                  <p className="font-semibold text-on-surface mt-2">{nearbyPlaces?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-gutter">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md industrial-shadow">
              <p className="text-on-surface-variant uppercase tracking-[0.24em] text-[10px] font-bold">Live emergency context</p>
              <h2 className="font-headline-lg text-xl font-bold mt-3">{loading ? 'Detecting location…' : locationName || 'Location unavailable'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <p className="text-on-surface-variant text-xs uppercase tracking-[0.24em]">Coordinates</p>
                  <p className="mt-2 font-semibold text-on-surface">{coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : 'N/A'}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <p className="text-on-surface-variant text-xs uppercase tracking-[0.24em]">Nearest response</p>
                  <p className="mt-2 font-semibold text-on-surface">{nearestUnit?.name ?? 'Finding unit...'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg industrial-shadow relative overflow-hidden">
              <div className="scan-line" />
              <h2 className="font-headline-lg text-2xl font-bold mb-md">Instant Booking</h2>

              <form className="space-y-md">
                <div>
                  <label className="block font-label-bold text-on-surface-variant mb-xs">Select Emergency Issue</label>
                  <div className="grid grid-cols-2 gap-sm">
                    {['Broken Chassis', 'Pipeline Leak', 'Conveyor Rift', 'Other Critical'].map((issue) => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => handleIssueSelect(issue)}
                        className={`border-2 p-sm rounded-lg flex flex-col items-center gap-xs transition-all ${booking.issue === issue ? 'border-primary bg-primary-container text-white' : 'border-outline-variant hover:border-safety-orange'}`}
                      >
                        <span className="material-symbols-outlined">{issue === 'Broken Chassis' ? 'car_repair' : issue === 'Pipeline Leak' ? 'plumbing' : issue === 'Conveyor Rift' ? 'factory' : 'more_horiz'}</span>
                        <span className="text-body-sm font-bold">{issue}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-label-bold text-on-surface-variant mb-xs">Asset ID / Serial Number</label>
                  <input
                    value={booking.assetId}
                    onChange={(event) => setBooking({ assetId: event.target.value })}
                    className="w-full bg-surface-container border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-lg h-12 px-md"
                    placeholder="e.g. WELD-X-9980"
                    type="text"
                  />
                </div>

                <div>
                  <label className="block font-label-bold text-on-surface-variant mb-xs">Current Condition Notes</label>
                  <textarea
                    value={booking.notes}
                    onChange={(event) => setBooking({ notes: event.target.value })}
                    className="w-full bg-surface-container border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-lg p-md"
                    placeholder="Describe the structural failure..."
                    rows="3"
                  />
                </div>

                <div className="rounded-3xl bg-white/5 p-4 border border-outline-variant space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Service</span>
                    <span className="font-semibold text-on-surface">{booking.issue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Estimated total</span>
                    <span className="font-semibold text-safety-orange">₹ {booking.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Payment method</span>
                    <span className="font-semibold text-on-surface">{booking.paymentMethod}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="w-full bg-safety-orange hover:bg-orange-600 text-white h-[56px] rounded-xl font-bold text-lg flex items-center justify-center gap-md industrial-shadow transition-transform active:scale-95"
                  type="button"
                >
                  Confirm Emergency Booking
                  <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </form>
            </div>

            <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-md border border-outline">
              <div className="flex items-center gap-md">
                <div className="bg-error p-3 rounded-lg">
                  <span className="material-symbols-outlined text-white" data-icon="headset_mic">headset_mic</span>
                </div>
                <div>
                  <p className="font-label-bold opacity-80">24/7 Priority Support Line</p>
                  <p className="font-headline-lg text-xl">+1 (800) 555-WELD</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Welders Section */}
        <div className="mt-lg">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Nearby Welders</h2>
            <button
              onClick={retryLocation}
              className="flex items-center gap-xs px-md py-sm bg-surface-container-high hover:bg-outline-variant rounded-lg border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-base" data-icon="refresh">refresh</span>
              <span className="text-body-sm font-semibold">Refresh</span>
            </button>
          </div>

          <p className="text-body-md text-on-surface-variant mb-md">Recommended near you</p>

          {nearbyPlaces && nearbyPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              {nearbyPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary-fixed text-xl" data-icon="factory">factory</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-on-surface truncate">{place.name}</h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">{place.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm pt-md border-t border-outline-variant">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant" data-icon="schedule">schedule</span>
                    <span className="text-body-sm text-on-surface-variant">
                      {getTravelMinutes(coords, place)
                        ? `${getTravelMinutes(coords, place)} min away`
                        : 'Nearby service'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50 block mb-md">location_off</span>
              <p className="text-body-md text-on-surface-variant mb-md">No nearby welding shops found. Try again or enable location services.</p>
              <button
                onClick={retryLocation}
                className="inline-flex items-center gap-sm px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90"
              >
                <span className="material-symbols-outlined text-base" data-icon="refresh">refresh</span>
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-28 right-margin-mobile md:right-margin-desktop z-50">
        <button onClick={() => navigate('/checkout')} className="bg-error hover:bg-red-700 text-white p-6 rounded-full shadow-2xl flex items-center gap-md active:scale-90 transition-all border-4 border-white/20">
          <span className="material-symbols-outlined text-4xl" data-icon="emergency">emergency</span>
          <span className="font-headline-lg text-xl uppercase tracking-tighter">SOS Support</span>
        </button>
      </div>
    </>
  );
}
