import { useEffect, useRef } from 'react';

export default function MapReview({ lat, lon, zoom = 14 }) {
  const mapId = `map-${lat}-${lon}`;
  const mapRef = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    const initializeMap = () => {
      const L = window.L;
      if (!L) return;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.warn('Failed to remove previous map instance:', err);
        }
      }

      const map = L.map(mapId, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lon], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      L.circleMarker([lat, lon], {
        radius: 8,
        fillColor: '#ff6b00',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      })
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();

      mapRef.current = map;
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, zoom, mapId]);

  if (!lat || !lon) {
    return (
      <div className="flex h-72 items-center justify-center bg-surface border border-dashed border-outline-variant text-on-surface-variant rounded-[32px]">
        Enable location to see your map
      </div>
    );
  }

  return (
    <div
      id={mapId}
      className="rounded-[32px] overflow-hidden border border-outline-variant"
      style={{ height: '100%', minHeight: '288px', width: '100%' }}
    />
  );
}
