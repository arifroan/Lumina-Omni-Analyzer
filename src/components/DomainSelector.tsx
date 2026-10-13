import React from 'react';
import { DomainType } from '../types/analyzer';
import {
  Sparkles,
  Code2,
  FileText,
  BarChart3,
  ShieldAlert,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';

interface DomainSelectorProps {
  selectedDomain: DomainType;
  onSelectDomain: (domain: DomainType) => void;
  disabled?: boolean;
}

const DOMAINS: {
  id: DomainType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}[] = [
  { id: 'auto', label: 'Auto Detect', icon: Sparkles, hint: 'Smart classification' },
  { id: 'code', label: 'Code & Systems', icon: Code2, hint: 'Security, complexity, bugs' },
  { id: 'prose', label: 'Prose & Rhetoric', icon: FileText, hint: 'Readability, logic, tone' },
  { id: 'data', label: 'Data & Tabular', icon: BarChart3, hint: 'Stats, anomalies, trends' },
  { id: 'legal', label: 'Contracts & Legal', icon: ShieldAlert, hint: 'Liabilities, terms, traps' },
  { id: 'image', label: 'Visual Media', icon: ImageIcon, hint: 'UI, diagram, OCR analysis' },
  { id: 'web', label: 'Web & Landing Page', icon: Globe, hint: 'SEO, CRO, value prop' },
];

export const DomainSelector: React.FC<DomainSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Analysis Domain
        </label>
        <span className="text-xs text-stone-500">
          Tailors diagnostics & metrics to domain standards
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1.5 bg-stone-900/70 border border-stone-800 rounded-lg">
        {DOMAINS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedDomain === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDomain(item.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-md text-center transition-all ${
                isSelected
                  ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/80 font-medium'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon
                className={`w-4 h-4 mb-1 transition-colors ${
                  isSelected ? 'text-amber-400' : 'text-stone-400'
                }`}
              />
              <span className="text-xs leading-tight">{item.label}</span>
              <span className="text-[10px] text-stone-500 hidden sm:block mt-0.5 truncate max-w-full">
                {item.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
