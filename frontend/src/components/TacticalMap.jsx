import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  ShieldAlert,
  Building2,
  Flame,
  Radio,
  Clock,
  Milestone,
  Compass
} from 'lucide-react';

// Custom Map Controller to center or fit bounds
function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Helper to create HTML DivIcons for tactical dark theme
function createCustomDivIcon(type, isBlocked, isHighlighted) {
  let bgClass = "bg-slate-800 border-slate-500 text-slate-300";
  let pulseRing = "";
  let iconContent = "•";

  if (type === 'emergency_base') {
    bgClass = "bg-blue-600 border-cyan-300 text-white shadow-lg shadow-blue-500/50";
    pulseRing = "<div class='absolute -inset-1 rounded-full bg-blue-500 animate-ping opacity-40'></div>";
    iconContent = "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>";
  } else if (type === 'hospital') {
    bgClass = "bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-500/50";
    pulseRing = "<div class='absolute -inset-1 rounded-full bg-emerald-500 animate-ping opacity-30'></div>";
    iconContent = "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>";
  } else if (type === 'incident_zone') {
    if (isBlocked) {
      bgClass = "bg-red-600 border-red-300 text-white shadow-xl shadow-red-500/80 animate-pulse";
      pulseRing = "<div class='absolute -inset-2 rounded-full bg-red-500 animate-ping opacity-60'></div>";
      iconContent = "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'/></svg>";
    } else {
      bgClass = "bg-amber-600 border-amber-300 text-white shadow-md shadow-amber-500/40";
      iconContent = "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>";
    }
  } else {
    // Standard Intersection
    if (isHighlighted) {
      bgClass = "bg-cyan-500 border-cyan-200 text-slate-950 shadow-md shadow-cyan-400/50";
      iconContent = "<span class='text-xs font-bold font-mono'>#</span>";
    } else {
      bgClass = "bg-slate-800 border-slate-600 text-slate-300";
      iconContent = "<span class='text-xs font-mono'>•</span>";
    }
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${bgClass} cursor-pointer transition-transform hover:scale-125">
      ${pulseRing}
      <div class="relative z-10 flex items-center justify-center">
        ${iconContent}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-tactical-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

export default function TacticalMap({ topology, route, incidentDetected }) {
  // Center map around downtown urban grid
  const defaultCenter = [37.7785, -122.4120];
  const zoomLevel = 14;

  const nodes = topology?.nodes || [];
  const edges = topology?.edges || [];
  const activePathNodes = useMemo(() => new Set(route?.path || []), [route?.path]);
  const activeRouteCoordinates = route?.coordinates || [];

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Tactical Map Header HUD */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-lg">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            CartoDB Dark Vector Grid // SF Downtown Network
          </span>
        </div>

        {/* Route Status Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          {route?.is_rerouted ? (
            <div className="flex items-center gap-2 bg-red-950/90 border border-red-500/70 text-red-300 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg shadow-red-900/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wide">
                EMERGENCY REROUTE ACTIVE (+38s DETOUR)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg shadow-emerald-900/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wide">
                OPTIMAL DIRECT CORRIDOR
              </span>
            </div>
          )}
        </div>
      </div>

      {/* React-Leaflet Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          <MapController center={defaultCenter} zoom={zoomLevel} />

          {/* 1. Render All Network Edges */}
          {edges.map((edge, idx) => {
            const isBlocked = edge.blocked;
            const positions = edge.coordinates;

            if (isBlocked) {
              // Blocked Edges rendered in Dashed Red
              return (
                <Polyline
                  key={`edge-blocked-${edge.u}-${edge.v}-${idx}`}
                  positions={positions}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 5,
                    dashArray: '10, 10',
                    opacity: 0.95,
                    lineCap: 'round'
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-mono text-xs">
                      <p className="text-red-400 font-bold uppercase">Corridor Blocked</p>
                      <p className="text-slate-300">{edge.u} &harr; {edge.v}</p>
                      <p className="text-slate-400">Penalty Impedance: +9999.0s</p>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            }

            // Normal Inactive Edge
            return (
              <Polyline
                key={`edge-normal-${edge.u}-${edge.v}-${idx}`}
                positions={positions}
                pathOptions={{
                  color: '#334155',
                  weight: 3,
                  opacity: 0.6,
                  dashArray: null
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-xs">
                    <p className="text-cyan-300 font-semibold">{edge.u} &harr; {edge.v}</p>
                    <p className="text-slate-300">Base Transit: {edge.base_weight}s | Dist: {edge.distance_m}m</p>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* 2. Render Computed Emergency Path as Emerald Green Line */}
          {activeRouteCoordinates.length > 1 && (
            <>
              {/* Outer Glow Halo Polyline */}
              <Polyline
                positions={activeRouteCoordinates}
                pathOptions={{
                  color: '#059669',
                  weight: 12,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Core Emerald Green Polyline */}
              <Polyline
                positions={activeRouteCoordinates}
                pathOptions={{
                  color: '#10b981',
                  weight: 5,
                  opacity: 0.98,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1">
                    <p className="font-bold text-emerald-400 text-sm">Active Emergency Route</p>
                    <p className="text-slate-200 mt-1">Status: {route?.status}</p>
                    <p className="text-slate-300">Total Travel: {route?.eta_formatted}</p>
                    <p className="text-slate-300">Hops: {route?.hops} segments</p>
                    <p className="text-slate-400 text-[10px] mt-1">Waypoints: {route?.path?.join(' &rarr; ')}</p>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}

          {/* 3. Render Network Nodes with Tactical Markers */}
          {nodes.map((node) => {
            const isHighlighted = activePathNodes.has(node.id);
            const isHazardZone = node.id === 'N_INCIDENT_ZONE';
            const icon = createCustomDivIcon(node.type, isHazardZone && incidentDetected, isHighlighted);

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="font-mono text-xs min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                      <span className="font-bold text-cyan-400 uppercase">{node.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {node.type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{node.name}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{node.description}</p>
                    <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                      <span>Coords: {node.lat.toFixed(4)}, {node.lng.toFixed(4)}</span>
                      {isHighlighted && <span className="text-emerald-400 font-bold">ON ROUTE</span>}
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                  <span className="font-mono text-xs font-semibold">{node.id}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Tactical Map Footer / Waypoint Breadcrumbs */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          <span className="text-slate-400 font-semibold uppercase text-[11px] flex items-center gap-1">
            <Milestone className="w-3.5 h-3.5 text-cyan-400" /> Waypoints:
          </span>
          {route?.path?.map((step, idx) => (
            <React.Fragment key={step}>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  step === 'N_AMBULANCE_BASE'
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                    : step === 'N_HOSPITAL'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : step === 'N_INCIDENT_ZONE'
                    ? 'bg-red-900/60 text-red-300 border border-red-500/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {step}
              </span>
              {idx < route.path.length - 1 && (
                <span className="text-slate-500">&rarr;</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-1 bg-emerald-500 rounded"></div>
            <span>Emergency Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-red-500"></div>
            <span>Blocked (9999.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-slate-600"></div>
            <span>Grid Edge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
