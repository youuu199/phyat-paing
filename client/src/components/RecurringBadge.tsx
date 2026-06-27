import type { Bill } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface RecurringBadgeProps {
  bill: Bill;
}

export default function RecurringBadge({ bill }: RecurringBadgeProps) {
  const { t } = useTranslation();
  if (!bill.isRecurring || !bill.recurringInterval) return null;

  const labels: Record<string, string> = {
    monthly: `🔄 ${t('recurring.monthly')}`,
    quarterly: `🔄 ${t('recurring.quarterly')}`,
    yearly: `🔄 ${t('recurring.yearly')}`,
  };

  return (
    <span className="recurring-badge" title={t(`recurring.${bill.recurringInterval}`)}>
      {labels[bill.recurringInterval] || '🔄'}
    </span>
  );
}
