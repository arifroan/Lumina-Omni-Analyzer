import React from 'react';
import { Sparkles, History, RotateCcw, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { AuthMode } from '../types/auth';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
  hasActiveResult: boolean;
  onOpenAuth: (mode?: AuthMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onReset,
  hasActiveResult,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-stone-100 text-base sm:text-lg">
                Lumina Omni-Analyzer
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline">
                Intelligence Engine
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Forensic multi-domain diagnostic & optimization studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveResult && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-md transition-colors relative"
            title="Analysis History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-[11px] font-mono text-amber-400">
                ({historyCount})
              </span>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-stone-800 text-xs text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Gemini 3.8</span>
          </div>

          {/* Auth section */}
          <div className="pl-2 border-l border-stone-800 flex items-center gap-2">
            {isAuthenticated && user ? (
              <UserProfileMenu
                historyCount={historyCount}
                onOpenHistory={onOpenHistory}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-900 rounded-md transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
