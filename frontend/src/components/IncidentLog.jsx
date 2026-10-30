import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Download,
  Trash2,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function IncidentLog({ logs = [], onClearLogs }) {
  const [filter, setFilter] = useState('ALL');
  const scrollRef = useRef(null);

  // Auto-scroll to bottom as new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  // Export Audit Logs as CSV
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'Level', 'Sector', 'Event', 'Details'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.level}"`,
      `"${l.sector || 'Sector 04'}"`,
      `"${l.event.replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saferoute_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0b101b]/95 rounded-xl border border-slate-800 flex flex-col font-mono shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 tracking-wider uppercase">
            Live Telemetry Event Audit Feed
          </span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            {['ALL', 'CRITICAL', 'WARN', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  filter === lvl
                    ? lvl === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : lvl === 'WARN'
                      ? 'bg-amber-600 text-white'
                      : lvl === 'INFO'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-colors"
            title="Export CSV Audit Trail"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Event Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div
        ref={scrollRef}
        className="p-3.5 max-h-[320px] min-h-[220px] overflow-y-auto space-y-1.5 text-xs bg-[#070b14]/90"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <Info className="w-6 h-6 mx-auto mb-2 opacity-40 text-cyan-400" />
            <p>NO AUDIT LOGS RECORDED FOR ACTIVE FILTER</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            let levelBadge = 'text-cyan-400 bg-cyan-950/70 border-cyan-800';
            let icon = <Info className="w-3 h-3 text-cyan-400" />;

            if (log.level === 'CRITICAL') {
              levelBadge = 'text-rose-400 bg-rose-950/70 border-rose-800';
              icon = <ShieldAlert className="w-3 h-3 text-rose-400" />;
            } else if (log.level === 'WARN') {
              levelBadge = 'text-amber-400 bg-amber-950/70 border-amber-800';
              icon = <AlertTriangle className="w-3 h-3 text-amber-400" />;
            }

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-900/60 transition-colors border-l-2 border-transparent hover:border-cyan-500/50"
              >
                <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                  [{log.timestamp}]
                </span>

                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 flex items-center gap-1 ${levelBadge}`}>
                  {icon}
                  {log.level}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="text-slate-200 font-semibold">{log.event}</span>
                  {log.details && (
                    <span className="text-slate-400 ml-1.5 text-[11px]">
                      &mdash; {log.details}
                    </span>
                  )}
                </div>

                {log.sector && (
                  <span className="text-slate-500 text-[10px] hidden md:inline shrink-0 font-mono">
                    {log.sector}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
