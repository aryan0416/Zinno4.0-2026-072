# SafeRoute-AI // Defense & Smart City Tactical Operations Center

> **Multi-Million-Dollar Defense & Municipal Operations Dashboard for Autonomous Computer Vision Incident Detection & Real-Time Emergency Vehicle Rerouting**
> Inspired by Palantir Foundry, Dark Mode Tesla UI, and NASA Mission Control.

---

## 🏛 System Architecture & Live Operations

```mermaid
flowchart TD
    subgraph SENSORS["Municipal CCTV Sensor Layer"]
        C1["CCTV Cam 04 (Downtown Central)"]
        C2["CCTV Cam 02 (North Arterial)"]
        C3["CCTV Cam 07 (Financial Dist)"]
    end

    subgraph EDGE_AI["Edge Computer Vision (NVIDIA Jetson / YOLOv8n)"]
        DET["YOLOv8n Vehicle Detector\nCars, Motorcycles, Buses, Trucks"]
        TRACK["Centroid Velocity Tracker\nZero-Velocity Temporal Window (T > 6.0s, Disp < 12px)"]
    end

    subgraph ENGINE["SafeRoute-AI Graph Core (FastAPI + NetworkX)"]
        HAZARD{"Hazard Confirmed?"}
        PENALTY["Edge Cost Inflation\nw = 9999.0 Impedance Penalty"]
        DIJKSTRA["Sub-15ms Dijkstra Shortest Path Solver"]
        WS["25 FPS Telemetry Streamer (/ws/telemetry)"]
    end

    subgraph OPS_CENTER["Palantir-Grade Tactical Command Center (React 18 + Vite)"]
        HUD["Tactical HUD Bar & Live Clock"]
        MAP["CartoDB Dark Vector Map & Glowing Green Corridors"]
        VIDEO["Live AI Feed with Reticle & Heatmap Overlays"]
        AMB["Interpolated Ambulance Step-by-Step Dispatcher"]
        METRICS["Real-Time Density Sparklines & CO2 Avoided"]
        AUDIT["Streaming Audit Log Console & CSV Export"]
        AUDIO["Synthesized Tactical Web Audio Sirens & Chirps"]
    end

    SENSORS --> DET
    DET --> TRACK
    TRACK --> HAZARD
    HAZARD -- Yes --> PENALTY
    HAZARD -- No --> DIJKSTRA
    PENALTY --> DIJKSTRA
    DIJKSTRA --> WS
    WS --> OPS_CENTER
```

---

## 💎 Tactical Features

### 1. Command Center (Main Tactical Split View)
- **Top HUD**: Live UTC clock with seconds, connection status pill (`ONLINE // 25 FPS`), sector selector (`Sector 04 Central`, `Sector 07 Financial`, `Sector 01 North`), Web Audio alert toggle, and instant simulation triggers.
- **Split Screen**:
  - **Left (5 Cols)**: Live CCTV AI surveillance stream with targeting reticle, inference latency indicator (`~28ms`), camera angle dropdown, and overlay toggles (`Bounding Boxes`, `Heatmap Mask`, `Reticle HUD`).
  - **Right (7 Cols)**: CartoDB Dark Matter Leaflet map with pulsing custom SVG markers for Ambulance Depot Alpha, Trauma Center Hospital, and Intersections. Active route renders in glowing emerald green; blocked segments render in pulsing dashed crimson.
  - **Ambulance Live Dispatch**: Click `[Spawn Ambulance]` to watch the emergency vehicle travel along the recalculated route coordinates step-by-step with synchronized audio beacons.
- **Metrics Drawer**: 4 KPI stat cards showing ETA, Hazard Detection State, Recalculation Runtime (`<15ms`), and avoided CO2 emissions.
- **Terminal Event Audit Log**: Real-time streaming log feed with color-coded levels (`[CRITICAL]`, `[WARN]`, `[INFO]`) and one-click CSV export.

### 2. Analytics & Incident History Tab
- **Arterial Congestion vs. Time**: Interactive Recharts dual line chart comparing legacy static routing against SafeRoute-AI.
- **Transit Time Reduction**: Recharts comparative bar chart benchmarking 5 urban sectors.
- **Verified Incident History Ledger**: Searchable table displaying past cleared obstructions, vehicle classes, and minutes saved.

### 3. "How to Use & System Architecture" Judge Guide Modal
- Interactive 4-step pipeline walkthrough:
  1. *CCTV Ingestion & Edge YOLOv8 Inference*
  2. *Centroid Displacement & Zero-Velocity Window*
  3. *NetworkX Dynamic Cost Inflation ($w = 9999.0$)*
  4. *Sub-50ms Dijkstra Green Wave Clearance*
- **Real-World Viability & Judge FAQ**: Camera blind-spots, night-vision/thermal handling, NVIDIA Jetson Orin deployment specs, and NTCIP 1202 municipal signal controller integration.
- Full-stack SVG node connection diagram.

### 4. Tactical Config Settings Drawer
- Sliders for live parameter tuning:
  - *Stationary Stall Threshold* (3.0s to 15.0s)
  - *Pixel Drift Sensitivity* (5px to 25px)
  - *Graph Impedance Penalty Multiplier* (1,000 to 20,000)
  - *Tactical Siren Volume*

### 5. Web Audio API Sound Synthesizer
- Built with pure Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`).
- Zero external MP3 files or audio network dependencies.
- Emits dual-oscillator hazard alarms, tactical radar chirps, ambulance dispatch tones, and resolution chimes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

### 2. Backend Engine
```bash
# In terminal 1:
cd backend

# Install requirements
pip install -r requirements.txt

# Launch FastAPI Uvicorn Server (http://localhost:8000)
python main.py
```
*Note: If `backend/data/sample_traffic.mp4` is missing, the server automatically synthesizes a realistic 25 FPS multi-lane traffic simulation with planned vehicle stalls.*

### 3. Frontend Command Center
```bash
# In terminal 2:
cd frontend

# Install npm dependencies (if not done)
npm install

# Start Vite Development Server (http://localhost:5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📡 Telemetry WebSocket API

- **Endpoint**: `ws://localhost:8000/ws/telemetry`
- **REST Endpoints**:
  - `GET /api/status`: Current route, hazard status, and topology
  - `GET /api/topology`: Node and edge coordinates
  - `POST /api/hazard/toggle`: Manually toggle corridor obstruction
  - `POST /api/hazard/reset`: Reset all graph blockages

---

## 🗺 Downtown Grid Topology

| Node ID | Type | Coordinates (Lat, Lng) | Function |
|---|---|---|---|
| `N_AMBULANCE_BASE` | Emergency Base | `37.7749, -122.4194` | Emergency Dispatch HQ Alpha |
| `INT_A` | Intersection | `37.7785, -122.4162` | 4th & Market Corridor |
| `INT_B` | Intersection | `37.7828, -122.4095` | 3rd & Mission Commercial Hub |
| `INT_C` | Intersection | `37.7712, -122.4135` | 6th & Folsom South Arterial |
| `INT_D` | Intersection | `37.7758, -122.4082` | 5th & Howard Connector Hub |
| `N_INCIDENT_ZONE` | Incident Zone | `37.7798, -122.4128` | Transit Corridor Central (Surveillance Zone) |
| `N_HOSPITAL` | Hospital | `37.7865, -122.4032` | Level-1 Metropolitan Trauma Center |

---

## 📜 License
MIT License. SafeRoute-AI.
