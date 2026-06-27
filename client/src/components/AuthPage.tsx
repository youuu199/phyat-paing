import { useState } from 'react';
import { ReceiptText, Loader2, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTranslation } from '../i18n/useTranslation';
import { validatePassword } from '../utils/validatePassword';
import './AuthPage.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { t } = useTranslation();
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
      setError(t('auth.errorEmailRequired'));
      return;
    }

    if (!email.includes('@') || email.length < 5) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(t(`auth.errorPassword${passwordError === 'length' ? 'Length' : 'Number'}`));
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'));
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
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <ReceiptText size={40} strokeWidth={1.5} className="auth-card__icon" />
          <h1 className="auth-card__title">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h1>
          <p className="auth-card__subtitle">
            {mode === 'login'
              ? t('auth.signInSubtitle')
              : t('auth.registerSubtitle')}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="auth-email">
              {t('auth.email')}
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
              {t('auth.password')}
            </label>
            <input
              className="auth-form__input"
              id="auth-password"
              type="password"
              placeholder={t('auth.passwordHint')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={submitting}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="auth-confirm">
                {t('auth.confirmPassword')}
              </label>
              <input
                className="auth-form__input"
                id="auth-confirm"
                type="password"
                placeholder={t('auth.confirmHint')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>
          )}

          {error && (
            <p className="auth-form__error" role="alert">
              <AlertTriangle size={16} strokeWidth={1.5} />
              {error}
            </p>
          )}

          <button
            className="auth-form__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="auth-form__submit-spinner" />
                {mode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount')}
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} strokeWidth={1.5} />
                {t('auth.signIn')}
              </>
            ) : (
              <>
                <UserPlus size={16} strokeWidth={1.5} />
                {t('auth.register')}
              </>
            )}
          </button>
        </form>

        <p className="auth-card__toggle">
          {mode === 'login' ? (
            <>
              {t('auth.noAccount')}{' '}
              <button className="auth-card__toggle-btn" onClick={toggleMode}>
                {t('auth.registerLink')}
              </button>
            </>
          ) : (
            <>
              {t('auth.hasAccount')}{' '}
              <button className="auth-card__toggle-btn" onClick={toggleMode}>
                {t('auth.signInLink')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
