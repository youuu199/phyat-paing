import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthContext';
import type { TrendEntry } from '../types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyTrendChart() {
  const [trends, setTrends] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiFetch } = useAuth();

  const fetchTrends = useCallback(async () => {
    try {
      const res = await apiFetch('/api/bills/trends?months=12');
      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  if (loading || trends.length === 0) {
    return null;
  }

  const chartData = trends.map((t) => ({
    name: `${MONTH_LABELS[t.month - 1]} ${String(t.year).slice(2)}`,
    total: t.total,
    count: t.count,
  }));

  return (
    <div className="trend-chart">
      <div className="trend-chart__header">
        <h3>📈 Monthly Spending Trend</h3>
      </div>
      <div className="trend-chart__body">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--color-text-muted, #6b7280)' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-text-muted, #6b7280)' }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} MMK`, 'Spent']}
              labelStyle={{ color: 'var(--color-text, #1f2937)' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-accent, #6366f1)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-accent, #6366f1)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
