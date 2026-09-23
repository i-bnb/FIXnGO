'use client';

import React from 'react';
import dynamic from 'next/dynamic';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'tech' | 'customer' | 'job';
  status?: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Dynamically import Leaflet components to prevent SSR 'window is not defined'
const DynamicMap = dynamic(
  async () => {
    const L = await import('leaflet');
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet');
    const { useEffect, useRef } = await import('react');

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

    function RecenterMap({ center }: { center?: [number, number] }) {
      const map = useMap();
      const prevCenterRef = useRef<[number, number] | null>(null);

      const lat = center?.[0] ?? 25.1972;
      const lng = center?.[1] ?? 55.2744;

      // Only re-center if coordinates have significantly changed (> 0.001 deg)
      // to prevent interrupting user manual pan/zoom or unnecessary jitter
      useEffect(() => {
        const prev = prevCenterRef.current;
        if (!prev || Math.abs(prev[0] - lat) > 0.001 || Math.abs(prev[1] - lng) > 0.001) {
          map.setView([lat, lng], map.getZoom(), { animate: true });
          prevCenterRef.current = [lat, lng];
        }
      }, [lat, lng, map]);

      // Handle container resize when opened in drawers/tabs
      useEffect(() => {
        const timer = setTimeout(() => {
          map.invalidateSize();
        }, 150);
        return () => clearTimeout(timer);
      }, [map]);

      return null;
    }

    return function MapComponent({
      center = [25.1972, 55.2744],
      zoom = 12,
      markers = [],
      onMarkerClick,
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
          <RecenterMap center={center} />
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

export function LeafletMap(props: LeafletMapProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-line shadow-xs ${
        props.className || ''
      }`}
    >
      <DynamicMap {...props} />
    </div>
  );
}
