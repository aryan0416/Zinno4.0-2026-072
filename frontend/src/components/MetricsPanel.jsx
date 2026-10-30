import React from 'react';
import {
  Clock,
  ShieldAlert,
  Milestone,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Navigation,
  Compass
} from 'lucide-react';

export default function MetricsPanel({ route, incidentDetected, incidentDetails, detectorMetrics }) {
  const isRerouted = route?.is_rerouted || false;
  const transitTimeSec = route?.eta_seconds ?? 135.0;
  const transitTimeFormatted = route?.eta_formatted ?? '2m 15s';
  const hopCount = route?.hops ?? 4;
  const distanceKm = route?.total_distance_km ?? 2.09;

  // Baseline normal travel time is ~135 seconds
  const baselineSec = 135.0;
  const detourDeltaSec = isRerouted ? Math.max(0, transitTimeSec - baselineSec) : 0;
  const detourPercent = isRerouted ? Math.round((detourDeltaSec / baselineSec) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      {/* 1. Transit Time & ETA Telemetry Card */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Emergency Transit Time
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
            isRerouted
              ? 'bg-amber-950/80 border border-amber-600 text-amber-300'
              : 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
          }`}>
            {isRerouted ? '+Detour' : 'Fastest'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-3xl font-extrabold ${isRerouted ? 'text-amber-400 glow-cyan' : 'text-emerald-400 glow-emerald'}`}>
            {transitTimeFormatted}
          </span>
          <span className="text-xs text-slate-400">
            ({transitTimeSec.toFixed(1)}s)
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Detour Penalty:</span>
          <span className={isRerouted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
            {isRerouted ? `+${detourDeltaSec.toFixed(1)}s (+${detourPercent}%)` : '0.0s (Direct)'}
          </span>
        </div>

        {/* Ambient background glow */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isRerouted ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
      </div>

      {/* 2. Hazard Detection State Card */}
      <div className={`rounded-xl border p-4 relative overflow-hidden shadow-xl transition-colors ${
        incidentDetected
          ? 'bg-red-950/40 border-red-500/60 shadow-red-950/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldAlert className={`w-4 h-4 ${incidentDetected ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
            Hazard Detection State
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
            incidentDetected
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-slate-800 text-emerald-400 border border-emerald-900'
          }`}>
            {incidentDetected ? 'ALERT ACTIVE' : 'CLEAR'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-extrabold ${incidentDetected ? 'text-red-400 glow-crimson' : 'text-slate-200'}`}>
            {incidentDetected ? 'CORRIDOR BLOCKED' : 'NOMINAL FLOW'}
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Stall Metric:</span>
          {incidentDetected ? (
            <span className="text-red-400 font-bold">
              {incidentDetails?.stalled_duration_sec ?? 6.2}s (&gt;6.0s) | {incidentDetails?.displacement_px ?? 4.0}px
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> No Stalls Detected
            </span>
          )}
        </div>

        {/* Ambient background glow */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          incidentDetected ? 'bg-red-600' : 'bg-cyan-600'
        }`} />
      </div>

      {/* 3. Routing Hop Counts Card */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Milestone className="w-4 h-4 text-cyan-400" />
            Route Topography
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
            Dijkstra Shortest
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-cyan-400 glow-cyan">
            {hopCount}
          </span>
          <span className="text-xs text-slate-400">
            Hops / Street Segments
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Corridor Distance:</span>
          <span className="text-slate-200 font-bold">
            {distanceKm.toFixed(2)} km ({route?.total_distance_m ?? 2090}m)
          </span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* 4. Real-time Recalculation Engine Latency Card */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Reroute Latency
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
            Real-Time
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-emerald-400">
            &lt; 15
          </span>
          <span className="text-xs text-slate-400">
            ms Graph Compute
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Penalty Weight:</span>
          <span className="text-red-400 font-bold">
            {incidentDetected ? '9999.0 Applied' : 'Zero Obstructions'}
          </span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
