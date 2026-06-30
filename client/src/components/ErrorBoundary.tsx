import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorEmptyState } from './EmptyState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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

      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <ErrorEmptyState onRetry={this.handleReset} />
          {this.state.error && (
            <details className="error-boundary__details">
              <summary>Error details</summary>
              <pre className="error-boundary__stack">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
