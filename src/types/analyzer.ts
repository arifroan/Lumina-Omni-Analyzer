export type DomainType = 'auto' | 'code' | 'prose' | 'data' | 'legal' | 'image' | 'web';
export type DepthType = 'standard' | 'deep' | 'executive' | 'academic';
export type SeverityType = 'critical' | 'warning' | 'info' | 'positive';

export interface MetricScore {
  label: string;
  score: number; // 0 - 100
  grade: string;
  benchmark: string;
  description: string;
}

export interface FindingItem {
  id: string;
  category: string;
  severity: SeverityType;
  title: string;
  description: string;
  location?: string;
  recommendation: string;
  codeSnippet?: string;
  suggestedFix?: string;
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  task: string;
  expectedImpact: string;
}

export interface ImprovedVersion {
  label: string;
  description: string;
  content: string;
}

export interface DataInsights {
  summaryStats?: { label: string; value: string }[];
  chartSuggestion?: {
    chartType: 'bar' | 'line' | 'pie';
    title: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    dataPoints: { label: string; value: number }[];
  };
}

export interface AnalysisResult {
  id?: string;
  timestamp?: number;
  title: string;
  domain: DomainType;
  verdict: string;
  overallScore: number;
  overallGrade: string;
  executiveSummary: string;
  sentimentOrTone?: string;
  metrics: MetricScore[];
  keyStrengths: string[];
  primaryWeaknesses: string[];
  findings: FindingItem[];
  actionItems: ActionItem[];
  improvedVersion?: ImprovedVersion;
  dataInsights?: DataInsights;
  originalInput?: {
    content: string;
    domain: DomainType;
    mediaData?: string;
    mediaMime?: string;
  };
}

export interface PresetItem {
  id: string;
  title: string;
  domain: DomainType;
  iconName: string;
  description: string;
  content: string;
  customPrompt?: string;
}
