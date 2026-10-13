import React, { useState, useEffect } from 'react';
import { DomainType, DepthType, AnalysisResult } from './types/analyzer';
import { Header } from './components/Header';
import { DomainSelector } from './components/DomainSelector';
import { AnalyzerInput } from './components/AnalyzerInput';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExportModal } from './components/ExportModal';
import { AlertCircle, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'lumina_analyzer_history_v1';

export default function App() {
  const [domain, setDomain] = useState<DomainType>('auto');
  const [content, setContent] = useState<string>('');
  const [mediaData, setMediaData] = useState<string | undefined>();
  const [mediaMime, setMediaMime] = useState<string | undefined>();
  const [depth, setDepth] = useState<DepthType>('standard');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load analysis history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== newResult.id);
      const updated = [newResult, ...filtered].slice(0, 20); // keep 20 recent
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist history:', e);
      }
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update history:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  };

  const handleRunAnalysis = async () => {
    if (!content.trim() && !mediaData) return;

    setIsLoading(true);
    setError(null);
    setLoadingStepText('Scanning input & classifying syntax...');

    // Progress text simulator
    const stepTimers: NodeJS.Timeout[] = [];
    stepTimers.push(
      setTimeout(() => {
        setLoadingStepText('Executing forensic domain checks...');
      }, 1500)
    );
    stepTimers.push(
      setTimeout(() => {
        setLoadingStepText('Computing quantitative metrics & scores...');
      }, 3200)
    );
    stepTimers.push(
      setTimeout(() => {
        setLoadingStepText('Generating actionable remediations & revision...');
      }, 4800)
    );

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          content,
          mediaData,
          mediaMime,
          depth,
          customPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete analysis');
      }

      const result: AnalysisResult = {
        ...data.analysis,
        id: `analysis-${Date.now()}`,
        timestamp: Date.now(),
        originalInput: {
          content,
          domain,
          mediaData,
          mediaMime,
        },
      };

      setActiveAnalysis(result);
      saveToHistory(result);

      // Scroll to result smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Analysis failed. Please verify API configuration.');
    } finally {
      stepTimers.forEach(clearTimeout);
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleReset = () => {
    setActiveAnalysis(null);
    setError(null);
  };

  const handleSelectFromHistory = (report: AnalysisResult) => {
    setActiveAnalysis(report);
    if (report.originalInput) {
      setContent(report.originalInput.content || '');
      setDomain(report.originalInput.domain || 'auto');
      setMediaData(report.originalInput.mediaData);
      setMediaMime(report.originalInput.mediaMime);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        hasActiveResult={Boolean(activeAnalysis)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 bg-rose-950/70 border border-rose-900 rounded-lg flex items-start justify-between gap-3 text-rose-200 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">Analysis Error</h4>
                <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 text-rose-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* If Active Analysis exists, show Analysis Studio */}
        {activeAnalysis ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AnalysisResults
              analysis={activeAnalysis}
              onOpenExport={() => setIsExportOpen(true)}
            />
          </div>
        ) : (
          /* Otherwise show Input Studio */
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Hero Banner with clean editorial typography */}
            <div className="text-center space-y-2 py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Deep Forensic Diagnostic Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                Analyze anything with forensic AI precision.
              </h1>
              <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Inspect software code vulnerabilities, verify contract traps, audit prose & rhetoric, evaluate CSV growth datasets, and diagnose landing pages.
              </p>
            </div>

            {/* Domain Selector */}
            <DomainSelector
              selectedDomain={domain}
              onSelectDomain={setDomain}
              disabled={isLoading}
            />

            {/* Input Workspace */}
            <AnalyzerInput
              content={content}
              onChangeContent={setContent}
              domain={domain}
              onSelectDomain={setDomain}
              depth={depth}
              onChangeDepth={setDepth}
              customPrompt={customPrompt}
              onChangeCustomPrompt={setCustomPrompt}
              mediaData={mediaData}
              mediaMime={mediaMime}
              onSetMedia={(data, mime) => {
                setMediaData(data);
                setMediaMime(mime);
              }}
              onRunAnalysis={handleRunAnalysis}
              isLoading={isLoading}
              loadingStepText={loadingStepText}
            />
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectReport={handleSelectFromHistory}
        onDeleteReport={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Export Modal */}
      {isExportOpen && activeAnalysis && (
        <ExportModal
          analysis={activeAnalysis}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-stone-800/60 py-6 text-center text-xs text-stone-400 font-mono">
        <p>Lumina Omni-Analyzer · Built with Google Gemini 3.8 Flash Engine</p>
      </footer>
    </div>
  );
}
