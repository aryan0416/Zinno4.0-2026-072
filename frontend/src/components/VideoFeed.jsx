import React from 'react';
import {
  Video,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';

export default function VideoFeed({
  frameData,
  incidentDetected,
  incidentDetails,
  detectorMetrics,
  isConnected,
  onToggleSimulation,
  isToggling
}) {
  return (
    <div className="relative flex flex-col bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top HUD Frame Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-600"></span>
            )}
          </div>
          <span className="font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            Live Surveillance Feed // Corridor Cam 04
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-[10px]">
            25 FPS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            {detectorMetrics?.model || 'YOLOv8n + Centroid Tracker'}
          </span>
          <span className="text-[11px] text-slate-400">
            {detectorMetrics?.latency_ms ? `${detectorMetrics.latency_ms} ms` : 'Active'}
          </span>
        </div>
      </div>

      {/* Video Stream Screen */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
        {frameData ? (
          <img
            src={frameData}
            alt="Real-time Computer Vision Annotated Traffic Stream"
            className="w-full h-full object-contain select-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin"></div>
              <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-300">ESTABLISHING CV TELEMETRY LINK...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting to ws://localhost:8000/ws/telemetry</p>
          </div>
        )}

        {/* Tactical Crosshair / Corner Grid Overlay */}
        <div className="absolute inset-2 pointer-events-none border border-slate-700/20 rounded-lg">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70"></div>
        </div>

        {/* Hazard Alert Banner Overlay */}
        <div className="absolute top-3 left-3 right-3 pointer-events-none">
          {incidentDetected ? (
            <div className="bg-red-950/90 border border-red-500 text-red-200 px-3 py-2 rounded-lg backdrop-blur-md shadow-2xl shadow-red-900/50 animate-pulse flex items-start justify-between gap-3 font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
                <div>
                  <p className="text-xs font-bold tracking-wide text-red-300">
                    HAZARD ALERT: STALLED VEHICLE #{incidentDetails?.vehicle_id ?? 'AUTO'} ({incidentDetails?.class_name?.toUpperCase() ?? 'CAR'})
                  </p>
                  <p className="text-[11px] text-red-400">
                    Stationary: <span className="text-white font-bold">{incidentDetails?.stalled_duration_sec ?? 6.2}s</span> (Threshold: &gt;6.0s) &bull; Displacement: <span className="text-white font-bold">{incidentDetails?.displacement_px ?? 4.1}px</span> (&lt;12px)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase shrink-0">
                LANE BLOCKED
              </span>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center justify-between gap-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MONITORING: ALL TRAFFIC FLOWING FREELY</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                STATUS NORMAL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Vehicle Telemetry HUD Readout */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Total Tracked</span>
          <span className="text-base font-bold text-slate-100">
            {detectorMetrics?.total_vehicles ?? 0}
          </span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Moving Units</span>
          <span className="text-base font-bold text-cyan-400">
            {detectorMetrics?.moving_vehicles ?? 0}
          </span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Stalled Hazards</span>
          <span className={`text-base font-bold ${incidentDetected ? 'text-red-400 glow-crimson' : 'text-emerald-400'}`}>
            {detectorMetrics?.stalled_vehicles ?? (incidentDetected ? 1 : 0)}
          </span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80 flex flex-col justify-center">
          <button
            onClick={onToggleSimulation}
            disabled={isToggling}
            className={`w-full py-1 px-2 rounded text-[11px] font-bold transition-all ${
              incidentDetected
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {incidentDetected ? 'Clear Incident' : 'Inject Hazard'}
          </button>
        </div>
      </div>
    </div>
  );
}
