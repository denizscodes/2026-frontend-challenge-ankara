'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapCoordinate {
  lat: number;
  lng: number;
  label?: string;
  isSuspicious?: boolean;
  data?: any;
}

interface InvestigationMapProps {
  coordinates: MapCoordinate[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (data: any) => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InvestigationMap({ coordinates, center = [39.9334, 32.8597], zoom = 13, onMarkerClick }: InvestigationMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      setMapKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || typeof window === 'undefined') {
    return <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-muted min-h-[400px]">Initializing Map Engine...</div>;
  }

  const createCustomIcon = (isSuspicious: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative group">
          <div class="absolute -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 rounded-full ${isSuspicious ? 'bg-red-600' : 'bg-blue-600'} border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:shadow-2xl">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ${isSuspicious ? '<div class="absolute -inset-1 bg-red-600 rounded-full animate-ping opacity-25"></div>' : ''}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  const actualCenter = coordinates.length > 0 
    ? [coordinates[0].lat, coordinates[0].lng] as [number, number]
    : center;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-background relative z-0">
      <MapContainer 
        key={`map-instance-${mapKey}`}
        center={actualCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={actualCenter} zoom={zoom} />
        {coordinates.map((coord, idx) => (
          <Marker 
            key={`marker-${idx}-${coord.lat}-${coord.lng}`} 
            position={[coord.lat, coord.lng]} 
            icon={createCustomIcon(!!coord.isSuspicious)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick && coord.data) {
                  onMarkerClick(coord.data);
                }
              },
            }}
          >
            {coord.label && (
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                <div className="px-2 py-1 font-bold text-xs bg-dark text-white rounded shadow-lg border border-white/20">
                  {coord.label}
                </div>
              </Tooltip>
            )}
            {coord.label && (
              <Popup>
                <div className="text-xs font-bold text-center p-1">
                  <p className={coord.isSuspicious ? 'text-red-600' : 'text-blue-600 font-bold'}>
                    {coord.isSuspicious ? '⚠️ HIGH SUSPICION' : '✓ VERIFIED AGENT'}
                  </p>
                  <p className="mt-1 text-dark text-[14px]">{coord.label}</p>
                  {onMarkerClick && (
                    <button 
                      className="mt-3 text-[10px] bg-dark text-white px-3 py-1.5 rounded-lg uppercase font-black w-full hover:bg-primary transition-colors"
                      onClick={() => onMarkerClick(coord.data)}
                    >
                      Analyze Profile
                    </button>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
