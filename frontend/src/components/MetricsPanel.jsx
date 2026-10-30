import React from 'react';
import {
  Clock,
  ShieldAlert,
  Milestone,
  Zap,
  Leaf,
  TrendingDown,
  CheckCircle2,
  AlertTriangle
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

  const minutesSaved = isRerouted ? '8.4' : '0.0';
  const co2AvoidedKg = isRerouted ? '4.2' : '0.0';
  const calcLatencyMs = 12;

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
      {/* 1. Emergency Transit Time & Time Saved */}
      <div className="bg-tactical-base rounded-lg border border-tactical-border p-3.5 relative flex flex-col justify-between">
        <div className="flex items-center justify-between text-textmuted-secondary mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-textmuted-tertiary" />
            Transit ETA
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
            isRerouted
              ? 'bg-signal-warnBg text-signal-warn border border-signal-warn/20'
              : 'bg-signal-greenBg text-signal-green border border-signal-green/20'
          }`}>
            {isRerouted ? 'DETOUR ACTIVE' : 'NOMINAL CORRIDOR'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <span className="text-2xl font-mono font-medium text-textmuted-primary">
              {transitTimeFormatted}
            </span>
            <span className="text-[10px] font-mono text-textmuted-tertiary ml-1.5">
              ({transitTimeSec.toFixed(1)}<span className="text-[9px]">s</span>)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-textmuted-tertiary uppercase block">Time Saved</span>
            <span className="text-xs font-mono font-medium text-signal-green flex items-center justify-end gap-0.5">
              <TrendingDown className="w-3 h-3" /> +{minutesSaved}<span className="text-[9px] text-textmuted-tertiary ml-0.5">min</span>
            </span>
          </div>
        </div>

        {/* Live Traffic Density Mini Sparkline */}
        <div className="mt-3 pt-2 border-t border-tactical-divider">
          <div className="flex items-center justify-between text-[10px] font-mono text-textmuted-secondary mb-1">
            <span className="uppercase text-textmuted-tertiary">Congestion Index</span>
            <span className={incidentDetected ? 'text-signal-alert font-medium' : 'text-signal-green font-medium'}>
              {incidentDetected ? '92% (CONGESTED)' : '38% (FLUID)'}
            </span>
          </div>
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-tactical-surface border border-tactical-border px-1.5 py-0.5 rounded text-[10px] font-mono text-textmuted-primary">
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
                  stroke={incidentDetected ? '#EF4444' : '#22C55E'}
                  fill={incidentDetected ? '#EF4444' : '#22C55E'}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Hazard Detection & Zero-Velocity Window */}
      <div className={`rounded-lg border p-3.5 relative flex flex-col justify-between transition-colors ${
        incidentDetected
          ? 'bg-signal-alertBg border-signal-alert/30'
          : 'bg-tactical-base border-tactical-border'
      }`}>
        <div className="flex items-center justify-between text-textmuted-secondary mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${incidentDetected ? 'text-signal-alert' : 'text-textmuted-tertiary'}`} />
            Hazard State
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
            incidentDetected
              ? 'bg-signal-alertBg text-signal-alert border border-signal-alert/25'
              : 'bg-signal-greenBg text-signal-green border border-signal-green/20'
          }`}>
            {incidentDetected ? 'HAZARD TRIPPED' : 'CLEAR'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-xl font-mono font-medium ${incidentDetected ? 'text-signal-alert' : 'text-textmuted-primary'}`}>
            {incidentDetected ? 'CORRIDOR IMPEDED' : 'NOMINAL FLOW'}
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-tactical-divider space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-textmuted-tertiary text-[11px]">Zero-Velocity Window:</span>
            {incidentDetected ? (
              <span className="text-signal-alert font-medium text-xs">
                {incidentDetails?.stalled_duration_sec ?? 7.4}<span className="text-[10px] text-textmuted-tertiary ml-0.5">s</span> (&gt;6.0s)
              </span>
            ) : (
              <span className="text-signal-green text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 0.0<span className="text-[10px] text-textmuted-tertiary ml-0.5">s</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textmuted-tertiary">Coordinate Drift:</span>
            <span className="text-textmuted-secondary font-medium">
              {incidentDetected ? `${incidentDetails?.displacement_px ?? 3.8}px (<12px)` : 'Standard Flow'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dijkstra Recalculation Engine Latency */}
      <div className="bg-tactical-base rounded-lg border border-tactical-border p-3.5 relative flex flex-col justify-between">
        <div className="flex items-center justify-between text-textmuted-secondary mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-textmuted-tertiary" />
            Graph Recalculation
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-signal-telemetryBg text-signal-telemetry border border-signal-telemetry/20">
            Dijkstra
          </span>
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-mono font-medium text-textmuted-primary">
            {calcLatencyMs}
          </span>
          <span className="text-textmuted-tertiary font-mono text-[10px] ml-0.5">
            ms runtime
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-tactical-divider space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textmuted-tertiary">Penalty Applied:</span>
            <span className={incidentDetected ? "text-signal-alert font-medium" : "text-textmuted-secondary"}>
              {incidentDetected ? 'w = 9999.0' : 'w = 0.0'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textmuted-tertiary">Preemptive Signal:</span>
            <span className="text-signal-green font-medium">
              NTCIP Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. Municipal Impact & Route Topography */}
      <div className="bg-tactical-base rounded-lg border border-tactical-border p-3.5 relative flex flex-col justify-between">
        <div className="flex items-center justify-between text-textmuted-secondary mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5">
            <Milestone className="w-3.5 h-3.5 text-textmuted-tertiary" />
            Corridor Extent
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-tactical-surface text-textmuted-secondary border border-tactical-border">
            {hopCount} Hops
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <span className="text-2xl font-mono font-medium text-textmuted-primary">
              {distanceKm.toFixed(2)}
            </span>
            <span className="text-textmuted-tertiary font-mono text-[10px] ml-0.5">km</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-textmuted-tertiary uppercase block">CO2 Avoided</span>
            <span className="text-xs font-mono font-medium text-signal-green flex items-center justify-end gap-0.5">
              <Leaf className="w-3 h-3" /> {co2AvoidedKg}<span className="text-[9px] text-textmuted-tertiary ml-0.5">kg</span>
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-tactical-divider space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textmuted-tertiary">Emergency Target:</span>
            <span className="text-textmuted-primary font-medium">
              Metropolitan Hospital
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-textmuted-tertiary">Network Status:</span>
            <span className="text-textmuted-secondary font-medium">
              Bidir 7 Nodes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
