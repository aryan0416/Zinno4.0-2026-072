import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Milestone,
  Car,
  Building2,
  ShieldAlert,
  Flame,
  Radio,
  Clock,
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';

// Controller to handle center updates smoothly
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom DivIcons for Tactical Defense Map
function createTacticalDivIcon(type, isBlocked, isHighlighted) {
  let innerHtml = '';

  if (type === 'emergency_base') {
    // Ambulance Depot Alpha
    innerHtml = `
      <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-cyan-600/90 border-2 border-cyan-300 text-white shadow-xl shadow-cyan-500/50 cursor-pointer">
        <div class="absolute -inset-1.5 rounded-full bg-cyan-400 animate-ping opacity-35"></div>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
    `;
  } else if (type === 'hospital') {
    // Level-1 Trauma Hospital
    innerHtml = `
      <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600/90 border-2 border-emerald-300 text-white shadow-xl shadow-emerald-500/50 cursor-pointer">
        <div class="absolute -inset-1.5 rounded-full bg-emerald-400 animate-ping opacity-30"></div>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </div>
    `;
  } else if (type === 'incident_zone') {
    // Incident Zone
    if (isBlocked) {
      innerHtml = `
        <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-rose-600 border-2 border-rose-300 text-white shadow-2xl shadow-rose-600/80 cursor-pointer animate-pulse">
          <div class="absolute -inset-3 rounded-full bg-rose-500 animate-ping opacity-60"></div>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
      `;
    } else {
      innerHtml = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/90 border-2 border-amber-300 text-white shadow-md shadow-amber-500/40 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke-width="2"/>
          </svg>
        </div>
      `;
    }
  } else {
    // Intersection Waypoints
    const ringColor = isHighlighted ? 'bg-cyan-500 border-cyan-200 text-slate-950 shadow-md shadow-cyan-400/50' : 'bg-slate-800 border-slate-600 text-slate-300';
    innerHtml = `
      <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 ${ringColor} cursor-pointer transition-transform hover:scale-125">
        <span class="text-[10px] font-mono font-bold">${isHighlighted ? '★' : '•'}</span>
      </div>
    `;
  }

  return L.divIcon({
    html: innerHtml,
    className: 'tactical-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

// Live Ambulance DivIcon with pulsing cyan beacon
function createAmbulanceDivIcon() {
  const html = `
    <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer">
      <div class="absolute -inset-2 rounded-full bg-cyan-400 animate-ping opacity-60"></div>
      <div class="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500 border-2 border-white text-slate-950 shadow-2xl shadow-cyan-400 font-bold">
        <svg class="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
          <circle cx="7.5" cy="14.5" r="1.5"/>
          <circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'ambulance-active-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

export default function TacticalMap({
  topology,
  route,
  incidentDetected,
  isAmbulanceMoving,
  ambulanceStepIndex = 0
}) {
  const defaultCenter = [37.7785, -122.4120];
  const zoomLevel = 14;

  const nodes = topology?.nodes || [];
  const edges = topology?.edges || [];
  const activePathNodes = useMemo(() => new Set(route?.path || []), [route?.path]);
  const activeRouteCoordinates = route?.coordinates || [];

  // Current animated ambulance coordinates
  const ambulancePos = useMemo(() => {
    if (!activeRouteCoordinates.length) return null;
    const idx = Math.min(ambulanceStepIndex, activeRouteCoordinates.length - 1);
    return activeRouteCoordinates[idx];
  }, [activeRouteCoordinates, ambulanceStepIndex]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-[#070b14] rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* 1. Tactical HUD Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none font-mono">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-xl">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            CartoDB Dark Vector Grid // SF Municipal Network
          </span>
        </div>

        {/* Dynamic Route Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          {route?.is_rerouted ? (
            <div className="flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 text-rose-300 px-3.5 py-1.5 rounded-lg backdrop-blur-md shadow-xl shadow-rose-950/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wide">
                EMERGENCY REROUTE ACTIVE (+38s DETOUR)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 px-3.5 py-1.5 rounded-lg backdrop-blur-md shadow-xl shadow-emerald-950/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wide">
                OPTIMAL DIRECT CORRIDOR (ETA: {route?.eta_formatted ?? '2m 15s'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. React-Leaflet Tactical Dark Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* CartoDB Dark Matter Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          <MapController center={defaultCenter} zoom={zoomLevel} />

          {/* Render All Street Network Edges */}
          {edges.map((edge, idx) => {
            const isBlocked = edge.blocked;
            const positions = edge.coordinates;

            if (isBlocked) {
              // Blocked Hazard Section: Flashing Dashed Crimson Red Polyline
              return (
                <Polyline
                  key={`edge-blocked-${edge.u}-${edge.v}-${idx}`}
                  positions={positions}
                  pathOptions={{
                    color: '#f43f5e',
                    weight: 6,
                    dashArray: '10, 10',
                    opacity: 0.95,
                    lineCap: 'round'
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-mono text-xs">
                      <p className="text-rose-400 font-bold uppercase">CORRIDOR BLOCKED</p>
                      <p className="text-slate-300">{edge.u} &harr; {edge.v}</p>
                      <p className="text-rose-300">Impedance Penalty: +9999.0s</p>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            }

            // Normal Inactive Street Segment
            return (
              <Polyline
                key={`edge-normal-${edge.u}-${edge.v}-${idx}`}
                positions={positions}
                pathOptions={{
                  color: '#1e293b',
                  weight: 3.5,
                  opacity: 0.7,
                  dashArray: null
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-xs">
                    <p className="text-cyan-300 font-semibold">{edge.u} &harr; {edge.v}</p>
                    <p className="text-slate-400">Baseline Transit: {edge.base_weight}s | Dist: {edge.distance_m}m</p>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Render Active Emergency Route (Glowing Emerald Green) */}
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
              {/* Core Emerald Line */}
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
                    <p className="font-bold text-emerald-400 text-sm">Active Emergency Transit Line</p>
                    <p className="text-slate-200 mt-1">Status: {route?.status}</p>
                    <p className="text-slate-300">Estimated Travel: {route?.eta_formatted}</p>
                    <p className="text-slate-300">Hops: {route?.hops} street links</p>
                    <p className="text-slate-400 text-[10px] mt-1">Waypoints: {route?.path?.join(' &rarr; ')}</p>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}

          {/* Animated Ambulance Step-by-Step Marker */}
          {ambulancePos && (
            <Marker
              position={ambulancePos}
              icon={createAmbulanceDivIcon()}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <p className="text-cyan-400 font-bold uppercase">Ambulance Unit 01</p>
                  <p className="text-slate-300">Transit: Base &rarr; Hospital</p>
                  <p className="text-slate-400">Status: En Route (Priority Signal Active)</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Network Nodes with Tactical Markers */}
          {nodes.map((node) => {
            const isHighlighted = activePathNodes.has(node.id);
            const isHazardZone = node.id === 'N_INCIDENT_ZONE';
            const icon = createTacticalDivIcon(node.type, isHazardZone && incidentDetected, isHighlighted);

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="font-mono text-xs min-w-[210px]">
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
                      {isHighlighted && <span className="text-emerald-400 font-bold">ON EMERGENCY ROUTE</span>}
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

      {/* 3. Tactical Map Footer / Waypoint Breadcrumbs & Legend */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          <span className="text-slate-400 font-semibold uppercase text-[11px] flex items-center gap-1">
            <Milestone className="w-3.5 h-3.5 text-cyan-400" /> Corridors:
          </span>
          {route?.path?.map((step, idx) => (
            <React.Fragment key={step}>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  step === 'N_AMBULANCE_BASE'
                    ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                    : step === 'N_HOSPITAL'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : step === 'N_INCIDENT_ZONE'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
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
            <div className="w-4 h-1.5 bg-emerald-500 rounded"></div>
            <span>Cleared Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-rose-500"></div>
            <span>Blocked (9999.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-slate-700"></div>
            <span>Street Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
