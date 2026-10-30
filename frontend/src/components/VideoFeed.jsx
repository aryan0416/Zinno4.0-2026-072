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
  Maximize2
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

  const avgConfidence = detectorMetrics?.total_vehicles > 0 ? 94.8 : 98.2;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative flex flex-col bg-tactical-base rounded-lg border border-tactical-border overflow-hidden transition-all ${
      isFullscreen ? 'fixed inset-4 z-[999]' : 'h-full'
    }`}>
      {/* 1. Tactical Camera Top HUD Header */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-tactical-surface/90 border-b border-tactical-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-signal-green' : 'bg-signal-alert'}`}></span>
            <Camera className="w-3.5 h-3.5 text-textmuted-tertiary" />
          </div>

          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="bg-tactical-void border border-tactical-border text-textmuted-primary font-medium rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="cam-04">CCTV-04 // SECTOR 4 CENTRAL CORRIDOR</option>
            <option value="cam-02">CCTV-02 // NORTH ARTERIAL INTERCHANGE</option>
            <option value="cam-07">CCTV-07 // FINANCIAL CORRIDOR SOUTH</option>
          </select>
        </div>

        {/* Inference Latency & Model Chip */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-tactical-void border border-tactical-border text-textmuted-secondary text-[10px] font-mono">
            <Cpu className="w-3 h-3 text-textmuted-tertiary" />
            <span>YOLOv8n: {detectorMetrics?.latency_ms ?? latencyMs}<span className="text-textmuted-tertiary">ms</span></span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-tactical-void border border-tactical-border text-textmuted-secondary text-[10px] font-mono">
            <span className="text-textmuted-tertiary">CONF:</span>
            <span className="text-textmuted-primary font-medium">{avgConfidence}%</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-tactical-hover text-textmuted-tertiary hover:text-textmuted-primary transition-colors"
            title="Toggle Expanded View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Live Video Display Area with Millimeter Reticle */}
      <div className="relative w-full flex-1 aspect-[4/3] sm:aspect-[16/10] bg-tactical-void flex items-center justify-center overflow-hidden">
        {frameData ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={frameData}
              alt="Live Tactical Computer Vision Stream"
              className={`w-full h-full object-contain select-none transition-opacity ${
                showBoxes ? 'opacity-100' : 'opacity-90 contrast-110'
              }`}
            />

            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 bg-gradient-to-r from-transparent via-signal-warn/25 to-signal-alert/35" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-textmuted-tertiary font-mono">
            <div className="relative w-12 h-12 mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-tactical-border animate-spin"></div>
              <Radio className="w-6 h-6 text-textmuted-secondary" />
            </div>
            <p className="text-xs font-medium text-textmuted-secondary uppercase">Awaiting Edge CCTV Telemetry...</p>
            <p className="text-[10px] text-textmuted-tertiary mt-0.5">Ingesting RTSP frame stream from Sector 04 Unit</p>
          </div>
        )}

        {/* Technical Millimeter Reticle Overlay */}
        {showReticle && (
          <div className="absolute inset-3 pointer-events-none border border-tactical-border/40 rounded">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-textmuted-tertiary/70"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-textmuted-tertiary/70"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-textmuted-tertiary/70"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-textmuted-tertiary/70"></div>

            {/* Subdued Center Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-6 h-[1px] bg-textmuted-tertiary"></div>
              <div className="h-6 w-[1px] bg-textmuted-tertiary absolute"></div>
            </div>
          </div>
        )}

        {/* Hazard Alert Banner Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 pointer-events-none font-mono">
          {incidentDetected ? (
            <div className="bg-signal-alertBg border border-signal-alert/30 text-signal-alert px-3 py-1.5 rounded backdrop-blur-md flex items-start justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-signal-alert shrink-0" />
                <div>
                  <p className="font-medium text-signal-alert uppercase text-[11px]">
                    HAZARD CONFIRMED: VEHICLE #{incidentDetails?.vehicle_id ?? '402'} STALLED &gt; 6.0s
                  </p>
                  <p className="text-[10px] text-textmuted-secondary">
                    Stationary: <span className="text-textmuted-primary font-medium">{incidentDetails?.stalled_duration_sec ?? 7.4}s</span> &bull; Drift: <span className="text-textmuted-primary font-medium">{incidentDetails?.displacement_px ?? 3.8}px</span> (&lt;12px)
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-signal-alert text-tactical-void text-[9px] font-bold uppercase shrink-0">
                BLOCKED
              </span>
            </div>
          ) : (
            <div className="bg-tactical-surface/90 border border-signal-green/20 text-signal-green px-2.5 py-1 rounded backdrop-blur-md flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-signal-green" />
                <span className="text-[11px] font-medium text-textmuted-secondary">SURVEILLANCE ACTIVE: CORRIDOR TRAFFIC FLOWING</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-signal-greenBg text-signal-green border border-signal-green/20 font-medium">
                NOMINAL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tactical Feed Control & Mask Toggle Bar */}
      <div className="px-3 py-1.5 bg-tactical-surface/90 border-t border-tactical-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-textmuted-tertiary text-[10px] uppercase">Masks:</span>
          
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              showBoxes
                ? 'bg-tactical-base border-tactical-border text-textmuted-primary'
                : 'bg-transparent border-transparent text-textmuted-tertiary hover:text-textmuted-secondary'
            }`}
          >
            {showBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Boxes</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              showHeatmap
                ? 'bg-signal-warnBg border-signal-warn/30 text-signal-warn'
                : 'bg-transparent border-transparent text-textmuted-tertiary hover:text-textmuted-secondary'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setShowReticle(!showReticle)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              showReticle
                ? 'bg-tactical-base border-tactical-border text-textmuted-primary'
                : 'bg-transparent border-transparent text-textmuted-tertiary hover:text-textmuted-secondary'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Reticle</span>
          </button>
        </div>

        <button
          onClick={onToggleSimulation}
          disabled={isToggling}
          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
            incidentDetected
              ? 'bg-signal-greenBg hover:bg-signal-green/20 text-signal-green border border-signal-green/30'
              : 'bg-signal-alertBg hover:bg-signal-alert/20 text-signal-alert border border-signal-alert/30'
          }`}
        >
          {incidentDetected ? 'Clear Obstruction' : 'Inject Stalled Vehicle'}
        </button>
      </div>

      {/* 4. Bottom Vehicle Detection Metrics Bar */}
      <div className="p-2.5 bg-tactical-void border-t border-tactical-border grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-tactical-base p-1.5 rounded border border-tactical-border">
          <span className="text-textmuted-tertiary text-[9px] uppercase block font-sans">Tracked</span>
          <span className="text-sm font-medium text-textmuted-primary">
            {detectorMetrics?.total_vehicles ?? 4}
          </span>
        </div>

        <div className="bg-tactical-base p-1.5 rounded border border-tactical-border">
          <span className="text-textmuted-tertiary text-[9px] uppercase block font-sans">Moving Units</span>
          <span className="text-sm font-medium text-signal-telemetry">
            {detectorMetrics?.moving_vehicles ?? (incidentDetected ? 3 : 4)}
          </span>
        </div>

        <div className="bg-tactical-base p-1.5 rounded border border-tactical-border">
          <span className="text-textmuted-tertiary text-[9px] uppercase block font-sans">Stalled Hazards</span>
          <span className={`text-sm font-medium ${incidentDetected ? 'text-signal-alert' : 'text-signal-green'}`}>
            {detectorMetrics?.stalled_vehicles ?? (incidentDetected ? 1 : 0)}
          </span>
        </div>

        <div className="bg-tactical-base p-1.5 rounded border border-tactical-border">
          <span className="text-textmuted-tertiary text-[9px] uppercase block font-sans">Avg Velocity</span>
          <span className="text-sm font-medium text-textmuted-secondary">
            {incidentDetected ? '14.2 px/s' : '36.8 px/s'}
          </span>
        </div>
      </div>
    </div>
  );
}
