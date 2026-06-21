import type { Bill } from '../types';

interface RecurringBadgeProps {
  bill: Bill;
}

export default function RecurringBadge({ bill }: RecurringBadgeProps) {
  if (!bill.isRecurring || !bill.recurringInterval) return null;

  const labels: Record<string, string> = {
    monthly: '🔄 Monthly',
    quarterly: '🔄 Quarterly',
    yearly: '🔄 Yearly',
  };

  return (
    <span className="recurring-badge" title={`Recurring ${bill.recurringInterval}`}>
      {labels[bill.recurringInterval] || '🔄'}
    </span>
  );
}
