import { useState } from 'react';
import {
  Receipt,
  CheckCircle,
  Mail,
  Lock,
  Eye,
  Loader2,
} from 'lucide-react';
import { useAuth } from './AuthContext';

const FEATURES = [
  'OCR text extraction for Myanmar & English bills',
  'Automatic bill classification with AI',
  'Spending analytics and budget tracking',
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (!email.includes('@') || email.length < 5) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Brand Panel */}
      <div className="w-[620px] bg-primary flex flex-col items-center justify-center px-[60px] gap-8 shrink-0">
        <div className="flex flex-col items-center gap-4">
          <Receipt className="w-16 h-16 text-white" />
          <span className="font-heading text-[28px] font-bold text-white">
            Pyat Paing
          </span>
        </div>
        <p className="text-[#C7D2FE] text-center text-[15px] leading-relaxed max-w-[400px]">
          AI-powered bill organizer for Myanmar households. Upload, track, and
          manage all your utility bills in one place.
        </p>
        <div className="flex flex-col gap-4 items-start max-w-[380px]">
          {FEATURES.map((feat) => (
            <div key={feat} className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-[#A5B4FC] shrink-0" />
              <span className="text-[#E0E7FF] text-sm">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-[60px]">
        <div className="w-[420px] flex flex-col gap-7">
          <div>
            <h1 className="font-heading text-[28px] font-bold text-text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-[15px] text-text-secondary mt-1">
              {mode === 'login'
                ? 'Sign in to manage your bills'
                : 'Start organizing your bills in seconds'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-bg p-1 rounded-lg">
            <button
              onClick={() => { setMode('login'); resetForm(); }}
              className={`flex-1 h-9 rounded-md text-[13px] font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-bg-card text-text-primary font-semibold shadow-sm'
                  : 'text-text-muted'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); resetForm(); }}
              className={`flex-1 h-9 rounded-md text-[13px] font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-bg-card text-text-primary font-semibold shadow-sm'
                  : 'text-text-muted'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-primary">
                Email
              </label>
              <div className="flex items-center h-11 px-3.5 bg-bg rounded-lg border border-border gap-2">
                <Mail className="w-[18px] h-[18px] text-text-muted" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
                  autoComplete="email"
                  disabled={submitting}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-primary">
                Password
              </label>
              <div className="flex items-center h-11 px-3.5 bg-bg rounded-lg border border-border gap-2">
                <Lock className="w-[18px] h-[18px] text-text-muted" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={submitting}
                />
                <Eye className="w-[18px] h-[18px] text-text-muted cursor-pointer" />
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-primary">
                  Confirm Password
                </label>
                <div className="flex items-center h-11 px-3.5 bg-bg rounded-lg border border-border gap-2">
                  <Lock className="w-[18px] h-[18px] text-text-muted" />
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
                    autoComplete="new-password"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            {/* Forgot password */}
            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-[13px] text-primary">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-danger flex items-center gap-1.5" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center h-[46px] bg-primary rounded-lg text-[15px] font-semibold text-white disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-[13px] text-text-secondary text-center">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={toggleMode} className="text-primary font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={toggleMode} className="text-primary font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
