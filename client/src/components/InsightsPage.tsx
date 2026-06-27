import SpendingOverview from './SpendingOverview';
import MonthlyTrendChart from './MonthlyTrendChart';
import UpcomingBills from './UpcomingBills';
import ErrorBoundary from './ErrorBoundary';

export default function InsightsPage() {
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
