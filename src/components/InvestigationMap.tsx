'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + Next.js - moved inside component

interface InvestigationMapProps {
  coordinates: { lat: number; lng: number; label?: string }[];
  center?: [number, number];
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InvestigationMap({ coordinates, center = [39.9334, 32.8597], zoom = 13 }: InvestigationMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Small delay to ensure container is fully ready in the DOM
    const timer = setTimeout(() => {
      setIsReady(true);
      setMapKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || typeof window === 'undefined') {
    return <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />;
  }

  // Define icon inside the component to ensure L is available on client
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const actualCenter = coordinates.length > 0 
    ? [coordinates[0].lat, coordinates[0].lng] as [number, number]
    : center;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-background relative min-h-[400px]">
      {isReady && typeof window !== 'undefined' && (
        <MapContainer 
          key={`map-instance-${mapKey}`}
          center={actualCenter} 
          zoom={zoom} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={actualCenter} zoom={zoom} />
          {coordinates.map((coord, idx) => (
            <Marker key={`marker-${idx}-${coord.lat}-${coord.lng}`} position={[coord.lat, coord.lng]} icon={customIcon}>
              {coord.label && (
                <Popup>
                  <div className="text-xs font-bold">{coord.label}</div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
