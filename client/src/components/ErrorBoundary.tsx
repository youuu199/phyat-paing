import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="error-boundary" role="alert">
      <div className="error-boundary__content">
        <span className="error-boundary__icon" aria-hidden="true">💥</span>
        <h2 className="error-boundary__title">{t('error.somethingWentWrong')}</h2>
        <p className="error-boundary__message">
          {t('error.unexpected')}
        </p>
        {error && (
          <details className="error-boundary__details" open>
            <summary>{t('error.details')}</summary>
            <pre className="error-boundary__stack">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}
        <div className="error-boundary__actions">
          <button
            className="error-boundary__button"
            onClick={onReset}
          >
            🔄 {t('error.tryAgain')}
          </button>
          <button
            className="error-boundary__button error-boundary__button--secondary"
            onClick={() => window.location.reload()}
          >
            ↻ {t('error.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Boundary component that catches React rendering errors.
 *
 * Without this, a single component crash white-screens the entire app.
 * With it, we can show a friendly error message and a "Try Again" button.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <BillDashboard />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with translations
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
