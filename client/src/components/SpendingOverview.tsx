import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from './AuthContext';
import type { BillStats, Category, BudgetLimits } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { useBudgets } from '../hooks/useBudgets';

export default function SpendingOverview() {
  const [stats, setStats] = useState<BillStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgets, setShowBudgets] = useState(false);
  const { budgets, setBudgets } = useBudgets();
  const { apiFetch } = useAuth();
  const { t, lang } = useTranslation();

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/bills/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleBudgetChange = (category: Category, value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    setBudgets((prev) => ({ ...prev, [category]: num }));
  };

  const totalSpent = stats.reduce((sum, s) => sum + s.total, 0);

  const chartData = stats.map((s) => ({
    name: s._id,
    value: s.total,
    count: s.count,
    color: CATEGORY_COLORS[s._id as Category] || '#6b7280',
  }));

  if (loading) {
    return (
      <div className="spending-overview">
        <div className="spending-overview__header">
          <h3>📊 {t('spending.title')}</h3>
        </div>
        <div className="spending-overview__loading">
          <div className="skeleton skeleton--chart" />
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="spending-overview">
      <div className="spending-overview__header">
        <h3>📊 {t('spending.title')}</h3>
        <span className="spending-overview__total">
          {t('spending.total', { amount: totalSpent.toLocaleString() })}
        </span>
      </div>

      <div className="spending-overview__content">
        {/* Pie Chart */}
        <div className="spending-overview__chart">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${Number(value).toLocaleString()} MMK`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown with budget bars */}
        <div className="spending-overview__breakdown">
          {stats.map((s) => {
            const cat = s._id as Category;
            const budget = budgets[cat];
            const pct = budget ? Math.round((s.total / budget) * 100) : null;
            const barColor = pct !== null
              ? pct > 100 ? 'var(--color-danger, #ef4444)' : pct > 80 ? 'var(--color-warning, #f59e0b)' : 'var(--color-accent)'
              : 'var(--color-accent)';

            return (
              <div key={s._id} className="spending-overview__item">
                <div className="spending-overview__item-header">
                  <span className="spending-overview__item-icon">{CATEGORY_ICONS[cat] || '📌'}</span>
                  <span className="spending-overview__item-name">{CATEGORY_LABELS[cat]?.[lang] || s._id}</span>
                  <span className="spending-overview__item-amount">
                    {s.total.toLocaleString()} MMK
                  </span>
                  <span className="spending-overview__item-count">{t('spending.bills', { count: s.count, plural: s.count !== 1 ? 's' : '' })}</span>
                </div>
                {budget !== undefined && budget > 0 && pct !== null && (
                  <div className="budget-alert" style={{ '--bar-color': barColor } as React.CSSProperties}>
                    <div className="budget-alert__bar">
                      <div
                        className="budget-alert__fill"
                        style={{ '--bar-pct': `${Math.min(pct, 100)}%` } as React.CSSProperties}
                      />
                    </div>
                    <span className="budget-alert__label">
                      {t('spending.budgetOf', { pct, budget: budget.toLocaleString() })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget settings toggle */}
      <button
        className="spending-overview__budget-toggle"
        onClick={() => setShowBudgets(!showBudgets)}
        aria-expanded={showBudgets}
      >
        {showBudgets ? `✕ ${t('spending.close')}` : `⚙️ ${t('spending.setBudgets')}`}
      </button>

      {showBudgets && (
        <div className="budget-settings">
          <p className="budget-settings__hint">{t('spending.budgetHint')}</p>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="budget-settings__row">
              <span className="budget-settings__icon">{CATEGORY_ICONS[cat]}</span>
              <label className="budget-settings__label">{CATEGORY_LABELS[cat]?.[lang] || cat}</label>
              <input
                className="budget-settings__input"
                type="number"
                min="0"
                placeholder="0"
                value={budgets[cat] ?? ''}
                onChange={(e) => handleBudgetChange(cat, e.target.value)}
                aria-label={t('spending.budgetOf', { pct: '', budget: '' })}
              />
              <span className="budget-settings__unit">MMK</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
