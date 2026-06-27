import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { Bill } from '../types';
import { CATEGORY_ICONS } from '../types';
import { useTranslation } from '../i18n/useTranslation';

export default function UpcomingBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiFetch } = useAuth();
  const { t } = useTranslation();

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await apiFetch('/api/bills/upcoming');
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  if (loading || bills.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="upcoming-bills">
      <div className="upcoming-bills__header">
        <h3>⏰ {t('upcoming.title')}</h3>
        <span className="upcoming-bills__count">{t('upcoming.bills', { count: bills.length, plural: bills.length !== 1 ? 's' : '' })}</span>
      </div>
      <div className="upcoming-bills__list">
        {bills.map((bill) => {
          const dueDate = new Date(bill.dueDate!);
          dueDate.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysLeft < 0;
          const isToday = daysLeft === 0;

          return (
            <div
              key={bill._id}
              className={`upcoming-bills__item${isOverdue ? ' upcoming-bills__item--overdue' : ''}${isToday ? ' upcoming-bills__item--today' : ''}`}
            >
              <span className="upcoming-bills__icon">
                {isOverdue ? '🚨' : isToday ? '📅' : CATEGORY_ICONS[bill.category as keyof typeof CATEGORY_ICONS] || '📌'}
              </span>
              <div className="upcoming-bills__info">
                <span className="upcoming-bills__title">{bill.title}</span>
                <span className="upcoming-bills__meta">
                  {bill.amount.toLocaleString()} MMK · {bill.category}
                </span>
              </div>
              <span className="upcoming-bills__days">
                {isOverdue
                  ? t('upcoming.overdue', { days: Math.abs(daysLeft) })
                  : isToday
                  ? t('upcoming.today')
                  : t('upcoming.daysLeft', { days: daysLeft })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
