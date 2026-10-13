import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Mail,
  History,
} from 'lucide-react';

interface UserProfileMenuProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onOpenHistory,
  historyCount,
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
            {initials}
          </div>
        )}

        <div className="text-left hidden sm:block max-w-[120px] truncate">
          <div className="text-xs font-semibold text-stone-200 truncate">
            {user.name}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-stone-800/80 bg-stone-950/60 rounded-lg mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-stone-100 truncate">
                {user.name}
              </span>
              <span title="Verified Account">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </span>
            </div>
            <div className="text-xs text-stone-400 truncate font-mono">
              {user.email}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="capitalize">
                {user.provider === 'google' ? 'Google Account' : 'Email & OTP'}
              </span>
              <span className="text-emerald-400">Verified</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                onOpenHistory();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>My Saved Dossiers</span>
              </div>
              <span className="font-mono text-stone-500">{historyCount}</span>
            </button>

            <div className="px-3 py-2 text-[11px] text-stone-400 flex items-center gap-2 bg-stone-950/40 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Factor OTP Verified</span>
            </div>

            <div className="border-t border-stone-800/80 my-1" />

            <button
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
