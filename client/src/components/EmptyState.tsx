import { EmptyState as RacineEmptyState } from '@sproutsocial/racine';

const mediaStyle: React.CSSProperties = { fontSize: '3rem' };

export function NoBillsState({ onUpload }: { onUpload: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={mediaStyle}>🧾</span>}
      headline="No bills yet"
      subtext="Upload your first bill to get started"
      primaryAction={<button onClick={onUpload}>🚀 Upload a Bill</button>}
    />
  );
}

export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={mediaStyle}>🔍</span>}
      headline={`No bills matching "${query}"`}
      subtext="Try a different search term"
      primaryAction={<button onClick={onClear}>✕ Clear Search</button>}
    />
  );
}

export function NoAnalyticsState({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={mediaStyle}>📊</span>}
      headline="No data to display"
      subtext="Upload some bills to see spending analytics"
      primaryAction={
        <button onClick={onGoToDashboard}>📋 Go to Dashboard</button>
      }
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={mediaStyle}>⚠️</span>}
      headline="Unable to load content"
      subtext="Please check your connection and try again"
      primaryAction={<button onClick={onRetry}>🔄 Try Again</button>}
    />
  );
}
