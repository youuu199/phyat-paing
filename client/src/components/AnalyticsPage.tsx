import SpendingOverview from './SpendingOverview';
import MonthlyTrendChart from './MonthlyTrendChart';
import UpcomingBills from './UpcomingBills';
import ErrorBoundary from './ErrorBoundary';

export default function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <div className="analytics-page__grid">
        <ErrorBoundary>
          <SpendingOverview />
        </ErrorBoundary>
        <ErrorBoundary>
          <MonthlyTrendChart />
        </ErrorBoundary>
      </div>
      <div className="analytics-page__upcoming">
        <ErrorBoundary>
          <UpcomingBills />
        </ErrorBoundary>
      </div>
    </div>
  );
}
