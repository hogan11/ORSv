import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Circle, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { RouteData, Location } from '../types';

// Fix for default Leaflet marker icons in React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Vehicle Icon
const createVehicleIcon = () => L.divIcon({
  html: `<div class="bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-lg flex items-center justify-center w-8 h-8">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="4" y="5" rx="1" /><path d="M10 2v3"/><path d="M14 2v3"/><path d="M22 10h-2"/><path d="M4 10H2"/><path d="M7 15h.01"/><path d="M17 15h.01"/><path d="m4 18.5 2.5-2.5"/><path d="m17.5 16 2.5 2.5"/></svg>
  </div>`,
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapDisplayProps {
  data: RouteData;
  vehiclePosition: [number, number];
  capturedProspects: Set<string>;
  ringRadius: number;
  visibleLayers: { customers: boolean; prospects: boolean };
  activeLocations: Location[];
}

// Component to handle auto-pan when city changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  data, 
  vehiclePosition, 
  capturedProspects, 
  ringRadius,
  visibleLayers,
  activeLocations
}) => {
  const vehicleIcon = createVehicleIcon();

  const customers = activeLocations.filter(l => l.type === 'customer');
  const prospects = activeLocations.filter(l => l.type === 'prospect');

  return (
    <div className="h-full w-full bg-slate-900 relative">
      <MapContainer
        center={data.center}
        zoom={data.zoom}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={true}
      >
        <ChangeView center={data.center} zoom={data.zoom} />
        
        {/* Dark Mode Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* The Route Line */}
        <Polyline 
          positions={data.path} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.6, dashArray: '10, 10' }} 
        />

        {/* Vehicle */}
        <Marker position={vehiclePosition} icon={vehicleIcon} zIndexOffset={1000} />

        {/* Opportunity Rings (Sibling to Marker, sharing position) */}
        <Circle 
            center={vehiclePosition} 
            pathOptions={{ fillColor: '#a855f7', fillOpacity: 0.1, color: '#a855f7', weight: 1 }} 
            radius={ringRadius} 
        />
        <Circle 
            center={vehiclePosition} 
            pathOptions={{ fill: false, color: '#a855f7', weight: 1, opacity: 0.3, dashArray: '5, 5' }} 
            radius={ringRadius * 2} // Secondary awareness ring
        />

        {/* Existing Customers (Blue) */}
        {visibleLayers.customers && customers.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            pathOptions={{
              fillColor: '#3b82f6', // Blue
              fillOpacity: 0.8,
              color: '#60a5fa',
              weight: 1,
              radius: 6
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-center">
                <div className="font-bold text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-600">Current Client</div>
                <div className="text-xs font-mono text-blue-600 font-bold">${c.revenue.toLocaleString()} / mo</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Prospects (Green) */}
        {visibleLayers.prospects && prospects.map((p) => {
            const isCaptured = capturedProspects.has(p.id);
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                pathOptions={{
                  fillColor: isCaptured ? '#22c55e' : '#334155', // Bright green if captured, slate if not
                  fillOpacity: isCaptured ? 0.9 : 0.4,
                  color: isCaptured ? '#86efac' : '#475569',
                  weight: isCaptured ? 2 : 1,
                  radius: isCaptured ? 8 : 5
                }}
              >
                 <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-center">
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-600">{p.category}</div>
                    <div className="text-xs font-mono text-green-600 font-bold">Est. ${p.revenue.toLocaleString()}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
        })}

      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 bg-slate-900/90 p-4 rounded-xl border border-slate-800 backdrop-blur-sm z-[1000] text-sm pointer-events-none">
        <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Map Legend</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300"></div>
                <span className="text-slate-200">Current Customer</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-500"></div>
                <span className="text-slate-400">Prospect (Out of Range)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300 animate-pulse"></div>
                <span className="text-green-400 font-medium">Opportunity Identified</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-purple-500 bg-purple-500/20"></div>
                <span className="text-purple-400">Opportunity Ring ({ringRadius}m)</span>
            </div>
        </div>
      </div>
    </div>
  );
};