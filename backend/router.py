"""
SafeRoute-AI // City Graph Router
NetworkX-powered dynamic city traffic graph with Dijkstra-based emergency rerouting.
"""

from typing import Dict, List, Any, Optional, Tuple
import networkx as nx


class CityGraphRouter:
    """
    Manages downtown city network topology, dynamic edge impediments,
    and real-time Dijkstra shortest-path calculations for emergency vehicles.
    """

    PENALTY_WEIGHT: float = 9999.0

    def __init__(self):
        # Undirected graph for two-way downtown street network
        self.graph = nx.Graph()
        self._init_network_nodes()
        self._init_network_edges()

    def _init_network_nodes(self) -> None:
        """Initialize downtown grid nodes with geospatial coordinates and metadata."""
        nodes = {
            "N_AMBULANCE_BASE": {
                "name": "Ambulance Dispatch Base Alpha",
                "lat": 37.774929,
                "lng": -122.419416,
                "type": "emergency_base",
                "description": "Primary emergency dispatch garage and staging depot."
            },
            "INT_A": {
                "name": "Intersection 4th & Market",
                "lat": 37.778500,
                "lng": -122.416200,
                "type": "intersection",
                "description": "Major urban corridor intersection A."
            },
            "INT_B": {
                "name": "Intersection 3rd & Mission",
                "lat": 37.782800,
                "lng": -122.409500,
                "type": "intersection",
                "description": "High-density commercial junction B."
            },
            "INT_C": {
                "name": "Intersection 6th & Folsom",
                "lat": 37.771200,
                "lng": -122.413500,
                "type": "intersection",
                "description": "South arterial transit point C."
            },
            "INT_D": {
                "name": "Intersection 5th & Howard",
                "lat": 37.775800,
                "lng": -122.408200,
                "type": "intersection",
                "description": "Central bypass connector hub D."
            },
            "N_INCIDENT_ZONE": {
                "name": "Transit Corridor Central (Hazard Zone)",
                "lat": 37.779800,
                "lng": -122.412800,
                "type": "incident_zone",
                "description": "Simulated computer vision surveillance corridor."
            },
            "N_HOSPITAL": {
                "name": "Metropolitan Trauma Center",
                "lat": 37.786500,
                "lng": -122.403200,
                "type": "hospital",
                "description": "Level-1 emergency medical center destination."
            }
        }

        for node_id, data in nodes.items():
            self.graph.add_node(node_id, **data)

    def _init_network_edges(self) -> None:
        """Initialize edges with baseline transit weights and distance metrics."""
        # Edge definition: (u, v, base_weight in seconds, distance in meters)
        edges = [
            ("N_AMBULANCE_BASE", "INT_A", 45.0, 650.0),
            ("N_AMBULANCE_BASE", "INT_C", 55.0, 800.0),
            ("INT_A", "N_INCIDENT_ZONE", 35.0, 480.0),
            ("N_INCIDENT_ZONE", "INT_B", 32.0, 440.0),
            ("INT_A", "INT_D", 60.0, 850.0),
            ("INT_C", "INT_D", 50.0, 720.0),
            ("INT_D", "INT_B", 45.0, 610.0),
            ("INT_D", "N_HOSPITAL", 80.0, 1150.0),
            ("INT_B", "N_HOSPITAL", 38.0, 520.0),
        ]

        for u, v, weight, distance in edges:
            self.graph.add_edge(
                u,
                v,
                base_weight=weight,
                weight=weight,
                distance_m=distance,
                blocked=False,
                blockage_reason=None
            )

    def set_edge_blockage(self, u: str, v: str, blocked: bool = True, reason: Optional[str] = None) -> bool:
        """
        Sets or clears a blockage penalty on a street network edge.
        When blocked, applies 9999.0 penalty impedance to force dynamic rerouting.
        """
        if not self.graph.has_edge(u, v):
            return False

        edge = self.graph[u][v]
        edge["blocked"] = blocked
        edge["blockage_reason"] = reason if blocked else None

        if blocked:
            edge["weight"] = edge["base_weight"] + self.PENALTY_WEIGHT
        else:
            edge["weight"] = edge["base_weight"]

        return True

    def set_incident_zone_blocked(self, blocked: bool = True, reason: str = "Stalled Vehicle Hazard") -> None:
        """
        Toggles blockage on all road segments feeding directly through the incident zone.
        """
        edges_to_toggle = [
            ("INT_A", "N_INCIDENT_ZONE"),
            ("N_INCIDENT_ZONE", "INT_B")
        ]
        for u, v in edges_to_toggle:
            self.set_edge_blockage(u, v, blocked=blocked, reason=reason)

    def is_incident_zone_blocked(self) -> bool:
        """Returns True if any edge connected to N_INCIDENT_ZONE is currently blocked."""
        return any(
            data.get("blocked", False)
            for _, _, data in self.graph.edges("N_INCIDENT_ZONE", data=True)
        )

    def reset_all_blockages(self) -> None:
        """Clears all road blockages and restores normal baseline edge weights."""
        for u, v in self.graph.edges():
            edge = self.graph[u][v]
            edge["blocked"] = False
            edge["blockage_reason"] = None
            edge["weight"] = edge["base_weight"]

    def compute_shortest_path(
        self,
        source: str = "N_AMBULANCE_BASE",
        target: str = "N_HOSPITAL"
    ) -> Dict[str, Any]:
        """
        Computes the optimal emergency transit route using Dijkstra's algorithm.
        Returns full telemetry, coordinates, cost, and reroute status.
        """
        try:
            path_nodes = nx.dijkstra_path(self.graph, source=source, target=target, weight="weight")
            raw_cost = nx.dijkstra_path_length(self.graph, source=source, target=target, weight="weight")

            # Check if any segment in the selected path has a blockage flag
            has_blocked_segment = False
            total_distance_m = 0.0
            actual_travel_time_sec = 0.0

            for i in range(len(path_nodes) - 1):
                u = path_nodes[i]
                v = path_nodes[i + 1]
                edge_data = self.graph[u][v]
                if edge_data.get("blocked", False):
                    has_blocked_segment = True
                total_distance_m += edge_data.get("distance_m", 0.0)
                actual_travel_time_sec += edge_data.get("base_weight", 0.0)

            # Determine whether this is an emergency detour avoiding the incident zone
            incident_blocked = self.is_incident_zone_blocked()
            uses_incident_zone = "N_INCIDENT_ZONE" in path_nodes
            is_rerouted = incident_blocked and not uses_incident_zone

            # Build geospatial coordinates array for map polylines: [[lat, lng], ...]
            coordinates = [
                [self.graph.nodes[n]["lat"], self.graph.nodes[n]["lng"]]
                for n in path_nodes
            ]

            waypoints = [
                {
                    "id": n,
                    "name": self.graph.nodes[n]["name"],
                    "lat": self.graph.nodes[n]["lat"],
                    "lng": self.graph.nodes[n]["lng"],
                    "type": self.graph.nodes[n]["type"]
                }
                for n in path_nodes
            ]

            return {
                "source": source,
                "target": target,
                "path": path_nodes,
                "waypoints": waypoints,
                "coordinates": coordinates,
                "hops": len(path_nodes) - 1,
                "total_cost": round(actual_travel_time_sec, 1),
                "total_distance_m": round(total_distance_m, 1),
                "total_distance_km": round(total_distance_m / 1000.0, 2),
                "eta_seconds": round(actual_travel_time_sec, 1),
                "eta_formatted": f"{int(actual_travel_time_sec // 60)}m {int(actual_travel_time_sec % 60)}s",
                "is_rerouted": is_rerouted,
                "status": "REROUTED" if is_rerouted else "OPTIMAL",
                "has_blocked_segment": has_blocked_segment
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound) as exc:
            return {
                "source": source,
                "target": target,
                "path": [],
                "waypoints": [],
                "coordinates": [],
                "hops": 0,
                "total_cost": 0.0,
                "total_distance_m": 0.0,
                "total_distance_km": 0.0,
                "eta_seconds": 0.0,
                "eta_formatted": "0m 0s",
                "is_rerouted": False,
                "status": "NO_PATH_AVAILABLE",
                "error": str(exc)
            }

    def get_topology(self) -> Dict[str, Any]:
        """
        Serializes nodes and edges for frontend tactical map rendering.
        """
        nodes_list = []
        for node_id, data in self.graph.nodes(data=True):
            nodes_list.append({
                "id": node_id,
                "name": data.get("name", node_id),
                "lat": data.get("lat"),
                "lng": data.get("lng"),
                "type": data.get("type", "intersection"),
                "description": data.get("description", "")
            })

        edges_list = []
        for u, v, data in self.graph.edges(data=True):
            u_node = self.graph.nodes[u]
            v_node = self.graph.nodes[v]
            edges_list.append({
                "u": u,
                "v": v,
                "base_weight": data.get("base_weight"),
                "current_weight": data.get("weight"),
                "distance_m": data.get("distance_m"),
                "blocked": data.get("blocked", False),
                "blockage_reason": data.get("blockage_reason"),
                "coordinates": [
                    [u_node["lat"], u_node["lng"]],
                    [v_node["lat"], v_node["lng"]]
                ]
            })

        return {
            "nodes": nodes_list,
            "edges": edges_list,
            "incident_zone_blocked": self.is_incident_zone_blocked()
        }
