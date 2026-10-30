import React from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Shield,
  Volume2,
  Cpu,
  GitBranch,
  Gauge,
  Sparkles,
  Save
} from 'lucide-react';

export default function SettingsDrawer({
  isOpen,
  onClose,
  config,
  setConfig,
  onResetDefaults
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex justify-end bg-slate-950/70 backdrop-blur-sm font-mono animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-[#0c121e] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tactical Engine Settings
                </h3>
                <p className="text-[11px] text-slate-400">Real-Time CV & Graph Parameter Tuning</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Sliders */}
          <div className="p-5 space-y-6 text-xs text-slate-300">
            {/* 1. Stationary Threshold */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Stationary Stall Threshold
                </label>
                <span className="text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {config.stallTimeThreshold} seconds
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Duration a vehicle must remain stationary before tripping an emergency corridor hazard.
              </p>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={config.stallTimeThreshold}
                onChange={(e) => setConfig({ ...config, stallTimeThreshold: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>3s (Aggressive)</span>
                <span>6s (Default)</span>
                <span>15s (Conservative)</span>
              </div>
            </div>

            {/* 2. Pixel Drift Sensitivity */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Pixel Drift Sensitivity
                </label>
                <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                  {config.displacementThreshold} px
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Maximum coordinate centroid displacement window permitted to qualify as zero-velocity.
              </p>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={config.displacementThreshold}
                onChange={(e) => setConfig({ ...config, displacementThreshold: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5px (Strict)</span>
                <span>12px (Default)</span>
                <span>25px (Relaxed)</span>
              </div>
            </div>

            {/* 3. Graph Blockage Penalty Multiplier */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-rose-400" />
                  Graph Impedance Penalty
                </label>
                <span className="text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                  +{config.penaltyWeight}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cost weight added to NetworkX edge when corridor blockage is detected.
              </p>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={config.penaltyWeight}
                onChange={(e) => setConfig({ ...config, penaltyWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1,000</span>
                <span>9,999 (Default)</span>
                <span>20,000</span>
              </div>
            </div>

            {/* 4. Alert Audio Volume */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Tactical Siren Volume
                </label>
                <span className="text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {Math.round(config.audioVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.audioVolume}
                onChange={(e) => setConfig({ ...config, audioVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-lg shadow-cyan-950/50"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
