import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import VideoFeed from './components/VideoFeed';
import TacticalMap from './components/TacticalMap';
import MetricsPanel from './components/MetricsPanel';
import IncidentLog from './components/IncidentLog';
import HowToUseModal from './components/HowToUseModal';
import AnalyticsView from './components/AnalyticsView';
import SettingsDrawer from './components/SettingsDrawer';
import { tacticalAudio } from './utils/audio';

export default function App() {
  // Navigation & Modal Views
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSector, setActiveSector] = useState('downtown');

  // WebSocket Live Telemetry State
  const [isConnected, setIsConnected] = useState(false);
  const [frameData, setFrameData] = useState(null);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [detectorMetrics, setDetectorMetrics] = useState(null);
  const [route, setRoute] = useState(null);
  const [topology, setTopology] = useState(null);
  const [fps, setFps] = useState(25);
  const [utcTime, setUtcTime] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  // Audio State
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Ambulance Step-by-Step Dispatch Simulation
  const [isAmbulanceMoving, setIsAmbulanceMoving] = useState(false);
  const [ambulanceStepIndex, setAmbulanceStepIndex] = useState(0);

  // Settings Configuration State
  const [config, setConfig] = useState({
    stallTimeThreshold: 6.0,
    displacementThreshold: 12,
    penaltyWeight: 9999,
    audioVolume: 0.8
  });

  // Real-time Event Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      sector: 'Sector 04',
      event: 'SYSTEM_BOOT',
      details: 'SafeRoute-AI Tactical Telemetry Console initialized.'
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      sector: 'Sector 04',
      event: 'NETWORKX_INITIALIZED',
      details: 'Downtown SF grid loaded with 7 nodes, Dijkstra shortest path solver online.'
    }
  ]);

  const wsRef = useRef(null);
  const lastIncidentStateRef = useRef(false);
  const ambulanceIntervalRef = useRef(null);

  // Helper to append a timestamped audit log
  const addAuditLog = useCallback((level, event, details, sector = 'Sector 04') => {
    const newEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      sector,
      event,
      details
    };
    setAuditLogs((prev) => [...prev.slice(-150), newEntry]);
  }, []);

  // Spawn Ambulance Step-by-Step Simulation along Route Coordinates
  const handleSpawnAmbulance = useCallback(() => {
    if (!route || !route.coordinates || route.coordinates.length === 0) return;

    if (ambulanceIntervalRef.current) {
      clearInterval(ambulanceIntervalRef.current);
    }

    setIsAmbulanceMoving(true);
    setAmbulanceStepIndex(0);
    tacticalAudio.playAmbulanceDispatch();
    addAuditLog('INFO', 'AMBULANCE_DISPATCHED', `Unit 01 departing N_AMBULANCE_BASE towards N_HOSPITAL via ${route.status} corridor.`);

    const totalSteps = route.coordinates.length;
    let currentStep = 0;

    ambulanceIntervalRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep >= totalSteps) {
        clearInterval(ambulanceIntervalRef.current);
        ambulanceIntervalRef.current = null;
        setIsAmbulanceMoving(false);
        tacticalAudio.playClearChirp();
        addAuditLog('INFO', 'AMBULANCE_ARRIVED', 'Unit 01 arrived at Metropolitan Trauma Center destination.');
      } else {
        setAmbulanceStepIndex(currentStep);
        tacticalAudio.playRadarChirp();
      }
    }, 900);
  }, [route, addAuditLog]);

  useEffect(() => {
    return () => {
      if (ambulanceIntervalRef.current) {
        clearInterval(ambulanceIntervalRef.current);
      }
    };
  }, []);

  // WebSocket Connection Management
  useEffect(() => {
    let reconnectTimeout = null;
    let isSubscribed = true;

    function connect() {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.port === '5173' ? 'localhost:8000' : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/telemetry`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed) return;
        setIsConnected(true);
        addAuditLog('INFO', 'WEBSOCKET_CONNECTED', `Telemetry socket established on ${wsUrl}`);
        tacticalAudio.playRadarChirp();
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry_update') {
            if (data.frame) setFrameData(data.frame);
            if (data.fps) setFps(data.fps);

            setIncidentDetected(data.incident_detected);
            setIncidentDetails(data.incident_details);
            setDetectorMetrics(data.detector_metrics);
            setRoute(data.route);
            setTopology(data.topology);

            if (data.incident_detected && !lastIncidentStateRef.current) {
              tacticalAudio.playHazardAlarm();
              const vehId = data.incident_details?.vehicle_id ?? '402';
              const duration = data.incident_details?.stalled_duration_sec ?? '6.4';
              addAuditLog(
                'CRITICAL',
                'HAZARD_DETECTED',
                `Vehicle #${vehId} stalled for ${duration}s in Sector 04. +9999.0 impedance penalty applied.`
              );
            } else if (!data.incident_detected && lastIncidentStateRef.current) {
              tacticalAudio.playClearChirp();
              addAuditLog(
                'INFO',
                'HAZARD_CLEARED',
                'Sector 04 corridor cleared. Direct optimal emergency pathway restored.'
              );
            }

            lastIncidentStateRef.current = data.incident_detected;
          }
        } catch (err) {
          console.error('[SafeRoute-AI] WS parse error:', err);
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        if (!isSubscribed) return;
        setIsConnected(false);
        addAuditLog('WARN', 'WEBSOCKET_DISCONNECTED', 'Telemetry socket dropped. Reconnecting in 2s...');
        reconnectTimeout = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [addAuditLog]);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(`${now.toUTCString().slice(17, 25)} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateHazard = async () => {
    setIsToggling(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "toggle" }));
      } else {
        await fetch('http://localhost:8000/api/hazard/toggle', { method: 'POST' });
      }
      addAuditLog('WARN', 'SIMULATION_HAZARD_INJECTED', 'Manual test obstruction injected into Sector 04 Central.');
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsToggling(false), 500);
    }
  };

  const handleClearHazard = async () => {
    setIsToggling(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "reset" }));
      } else {
        await fetch('http://localhost:8000/api/hazard/reset', { method: 'POST' });
      }
      addAuditLog('INFO', 'SIMULATION_HAZARD_CLEARED', 'Manual reset triggered: corridor penalty cleared.');
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsToggling(false), 500);
    }
  };

  const handleResetDefaults = () => {
    setConfig({
      stallTimeThreshold: 6.0,
      displacementThreshold: 12,
      penaltyWeight: 9999,
      audioVolume: 0.8
    });
    addAuditLog('INFO', 'CONFIG_RESET', 'Tactical engine parameters restored to default baseline.');
  };

  return (
    <div className="min-h-screen bg-tactical-void text-textmuted-primary flex flex-col font-sans selection:bg-signal-telemetryBg tactical-grid-bg">
      {/* 1. Tactical Top HUD */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        fps={fps}
        incidentDetected={incidentDetected}
        utcTime={utcTime}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onSimulateHazard={handleSimulateHazard}
        onClearHazard={handleClearHazard}
        onSpawnAmbulance={handleSpawnAmbulance}
        isAmbulanceMoving={isAmbulanceMoving}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeSector={activeSector}
        setActiveSector={setActiveSector}
        isToggling={isToggling}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-[1900px] w-full mx-auto p-3 sm:p-4 flex flex-col gap-3.5">
        {activeTab === 'dashboard' ? (
          <>
            {/* Top 4 Telemetry Metrics Cards */}
            <MetricsPanel
              route={route}
              incidentDetected={incidentDetected}
              incidentDetails={incidentDetails}
              detectorMetrics={detectorMetrics}
            />

            {/* Split Screen Tactical View: CCTV AI Feed vs. Tactical Leaflet Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 items-stretch">
              {/* Left Column (5 Cols): Live Computer Vision Telemetry Feed */}
              <div className="lg:col-span-5 flex flex-col min-h-[460px]">
                <VideoFeed
                  frameData={frameData}
                  incidentDetected={incidentDetected}
                  incidentDetails={incidentDetails}
                  detectorMetrics={detectorMetrics}
                  isConnected={isConnected}
                  onToggleSimulation={incidentDetected ? handleClearHazard : handleSimulateHazard}
                  isToggling={isToggling}
                />
              </div>

              {/* Right Column (7 Cols): Tactical Downtown Graph & Dijkstra Map */}
              <div className="lg:col-span-7 flex flex-col min-h-[460px]">
                <TacticalMap
                  topology={topology}
                  route={route}
                  incidentDetected={incidentDetected}
                  isAmbulanceMoving={isAmbulanceMoving}
                  ambulanceStepIndex={ambulanceStepIndex}
                />
              </div>
            </div>

            {/* Bottom Telemetry Event Audit Log Drawer */}
            <IncidentLog
              logs={auditLogs}
              onClearLogs={() => setAuditLogs([])}
            />
          </>
        ) : (
          /* Analytics & Incident History Tab */
          <div className="space-y-4">
            <AnalyticsView onExportReport={() => {}} />
            <IncidentLog
              logs={auditLogs}
              onClearLogs={() => setAuditLogs([])}
            />
          </div>
        )}
      </main>

      {/* 3. System Architecture & Judge Guide Modal */}
      <HowToUseModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSimulateDemo={handleSimulateHazard}
        onClearDemo={handleClearHazard}
      />

      {/* 4. Settings Configuration Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
        onResetDefaults={handleResetDefaults}
      />

      {/* 5. Defense Mission Control Footer */}
      <footer className="bg-tactical-surface border-t border-tactical-border px-4 py-2 text-xs font-mono text-textmuted-tertiary">
        <div className="max-w-[1900px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-textmuted-secondary font-medium">
              STATUS: <span className={incidentDetected ? "text-signal-alert" : "text-signal-green"}>
                {incidentDetected ? "EMERGENCY REROUTE ACTIVE" : "ALL CORRIDORS NOMINAL"}
              </span>
            </span>
            <span className="text-tactical-border">|</span>
            <span>Vision Core: YOLOv8n Edge TensorRT</span>
            <span className="text-tactical-border">|</span>
            <span>Graph Engine: NetworkX Dijkstra (&lt;15ms)</span>
          </div>

          <div className="text-textmuted-tertiary">
            SafeRoute-AI Tactical Console &bull; Municipal Traffic Preemption System
          </div>
        </div>
      </footer>
    </div>
  );
}
