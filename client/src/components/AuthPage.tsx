import { useState } from 'react';
import { useAuth } from './AuthContext';

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

    // Client-side validation
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    if (!email.includes('@') || email.length < 5) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      // AuthContext will update and App will re-render to dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__icon">🧾</span>
          <h1 className="auth-card__title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-card__subtitle">
            {mode === 'login'
              ? 'Sign in to manage your bills'
              : 'Start organizing your bills in seconds'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="auth-email">
              Email
            </label>
            <input
              className="auth-form__input"
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="auth-password">
              Password
            </label>
            <input
              className="auth-form__input"
              id="auth-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={submitting}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="auth-confirm">
                Confirm Password
              </label>
              <input
                className="auth-form__input"
                id="auth-confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>
          )}

          {error && (
            <p className="auth-form__error" role="alert">
              ⚠️ {error}
            </p>
          )}

          <button
            className="auth-form__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? mode === 'login'
                ? '⏳ Signing in...'
                : '⏳ Creating account...'
              : mode === 'login'
                ? '🔑 Sign In'
                : '✨ Create Account'}
          </button>
        </form>

        <p className="auth-card__toggle">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button className="auth-card__toggle-btn" onClick={toggleMode}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="auth-card__toggle-btn" onClick={toggleMode}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
