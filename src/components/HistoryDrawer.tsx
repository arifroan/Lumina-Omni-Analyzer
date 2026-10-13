import React from 'react';
import { AnalysisResult } from '../types/analyzer';
import { X, Trash2, Clock, ChevronRight, History } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelectReport: (report: AnalysisResult) => void;
  onDeleteReport: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onDeleteReport,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-stone-100">
              Analysis History Dossiers
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-xs">
              No historical analyses stored in this browser session.
            </div>
          ) : (
            history.map((item) => {
              const scoreColor =
                item.overallScore >= 80
                  ? 'text-emerald-400'
                  : item.overallScore >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-stone-950/70 border border-stone-800 hover:border-stone-700 rounded-lg group transition-all flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => {
                      onSelectReport(item);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-1 text-xs text-stone-500 font-mono">
                      <span className="capitalize">{item.domain}</span>
                      <span aria-hidden="true">·</span>
                      <Clock className="w-3 h-3" />
                      <span>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-medium text-stone-200 truncate group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`font-mono font-bold ${scoreColor}`}>
                        {item.overallGrade} ({item.overallScore}/100)
                      </span>
                      <span className="text-stone-500 truncate max-w-[150px]">
                        {item.findings.length} findings
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDeleteReport(item.id!)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(item);
                        onClose();
                      }}
                      className="p-1.5 text-stone-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {history.length} records cached
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
