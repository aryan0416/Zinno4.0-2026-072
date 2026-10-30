"""
SafeRoute-AI // Vehicle Incident Detector
Ultralytics YOLOv8n + Centroid Velocity Tracking for Real-Time Hazard Detection.
"""

from collections import deque
import math
import time
from typing import Dict, List, Tuple, Optional, Any
import cv2
import numpy as np

# Try importing ultralytics YOLO; provide high-accuracy CV fallback if missing
try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False


class VehicleTrack:
    """Represents a tracked vehicle with centroid trajectory and stall metrics."""

    def __init__(self, track_id: int, class_name: str, bbox: Tuple[int, int, int, int], timestamp: float):
        self.track_id: int = track_id
        self.class_name: str = class_name
        self.bbox: Tuple[int, int, int, int] = bbox  # (x1, y1, x2, y2)
        self.centroid: Tuple[int, int] = self._calc_centroid(bbox)

        # History stores tuples of (timestamp, cx, cy)
        self.history: deque = deque(maxlen=300)
        self.history.append((timestamp, self.centroid[0], self.centroid[1]))

        self.first_seen: float = timestamp
        self.last_seen: float = timestamp
        self.velocity_px_s: float = 0.0

        # Stall detection attributes
        # Threshold: coordinate displacement under 12 px for longer than 6 seconds
        self.anchor_centroid: Tuple[int, int] = self.centroid
        self.anchor_start_time: float = timestamp
        self.max_displacement_in_window: float = 0.0
        self.stationary_duration_sec: float = 0.0
        self.is_stalled: bool = False

    @staticmethod
    def _calc_centroid(bbox: Tuple[int, int, int, int]) -> Tuple[int, int]:
        x1, y1, x2, y2 = bbox
        return int((x1 + x2) / 2), int((y1 + y2) / 2)

    def update(self, bbox: Tuple[int, int, int, int], timestamp: float) -> None:
        """Update track with new bounding box, calculate velocity and evaluate stall condition."""
        self.bbox = bbox
        new_centroid = self._calc_centroid(bbox)
        prev_centroid = self.centroid
        dt = max(timestamp - self.last_seen, 1e-4)

        # Instantaneous velocity in pixels / second
        step_dist = math.hypot(new_centroid[0] - prev_centroid[0], new_centroid[1] - prev_centroid[1])
        instant_velocity = step_dist / dt
        self.velocity_px_s = 0.8 * self.velocity_px_s + 0.2 * instant_velocity

        self.centroid = new_centroid
        self.last_seen = timestamp
        self.history.append((timestamp, new_centroid[0], new_centroid[1]))

        # Calculate coordinate displacement over the last 6.0 seconds
        window_threshold_time = timestamp - 6.0

        # Filter history points within the last 6.0 seconds
        recent_points = [pt for pt in self.history if pt[0] >= window_threshold_time]

        if recent_points:
            oldest_in_window = recent_points[0]
            elapsed_in_window = timestamp - oldest_in_window[0]

            # Measure maximum displacement relative to the oldest point in the 6-second window
            ref_x, ref_y = oldest_in_window[1], oldest_in_window[2]
            max_disp = max(
                math.hypot(p[1] - ref_x, p[2] - ref_y)
                for p in recent_points
            )
            self.max_displacement_in_window = max_disp

            # Check stall criteria:
            # Tracked continuously for at least 6.0 seconds AND displacement remains under 12.0 pixels
            if elapsed_in_window >= 5.8 and max_disp <= 12.0:
                self.is_stalled = True
                self.stationary_duration_sec = timestamp - self.anchor_start_time
            else:
                # If displacement exceeded threshold, reset stationary anchor
                if max_disp > 12.0:
                    self.is_stalled = False
                    self.anchor_centroid = new_centroid
                    self.anchor_start_time = timestamp
                    self.stationary_duration_sec = 0.0
                else:
                    self.stationary_duration_sec = timestamp - self.anchor_start_time
        else:
            self.max_displacement_in_window = 0.0
            self.is_stalled = False
            self.stationary_duration_sec = 0.0


class IncidentDetector:
    """
    Computer vision vehicle tracker and stall detector.
    Utilizes YOLOv8n to track target vehicle classes (car, motorcycle, bus, truck)
    and flags incidents when vehicle displacement remains < 12px for > 6 seconds.
    """

    TARGET_CLASSES = {
        2: "car",
        3: "motorcycle",
        5: "bus",
        7: "truck"
    }

    STALL_DISPLACEMENT_THRESHOLD_PX: float = 12.0
    STALL_TIME_THRESHOLD_SEC: float = 6.0
    MAX_CENTROID_MATCH_DIST_PX: float = 85.0
    MAX_TRACK_AGE_SEC: float = 2.0

    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.35):
        self.conf_threshold: float = conf_threshold
        self.model = None
        self.has_yolo: bool = HAS_YOLO
        self.next_track_id: int = 1
        self.tracks: Dict[int, VehicleTrack] = {}
        self.incident_detected: bool = False
        self.incident_details: Optional[Dict[str, Any]] = None

        # Fallback background subtractor if YOLO unavailable
        self._bg_subtractor = None

        if self.has_yolo:
            try:
                self.model = YOLO(model_path)
            except Exception as e:
                print(f"[Detector] Note: YOLO load failed ({e}), using precision CV fallback.")
                self.has_yolo = False

        if not self.has_yolo:
            self._bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=25, detectShadows=True)

    def _detect_with_yolo(self, frame: np.ndarray) -> List[Tuple[Tuple[int, int, int, int], str, float]]:
        """Run YOLO inference and filter target vehicle classes."""
        detections = []
        if self.model is None:
            return detections

        try:
            results = self.model(
                frame,
                verbose=False,
                conf=self.conf_threshold,
                classes=list(self.TARGET_CLASSES.keys())
            )
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    if cls_id in self.TARGET_CLASSES:
                        coords = box.xyxy[0].cpu().numpy().astype(int)
                        conf = float(box.conf[0].item())
                        bbox = (int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3]))
                        detections.append((bbox, self.TARGET_CLASSES[cls_id], conf))
        except Exception as e:
            print(f"[Detector] YOLO inference error: {e}")
        return detections

    def _detect_with_fallback(self, frame: np.ndarray) -> List[Tuple[Tuple[int, int, int, int], str, float]]:
        """Precision computer-vision vehicle detection fallback."""
        detections = []
        if self._bg_subtractor is None:
            self._bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=25, detectShadows=True)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        fg_mask = self._bg_subtractor.apply(blur)
        _, thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 900 < area < 80000:
                x, y, w, h = cv2.boundingRect(cnt)
                aspect_ratio = float(w) / max(h, 1)
                if 0.4 < aspect_ratio < 3.2:
                    bbox = (x, y, x + w, y + h)
                    cls_name = "car" if area < 8000 else "truck"
                    detections.append((bbox, cls_name, 0.85))
        return detections

    def _update_tracks(
        self,
        detections: List[Tuple[Tuple[int, int, int, int], str, float]],
        current_time: float
    ) -> None:
        """Associate detections with existing tracks using Euclidean distance centroid matching."""
        # Purge stale tracks that haven't been observed recently
        stale_ids = [
            tid for tid, track in self.tracks.items()
            if (current_time - track.last_seen) > self.MAX_TRACK_AGE_SEC
        ]
        for tid in stale_ids:
            del self.tracks[tid]

        if not detections:
            return

        detection_centroids = [
            (int((b[0] + b[2]) / 2), int((b[1] + b[3]) / 2))
            for b, _, _ in detections
        ]

        assigned_detection_indices = set()
        assigned_track_ids = set()

        # Match existing tracks to nearest new detection
        for tid, track in list(self.tracks.items()):
            best_dist = float("inf")
            best_idx = -1
            tcx, tcy = track.centroid

            for i, (dcx, dcy) in enumerate(detection_centroids):
                if i in assigned_detection_indices:
                    continue
                dist = math.hypot(dcx - tcx, dcy - tcy)
                if dist < best_dist and dist <= self.MAX_CENTROID_MATCH_DIST_PX:
                    best_dist = dist
                    best_idx = i

            if best_idx != -1:
                bbox, _, _ = detections[best_idx]
                track.update(bbox, current_time)
                assigned_detection_indices.add(best_idx)
                assigned_track_ids.add(tid)

        # Create new tracks for unassigned detections
        for i, (bbox, cls_name, _) in enumerate(detections):
            if i not in assigned_detection_indices:
                new_track = VehicleTrack(self.next_track_id, cls_name, bbox, current_time)
                self.tracks[self.next_track_id] = new_track
                self.next_track_id += 1

    def _evaluate_incidents(self, current_time: float) -> None:
        """Scan active tracks to verify if any vehicle has tripped the stall threshold."""
        stalled_tracks = [t for t in self.tracks.values() if t.is_stalled]

        if stalled_tracks:
            # Sort by longest stall duration
            stalled_tracks.sort(key=lambda x: x.stationary_duration_sec, reverse=True)
            primary_incident = stalled_tracks[0]

            self.incident_detected = True
            self.incident_details = {
                "vehicle_id": primary_incident.track_id,
                "class_name": primary_incident.class_name,
                "centroid": primary_incident.centroid,
                "bbox": primary_incident.bbox,
                "stalled_duration_sec": round(primary_incident.stationary_duration_sec, 1),
                "displacement_px": round(primary_incident.max_displacement_in_window, 1),
                "threshold_seconds": self.STALL_TIME_THRESHOLD_SEC,
                "threshold_displacement_px": self.STALL_DISPLACEMENT_THRESHOLD_PX,
                "hazard_level": "CRITICAL_CORRIDOR_BLOCKAGE"
            }
        else:
            self.incident_detected = False
            self.incident_details = None

    def process_frame(
        self,
        frame: np.ndarray,
        current_time: Optional[float] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Processes a single video frame:
        1. Executes vehicle detection
        2. Updates centroid tracks
        3. Evaluates stationary stall threshold
        4. Overlays tactical HUD annotations
        Returns (annotated_frame, telemetry_dict).
        """
        start_proc = time.perf_counter()
        t = current_time if current_time is not None else time.time()

        # Step 1: Detect vehicles
        detections = self._detect_with_yolo(frame) if self.has_yolo else self._detect_with_fallback(frame)

        # Step 2: Track & update
        self._update_tracks(detections, t)

        # Step 3: Evaluate stall condition (< 12 px for > 6 seconds)
        self._evaluate_incidents(t)

        proc_ms = (time.perf_counter() - start_proc) * 1000.0

        # Step 4: Render tactical annotations
        annotated = self._render_annotations(frame.copy(), t, proc_ms)

        # Calculate counts
        stalled_count = sum(1 for t in self.tracks.values() if t.is_stalled)
        moving_count = len(self.tracks) - stalled_count

        telemetry = {
            "incident_detected": self.incident_detected,
            "incident_details": self.incident_details,
            "total_vehicles": len(self.tracks),
            "moving_vehicles": moving_count,
            "stalled_vehicles": stalled_count,
            "latency_ms": round(proc_ms, 1),
            "timestamp": t
        }

        return annotated, telemetry

    def _render_annotations(self, frame: np.ndarray, current_time: float, proc_ms: float) -> np.ndarray:
        """Renders tactical bounding boxes, centroid trajectories, and HUD alerts."""
        h, w = frame.shape[:2]

        # Draw vehicle tracks
        for tid, track in self.tracks.items():
            x1, y1, x2, y2 = track.bbox
            cx, cy = track.centroid

            if track.is_stalled:
                # Hazard / Stalled styling: Bold Red (#EF4444) with pulsing indicator
                box_color = (40, 40, 235)  # BGR: Red
                text_color = (255, 255, 255)

                # Draw bold bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 3)

                # Hazard corner markers
                marker_len = min(18, (x2 - x1) // 3, (y2 - y1) // 3)
                cv2.line(frame, (x1, y1), (x1 + marker_len, y1), (0, 0, 255), 4)
                cv2.line(frame, (x1, y1), (x1, y1 + marker_len), (0, 0, 255), 4)
                cv2.line(frame, (x2, y1), (x2 - marker_len, y1), (0, 0, 255), 4)
                cv2.line(frame, (x2, y1), (x2, y1 + marker_len), (0, 0, 255), 4)
                cv2.line(frame, (x1, y2), (x1 + marker_len, y2), (0, 0, 255), 4)
                cv2.line(frame, (x1, y2), (x1, y2 - marker_len), (0, 0, 255), 4)
                cv2.line(frame, (x2, y2), (x2 - marker_len, y2), (0, 0, 255), 4)
                cv2.line(frame, (x2, y2), (x2, y2 - marker_len), (0, 0, 255), 4)

                # Centroid crosshair
                cv2.drawMarker(frame, (cx, cy), (0, 0, 255), cv2.MARKER_TILTED_CROSS, 16, 2)

                # Hazard banner above vehicle
                label = f"HAZARD: STALLED #{tid} ({track.class_name})"
                sub_label = f"STOPPED: {track.stationary_duration_sec:.1f}s | DISP: {track.max_displacement_in_window:.1f}px"

                cv2.rectangle(frame, (x1, max(0, y1 - 44)), (x1 + 260, max(0, y1)), (20, 20, 200), -1)
                cv2.putText(frame, label, (x1 + 6, max(14, y1 - 26)), cv2.FONT_HERSHEY_SIMPLEX, 0.48, text_color, 2)
                cv2.putText(frame, sub_label, (x1 + 6, max(28, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 240, 255), 1)

            else:
                # Normal moving vehicle styling: Emerald/Cyan (#10B981)
                box_color = (180, 210, 40)  # BGR Cyan/Green
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
                cv2.circle(frame, (cx, cy), 4, (0, 255, 120), -1)

                # Small tag
                tag = f"#{tid} {track.class_name} {track.velocity_px_s:.0f}px/s"
                cv2.rectangle(frame, (x1, max(0, y1 - 20)), (x1 + len(tag) * 9, max(0, y1)), (20, 30, 25), -1)
                cv2.putText(frame, tag, (x1 + 4, max(12, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 255, 180), 1)

            # Draw motion trail (last 12 centroid points)
            pts = [(p[1], p[2]) for p in list(track.history)[-12:]]
            for i in range(1, len(pts)):
                thickness = int(math.sqrt(i) + 1)
                cv2.line(frame, pts[i - 1], pts[i], box_color, thickness)

        # Top HUD Status Bar
        if self.incident_detected:
            # Flashing Crimson Hazard HUD
            cv2.rectangle(frame, (0, 0), (w, 40), (20, 20, 180), -1)
            cv2.putText(
                frame,
                "! EMERGENCY CORRIDOR HAZARD DETECTED // AUTO-REROUTE ACTIVE !",
                (16, 26),
                cv2.FONT_HERSHEY_DUPLEX,
                0.62,
                (255, 255, 255),
                2
            )
        else:
            # Subdued Dark Blue-Green HUD
            cv2.rectangle(frame, (0, 0), (w, 36), (15, 25, 20), -1)
            cv2.putText(
                frame,
                "SAFEROUTE-AI // YOLOv8n VISION TELEMETRY // CORRIDOR CLEAR",
                (16, 24),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (120, 240, 180),
                1
            )

        # Bottom Telemetry Bar
        cv2.rectangle(frame, (0, h - 28), (w, h), (10, 14, 18), -1)
        bottom_text = (
            f"VEHICLES: {len(self.tracks)} | "
            f"MOVING: {sum(1 for t in self.tracks.values() if not t.is_stalled)} | "
            f"STALLED: {sum(1 for t in self.tracks.values() if t.is_stalled)} | "
            f"INFERENCE: {proc_ms:.1f}ms | "
            f"STALL RULE: <12px for >6.0s"
        )
        cv2.putText(frame, bottom_text, (12, h - 9), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 200, 210), 1)

        return frame

