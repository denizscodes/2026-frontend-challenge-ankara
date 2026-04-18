'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MapCoordinate {
  lat: number;
  lng: number;
  label?: string;
  isSuspicious?: boolean;
  isPodo?: boolean;
  timestamp?: string;
  data?: any;
}

interface MapPath {
  id: string;
  coordinates: [number, number][];
  color: string;
  label?: string;
}

interface InvestigationMapProps {
  coordinates: MapCoordinate[];
  paths?: MapPath[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (data: any) => void;
  disableClustering?: boolean;
}

function MapContent({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (map) {
      setReady(true);
    }
  }, [map]);

  return ready ? <>{children}</> : null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InvestigationMap({ 
  coordinates, 
  paths = [],
  center = [39.9334, 32.8597], 
  zoom = 13, 
  onMarkerClick,
  disableClustering = false
}: InvestigationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || typeof window === 'undefined') {
    return (
      <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-muted min-h-[400px] border border-dashed border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Map Engine Priming...</span>
        </div>
      </div>
    );
  }

  const createCustomIcon = (isSuspicious: boolean, isPodo: boolean, label?: string) => {
    let colorClass = 'bg-blue-600';
    if (isPodo) colorClass = 'bg-[#ff6100]';
    else if (isSuspicious) colorClass = 'bg-red-600';

    const pulseClass = isPodo 
      ? 'absolute -inset-2 bg-[#ff6100] rounded-full animate-ping opacity-30' 
      : (isSuspicious ? 'absolute -inset-1 bg-red-600 rounded-full animate-ping opacity-25' : '');
    
    const pulseHtml = pulseClass ? `<div class="${pulseClass}"></div>` : '';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative group">
          <div class="absolute -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 rounded-full ${colorClass} border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:shadow-2xl">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ${pulseHtml}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  const createClusterCustomIcon = (cluster: any) => {
    const markers = cluster.getAllChildMarkers();
    const hasSuspicious = markers.some((marker: any) => marker.options.isSuspicious);

    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-xl ${hasSuspicious ? 'bg-red-600' : 'bg-blue-600'} text-white font-black text-xs transition-transform hover:scale-110">
          <span>${cluster.getChildCount()}</span>
          ${hasSuspicious ? '<div class="absolute -inset-1 bg-red-600 rounded-full animate-ping opacity-20"></div>' : ''}
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: L.point(40, 40, true),
    });
  };

  const hasCoordinates = coordinates.length > 0;
  const mapCenter: [number, number] = center || (hasCoordinates && !isNaN(coordinates[0].lat) && !isNaN(coordinates[0].lng)
    ? [coordinates[0].lat, coordinates[0].lng] 
    : [39.9334, 32.8597]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-background relative z-0 min-h-[400px]">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapContent>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={mapCenter} zoom={zoom} />
          
          {paths && paths.map((path) => (
            <Polyline
              key={`path-group-${path.id}`}
              positions={path.coordinates}
              pathOptions={{ 
                color: path.color, 
                weight: 4, 
                opacity: 0.6, 
                dashArray: '10, 10',
                lineJoin: 'round'
              }}
            >
               <Tooltip sticky>Movement Path: {path.label}</Tooltip>
            </Polyline>
          ))}

          {hasCoordinates && (
            <>
              {disableClustering ? (
                coordinates.filter(c => !c.isPodo).map((coord, idx) => (
                  <Marker 
                    key={`marker-${idx}-${coord.lat}-${coord.lng}`} 
                    position={[coord.lat, coord.lng]} 
                    icon={createCustomIcon(!!coord.isSuspicious, !!coord.isPodo, coord.label)}
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
                          {coord.timestamp && <span className="block text-[8px] opacity-70 font-normal">{new Date(coord.timestamp).toLocaleString()}</span>}
                        </div>
                      </Tooltip>
                    )}
                    <Popup>
                      <div className="text-xs font-bold text-center p-1">
                        <p className={coord.isSuspicious ? 'text-red-600' : 'text-blue-600 font-bold'}>
                          {coord.isSuspicious ? '⚠️ HIGH SUSPICION' : '✓ VERIFIED AGENT'}
                        </p>
                        <p className="mt-1 text-dark text-[14px]">{coord.label || 'Anonymous'}</p>
                        {coord.timestamp && <p className="text-[10px] text-muted mt-1">{new Date(coord.timestamp).toLocaleString()}</p>}
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
                  </Marker>
                ))
              ) : (
                <MarkerClusterGroup
                  chunkedLoading
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                  iconCreateFunction={createClusterCustomIcon}
                >
                  {coordinates.filter(c => !c.isPodo).map((coord, idx) => (
                    <Marker 
                      key={`marker-${idx}-${coord.lat}-${coord.lng}`} 
                      position={[coord.lat, coord.lng]} 
                      icon={createCustomIcon(!!coord.isSuspicious, !!coord.isPodo, coord.label)}
                      // @ts-ignore
                      isSuspicious={!!coord.isSuspicious}
                      // @ts-ignore
                      isPodo={!!coord.isPodo}
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
                            {coord.timestamp && <span className="block text-[8px] opacity-70 font-normal">{new Date(coord.timestamp).toLocaleString()}</span>}
                          </div>
                        </Tooltip>
                      )}
                      <Popup>
                        <div className="text-xs font-bold text-center p-1">
                          <p className={coord.isSuspicious ? 'text-red-600' : 'text-blue-600 font-bold'}>
                            {coord.isSuspicious ? '⚠️ HIGH SUSPICION' : '✓ VERIFIED AGENT'}
                          </p>
                          <p className="mt-1 text-dark text-[14px]">{coord.label || 'Anonymous'}</p>
                          {coord.timestamp && <p className="text-[10px] text-muted mt-1">{new Date(coord.timestamp).toLocaleString()}</p>}
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
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )}

              {coordinates.filter(c => c.isPodo).map((coord, idx) => (
                <Marker 
                  key={`podo-marker-${idx}-${coord.lat}-${coord.lng}`} 
                  position={[coord.lat, coord.lng]} 
                  icon={createCustomIcon(false, true, coord.label)}
                  zIndexOffset={1000}
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
                      <div className="px-2 py-1 font-bold text-xs bg-[#ff6100] text-white rounded shadow-lg border border-white/20">
                        {coord.label}
                        {coord.timestamp && <span className="block text-[8px] opacity-90 font-normal">{new Date(coord.timestamp).toLocaleString()}</span>}
                      </div>
                    </Tooltip>
                  )}
                  <Popup>
                    <div className="text-xs font-bold text-center p-1">
                      <p className="text-[#ff6100] font-bold">PODO ACTIVE</p>
                      <p className="mt-1 text-dark text-[14px]">{coord.label || 'Anonymous'}</p>
                      {coord.timestamp && <p className="text-[10px] text-muted mt-1">{new Date(coord.timestamp).toLocaleString()}</p>}
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
                </Marker>
              ))}
            </>
          )}
        </MapContent>
      </MapContainer>
    </div>
  );
}
