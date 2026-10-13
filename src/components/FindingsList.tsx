import React, { useState } from 'react';
import { FindingItem, SeverityType } from '../types/analyzer';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Code2,
} from 'lucide-react';

interface FindingsListProps {
  findings: FindingItem[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!findings || findings.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 border border-stone-800 rounded-lg text-stone-400 text-sm">
        No specific findings or anomalies detected.
      </div>
    );
  }

  const counts = {
    all: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    warning: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
    positive: findings.filter((f) => f.severity === 'positive').length,
  };

  const filtered = findings.filter((f) => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const handleCopyFix = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityMeta = (sev: SeverityType) => {
    switch (sev) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-rose-400',
          label: 'Critical',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          label: 'Warning',
        };
      case 'info':
        return {
          icon: Info,
          color: 'text-sky-400',
          label: 'Informational',
        };
      case 'positive':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          label: 'Strength',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Interactive filter controls - styled as segmented functional button controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-1 p-1 bg-stone-900/90 border border-stone-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterSeverity === 'all'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Findings ({counts.all})
          </button>
          {counts.critical > 0 && (
            <button
              type="button"
              onClick={() => setFilterSeverity('critical')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterSeverity === 'critical'
                  ? 'bg-stone-800 text-rose-400 shadow-sm'
                  : 'text-stone-400 hover:text-rose-300'
              }`}
            >
              Critical ({counts.critical})
            </button>
          )}
          {counts.warning > 0 && (
            <button
              type="button"
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterSeverity === 'warning'
                  ? 'bg-stone-800 text-amber-400 shadow-sm'
                  : 'text-stone-400 hover:text-amber-300'
              }`}
            >
              Warnings ({counts.warning})
            </button>
          )}
          {counts.info > 0 && (
            <button
              type="button"
              onClick={() => setFilterSeverity('info')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterSeverity === 'info'
                  ? 'bg-stone-800 text-sky-400 shadow-sm'
                  : 'text-stone-400 hover:text-sky-300'
              }`}
            >
              Info ({counts.info})
            </button>
          )}
          {counts.positive > 0 && (
            <button
              type="button"
              onClick={() => setFilterSeverity('positive')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterSeverity === 'positive'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-emerald-300'
              }`}
            >
              Strengths ({counts.positive})
            </button>
          )}
        </div>

        <span className="text-xs text-stone-400 font-mono">
          Showing {filtered.length} of {findings.length} findings
        </span>
      </div>

      {/* Findings list */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const meta = getSeverityMeta(item.severity);
          const Icon = meta.icon;

          return (
            <div
              key={item.id}
              className="p-4 bg-stone-900/60 border border-stone-800 rounded-lg hover:border-stone-700/80 transition-all space-y-3"
            >
              {/* Header with clean unboxed metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${meta.color} shrink-0`} />
                  <h4 className="text-sm font-semibold text-stone-100">
                    {item.title}
                  </h4>
                </div>

                {/* Clean unboxed metadata with separators - zero pill discipline */}
                <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                  <span className={meta.color}>{meta.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.category}</span>
                  {item.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {item.description}
              </p>

              {/* Recommendation */}
              <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-md">
                <div className="text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                  <span className="text-amber-400">Actionable Remediation:</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {item.recommendation}
                </p>
              </div>

              {/* Code Snippets Comparison if available */}
              {(item.codeSnippet || item.suggestedFix) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {item.codeSnippet && (
                    <div className="p-2.5 bg-stone-950 border border-rose-950/60 rounded-md">
                      <div className="text-[11px] font-mono font-semibold text-rose-400/90 mb-1.5 flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Problematic Snippet</span>
                      </div>
                      <pre className="text-xs font-mono text-stone-300 overflow-x-auto whitespace-pre-wrap p-2 bg-stone-900/60 rounded border border-stone-800/60">
                        {item.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {item.suggestedFix && (
                    <div className="p-2.5 bg-stone-950 border border-emerald-950/60 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[11px] font-mono font-semibold text-emerald-400/90 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Suggested Remedy</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyFix(item.id, item.suggestedFix!)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Fix</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre-wrap p-2 bg-stone-900/60 rounded border border-stone-800/60">
                        {item.suggestedFix}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
