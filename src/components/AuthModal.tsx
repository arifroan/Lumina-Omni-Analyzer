import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthMode, OtpPurpose } from '../types/auth';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { loginWithGoogle, sendOtp, verifyOtp, loginWithPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>('signup');
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset or initialize mode on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessNotice(null);
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle Google Login
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ok = await loginWithGoogle('mdarifarman2005@gmail.com', 'Md Arif Arman');
      if (ok) {
        onClose();
      } else {
        setError('Failed to authenticate with Google account.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Send OTP
  const handleRequestOtp = async (purpose: OtpPurpose) => {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessNotice(null);

    const res = await sendOtp(email, purpose);
    setIsLoading(false);

    if (res.success) {
      setOtpPurpose(purpose);
      setOtpPreview(res.otpCode || null);
      setMode('otp');
      setResendCooldown(60);
      setSuccessNotice(`Verification code dispatched to ${email}`);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } else {
      setError(res.error || res.message || 'Failed to dispatch verification code.');
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await verifyOtp({
      email,
      code,
      purpose: otpPurpose,
      name,
      password,
    });

    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Verification code failed. Please check and try again.');
    }
  };

  // Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await loginWithPassword(email, password);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  // OTP Input Handlers (auto-focus next, backspace, paste)
  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1); // take last typed character
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleAutofillCode = () => {
    if (otpPreview && otpPreview.length === 6) {
      setOtpDigits(otpPreview.split(''));
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-800/80 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 tracking-tight">
                {mode === 'signin' && 'Sign In to Lumina'}
                {mode === 'signup' && 'Create Your Account'}
                {mode === 'otp' && 'Verify Email Address'}
                {mode === 'forgot' && 'Reset Your Password'}
              </h3>
              <p className="text-xs text-stone-400">
                {mode === 'signin' && 'Access saved analyses, exports & AI consultations'}
                {mode === 'signup' && 'Join with Google account or verified email'}
                {mode === 'otp' && `Secure 6-digit one-time code`}
                {mode === 'forgot' && 'Enter your email to receive recovery code'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-900/80 rounded-lg flex items-start gap-2.5 text-rose-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-900/80 rounded-lg flex items-start gap-2.5 text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* -------------------- MODE: SIGN IN -------------------- */}
          {mode === 'signin' && (
            <div className="space-y-4">
              {/* Google One-Tap Primary Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-900 font-semibold rounded-lg text-sm flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer"
              >
                {/* Google SVG Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-stone-800" />
                <span className="text-xs text-stone-500 uppercase font-mono tracking-wider">
                  or email
                </span>
                <div className="flex-1 border-t border-stone-800" />
              </div>

              {!usePasswordLogin ? (
                /* Passwordless OTP Sign In */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRequestOtp('login');
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send 6-Digit Login Code</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs text-stone-400">
                    <button
                      type="button"
                      onClick={() => setUsePasswordLogin(true)}
                      className="hover:text-stone-200 transition-colors"
                    >
                      Sign in with password instead
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      Need an account? Sign up
                    </button>
                  </div>
                </form>
              ) : (
                /* Traditional Password Sign In */
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    ) : (
                      <span>Sign In with Password</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs text-stone-400">
                    <button
                      type="button"
                      onClick={() => setUsePasswordLogin(false)}
                      className="hover:text-stone-200 transition-colors"
                    >
                      Use Email OTP Code instead
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* -------------------- MODE: SIGN UP -------------------- */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-900 font-semibold rounded-lg text-sm flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-stone-800" />
                <span className="text-xs text-stone-500 uppercase font-mono tracking-wider">
                  or with email
                </span>
                <div className="flex-1 border-t border-stone-800" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRequestOtp('signup');
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Create Password (Optional for OTP verification)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !name.trim()}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  ) : (
                    <>
                      <span>Continue & Verify with OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1 text-xs text-stone-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* -------------------- MODE: OTP VERIFICATION -------------------- */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg text-center space-y-1">
                <p className="text-xs text-stone-400">
                  We've generated a 6-digit security verification code for:
                </p>
                <p className="text-sm font-semibold text-stone-200 font-mono">
                  {email}
                </p>
              </div>

              {/* Dev Preview / Simulation Banner so users can immediately test */}
              {otpPreview && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
                  <div>
                    <span className="text-stone-400">Verification Code: </span>
                    <strong className="text-amber-400 font-mono tracking-widest text-sm">
                      {otpPreview}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillCode}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-medium transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div
                className="flex items-center justify-center gap-2 py-2"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 text-center text-xl font-bold font-mono bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Complete Sign In</span>
                  </>
                )}
              </button>

              {/* Resend & Back options */}
              <div className="flex items-center justify-between pt-1 text-xs text-stone-400">
                <button
                  type="button"
                  onClick={() => {
                    setMode(otpPurpose === 'signup' ? 'signup' : 'signin');
                    setError(null);
                  }}
                  className="hover:text-stone-200 transition-colors"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={() => handleRequestOtp(otpPurpose)}
                  className={`flex items-center gap-1 ${
                    resendCooldown > 0
                      ? 'text-stone-600 cursor-not-allowed font-mono'
                      : 'text-amber-400 hover:text-amber-300 font-medium cursor-pointer'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------- MODE: FORGOT PASSWORD -------------------- */}
          {mode === 'forgot' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestOtp('reset');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <span>Send Recovery Code</span>
                )}
              </button>

              <div className="text-center pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-stone-400 hover:text-stone-200 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-stone-950/90 border-t border-stone-800/80 flex items-center justify-center gap-2 text-[11px] text-stone-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit TLS encrypted · Multi-Factor OTP Secured</span>
        </div>
      </div>
    </div>
  );
};
