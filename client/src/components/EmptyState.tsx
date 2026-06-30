interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'error';
}

export function EmptyState({ icon, title, description, actionLabel, onAction, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--${variant}`}>
      <div className="empty-state__icon-wrapper">
        <span className="empty-state__icon">{icon}</span>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function NoBillsState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon="📄"
      title="No bills yet"
      description="Upload your first bill or receipt to start tracking your expenses. We'll extract the details automatically."
      actionLabel="Upload a Bill"
      onAction={onUpload}
    />
  );
}

export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title={`No results for "${query}"`}
      description="We couldn't find any bills matching your search. Try different keywords or clear the search."
      actionLabel="Clear Search"
      onAction={onClear}
      variant="search"
    />
  );
}

export function NoAnalyticsState({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <EmptyState
      icon="📊"
      title="No data yet"
      description="Upload some bills first to see your spending breakdown, trends, and upcoming payments."
      actionLabel="Go to Dashboard"
      onAction={onGoToDashboard}
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      description="We couldn't load this content. Please check your connection and try again."
      actionLabel="Try Again"
      onAction={onRetry}
      variant="error"
    />
  );
}
