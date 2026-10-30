import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Download,
  Trash2,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info
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
    <div className="bg-tactical-base rounded-lg border border-tactical-border flex flex-col font-mono overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2 bg-tactical-surface/90 border-b border-tactical-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-textmuted-tertiary" />
          <span className="font-medium text-textmuted-primary uppercase text-[11px] tracking-wider">
            Live Telemetry Event Audit Log
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-tactical-void border border-tactical-border text-textmuted-tertiary">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-tactical-void p-0.5 rounded border border-tactical-border text-[10px]">
            {['ALL', 'CRITICAL', 'WARN', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                  filter === lvl
                    ? lvl === 'CRITICAL'
                      ? 'bg-signal-alertBg text-signal-alert border border-signal-alert/30'
                      : lvl === 'WARN'
                      ? 'bg-signal-warnBg text-signal-warn border border-signal-warn/30'
                      : lvl === 'INFO'
                      ? 'bg-signal-telemetryBg text-signal-telemetry border border-signal-telemetry/30'
                      : 'bg-tactical-surface text-textmuted-primary border border-tactical-border'
                    : 'text-textmuted-tertiary hover:text-textmuted-secondary border border-transparent'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-tactical-void hover:bg-tactical-hover text-textmuted-secondary hover:text-textmuted-primary border border-tactical-border text-[10px] font-mono transition-colors"
            title="Export CSV Audit Trail"
          >
            <Download className="w-3 h-3 text-textmuted-tertiary" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1 rounded hover:bg-tactical-hover text-textmuted-tertiary hover:text-signal-alert transition-colors"
              title="Clear Event Log"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div
        ref={scrollRef}
        className="p-3 max-h-[260px] min-h-[180px] overflow-y-auto space-y-1 text-xs bg-tactical-void"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-textmuted-tertiary">
            <Info className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-textmuted-tertiary" />
            <p className="text-[11px] uppercase tracking-wider">No events recorded for active filter</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            let levelBadge = 'text-signal-telemetry bg-signal-telemetryBg border-signal-telemetry/20';
            let icon = <Info className="w-3 h-3 text-signal-telemetry" />;

            if (log.level === 'CRITICAL') {
              levelBadge = 'text-signal-alert bg-signal-alertBg border-signal-alert/25';
              icon = <ShieldAlert className="w-3 h-3 text-signal-alert" />;
            } else if (log.level === 'WARN') {
              levelBadge = 'text-signal-warn bg-signal-warnBg border-signal-warn/20';
              icon = <AlertTriangle className="w-3 h-3 text-signal-warn" />;
            }

            return (
              <div
                key={idx}
                className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-tactical-surface/50 transition-colors"
              >
                <span className="text-textmuted-tertiary text-[10px] shrink-0 font-mono">
                  [{log.timestamp}]
                </span>

                <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-medium border shrink-0 flex items-center gap-1 ${levelBadge}`}>
                  {icon}
                  {log.level}
                </span>

                <div className="flex-1 min-w-0 text-[11px]">
                  <span className="text-textmuted-primary font-medium">{log.event}</span>
                  {log.details && (
                    <span className="text-textmuted-secondary ml-1.5">
                      &mdash; {log.details}
                    </span>
                  )}
                </div>

                {log.sector && (
                  <span className="text-textmuted-tertiary text-[10px] hidden md:inline shrink-0 font-mono">
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
