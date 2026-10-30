import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingDown,
  Clock,
  ShieldAlert,
  Car
} from 'lucide-react';

export default function AnalyticsView({ onExportReport }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Congestion Density vs Time (Line Chart)
  const congestionData = [
    { hour: '06:00', staticGps: 22, safeRoute: 18 },
    { hour: '08:00', staticGps: 65, safeRoute: 42 },
    { hour: '10:00', staticGps: 78, safeRoute: 45 },
    { hour: '12:00', staticGps: 84, safeRoute: 51 },
    { hour: '14:00', staticGps: 72, safeRoute: 46 },
    { hour: '16:00', staticGps: 92, safeRoute: 58 },
    { hour: '18:00', staticGps: 88, safeRoute: 54 },
    { hour: '20:00', staticGps: 52, safeRoute: 34 }
  ];

  // Emergency Transit Time Reduction: Static GPS vs SafeRoute-AI (Bar Chart)
  const transitComparisonData = [
    { sector: 'Sector 4 (Downtown)', staticGpsMin: 14.2, safeRouteMin: 3.1 },
    { sector: 'Sector 7 (Financial)', staticGpsMin: 16.5, safeRouteMin: 4.2 },
    { sector: 'Sector 1 (North Art)', staticGpsMin: 11.8, safeRouteMin: 2.8 },
    { sector: 'Sector 3 (Mission)', staticGpsMin: 13.4, safeRouteMin: 3.5 },
    { sector: 'Sector 5 (Waterfront)', staticGpsMin: 15.0, safeRouteMin: 3.9 }
  ];

  const incidentHistory = [
    {
      id: "INC-2026-904",
      timestamp: "Today, 11:14:02",
      sector: "Sector 04 Central",
      road: "Transit Corridor Central",
      severity: "CRITICAL",
      duration: "13m 42s",
      vehicleClass: "Commercial Bus",
      minutesSaved: "+8.4 min"
    },
    {
      id: "INC-2026-903",
      timestamp: "Today, 09:32:15",
      sector: "Sector 07 Financial",
      road: "3rd & Mission Junction",
      severity: "HIGH",
      duration: "8m 10s",
      vehicleClass: "Freight Truck",
      minutesSaved: "+6.2 min"
    },
    {
      id: "INC-2026-902",
      timestamp: "Today, 07:45:50",
      sector: "Sector 01 North",
      road: "Market & 4th Arterial",
      severity: "MEDIUM",
      duration: "5m 25s",
      vehicleClass: "Sedan Car",
      minutesSaved: "+4.1 min"
    },
    {
      id: "INC-2026-901",
      timestamp: "Yesterday, 18:20:11",
      sector: "Sector 04 Central",
      road: "5th & Howard Connector",
      severity: "CRITICAL",
      duration: "18m 04s",
      vehicleClass: "SUV",
      minutesSaved: "+11.5 min"
    }
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
        <div>
          <h2 className="text-sm font-semibold text-textmuted-primary flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-signal-telemetry" />
            Historical Analytics & Incident Operations Ledger
          </h2>
          <p className="text-[11px] text-textmuted-tertiary mt-0.5">
            Comparative performance telemetry: SafeRoute-AI Green Wave vs. Legacy Static GPS Navigation
          </p>
        </div>

        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="bg-tactical-void border border-tactical-border text-textmuted-primary text-xs rounded px-2.5 py-1 focus:outline-none cursor-pointer font-mono"
        >
          <option value="24h">Past 24 Hours</option>
          <option value="7d">Past 7 Days</option>
          <option value="30d">Past 30 Days</option>
        </select>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <span className="text-textmuted-tertiary text-[11px] block uppercase tracking-wider">Avg Time Saved</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-medium text-signal-green">8.4</span>
            <span className="text-textmuted-tertiary font-mono text-xs">min</span>
          </div>
          <span className="text-[10px] text-textmuted-tertiary mt-1 block font-mono">
            73% reduction in arterial transit delays
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <span className="text-textmuted-tertiary text-[11px] block uppercase tracking-wider">Autonomous Incidents</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-medium text-textmuted-primary">128</span>
            <span className="text-textmuted-tertiary font-mono text-xs">trips</span>
          </div>
          <span className="text-[10px] text-textmuted-tertiary mt-1 block font-mono">
            100% verified zero-velocity detection
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <span className="text-textmuted-tertiary text-[11px] block uppercase tracking-wider">Signal Preemption</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-medium text-textmuted-primary">99.4</span>
            <span className="text-textmuted-tertiary font-mono text-xs">%</span>
          </div>
          <span className="text-[10px] text-textmuted-tertiary mt-1 block font-mono">
            NTCIP 1202 Green Wave Controller sync
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <span className="text-textmuted-tertiary text-[11px] block uppercase tracking-wider">Cumulative Delay Avoided</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-medium text-signal-warn">412.5</span>
            <span className="text-textmuted-tertiary font-mono text-xs">hrs</span>
          </div>
          <span className="text-[10px] text-textmuted-tertiary mt-1 block font-mono">
            Municipal ambulance & emergency fleet
          </span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Congestion Density vs Time */}
        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-textmuted-primary flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-textmuted-tertiary" />
              Arterial Congestion Density vs. Time
            </h3>
            <p className="text-[10px] text-textmuted-tertiary">
              Peak hours density benchmark (Static Municipal Routing vs. SafeRoute-AI Reroute)
            </p>
          </div>

          <div className="h-60 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={congestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232833" />
                <XAxis dataKey="hour" stroke="#5C6473" fontSize={10} />
                <YAxis stroke="#5C6473" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161920', borderColor: '#232833', borderRadius: '4px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                <Line
                  type="monotone"
                  dataKey="staticGps"
                  name="Static GPS"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="safeRoute"
                  name="SafeRoute-AI"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Transit Time Reduction Bar Chart */}
        <div className="p-3.5 rounded-lg bg-tactical-base border border-tactical-border">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-textmuted-primary flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5 text-textmuted-tertiary" />
              Emergency Transit Time (Minutes to Hospital)
            </h3>
            <p className="text-[10px] text-textmuted-tertiary">
              Direct transit time comparison across 5 urban sectors
            </p>
          </div>

          <div className="h-60 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transitComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232833" />
                <XAxis dataKey="sector" stroke="#5C6473" fontSize={9} />
                <YAxis stroke="#5C6473" fontSize={10} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161920', borderColor: '#232833', borderRadius: '4px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                <Bar dataKey="staticGpsMin" name="Static GPS (min)" fill="#EF4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="safeRouteMin" name="SafeRoute-AI (min)" fill="#22C55E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Incident Audit Log Table */}
      <div className="rounded-lg bg-tactical-base border border-tactical-border overflow-hidden">
        <div className="px-3.5 py-2.5 bg-tactical-surface border-b border-tactical-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-textmuted-primary flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-textmuted-tertiary" />
            Verified Incident History Ledger
          </h3>
          <span className="text-[10px] text-textmuted-tertiary font-mono">Autonomous Resolution Log</span>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-tactical-void text-textmuted-tertiary border-b border-tactical-border uppercase text-[10px]">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Corridor / Road</th>
                <th className="p-2.5">Vehicle</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Time Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-divider text-[11px]">
              {incidentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-tactical-hover/40 transition-colors">
                  <td className="p-2.5 text-signal-telemetry font-medium">{item.id}</td>
                  <td className="p-2.5 text-textmuted-tertiary">{item.timestamp}</td>
                  <td className="p-2.5 text-textmuted-primary">{item.road}</td>
                  <td className="p-2.5 text-textmuted-secondary">{item.vehicleClass}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${
                      item.severity === 'CRITICAL'
                        ? 'bg-signal-alertBg text-signal-alert border-signal-alert/25'
                        : item.severity === 'HIGH'
                        ? 'bg-signal-warnBg text-signal-warn border-signal-warn/25'
                        : 'bg-signal-telemetryBg text-signal-telemetry border-signal-telemetry/20'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-2.5 text-textmuted-secondary">{item.duration}</td>
                  <td className="p-2.5 text-signal-green font-medium">{item.minutesSaved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
