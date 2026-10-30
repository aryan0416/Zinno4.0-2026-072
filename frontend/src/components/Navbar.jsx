import React from 'react';
import {
  Siren,
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Play,
  Sliders,
  HelpCircle,
  BarChart3,
  LayoutDashboard,
  Car,
  Compass,
  CheckCircle2,
  Clock,
  Flame
} from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

export default function Navbar({
  activeTab,
  setActiveTab,
  isConnected,
  fps = 25,
  incidentDetected,
  utcTime,
  audioEnabled,
  setAudioEnabled,
  onSimulateHazard,
  onClearHazard,
  onSpawnAmbulance,
  isAmbulanceMoving,
  onOpenSettings,
  onOpenGuide,
  activeSector,
  setActiveSector,
  isToggling
}) {
  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    tacticalAudio.setEnabled(next);
    if (next) {
      tacticalAudio.playRadarChirp();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-tactical-surface/95 backdrop-blur-md border-b border-tactical-border px-4 py-2 font-mono">
      <div className="max-w-[1900px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Sector Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded border transition-colors ${
              incidentDetected
                ? 'bg-signal-alertBg border-signal-alert/30 text-signal-alert'
                : 'bg-signal-telemetryBg border-signal-telemetry/30 text-signal-telemetry'
            }`}>
              <Siren className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wider uppercase text-textmuted-primary">
                  SafeRoute<span className="text-signal-telemetry">-AI</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-tactical-base text-textmuted-secondary border border-tactical-border tracking-wider">
                  TACTICAL CONSOLE
                </span>
              </div>
              <p className="text-[10px] text-textmuted-tertiary hidden xl:block">
                Emergency Route Recalculation & Computer Vision Telemetry
              </p>
            </div>
          </div>

          <div className="hidden md:block h-5 w-[1px] bg-tactical-border" />

          {/* Sector Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-tactical-base border border-tactical-border rounded px-2.5 py-1 text-xs">
            <Compass className="w-3.5 h-3.5 text-textmuted-tertiary" />
            <span className="text-textmuted-tertiary uppercase text-[10px]">Sector:</span>
            <select
              value={activeSector}
              onChange={(e) => setActiveSector(e.target.value)}
              className="bg-transparent text-textmuted-primary text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="downtown" className="bg-tactical-base text-textmuted-primary">Sector 04 // SF Downtown Central</option>
              <option value="financial" className="bg-tactical-base text-textmuted-primary">Sector 07 // Financial Corridor</option>
              <option value="north" className="bg-tactical-base text-textmuted-primary">Sector 01 // North Arterial Hub</option>
            </select>
          </div>
        </div>

        {/* Center: Mission Control Tab Navigation */}
        <div className="flex items-center gap-1 bg-tactical-base p-1 rounded border border-tactical-border text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-tactical-surface text-textmuted-primary border border-tactical-border'
                : 'text-textmuted-secondary hover:text-textmuted-primary hover:bg-tactical-hover/50 border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-textmuted-tertiary" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-tactical-surface text-textmuted-primary border border-tactical-border'
                : 'text-textmuted-secondary hover:text-textmuted-primary hover:bg-tactical-hover/50 border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-textmuted-tertiary" />
            <span>Analytics & Audit</span>
          </button>

          <button
            onClick={() => onOpenGuide()}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-signal-warn hover:bg-signal-warnBg border border-signal-warn/20 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Architecture & Guide</span>
          </button>
        </div>

        {/* Right: Simulation Quick Actions, Audio Toggle, & Telemetry */}
        <div className="flex items-center gap-2 text-xs">
          {/* Quick Simulation Action Bar */}
          <div className="flex items-center gap-1.5 bg-tactical-base p-0.5 rounded border border-tactical-border">
            {incidentDetected ? (
              <button
                onClick={onClearHazard}
                disabled={isToggling}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-signal-greenBg hover:bg-signal-green/20 text-signal-green border border-signal-green/30 text-[11px] font-medium transition-colors"
                title="Restore Normal Corridor Flow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clear Hazard</span>
              </button>
            ) : (
              <button
                onClick={onSimulateHazard}
                disabled={isToggling}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-signal-alertBg hover:bg-signal-alert/20 text-signal-alert border border-signal-alert/30 text-[11px] font-medium transition-colors"
                title="Trigger Stalled Vehicle Hazard on Sector 4"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Simulate Crash</span>
              </button>
            )}

            <button
              onClick={onSpawnAmbulance}
              disabled={isAmbulanceMoving}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                isAmbulanceMoving
                  ? 'bg-signal-telemetryBg text-signal-telemetry border border-signal-telemetry/40'
                  : 'bg-tactical-surface hover:bg-tactical-hover text-textmuted-secondary hover:text-textmuted-primary border border-tactical-border'
              }`}
              title="Dispatch Ambulance along calculated route"
            >
              <Car className="w-3.5 h-3.5 text-signal-telemetry" />
              <span>{isAmbulanceMoving ? 'En Route...' : 'Spawn Ambulance'}</span>
            </button>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded border transition-colors ${
              audioEnabled
                ? 'bg-signal-telemetryBg border-signal-telemetry/30 text-signal-telemetry'
                : 'bg-tactical-base border-tactical-border text-textmuted-tertiary hover:text-textmuted-secondary'
            }`}
            title={audioEnabled ? "Disable Tactical Audio Alerts" : "Enable Tactical Audio Alerts (Web Audio API)"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Config Settings Drawer Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded bg-tactical-base border border-tactical-border text-textmuted-tertiary hover:text-textmuted-secondary hover:bg-tactical-hover transition-colors"
            title="Configure Thresholds & Graph Multipliers"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Live System Connection Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border ${
            isConnected
              ? 'bg-signal-greenBg border-signal-green/20 text-signal-green'
              : 'bg-signal-alertBg border-signal-alert/25 text-signal-alert'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`rounded-full h-1.5 w-1.5 ${isConnected ? 'bg-signal-green' : 'bg-signal-alert'}`}></span>
            </span>
            <span className="text-[11px] font-mono font-medium">
              {isConnected ? `ONLINE // ${fps.toFixed(0)} FPS` : 'CONNECTING'}
            </span>
          </div>

          {/* Live Clock */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-tactical-base border border-tactical-border text-textmuted-secondary text-[11px]">
            <Clock className="w-3.5 h-3.5 text-textmuted-tertiary" />
            <span>{utcTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
