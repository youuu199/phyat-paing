import { useState, useEffect } from 'react';
import SpendingOverview from './SpendingOverview';
import MonthlyTrendChart from './MonthlyTrendChart';
import UpcomingBills from './UpcomingBills';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from './AuthContext';
import { NoAnalyticsState } from './EmptyState';

interface InsightsPageProps {
  onNavigate?: (page: string) => void;
}

export default function InsightsPage({ onNavigate }: InsightsPageProps) {
  const [hasBills, setHasBills] = useState<boolean | null>(null);
  const { apiFetch } = useAuth();

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/bills?limit=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) {
          setHasBills(Boolean(d?.bills?.length || d?.length));
        }
      })
      .catch(() => {
        if (!cancelled) setHasBills(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiFetch]);

  if (hasBills === null) {
    return (
      <div className="insights-page">
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (!hasBills) {
    return (
      <div className="insights-page">
        <NoAnalyticsState
          onGoToDashboard={() =>
            onNavigate ? onNavigate('dashboard') : (window.location.href = '/')
          }
        />
      </div>
    );
  }

  return (
    <div className="insights-page">
      <div className="insights-page__grid">
        <ErrorBoundary>
          <SpendingOverview />
        </ErrorBoundary>
        <ErrorBoundary>
          <MonthlyTrendChart />
        </ErrorBoundary>
      </div>
      <div className="insights-page__upcoming">
        <ErrorBoundary>
          <UpcomingBills />
        </ErrorBoundary>
      </div>
    </div>
  );
}
