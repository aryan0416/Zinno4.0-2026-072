import React from 'react';
import {
  Clock,
  ShieldAlert,
  Milestone,
  Zap,
  Activity,
  Leaf,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export default function MetricsPanel({
  route,
  incidentDetected,
  incidentDetails,
  detectorMetrics,
  densityHistory = []
}) {
  const isRerouted = route?.is_rerouted || false;
  const transitTimeSec = route?.eta_seconds ?? 135.0;
  const transitTimeFormatted = route?.eta_formatted ?? '2m 15s';
  const hopCount = route?.hops ?? 4;
  const distanceKm = route?.total_distance_km ?? 2.09;

  // Mock baseline: static GPS without SafeRoute-AI would sit in congestion for ~10.5 mins
  const minutesSaved = isRerouted ? '8.4 min' : '0.0 min';
  const co2AvoidedKg = isRerouted ? '4.2 kg' : '0.0 kg';
  const calcLatencyMs = 12;

  // Sparkline data fallback
  const chartData = densityHistory.length > 0 ? densityHistory : [
    { time: '10:00', density: 34 },
    { time: '10:05', density: 42 },
    { time: '10:10', density: 55 },
    { time: '10:15', density: incidentDetected ? 88 : 48 },
    { time: '10:20', density: incidentDetected ? 94 : 45 },
    { time: '10:25', density: incidentDetected ? 91 : 40 },
    { time: '10:30', density: incidentDetected ? 95 : 38 }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
      {/* 1. Emergency Transit Time & Time Saved */}
      <div className="bg-[#0b101b]/95 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Emergency Transit ETA
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
            isRerouted
              ? 'bg-amber-950/80 border border-amber-600 text-amber-300'
              : 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
          }`}>
            {isRerouted ? 'DIVERSIFIED' : 'CLEAR CORRIDOR'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <span className={`text-3xl font-extrabold ${isRerouted ? 'text-amber-400 glow-amber' : 'text-emerald-400 glow-emerald'}`}>
              {transitTimeFormatted}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              ({transitTimeSec.toFixed(1)}s)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Time Saved</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
              <TrendingDown className="w-3 h-3" /> {minutesSaved}
            </span>
          </div>
        </div>

        {/* Live Traffic Density Mini Sparkline */}
        <div className="mt-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Corridor Congestion Index</span>
            <span className={incidentDetected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {incidentDetected ? '92% (CRITICAL)' : '38% (FLUID)'}
            </span>
          </div>
          <div className="h-9 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-cyan-300">
                          {payload[0].value}% Density
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke={incidentDetected ? '#f43f5e' : '#10b981'}
                  fill={incidentDetected ? '#f43f5e' : '#10b981'}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isRerouted ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
      </div>

      {/* 2. Hazard Detection & Zero-Velocity Window */}
      <div className={`rounded-xl border p-4 relative overflow-hidden shadow-xl backdrop-blur-md transition-colors ${
        incidentDetected
          ? 'bg-rose-950/30 border-rose-500/70 shadow-rose-950/40'
          : 'bg-[#0b101b]/95 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldAlert className={`w-4 h-4 ${incidentDetected ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            Hazard Detection State
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
            incidentDetected
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
          }`}>
            {incidentDetected ? 'ALERT TRIPPED' : 'MONITORING'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-extrabold ${incidentDetected ? 'text-rose-400 glow-crimson' : 'text-slate-100'}`}>
            {incidentDetected ? 'CORRIDOR BLOCKED' : 'NOMINAL FLOW'}
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Zero-Velocity Window:</span>
            {incidentDetected ? (
              <span className="text-rose-400 font-bold">
                {incidentDetails?.stalled_duration_sec ?? 7.4}s &gt; 6.0s
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0.0s (No Stalls)
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Coordinate Drift:</span>
            <span className="text-slate-300 font-semibold">
              {incidentDetected ? `${incidentDetails?.displacement_px ?? 3.8}px (<12px)` : 'Normal (30+ px/s)'}
            </span>
          </div>
        </div>

        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          incidentDetected ? 'bg-rose-600' : 'bg-cyan-600'
        }`} />
      </div>

      {/* 3. Dijkstra Recalculation Engine Latency */}
      <div className="bg-[#0b101b]/95 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            Graph Recalculation
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
            Sub-50ms
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-cyan-400 glow-cyan">
            {calcLatencyMs}
          </span>
          <span className="text-xs text-slate-400">
            ms Dijkstra Runtime
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Obstruction Weight:</span>
            <span className="text-rose-400 font-bold">
              {incidentDetected ? 'w = 9999.0 Applied' : 'w = 0.0 (Unblocked)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Green Wave Clearance:</span>
            <span className="text-emerald-400 font-semibold">
              Preempt Signals Ready
            </span>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* 4. Municipal Impact & Route Topography */}
      <div className="bg-[#0b101b]/95 rounded-xl border border-slate-800 p-4 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Milestone className="w-4 h-4 text-emerald-400" />
            Topography & Eco Impact
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
            {hopCount} Hops
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <span className="text-2xl font-extrabold text-slate-100">
              {distanceKm.toFixed(2)} km
            </span>
            <span className="text-xs text-slate-400 ml-1">Corridor</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">CO2 Avoided</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
              <Leaf className="w-3 h-3" /> {co2AvoidedKg}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Emergency Target:</span>
            <span className="text-emerald-400 font-bold">
              Level-1 Trauma Center
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Municipal Link:</span>
            <span className="text-cyan-400 font-semibold">
              NTCIP 1202 Controller
            </span>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-600/20 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
