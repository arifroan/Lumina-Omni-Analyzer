import React, { useRef, useState } from 'react';
import { DomainType, DepthType, PresetItem } from '../types/analyzer';
import { PRESETS } from '../data/presets';
import {
  Upload,
  FileCode,
  SlidersHorizontal,
  X,
  Play,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface AnalyzerInputProps {
  content: string;
  onChangeContent: (value: string) => void;
  domain: DomainType;
  onSelectDomain: (domain: DomainType) => void;
  depth: DepthType;
  onChangeDepth: (depth: DepthType) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  mediaData?: string;
  mediaMime?: string;
  onSetMedia: (data?: string, mime?: string) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  loadingStepText: string;
}

const DEPTH_OPTIONS: { id: DepthType; label: string; desc: string }[] = [
  { id: 'standard', label: 'Standard Diagnostic', desc: 'Balanced depth, core metrics, actionable fixes' },
  { id: 'deep', label: 'Deep Forensic Audit', desc: 'Exhaustive edge-case scrutiny, security, and logic' },
  { id: 'executive', label: 'Executive Summary', desc: 'High-level business risk, bottom-line ROI impacts' },
  { id: 'academic', label: 'Peer Review', desc: 'Methodological rigor, nuance, and theoretical limits' },
];

export const AnalyzerInput: React.FC<AnalyzerInputProps> = ({
  content,
  onChangeContent,
  domain,
  onSelectDomain,
  depth,
  onChangeDepth,
  customPrompt,
  onChangeCustomPrompt,
  mediaData,
  mediaMime,
  onSetMedia,
  onRunAnalysis,
  isLoading,
  loadingStepText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute stats
  const lineCount = content ? content.split('\n').length : 0;
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onSetMedia(result, file.type);
        if (domain === 'auto') {
          onSelectDomain('image');
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Text / Code / CSV / JSON
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onChangeContent(text);

        // Auto detect file extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['py', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'rs', 'go', 'java', 'html', 'css'].includes(ext || '')) {
          if (domain === 'auto') onSelectDomain('code');
        } else if (['csv', 'json'].includes(ext || '')) {
          if (domain === 'auto') onSelectDomain('data');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyPreset = (preset: PresetItem) => {
    onChangeContent(preset.content);
    onSelectDomain(preset.domain);
    if (preset.customPrompt) {
      onChangeCustomPrompt(preset.customPrompt);
      setShowAdvanced(true);
    }
    onSetMedia(undefined, undefined);
  };

  const handleClear = () => {
    onChangeContent('');
    onSetMedia(undefined, undefined);
    onChangeCustomPrompt('');
  };

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4">
      {/* Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-stone-300">Quick Test Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 rounded-md transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border rounded-lg transition-all ${
          isDragging
            ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
            : 'border-stone-800 bg-stone-950/70'
        }`}
      >
        {/* Media Preview thumbnail if image attached */}
        {mediaData && (
          <div className="p-3 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border border-stone-700 overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={mediaData}
                  alt="Uploaded media"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Visual Asset Attached</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {mediaMime || 'image'} · Multimodal vision analysis active
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSetMedia(undefined, undefined)}
              className="p-1 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          disabled={isLoading}
          rows={10}
          placeholder="Paste or type content to analyze here (code, article, contract excerpt, CSV dataset, landing page copy, or drop a file/screenshot)..."
          className="w-full p-4 bg-transparent text-stone-100 placeholder:text-stone-500 text-sm font-mono leading-relaxed focus:outline-none resize-y min-h-[180px]"
        />

        {/* Floating Upload / File action bar inside editor bottom */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-stone-800/80 text-xs text-stone-500 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="hidden"
              accept=".txt,.py,.js,.ts,.tsx,.jsx,.json,.csv,.md,.html,.sql,.css,.png,.jpg,.jpeg,.webp"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach File or Image</span>
            </button>

            {content && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="flex items-center gap-1 text-stone-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
            <span>{lineCount} lines</span>
            <span aria-hidden="true">·</span>
            <span>{wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>

      {/* Advanced Depth & Custom Focus Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {showAdvanced ? 'Hide Audit Configurations' : 'Configure Depth & Custom Focus'}
            </span>
          </button>
          <span className="text-xs text-stone-400">
            Current Depth: <strong className="text-stone-300 font-medium">{depth}</strong>
          </span>
        </div>

        {showAdvanced && (
          <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Audit Rigor Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeDepth(opt.id)}
                    className={`p-2 rounded text-left transition-colors border ${
                      depth === opt.id
                        ? 'bg-stone-800 border-amber-500/50 text-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Custom Focus / Specific Directives (Optional)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => onChangeCustomPrompt(e.target.value)}
                placeholder="e.g. Audit for memory leaks and race conditions, verify GDPR compliance, or highlight passive voice..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-stone-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-400">
          Powered by Gemini 3.8 Flash · Zero hallucinations telemetry
        </div>

        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isLoading || (!content.trim() && !mediaData)}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
            isLoading || (!content.trim() && !mediaData)
              ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              <span>{loadingStepText || 'Analyzing Input...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Deep Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
