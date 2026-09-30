'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'tech' | 'customer' | 'job';
  status?: string;
}

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (coords: [number, number]) => void;
}

// Dynamically import Leaflet components to prevent SSR 'window is not defined'
const DynamicMap = dynamic(
  async () => {
    const L = await import('leaflet');
    const { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = await import('react-leaflet');
    const { useEffect, useRef } = await import('react');

    // Fix default marker icon assets path to prevent broken icon 404s
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Create custom SVG markers conforming to FIXnGO brand tokens
    const createCustomIcon = (type: 'tech' | 'customer' | 'job', status?: string) => {
      let bgColor = '#059669'; // emerald for available tech
      let label = 'T';

      if (type === 'tech') {
        if (status === 'EN_ROUTE') bgColor = '#0A7BA8'; // ocean-blue
        else if (status === 'IN_PROGRESS' || status === 'ON_JOB') bgColor = '#0C2233'; // navy
        label = '🚐';
      } else if (type === 'customer' || type === 'job') {
        bgColor = status === 'EMERGENCY' ? '#DC2626' : '#C2410C'; // red or signal-orange
        label = '📍';
      }

      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="
            background-color: ${bgColor};
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: white;
            font-weight: bold;
          ">
            ${label}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });
    };

    /**
     * MapController:
     * 1. Handles map clicks for interactive location picking
     * 2. Re-centers smoothly when coordinates or zoom change
     * 3. Solves the grey tiles / unrendered edges bug on all sides by running
     *    map.invalidateSize() on mount, delayed animations, ResizeObserver, and window resize.
     */
    function MapController({
      center,
      zoom,
      onMapClick,
    }: {
      center?: [number, number];
      zoom?: number;
      onMapClick?: (coords: [number, number]) => void;
    }) {
      const map = useMap();
      const prevCenterRef = useRef<[number, number] | null>(null);
      const prevZoomRef = useRef<number | null>(null);

      const lat = center?.[0] ?? 25.1972;
      const lng = center?.[1] ?? 55.2744;
      const targetZoom = zoom ?? map.getZoom();

      // Listen for map clicks if onMapClick is provided
      useMapEvents({
        click(e) {
          if (onMapClick) {
            onMapClick([e.latlng.lat, e.latlng.lng]);
          }
        },
      });

      // Smooth recenter when center or zoom changes
      useEffect(() => {
        const prev = prevCenterRef.current;
        const prevZoom = prevZoomRef.current;
        const centerChanged = !prev || Math.abs(prev[0] - lat) > 0.0005 || Math.abs(prev[1] - lng) > 0.0005;
        const zoomChanged = prevZoom !== null && prevZoom !== targetZoom;

        if (centerChanged || zoomChanged) {
          map.setView([lat, lng], targetZoom, { animate: true });
          prevCenterRef.current = [lat, lng];
          prevZoomRef.current = targetZoom;
        }
      }, [lat, lng, targetZoom, map]);

      // Eliminate grey tiles on all sides with aggressive resize observers
      useEffect(() => {
        const invalidate = () => {
          if (map) {
            map.invalidateSize();
          }
        };

        // Run immediately and staggered after CSS transitions / modal animations complete
        invalidate();
        const t1 = setTimeout(invalidate, 100);
        const t2 = setTimeout(invalidate, 300);
        const t3 = setTimeout(invalidate, 600);

        // ResizeObserver on map container and parent element
        const container = map.getContainer();
        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && container) {
          observer = new ResizeObserver(() => {
            invalidate();
          });
          observer.observe(container);
          if (container.parentElement) {
            observer.observe(container.parentElement);
          }
        }

        window.addEventListener('resize', invalidate);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          if (observer) observer.disconnect();
          window.removeEventListener('resize', invalidate);
        };
      }, [map]);

      return null;
    }

    return function MapComponent({
      center = [25.1972, 55.2744],
      zoom = 12,
      markers = [],
      onMarkerClick,
      onMapClick,
    }: LeafletMapProps) {
      return (
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} zoom={zoom} onMapClick={onMapClick} />
          {markers.map((m) => {
            if (typeof m.lat !== 'number' || typeof m.lng !== 'number' || isNaN(m.lat) || isNaN(m.lng)) {
              return null;
            }

            return (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createCustomIcon(m.type, m.status)}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(m),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <div className="font-bold text-sm text-slate-900">{m.title}</div>
                    {m.subtitle && <div className="text-xs text-slate-600 mt-0.5">{m.subtitle}</div>}
                    {m.status && (
                      <div className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-signal-orange rounded">
                        {m.status}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-ground text-slate-500 font-medium text-xs">
        Loading UAE Live Map...
      </div>
    ),
  }
);

export function LeafletMap({
  className = '',
  ...props
}: LeafletMapProps) {
  // If no height utility is passed in className, provide a default min-height
  const hasHeightClass = /(^|\s)(h-|min-h-)/.test(className);
  const defaultHeightClass = hasHeightClass ? '' : 'min-h-[260px]';

  return (
    <div
      dir="ltr"
      className={`relative w-full h-full overflow-hidden rounded-xl border border-line shadow-xs ${defaultHeightClass} ${className}`}
      style={{ direction: 'ltr', textAlign: 'left' }}
    >
      <DynamicMap {...props} />
    </div>
  );
}
