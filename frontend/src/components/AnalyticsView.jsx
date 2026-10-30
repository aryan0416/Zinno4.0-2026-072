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
  Car,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Zap
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

  // Historical Incident Records
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
    <div className="space-y-6 font-mono">
      {/* Top Header & Export Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0b101b]/95 border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Historical Analytics & Incident Operations Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative performance telemetry: SafeRoute-AI Green Wave vs. Legacy Static GPS Navigation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b101b]/90 border border-slate-800 shadow-xl">
          <span className="text-slate-400 text-xs block uppercase">Avg Emergency Time Saved</span>
          <span className="text-3xl font-extrabold text-emerald-400 glow-emerald mt-1 block">
            8.4 min
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &mdash; 73% reduction in arterial transit delays
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b]/90 border border-slate-800 shadow-xl">
          <span className="text-slate-400 text-xs block uppercase">Autonomous Incident Trips</span>
          <span className="text-3xl font-extrabold text-cyan-400 glow-cyan mt-1 block">
            128
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &mdash; 100% verified zero-velocity detection
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b]/90 border border-slate-800 shadow-xl">
          <span className="text-slate-400 text-xs block uppercase">Signal Preemption Rate</span>
          <span className="text-3xl font-extrabold text-slate-100 mt-1 block">
            99.4%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &mdash; NTCIP 1202 Green Wave Controller sync
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b]/90 border border-slate-800 shadow-xl">
          <span className="text-slate-400 text-xs block uppercase">Cumulative Delay Avoided</span>
          <span className="text-3xl font-extrabold text-amber-400 glow-amber mt-1 block">
            412.5 hrs
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &mdash; Municipal ambulance & fire department fleet
          </span>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Congestion Density vs Time */}
        <div className="p-4 rounded-xl bg-[#0b101b]/95 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Arterial Congestion Density vs. Time
              </h3>
              <p className="text-[11px] text-slate-400">
                Peak hours density comparison (Static Municipal Routing vs. SafeRoute-AI Reroute)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={congestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="staticGps"
                  name="Legacy Static Routing"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="safeRoute"
                  name="SafeRoute-AI Dynamic Graph"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Transit Time Reduction Bar Chart */}
        <div className="p-4 rounded-xl bg-[#0b101b]/95 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Emergency Transit Time (Minutes to Trauma Center)
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct benchmark across 5 key municipal urban sectors
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transitComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sector" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="staticGpsMin" name="Static GPS (Minutes)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safeRouteMin" name="SafeRoute-AI (Minutes)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Incident Audit Log Table */}
      <div className="rounded-xl bg-[#0b101b]/95 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Verified Incident History Ledger
          </h3>
          <span className="text-xs text-slate-400">All incidents resolved autonomously</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Corridor / Road</th>
                <th className="p-3">Vehicle Class</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Blockage Duration</th>
                <th className="p-3">Time Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">{item.id}</td>
                  <td className="p-3 text-slate-400">{item.timestamp}</td>
                  <td className="p-3 text-slate-200">{item.road}</td>
                  <td className="p-3 text-slate-300">{item.vehicleClass}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : item.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{item.duration}</td>
                  <td className="p-3 text-emerald-400 font-bold">{item.minutesSaved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
