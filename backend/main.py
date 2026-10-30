"""
SafeRoute-AI // Main Application Server
FastAPI REST + WebSocket server streaming real-time video telemetry,
incident detection, and dynamic Dijkstra emergency rerouting.
"""

import asyncio
import base64
import math
import os
from pathlib import Path
import time
from typing import Optional, Dict, Any

import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np

from router import CityGraphRouter
from detector import IncidentDetector

app = FastAPI(
    title="SafeRoute-AI Telemetry Engine",
    description="Computer Vision Traffic Incident Detector & Dynamic Emergency Vehicle Rerouting Engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core engines
router = CityGraphRouter()
detector = IncidentDetector()

# Resolve data video directory
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SAMPLE_VIDEO_PATH = DATA_DIR / "sample_traffic.mp4"


def ensure_sample_traffic_video() -> Path:
    """
    Ensures data/sample_traffic.mp4 exists.
    If missing, synthesizes a high-fidelity 25 FPS multi-lane traffic simulation
    with moving vehicles and a planned stalled vehicle to exercise the detector.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if SAMPLE_VIDEO_PATH.exists() and SAMPLE_VIDEO_PATH.stat().st_size > 1000:
        return SAMPLE_VIDEO_PATH

    print("[SafeRoute-AI] Synthesizing realistic simulated traffic video at data/sample_traffic.mp4...")
    width, height = 640, 480
    fps = 25
    duration_sec = 28
    total_frames = fps * duration_sec

    # Try different video codecs for cross-platform compatibility
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(SAMPLE_VIDEO_PATH), fourcc, fps, (width, height))

    if not out.isOpened():
        # Fallback to MJPG or avc1
        fourcc = cv2.VideoWriter_fourcc(*"MJPG")
        out = cv2.VideoWriter(str(SAMPLE_VIDEO_PATH), fourcc, fps, (width, height))

    # Vehicle simulated physics models
    # Vehicle 1: Normal car in lane 1 (flowing freely)
    # Vehicle 2: Incident car in lane 2 (stalls after 4s, stays stopped for 12s, then clears)
    # Vehicle 3: Bus in lane 1
    # Vehicle 4: Motorcycle in lane 2
    for frame_idx in range(total_frames):
        t_sec = frame_idx / fps
        frame = np.zeros((height, width, 3), dtype=np.uint8)

        # 1. Render Asphalt Roadway
        frame[:] = (38, 42, 45)  # Dark asphalt

        # Road shoulders & curbs
        cv2.rectangle(frame, (0, 0), (110, height), (30, 80, 45), -1)      # Left grass
        cv2.rectangle(frame, (530, 0), (width, height), (30, 80, 45), -1)  # Right grass
        cv2.line(frame, (110, 0), (110, height), (220, 220, 220), 4)      # Solid white edge
        cv2.line(frame, (530, 0), (530, height), (220, 220, 220), 4)      # Solid white edge

        # Lane divider (dashed yellow line at x = 320)
        dash_offset = int((frame_idx * 6) % 40)
        for y in range(-40 + dash_offset, height + 40, 40):
            cv2.line(frame, (320, y), (320, y + 20), (30, 210, 240), 3)

        # Subtle road texture / crosswalk markings at top
        for wx in range(130, 510, 35):
            cv2.rectangle(frame, (wx, 20), (wx + 20, 45), (180, 180, 180), -1)

        # 2. Simulate Vehicle 1 (Normal Passenger Car, Lane 1: x ~ 215)
        # Drives continuously downwards
        v1_y = int((frame_idx * 5.5) % (height + 120)) - 60
        v1_x = 215
        cv2.rectangle(frame, (v1_x - 28, v1_y - 45), (v1_x + 28, v1_y + 45), (190, 80, 30), -1)  # Blue Car
        cv2.rectangle(frame, (v1_x - 22, v1_y - 20), (v1_x + 22, v1_y + 20), (70, 40, 20), -1)   # Windshield/Roof
        cv2.rectangle(frame, (v1_x - 26, v1_y - 48), (v1_x - 18, v1_y - 44), (240, 240, 255), -1) # Headlight
        cv2.rectangle(frame, (v1_x + 18, v1_y - 48), (v1_x + 26, v1_y - 44), (240, 240, 255), -1) # Headlight

        # 3. Simulate Vehicle 2 (TARGET INCIDENT VEHICLE, Lane 2: x ~ 425)
        # Schedule:
        # 0s - 3s: Enters corridor normally (moving down)
        # 3s - 5s: Decelerates to halt at y = 230
        # 5s - 19s: Stalled stationary at y = 230 (< 12px displacement for 14 seconds!)
        # 19s - 28s: Cleared and drives away
        if t_sec < 3.0:
            v2_y = int(30 + t_sec * 60)
        elif t_sec < 5.0:
            progress = (t_sec - 3.0) / 2.0
            v2_y = int(210 + progress * 25)
        elif t_sec < 19.0:
            # Stationary with minute jitter < 2 px
            jitter = int(math.sin(frame_idx * 0.4) * 1.5)
            v2_y = 235 + jitter
        else:
            elapsed = t_sec - 19.0
            v2_y = int(235 + elapsed * 70)

        v2_x = 425
        # Red SUV / Sedan
        cv2.rectangle(frame, (v2_x - 32, v2_y - 50), (v2_x + 32, v2_y + 50), (45, 50, 200), -1)
        cv2.rectangle(frame, (v2_x - 25, v2_y - 25), (v2_x + 25, v2_y + 22), (25, 25, 110), -1)
        # Hazard blinkers when stopped
        if 5.0 <= t_sec <= 19.0 and (frame_idx % 12 < 6):
            cv2.circle(frame, (v2_x - 30, v2_y - 50), 5, (0, 220, 255), -1)
            cv2.circle(frame, (v2_x + 30, v2_y - 50), 5, (0, 220, 255), -1)
            cv2.circle(frame, (v2_x - 30, v2_y + 50), 5, (0, 220, 255), -1)
            cv2.circle(frame, (v2_x + 30, v2_y + 50), 5, (0, 220, 255), -1)

        # 4. Simulate Vehicle 3 (Commercial Bus, Lane 1)
        v3_y = int(((frame_idx + 220) * 4.2) % (height + 180)) - 90
        v3_x = 215
        if abs(v3_y - v1_y) > 130:
            cv2.rectangle(frame, (v3_x - 34, v3_y - 75), (v3_x + 34, v3_y + 75), (35, 170, 220), -1)
            cv2.rectangle(frame, (v3_x - 28, v3_y - 40), (v3_x + 28, v3_y + 40), (20, 110, 150), -1)

        # 5. Simulate Vehicle 4 (Motorcycle, Lane 2)
        if t_sec < 4.0 or t_sec > 18.0:
            v4_y = int(((frame_idx + 100) * 6.5) % (height + 80)) - 40
            v4_x = 450
            cv2.rectangle(frame, (v4_x - 10, v4_y - 22), (v4_x + 10, v4_y + 22), (180, 180, 180), -1)

        out.write(frame)

    out.release()
    print(f"[SafeRoute-AI] Successfully generated simulated traffic video: {SAMPLE_VIDEO_PATH}")
    return SAMPLE_VIDEO_PATH


@app.on_event("startup")
async def startup_event():
    """Ensure baseline resources are available upon application launch."""
    ensure_sample_traffic_video()
    print("[SafeRoute-AI] Backend Engine initialized and ready.")


@app.get("/")
def get_root():
    return {
        "system": "SafeRoute-AI",
        "description": "Dynamic Emergency Vehicle Rerouting & Computer Vision Incident Detector",
        "endpoints": {
            "websocket": "/ws/telemetry",
            "status": "/api/status",
            "topology": "/api/topology",
            "toggle_hazard": "/api/hazard/toggle",
            "reset": "/api/hazard/reset"
        }
    }


@app.get("/api/status")
def get_status():
    """Returns current routing state, incident alert status, and network topology."""
    current_route = router.compute_shortest_path("N_AMBULANCE_BASE", "N_HOSPITAL")
    return {
        "incident_detected": router.is_incident_zone_blocked(),
        "route": current_route,
        "topology": router.get_topology()
    }


@app.get("/api/topology")
def get_topology():
    """Returns city network graph nodes and edges."""
    return router.get_topology()


@app.post("/api/hazard/toggle")
def toggle_hazard():
    """Manually toggles hazard blockage in the incident zone corridor."""
    is_blocked = router.is_incident_zone_blocked()
    new_state = not is_blocked
    router.set_incident_zone_blocked(new_state, reason="Manual Simulation Override")
    route = router.compute_shortest_path("N_AMBULANCE_BASE", "N_HOSPITAL")
    return {
        "status": "success",
        "incident_zone_blocked": new_state,
        "route": route
    }


@app.post("/api/hazard/reset")
def reset_hazard():
    """Clears all blockages and restores normal optimal routing."""
    router.reset_all_blockages()
    route = router.compute_shortest_path("N_AMBULANCE_BASE", "N_HOSPITAL")
    return {
        "status": "success",
        "incident_zone_blocked": False,
        "route": route
    }


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    WebSocket Telemetry Stream:
    1. Ingests video frames from data/sample_traffic.mp4
    2. Runs IncidentDetector centroid tracking and stall detection
    3. Recomputes dynamic Dijkstra emergency route via CityGraphRouter
    4. Streams base64-encoded JPEG frames and telemetry JSON at 25 FPS
    """
    await websocket.accept()
    video_path = ensure_sample_traffic_video()

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        await websocket.send_json({"error": f"Cannot open video source at {video_path}"})
        await websocket.close()
        return

    frame_counter = 0
    sim_start_time = time.time()
    last_blockage_state: Optional[bool] = None

    try:
        while True:
            frame_loop_start = time.perf_counter()

            # Read next frame
            ret, frame = cap.read()
            if not ret or frame is None:
                # Video loop wrap-around for continuous live demonstration
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
                if not ret or frame is None:
                    await asyncio.sleep(0.1)
                    continue

            frame_counter += 1
            # Maintain monotonic virtual timestamp matching 25 FPS playback
            virtual_timestamp = sim_start_time + (frame_counter * 0.040)

            # Process frame with computer vision detector
            annotated_frame, det_telemetry = detector.process_frame(frame, virtual_timestamp)
            incident_detected = det_telemetry["incident_detected"]

            # Dynamically recalculate route impedance if incident state shifted
            if incident_detected != last_blockage_state:
                router.set_incident_zone_blocked(
                    blocked=incident_detected,
                    reason=f"CV Detected Stalled Vehicle (>{detector.STALL_TIME_THRESHOLD_SEC}s)"
                )
                last_blockage_state = incident_detected

            # Calculate Dijkstra shortest path for emergency response
            route_data = router.compute_shortest_path(
                source="N_AMBULANCE_BASE",
                target="N_HOSPITAL"
            )

            # Get current serialized topology
            topology_data = router.get_topology()

            # Encode annotated frame to JPEG -> base64
            encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), 82]
            success, buffer = cv2.imencode(".jpg", annotated_frame, encode_params)
            if not success:
                continue

            frame_b64 = base64.b64encode(buffer).decode("utf-8")
            frame_data_url = f"data:image/jpeg;base64,{frame_b64}"

            # Assemble real-time telemetry payload
            payload = {
                "type": "telemetry_update",
                "timestamp": virtual_timestamp,
                "frame_index": frame_counter,
                "fps": 25.0,
                "frame": frame_data_url,
                "incident_detected": incident_detected,
                "incident_details": det_telemetry["incident_details"],
                "detector_metrics": {
                    "total_vehicles": det_telemetry["total_vehicles"],
                    "moving_vehicles": det_telemetry["moving_vehicles"],
                    "stalled_vehicles": det_telemetry["stalled_vehicles"],
                    "latency_ms": det_telemetry["latency_ms"],
                    "model": "YOLOv8n" if detector.has_yolo else "MOG2-Centroid-Vision"
                },
                "route": route_data,
                "topology": topology_data
            }

            # Transmit to frontend client
            await websocket.send_json(payload)

            # Check if client sent any command (non-blocking poll)
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.001)
                if "toggle" in msg:
                    curr = router.is_incident_zone_blocked()
                    router.set_incident_zone_blocked(not curr, reason="Client WS Command")
                elif "reset" in msg:
                    router.reset_all_blockages()
            except asyncio.TimeoutError:
                pass

            # Target 25 FPS (~40ms per frame)
            elapsed_sec = time.perf_counter() - frame_loop_start
            sleep_duration = max(0.001, 0.040 - elapsed_sec)
            await asyncio.sleep(sleep_duration)

    except WebSocketDisconnect:
        print("[SafeRoute-AI] WebSocket client disconnected.")
    except Exception as exc:
        print(f"[SafeRoute-AI] Telemetry loop exception: {exc}")
    finally:
        cap.release()


if __name__ == "__main__":
    import uvicorn
    # Generate sample video upfront if not yet present
    ensure_sample_traffic_video()
    print("[SafeRoute-AI] Starting FastAPI Uvicorn Server on http://0.0.0.0:8000 ...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

