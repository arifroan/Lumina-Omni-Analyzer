import React, { useState } from 'react';
import { DataInsights } from '../types/analyzer';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DataVisualizerProps {
  dataInsights?: DataInsights;
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ dataInsights }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number } | null>(null);

  if (!dataInsights) return null;

  const { summaryStats, chartSuggestion } = dataInsights;

  if (!summaryStats && !chartSuggestion) return null;

  const points = chartSuggestion?.dataPoints || [];
  const maxValue = points.length > 0 ? Math.max(...points.map((p) => p.value)) : 100;
  const safeMax = maxValue > 0 ? maxValue * 1.15 : 100;

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-5">
      {/* Summary Stats Row */}
      {summaryStats && summaryStats.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Statistical & Empirical Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {summaryStats.map((stat, i) => (
              <div
                key={i}
                className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-md"
              >
                <div className="text-[11px] text-stone-400 truncate">
                  {stat.label}
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-stone-100 mt-0.5">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG Chart */}
      {chartSuggestion && points.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-stone-200">
                {chartSuggestion.title || 'Trend & Distribution Plot'}
              </h4>
            </div>
            {hoveredPoint && (
              <div className="text-xs font-mono text-amber-400 bg-stone-950 px-2 py-1 rounded border border-stone-800">
                {hoveredPoint.label}: <strong>{hoveredPoint.value}</strong>
              </div>
            )}
          </div>

          <div className="h-64 w-full bg-stone-950/80 border border-stone-800/80 rounded-lg p-4 flex flex-col justify-end relative">
            {/* Background grid lines */}
            <div className="absolute inset-x-4 top-4 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-stone-700 w-full" />
              <div className="border-b border-stone-700 w-full" />
              <div className="border-b border-stone-700 w-full" />
              <div className="border-b border-stone-700 w-full" />
            </div>

            {/* Bars container */}
            <div className="flex items-end justify-between gap-2 h-44 z-10 w-full">
              {points.map((p, idx) => {
                const heightPercent = Math.max(5, (p.value / safeMax) * 100);
                const isHovered = hoveredPoint?.label === p.label;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <div
                      className={`w-full max-w-[48px] rounded-t transition-all duration-300 ${
                        isHovered
                          ? 'bg-amber-400'
                          : 'bg-amber-500/70 hover:bg-amber-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-mono text-stone-400 mt-2 truncate max-w-full text-center">
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
