import React, { useState } from 'react';
import { ImprovedVersion } from '../types/analyzer';
import { Copy, Check, Download, Wand2, Eye } from 'lucide-react';

interface ImprovedVersionViewProps {
  improvedVersion?: ImprovedVersion;
  originalContent?: string;
}

export const ImprovedVersionView: React.FC<ImprovedVersionViewProps> = ({
  improvedVersion,
  originalContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'improved' | 'diff'>('improved');

  if (!improvedVersion || !improvedVersion.content) {
    return (
      <div className="p-8 text-center bg-stone-900/40 border border-stone-800 rounded-lg text-stone-400 text-sm">
        No optimized revision generated for this input.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([improvedVersion.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-100">
              {improvedVersion.label || 'Optimized Production-Ready Revision'}
            </h4>
            <p className="text-xs text-stone-400">
              {improvedVersion.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {originalContent && (
            <div className="flex items-center gap-1 p-0.5 bg-stone-950 border border-stone-800 rounded-md text-xs">
              <button
                type="button"
                onClick={() => setViewMode('improved')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'improved'
                    ? 'bg-stone-800 text-stone-100 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Optimized
              </button>
              <button
                type="button"
                onClick={() => setViewMode('diff')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'diff'
                    ? 'bg-stone-800 text-stone-100 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Side-by-Side
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code / Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors"
            title="Download as file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Content view */}
      {viewMode === 'diff' && originalContent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-stone-800 rounded-lg overflow-hidden bg-stone-950">
            <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 text-xs font-mono text-stone-400">
              Original Submission
            </div>
            <pre className="p-3 text-xs font-mono text-stone-400 overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap">
              {originalContent}
            </pre>
          </div>

          <div className="border border-emerald-900/60 rounded-lg overflow-hidden bg-stone-950">
            <div className="px-3 py-2 bg-stone-900 border-b border-emerald-900/60 text-xs font-mono text-emerald-400">
              Remediated & Hardened
            </div>
            <pre className="p-3 text-xs font-mono text-emerald-200 overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap">
              {improvedVersion.content}
            </pre>
          </div>
        </div>
      ) : (
        <div className="border border-stone-800 rounded-lg overflow-hidden bg-stone-950">
          <pre className="p-4 text-xs sm:text-sm font-mono text-stone-200 overflow-x-auto max-h-[550px] leading-relaxed whitespace-pre-wrap">
            {improvedVersion.content}
          </pre>
        </div>
      )}
    </div>
  );
};
