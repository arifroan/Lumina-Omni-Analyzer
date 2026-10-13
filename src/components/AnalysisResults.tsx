import React, { useState } from 'react';
import { AnalysisResult } from '../types/analyzer';
import { MetricGauges } from './MetricGauges';
import { FindingsList } from './FindingsList';
import { ImprovedVersionView } from './ImprovedVersionView';
import { DataVisualizer } from './DataVisualizer';
import { ChatConsultation } from './ChatConsultation';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  BarChart3,
  MessageSquare,
  FileDown,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onOpenExport: () => void;
}

type TabType = 'overview' | 'findings' | 'improved' | 'data' | 'consult';

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedVerdict, setCopiedVerdict] = useState(false);

  const handleCopyVerdict = () => {
    navigator.clipboard.writeText(analysis.verdict);
    setCopiedVerdict(true);
    setTimeout(() => setCopiedVerdict(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', stroke: '#10b981' };
    if (score >= 60) return { text: 'text-amber-400', stroke: '#f59e0b' };
    return { text: 'text-rose-400', stroke: '#f43f5e' };
  };

  const scoreTheme = getScoreColor(analysis.overallScore);

  const hasDataInsights = Boolean(analysis.dataInsights?.chartSuggestion || analysis.dataInsights?.summaryStats);

  return (
    <div className="space-y-6">
      {/* Top Overview Banner Card */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-6 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            {/* Clean unboxed metadata with separators */}
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
              <span className="capitalize text-amber-400 font-medium">{analysis.domain} Analysis</span>
              <span aria-hidden="true">·</span>
              <span>Audit Completed</span>
              {analysis.sentimentOrTone && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Tone: {analysis.sentimentOrTone}</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
              {analysis.title}
            </h2>

            {/* Verdict callout */}
            <div className="pt-1 flex items-start gap-2 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
              <span className="font-semibold text-stone-100 shrink-0">Executive Verdict:</span>
              <span>"{analysis.verdict}"</span>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="flex items-center gap-4 bg-stone-950/80 border border-stone-800 p-4 rounded-xl shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${Math.min(100, Math.max(0, analysis.overallScore))}, 100`}
                  strokeWidth="3.5"
                  stroke={scoreTheme.stroke}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-base font-bold font-mono ${scoreTheme.text}`}>
                  {analysis.overallScore}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Overall Grade
              </div>
              <div className={`text-xl font-bold font-mono ${scoreTheme.text}`}>
                {analysis.overallGrade}
              </div>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                Quality Index / 100
              </div>
            </div>
          </div>
        </div>

        {/* Action utility row */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyVerdict}
              className="text-stone-400 hover:text-stone-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedVerdict ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Verdict Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Verdict</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-md transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Full Dossier</span>
          </button>
        </div>
      </div>

      {/* Quantitative Metric Gauges */}
      <MetricGauges metrics={analysis.metrics} />

      {/* Interactive Tabs Navigation (Functional buttons with clean segmented style) */}
      <div className="border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 p-1 bg-stone-900/60 border border-stone-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('findings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'findings'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Granular Findings ({analysis.findings.length})</span>
          </button>

          {analysis.improvedVersion && (
            <button
              type="button"
              onClick={() => setActiveTab('improved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'improved'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimized Revision</span>
            </button>
          )}

          {hasDataInsights && (
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Data & Visuals</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('consult')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'consult'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Consultation</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Executive Summary Prose */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                Executive Synthesis
              </h3>
              <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-line">
                {analysis.executiveSummary}
              </p>
            </div>

            {/* Strengths and Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-stone-200">
                    Confirmed Strengths & Validations
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.keyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-300">
                      <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-semibold text-stone-200">
                    Key Vulnerabilities & Friction Points
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analysis.primaryWeaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-300">
                      <span className="text-rose-400 shrink-0 mt-0.5">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prioritized Action Plan */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                Prioritized Remediation Roadmap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.actionItems.map((act, i) => {
                  const priorityColor =
                    act.priority === 'high'
                      ? 'text-rose-400 border-rose-900/60'
                      : act.priority === 'medium'
                      ? 'text-amber-400 border-amber-900/60'
                      : 'text-sky-400 border-sky-900/60';

                  return (
                    <div
                      key={i}
                      className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-lg flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className={`font-semibold capitalize ${priorityColor.split(' ')[0]}`}>
                            {act.priority} Priority
                          </span>
                          <span className="text-stone-400 font-mono">Step #{i + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-stone-200 leading-snug">
                          {act.task}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-300 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>Impact: {act.expectedImpact}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Findings */}
        {activeTab === 'findings' && (
          <div className="animate-in fade-in duration-150">
            <FindingsList findings={analysis.findings} />
          </div>
        )}

        {/* Tab 3: Improved Version */}
        {activeTab === 'improved' && (
          <div className="animate-in fade-in duration-150">
            <ImprovedVersionView
              improvedVersion={analysis.improvedVersion}
              originalContent={analysis.originalInput?.content}
            />
          </div>
        )}

        {/* Tab 4: Data Insights */}
        {activeTab === 'data' && (
          <div className="animate-in fade-in duration-150">
            <DataVisualizer dataInsights={analysis.dataInsights} />
          </div>
        )}

        {/* Tab 5: Consultation */}
        {activeTab === 'consult' && (
          <div className="animate-in fade-in duration-150">
            <ChatConsultation analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
};
