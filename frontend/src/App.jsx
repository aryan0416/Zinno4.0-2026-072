import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Siren,
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Activity,
  Wifi,
  WifiOff,
  Navigation,
  Compass,
  Zap,
  Server
} from 'lucide-react';

import VideoFeed from './components/VideoFeed';
import TacticalMap from './components/TacticalMap';
import MetricsPanel from './components/MetricsPanel';

export default function App() {
  // Real-time state received from WebSocket
  const [isConnected, setIsConnected] = useState(false);
  const [frameData, setFrameData] = useState(null);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [detectorMetrics, setDetectorMetrics] = useState(null);
  const [route, setRoute] = useState(null);
  const [topology, setTopology] = useState(null);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastIncidentStateRef = useRef(false);

  // Synthesize tactical sound beep using Web Audio API on hazard trip
  const playAlertSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      console.warn("Audio alert failed", e);
    }
  }, [audioEnabled]);

  // Establish and manage active WebSocket connection
  useEffect(() => {
    let reconnectTimeout = null;
    let isSubscribed = true;

    function connect() {
      // Determine WebSocket URL (default to localhost:8000 if dev server)
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.port === '5173' ? 'localhost:8000' : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/telemetry`;

      console.log(`[SafeRoute-AI] Connecting WebSocket to ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed) return;
        console.log('[SafeRoute-AI] WebSocket connected.');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry_update') {
            if (data.frame) setFrameData(data.frame);
            setIncidentDetected(data.incident_detected);
            setIncidentDetails(data.incident_details);
            setDetectorMetrics(data.detector_metrics);
            setRoute(data.route);
            setTopology(data.topology);

            // Audio alert on rising edge of incident
            if (data.incident_detected && !lastIncidentStateRef.current) {
              playAlertSound();
            }
            lastIncidentStateRef.current = data.incident_detected;
          }
        } catch (err) {
          console.error('[SafeRoute-AI] WS message error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[SafeRoute-AI] WebSocket error encountered, will reconnect.');
      };

      ws.onclose = () => {
        if (!isSubscribed) return;
        console.log('[SafeRoute-AI] WebSocket disconnected. Reconnecting in 2s...');
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [playAlertSound]);

  // System clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manual hazard injection / clear action
  const handleToggleSimulation = async () => {
    setIsToggling(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "toggle" }));
      } else {
        // Fallback REST endpoint
        await fetch('http://localhost:8000/api/hazard/toggle', { method: 'POST' });
      }
    } catch (e) {
      console.error("Failed to toggle hazard:", e);
    } finally {
      setTimeout(() => setIsToggling(false), 500);
    }
  };

  const handleResetAll = async () => {
    setIsToggling(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "reset" }));
      } else {
        await fetch('http://localhost:8000/api/hazard/reset', { method: 'POST' });
      }
    } catch (e) {
      console.error("Failed to reset:", e);
    } finally {
      setTimeout(() => setIsToggling(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col selection:bg-cyan-500/20">
      {/* 1. Command Center Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 px-4 py-3">
        <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-4 font-mono">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
              incidentDetected
                ? 'bg-red-600/20 border-red-500 text-red-400 shadow-lg shadow-red-600/30 animate-pulse'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20'
            }`}>
              <Siren className="w-5 h-5 animate-pulse-fast" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-wider uppercase text-white">
                  SafeRoute<span className="text-cyan-400">-AI</span>
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Computer Vision Traffic Incident Detector & Dynamic Emergency Rerouting Engine
              </p>
            </div>
          </div>

          {/* Central Alert Pill */}
          <div className="flex items-center gap-3">
            {incidentDetected ? (
              <div className="flex items-center gap-2 bg-red-950/90 border border-red-500 text-red-300 px-3.5 py-1.5 rounded-full shadow-lg shadow-red-950/50 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  CRITICAL HAZARD IN CORRIDOR // REROUTING DISPATCH
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  NETWORK NOMINAL // OPTIMAL PATHWAY ACTIVE
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls & Telemetry */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Disable Tactical Siren" : "Enable Tactical Siren"}
              className={`p-2 rounded-lg border transition-colors ${
                audioEnabled
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetAll}
              disabled={isToggling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Reset Graph</span>
            </button>

            {/* Connection Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              isConnected
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-red-950/50 border-red-800 text-red-300'
            }`}>
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold">
                {isConnected ? 'LIVE 25FPS' : 'RECONNECTING'}
              </span>
            </div>

            {/* Digital Clock */}
            <div className="hidden lg:block px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
              {systemTime}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Command Body */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Top KPI Telemetry Cards */}
        <MetricsPanel
          route={route}
          incidentDetected={incidentDetected}
          incidentDetails={incidentDetails}
          detectorMetrics={detectorMetrics}
        />

        {/* Central Tactical Split View: CV Video vs Tactical Graph Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          {/* Left Column (5 Cols): Live Computer Vision Telemetry Feed */}
          <div className="lg:col-span-5 flex flex-col">
            <VideoFeed
              frameData={frameData}
              incidentDetected={incidentDetected}
              incidentDetails={incidentDetails}
              detectorMetrics={detectorMetrics}
              isConnected={isConnected}
              onToggleSimulation={handleToggleSimulation}
              isToggling={isToggling}
            />
          </div>

          {/* Right Column (7 Cols): Tactical Downtown Graph & Dijkstra Map */}
          <div className="lg:col-span-7 flex flex-col min-h-[500px]">
            <TacticalMap
              topology={topology}
              route={route}
              incidentDetected={incidentDetected}
            />
          </div>
        </div>
      </main>

      {/* 3. Footer System Telemetry Status */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-2.5 text-xs font-mono text-slate-400">
        <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> SafeRoute Backend: FastAPI / Python 3.10
            </span>
            <span className="text-slate-600">|</span>
            <span>Graph Engine: NetworkX Dijkstra</span>
            <span className="text-slate-600">|</span>
            <span>Vision Core: Ultralytics YOLOv8n + Centroid Tracker (&lt;12px, &gt;6.0s)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Target Destination: <span className="text-emerald-400 font-bold">N_HOSPITAL (Trauma Center)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
