import React from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Volume2,
  Cpu,
  GitBranch,
  Gauge
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
    <div className="fixed inset-0 z-[1050] flex justify-end bg-tactical-void/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-md h-full bg-tactical-base border-l border-tactical-border shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-3.5 bg-tactical-surface border-b border-tactical-border">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-tactical-void text-signal-telemetry border border-tactical-border">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-textmuted-primary uppercase tracking-wider">
                  Tactical Engine Settings
                </h3>
                <p className="text-[10px] text-textmuted-tertiary">Real-Time CV & Graph Parameter Tuning</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-tactical-hover text-textmuted-tertiary hover:text-textmuted-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Sliders */}
          <div className="p-4 space-y-4 text-xs text-textmuted-secondary">
            {/* 1. Stationary Threshold */}
            <div className="space-y-1.5 bg-tactical-surface/50 p-3 rounded border border-tactical-border">
              <div className="flex items-center justify-between">
                <label className="font-medium text-textmuted-primary flex items-center gap-1.5 text-xs">
                  <Gauge className="w-3.5 h-3.5 text-signal-telemetry" />
                  Stationary Stall Threshold
                </label>
                <span className="text-signal-telemetry font-mono font-medium px-1.5 py-0.2 rounded bg-tactical-void border border-tactical-border text-[11px]">
                  {config.stallTimeThreshold}s
                </span>
              </div>
              <p className="text-[10px] text-textmuted-tertiary">
                Duration a vehicle must remain stationary before tripping an emergency corridor hazard.
              </p>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={config.stallTimeThreshold}
                onChange={(e) => setConfig({ ...config, stallTimeThreshold: parseFloat(e.target.value) })}
                className="w-full accent-signal-telemetry cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-textmuted-tertiary font-mono">
                <span>3s (Aggressive)</span>
                <span>6s (Default)</span>
                <span>15s (Conservative)</span>
              </div>
            </div>

            {/* 2. Pixel Drift Sensitivity */}
            <div className="space-y-1.5 bg-tactical-surface/50 p-3 rounded border border-tactical-border">
              <div className="flex items-center justify-between">
                <label className="font-medium text-textmuted-primary flex items-center gap-1.5 text-xs">
                  <Cpu className="w-3.5 h-3.5 text-signal-warn" />
                  Pixel Drift Sensitivity
                </label>
                <span className="text-signal-warn font-mono font-medium px-1.5 py-0.2 rounded bg-tactical-void border border-tactical-border text-[11px]">
                  {config.displacementThreshold}px
                </span>
              </div>
              <p className="text-[10px] text-textmuted-tertiary">
                Maximum coordinate centroid displacement window permitted to qualify as zero-velocity.
              </p>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={config.displacementThreshold}
                onChange={(e) => setConfig({ ...config, displacementThreshold: parseInt(e.target.value, 10) })}
                className="w-full accent-signal-warn cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-textmuted-tertiary font-mono">
                <span>5px (Strict)</span>
                <span>12px (Default)</span>
                <span>25px (Relaxed)</span>
              </div>
            </div>

            {/* 3. Graph Blockage Penalty Multiplier */}
            <div className="space-y-1.5 bg-tactical-surface/50 p-3 rounded border border-tactical-border">
              <div className="flex items-center justify-between">
                <label className="font-medium text-textmuted-primary flex items-center gap-1.5 text-xs">
                  <GitBranch className="w-3.5 h-3.5 text-signal-alert" />
                  Graph Impedance Penalty
                </label>
                <span className="text-signal-alert font-mono font-medium px-1.5 py-0.2 rounded bg-tactical-void border border-tactical-border text-[11px]">
                  +{config.penaltyWeight}
                </span>
              </div>
              <p className="text-[10px] text-textmuted-tertiary">
                Cost weight added to NetworkX edge when corridor blockage is detected.
              </p>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={config.penaltyWeight}
                onChange={(e) => setConfig({ ...config, penaltyWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-signal-alert cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-textmuted-tertiary font-mono">
                <span>1,000</span>
                <span>9,999 (Default)</span>
                <span>20,000</span>
              </div>
            </div>

            {/* 4. Alert Audio Volume */}
            <div className="space-y-1.5 bg-tactical-surface/50 p-3 rounded border border-tactical-border">
              <div className="flex items-center justify-between">
                <label className="font-medium text-textmuted-primary flex items-center gap-1.5 text-xs">
                  <Volume2 className="w-3.5 h-3.5 text-signal-telemetry" />
                  Tactical Siren Volume
                </label>
                <span className="text-signal-telemetry font-mono font-medium px-1.5 py-0.2 rounded bg-tactical-void border border-tactical-border text-[11px]">
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
                className="w-full accent-signal-telemetry cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-tactical-surface border-t border-tactical-border flex items-center justify-between gap-2">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-tactical-void hover:bg-tactical-hover text-textmuted-secondary hover:text-textmuted-primary border border-tactical-border font-medium text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded bg-signal-telemetry text-tactical-void font-medium text-xs transition-colors hover:opacity-90"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
