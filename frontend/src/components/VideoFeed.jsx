import React, { useState } from 'react';
import {
  Video,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  Activity,
  Crosshair,
  Eye,
  EyeOff,
  Flame,
  Camera,
  Maximize2,
  Sparkles
} from 'lucide-react';

export default function VideoFeed({
  frameData,
  incidentDetected,
  incidentDetails,
  detectorMetrics,
  isConnected,
  onToggleSimulation,
  isToggling,
  latencyMs = 28.4
}) {
  const [selectedCam, setSelectedCam] = useState('cam-04');
  const [showBoxes, setShowBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showReticle, setShowReticle] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Confidence estimation based on detection metrics
  const avgConfidence = detectorMetrics?.total_vehicles > 0 ? 94.8 : 98.2;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative flex flex-col bg-[#0b101b]/95 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md transition-all ${
      isFullscreen ? 'fixed inset-4 z-[999]' : 'h-full'
    }`}>
      {/* 1. Tactical Camera Top HUD Header */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-600"></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 text-cyan-300 font-bold rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="cam-04">CCTV-04 // SECTOR 4 INCIDENT ZONE</option>
              <option value="cam-02">CCTV-02 // NORTH ARTERIAL INTERCHANGE</option>
              <option value="cam-07">CCTV-07 // FINANCIAL CORRIDOR SOUTH</option>
            </select>
          </div>
        </div>

        {/* Inference Latency & Model Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[10px] font-bold">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>YOLOv8n: {detectorMetrics?.latency_ms ?? latencyMs}ms</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
            <span>CONF:</span>
            <span className="text-emerald-400 font-bold">{avgConfidence}%</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle Expanded View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Live Video Display Area with Tactical Reticle and Overlays */}
      <div className="relative w-full flex-1 aspect-[4/3] sm:aspect-[16/10] bg-[#070b14] flex items-center justify-center overflow-hidden">
        {frameData ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={frameData}
              alt="Live Tactical Computer Vision Stream"
              className={`w-full h-full object-contain select-none transition-opacity duration-300 ${
                showBoxes ? 'opacity-100' : 'opacity-90 contrast-125'
              }`}
            />

            {/* Optional Heatmap Congestion Density Simulation Mask */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50 bg-gradient-to-r from-transparent via-amber-500/30 to-rose-600/40 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin"></div>
              <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-300">ESTABLISHING EDGE CCTV TELEMETRY...</p>
            <p className="text-xs text-slate-500 mt-1">Ingesting 25 FPS stream from Sector 4 Surveillance Unit</p>
          </div>
        )}

        {/* Tactical Crosshair / Corner Bracket Overlays */}
        {showReticle && (
          <div className="absolute inset-3 pointer-events-none border border-slate-700/25 rounded-lg">
            {/* Top-Left Reticle */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80"></div>
            {/* Top-Right Reticle */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80"></div>
            {/* Bottom-Left Reticle */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80"></div>
            {/* Bottom-Right Reticle */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80"></div>

            {/* Center Crosshair Pinpoint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-8 h-[1px] bg-cyan-400"></div>
              <div className="h-8 w-[1px] bg-cyan-400 absolute"></div>
            </div>
          </div>
        )}

        {/* Hazard Alert Banner Overlay */}
        <div className="absolute top-3 left-3 right-3 pointer-events-none">
          {incidentDetected ? (
            <div className="bg-rose-950/90 border border-rose-500 text-rose-200 px-3 py-2 rounded-lg backdrop-blur-md shadow-2xl shadow-rose-950/70 animate-pulse flex items-start justify-between gap-3 font-mono">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                <div>
                  <p className="text-xs font-bold tracking-wide text-rose-300">
                    HAZARD CONFIRMED: VEHICLE #{incidentDetails?.vehicle_id ?? '402'} STALLED &gt; 6.0s
                  </p>
                  <p className="text-[11px] text-rose-400">
                    Zero-Velocity Window: <span className="text-white font-bold">{incidentDetails?.stalled_duration_sec ?? 7.4}s</span> &bull; Drift: <span className="text-white font-bold">{incidentDetails?.displacement_px ?? 3.8}px</span> (&lt;12px)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase shrink-0 shadow-md">
                CORRIDOR BLOCKED
              </span>
            </div>
          ) : (
            <div className="bg-slate-900/85 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center justify-between gap-2 font-mono text-xs shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">SURVEILLANCE ACTIVE: CORRIDOR TRAFFIC FLOWING NOMINALLY</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold hidden sm:inline">
                ZERO HAZARDS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tactical Feed Control & Mask Toggle Bar */}
      <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase">Overlays:</span>
          
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showBoxes
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Bounding Boxes</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showHeatmap
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Heatmap Mask</span>
          </button>

          <button
            onClick={() => setShowReticle(!showReticle)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showReticle
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Reticle HUD</span>
          </button>
        </div>

        {/* Quick Simulation Trigger inside feed */}
        <button
          onClick={onToggleSimulation}
          disabled={isToggling}
          className={`px-3 py-1 rounded text-[11px] font-bold transition-all shadow-sm ${
            incidentDetected
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {incidentDetected ? 'Clear Obstruction' : 'Inject Stalled Vehicle'}
        </button>
      </div>

      {/* 4. Bottom Vehicle Detection Metrics Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Tracked Vehicles</span>
          <span className="text-lg font-bold text-slate-100">
            {detectorMetrics?.total_vehicles ?? 4}
          </span>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Moving Units</span>
          <span className="text-lg font-bold text-cyan-400">
            {detectorMetrics?.moving_vehicles ?? (incidentDetected ? 3 : 4)}
          </span>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Stalled Hazards</span>
          <span className={`text-lg font-bold ${incidentDetected ? 'text-rose-400 glow-crimson' : 'text-emerald-400'}`}>
            {detectorMetrics?.stalled_vehicles ?? (incidentDetected ? 1 : 0)}
          </span>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Avg Velocity</span>
          <span className="text-lg font-bold text-slate-200">
            {incidentDetected ? '14.2 px/s' : '36.8 px/s'}
          </span>
        </div>
      </div>
    </div>
  );
}
