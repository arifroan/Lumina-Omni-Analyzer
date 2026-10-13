import React, { useState } from 'react';
import { AnalysisResult } from '../types/analyzer';
import { X, FileDown, Copy, Check, Printer, FileText, Code } from 'lucide-react';

interface ExportModalProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ analysis, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const generateMarkdownReport = (): string => {
    return `# Lumina Forensic Analysis Report: ${analysis.title}
**Domain:** ${analysis.domain.toUpperCase()}  
**Verdict:** ${analysis.verdict}  
**Overall Grade:** ${analysis.overallGrade} (Score: ${analysis.overallScore}/100)  
**Date:** ${new Date(analysis.timestamp || Date.now()).toUTCString()}  

---

## Executive Summary
${analysis.executiveSummary}

${analysis.sentimentOrTone ? `**Tone / Posture:** ${analysis.sentimentOrTone}\n` : ''}

---

## Quantitative Metrics
${analysis.metrics
  .map(
    (m) =>
      `- **${m.label}**: ${m.grade} (Score: ${m.score}/100) | *Benchmark: ${m.benchmark}*\n  ${m.description}`
  )
  .join('\n\n')}

---

## Key Strengths
${analysis.keyStrengths.map((s) => `- ${s}`).join('\n')}

---

## Primary Vulnerabilities & Weaknesses
${analysis.primaryWeaknesses.map((w) => `- ${w}`).join('\n')}

---

## Prioritized Remediation Roadmap
${analysis.actionItems
  .map(
    (a, i) =>
      `${i + 1}. **[${a.priority.toUpperCase()}]** ${a.task}\n   *Expected Impact:* ${a.expectedImpact}`
  )
  .join('\n\n')}

---

## Granular Findings (${analysis.findings.length} Items)
${analysis.findings
  .map(
    (f, idx) => `### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}
- **Category:** ${f.category}
- **Location:** ${f.location || 'General'}
- **Description:** ${f.description}
- **Recommendation:** ${f.recommendation}
${f.codeSnippet ? `\n*Problematic Segment:*\n\`\`\`\n${f.codeSnippet}\n\`\`\`\n` : ''}
${f.suggestedFix ? `\n*Suggested Remedy:*\n\`\`\`\n${f.suggestedFix}\n\`\`\`\n` : ''}`
  )
  .join('\n\n')}

${
  analysis.improvedVersion
    ? `\n---\n\n## Optimized Version: ${analysis.improvedVersion.label}\n${analysis.improvedVersion.description}\n\n\`\`\`\n${analysis.improvedVersion.content}\n\`\`\``
    : ''
}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-stone-100">
              Export Analysis Dossier
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

        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-400">
            Export the complete forensic breakdown, quantitative scores, findings, and optimized remediations in your preferred format.
          </p>

          <div className="space-y-2.5">
            {/* Markdown option */}
            <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-sm font-medium text-stone-200">
                    Markdown Report (.md)
                  </div>
                  <div className="text-xs text-stone-500">
                    Standard formatted documentation ready for GitHub, Notion, or Slack
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'md' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium rounded flex items-center gap-1 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* JSON option */}
            <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-sm font-medium text-stone-200">
                    Raw JSON Telemetry (.json)
                  </div>
                  <div className="text-xs text-stone-500">
                    Complete programmatic schema for CI/CD pipelines and auditing
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'json' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded flex items-center gap-1 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Print/PDF option */}
            <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-medium text-stone-200">
                    Print / PDF Document
                  </div>
                  <div className="text-xs text-stone-500">
                    Formatted document layout suitable for executive review
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-stone-950/90 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
