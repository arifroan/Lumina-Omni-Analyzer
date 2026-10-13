import React from 'react';
import { MetricScore } from '../types/analyzer';

interface MetricGaugesProps {
  metrics: MetricScore[];
}

export const MetricGauges: React.FC<MetricGaugesProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500';
    if (score >= 60) return 'text-amber-400 bg-amber-500';
    return 'text-rose-400 bg-rose-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {metrics.map((m, idx) => {
        const colorClasses = getScoreColor(m.score);
        const textColor = colorClasses.split(' ')[0];
        const barColor = colorClasses.split(' ')[1];

        return (
          <div
            key={idx}
            className="p-4 bg-stone-900/60 border border-stone-800 rounded-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-stone-300 truncate">
                  {m.label}
                </span>
                <span className={`text-xs font-mono font-bold ${textColor}`}>
                  {m.grade}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                />
              </div>

              <p className="text-[11px] text-stone-400 leading-snug line-clamp-2">
                {m.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <span>Score: {m.score}/100</span>
              <span className="truncate max-w-[120px]" title={m.benchmark}>
                {m.benchmark}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
