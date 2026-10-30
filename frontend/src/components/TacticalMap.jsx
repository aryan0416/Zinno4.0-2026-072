import React, { useMemo, useEffect } from 'react';
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
  Clock
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

// Minimalist Industrial Pin DivIcons
function createTacticalDivIcon(type, isBlocked, isHighlighted) {
  let badgeColor = 'bg-tactical-surface border-tactical-border text-textmuted-secondary';
  let iconSvg = '<span class="text-[10px] font-mono">•</span>';

  if (type === 'emergency_base') {
    badgeColor = 'bg-tactical-base border-signal-telemetry text-signal-telemetry';
    iconSvg = `
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    `;
  } else if (type === 'hospital') {
    badgeColor = 'bg-tactical-base border-signal-green text-signal-green';
    iconSvg = `
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
      </svg>
    `;
  } else if (type === 'incident_zone') {
    if (isBlocked) {
      badgeColor = 'bg-signal-alertBg border-signal-alert text-signal-alert';
      iconSvg = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      `;
    } else {
      badgeColor = 'bg-signal-warnBg border-signal-warn text-signal-warn';
      iconSvg = '<span class="text-[9px] font-mono font-bold">WARN</span>';
    }
  } else if (isHighlighted) {
    badgeColor = 'bg-tactical-surface border-signal-telemetry text-signal-telemetry';
    iconSvg = '<span class="text-[10px] font-mono font-bold">#</span>';
  }

  const innerHtml = `
    <div class="flex items-center justify-center w-7 h-7 rounded border ${badgeColor} shadow-sm">
      ${iconSvg}
    </div>
  `;

  return L.divIcon({
    html: innerHtml,
    className: 'tactical-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

function createAmbulanceDivIcon() {
  const html = `
    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-tactical-void border-2 border-signal-telemetry text-signal-telemetry shadow-md">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'ambulance-active-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
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

  const ambulancePos = useMemo(() => {
    if (!activeRouteCoordinates.length) return null;
    const idx = Math.min(ambulanceStepIndex, activeRouteCoordinates.length - 1);
    return activeRouteCoordinates[idx];
  }, [activeRouteCoordinates, ambulanceStepIndex]);

  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col bg-tactical-void rounded-lg border border-tactical-border overflow-hidden">
      {/* 1. Tactical HUD Header Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none font-mono">
        <div className="pointer-events-auto flex items-center gap-2 bg-tactical-surface/90 backdrop-blur-md px-2.5 py-1 rounded border border-tactical-border text-xs">
          <Compass className="w-3.5 h-3.5 text-textmuted-tertiary" />
          <span className="text-[11px] font-medium text-textmuted-secondary uppercase">
            CartoDB Dark Vector Grid // SF Sector 04
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {route?.is_rerouted ? (
            <div className="flex items-center gap-1.5 bg-signal-alertBg border border-signal-alert/25 text-signal-alert px-2.5 py-1 rounded backdrop-blur-md text-xs font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-alert"></span>
              <span>EMERGENCY DETOUR ACTIVE (+38s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-signal-greenBg border border-signal-green/20 text-signal-green px-2.5 py-1 rounded backdrop-blur-md text-xs font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-green"></span>
              <span>DIRECT CORRIDOR (ETA: {route?.eta_formatted ?? '2m 15s'})</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Map Container */}
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
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
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
              // Blocked Hazard Section: Clean industrial dashed red stroke
              return (
                <Polyline
                  key={`edge-blocked-${edge.u}-${edge.v}-${idx}`}
                  positions={positions}
                  pathOptions={{
                    color: '#EF4444',
                    weight: 4,
                    dashArray: '6, 6',
                    opacity: 0.9,
                    lineCap: 'round'
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-mono text-xs">
                      <p className="text-signal-alert font-medium uppercase">CORRIDOR IMPEDED</p>
                      <p className="text-textmuted-primary">{edge.u} &harr; {edge.v}</p>
                      <p className="text-textmuted-secondary text-[10px]">Penalty: +9999.0s</p>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            }

            // Inactive Street Segment: Subdued thin line
            return (
              <Polyline
                key={`edge-normal-${edge.u}-${edge.v}-${idx}`}
                positions={positions}
                pathOptions={{
                  color: '#1E232F',
                  weight: 2.5,
                  opacity: 0.45,
                  dashArray: null
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-xs">
                    <p className="text-textmuted-primary font-medium">{edge.u} &harr; {edge.v}</p>
                    <p className="text-textmuted-tertiary text-[10px]">Base: {edge.base_weight}s | Dist: {edge.distance_m}m</p>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Render Active Emergency Corridor: Clean solid 4px vector line */}
          {activeRouteCoordinates.length > 1 && (
            <Polyline
              positions={activeRouteCoordinates}
              pathOptions={{
                color: '#22C55E',
                weight: 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <p className="font-medium text-signal-green">Cleared Emergency Corridor</p>
                  <p className="text-textmuted-secondary text-[11px] mt-0.5">Status: {route?.status}</p>
                  <p className="text-textmuted-secondary text-[11px]">Travel Time: {route?.eta_formatted}</p>
                  <p className="text-textmuted-tertiary text-[10px] mt-1">Waypoints: {route?.path?.join(' &rarr; ')}</p>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Animated Ambulance Marker */}
          {ambulancePos && (
            <Marker
              position={ambulancePos}
              icon={createAmbulanceDivIcon()}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <p className="text-signal-telemetry font-medium uppercase">Ambulance Unit 01</p>
                  <p className="text-textmuted-secondary text-[11px]">En Route to Hospital</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Network Nodes */}
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
                  <div className="font-mono text-xs min-w-[190px]">
                    <div className="flex items-center justify-between border-b border-tactical-divider pb-1 mb-1">
                      <span className="font-medium text-textmuted-primary">{node.id}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-tactical-base text-textmuted-tertiary border border-tactical-border">
                        {node.type}
                      </span>
                    </div>
                    <p className="text-xs text-textmuted-secondary">{node.name}</p>
                    <div className="mt-1 pt-1 border-t border-tactical-divider text-[10px] text-textmuted-tertiary flex justify-between">
                      <span>{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</span>
                      {isHighlighted && <span className="text-signal-green font-medium">ON ROUTE</span>}
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -16]} opacity={0.9}>
                  <span className="font-mono text-[10px]">{node.id}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 3. Footer Waypoint Breadcrumbs & Minimal Legend */}
      <div className="p-2.5 bg-tactical-surface/95 border-t border-tactical-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          <span className="text-textmuted-tertiary text-[10px] uppercase flex items-center gap-1">
            <Milestone className="w-3 h-3 text-textmuted-tertiary" /> Path:
          </span>
          {route?.path?.map((step, idx) => (
            <React.Fragment key={step}>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                  step === 'N_AMBULANCE_BASE'
                    ? 'bg-signal-telemetryBg text-signal-telemetry border border-signal-telemetry/30'
                    : step === 'N_HOSPITAL'
                    ? 'bg-signal-greenBg text-signal-green border border-signal-green/30'
                    : step === 'N_INCIDENT_ZONE'
                    ? 'bg-signal-alertBg text-signal-alert border border-signal-alert/30'
                    : 'bg-tactical-base text-textmuted-secondary border border-tactical-border'
                }`}
              >
                {step}
              </span>
              {idx < route.path.length - 1 && (
                <span className="text-textmuted-tertiary text-[10px]">&rarr;</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-textmuted-tertiary">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-signal-green rounded-sm"></div>
            <span>Cleared Route</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-t border-dashed border-signal-alert"></div>
            <span>Impeded (9999.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-[#1E232F]"></div>
            <span>Grid Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
