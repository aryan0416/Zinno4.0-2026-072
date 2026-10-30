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
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 font-mono shadow-2xl">
      <div className="max-w-[1900px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Sector Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`relative p-2 rounded-lg border transition-all ${
              incidentDetected
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/30'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20'
            }`}>
              <Siren className="w-5 h-5 animate-pulse" />
              {incidentDetected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider uppercase text-white">
                  SafeRoute<span className="text-cyan-400">-AI</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 font-bold uppercase tracking-wider">
                  Tactical OS v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block">
                Autonomous CV Hazard Detection & Dynamic Emergency Corridor Clearing
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-[1px] bg-slate-800" />

          {/* Sector Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 uppercase text-[10px]">Sector:</span>
            <select
              value={activeSector}
              onChange={(e) => setActiveSector(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="downtown" className="bg-slate-900 text-slate-200">Sector 04 // SF Downtown Central</option>
              <option value="financial" className="bg-slate-900 text-slate-200">Sector 07 // Financial Arterial</option>
              <option value="north" className="bg-slate-900 text-slate-200">Sector 01 // North Transit Hub</option>
            </select>
          </div>
        </div>

        {/* Center: Mission Control Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/90 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Audit</span>
          </button>

          <button
            onClick={() => onOpenGuide()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold tracking-wide text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Judge Guide & Architecture</span>
          </button>
        </div>

        {/* Right: Simulation Quick Actions, Audio Toggle, & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Quick Simulation Action Bar (Crucial for live Judge Demo) */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {incidentDetected ? (
              <button
                onClick={onClearHazard}
                disabled={isToggling}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-lg shadow-emerald-900/30 transition-colors"
                title="Restore Normal Corridor Flow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clear Hazard</span>
              </button>
            ) : (
              <button
                onClick={onSimulateHazard}
                disabled={isToggling}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-[11px] shadow-lg shadow-rose-900/40 transition-colors"
                title="Trigger Stalled Vehicle Hazard on Sector 4"
              >
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                <span>Simulate Crash</span>
              </button>
            )}

            <button
              onClick={onSpawnAmbulance}
              disabled={isAmbulanceMoving}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
                isAmbulanceMoving
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Dispatch Ambulance along calculated route"
            >
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAmbulanceMoving ? 'Dispatched...' : 'Spawn Ambulance'}</span>
            </button>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-colors ${
              audioEnabled
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={audioEnabled ? "Disable Tactical Audio Alerts" : "Enable Tactical Audio Alerts (Synthesized Web Audio)"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Config Settings Drawer Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Configure CV Thresholds & Graph Penalty Multipliers"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Live System Connection Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
            isConnected
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
          }`}>
            <span className="relative flex h-2 w-2">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="text-[11px] font-bold">
              {isConnected ? `ONLINE // ${fps.toFixed(0)} FPS` : 'CONNECTING...'}
            </span>
          </div>

          {/* Live Clock */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{utcTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
