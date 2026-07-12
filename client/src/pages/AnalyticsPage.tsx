import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet,
  Calculator,
  CircleCheck,
  TriangleAlert,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { type Bill } from '../types';
import { MetricCardSkeleton } from '../components/ui/Skeleton';

interface TrendEntry {
  year: number;
  month: number;
  total: number;
  count: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#F59E0B',
  Water: '#3B82F6',
  Internet: '#8B5CF6',
  Phone: '#10B981',
  Shopping: '#EC4899',
  Other: '#6B7280',
};

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  up,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  up: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-[18px] bg-bg-card rounded-xl border border-border flex-1">
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
        </div>
        <div
          className={`flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium ${
            up ? 'bg-emerald-50 text-success' : 'bg-amber-50 text-warning'
          }`}
        >
          {up ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
      <span className="font-heading text-2xl font-bold text-text-primary">
        {value}
      </span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

function getQuarterMonths(_year: number, month: number) {
  const q = Math.floor((month - 1) / 3);
  return [q * 3 + 1, q * 3 + 2, q * 3 + 3];
}

function getPeriodParams(period: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  switch (period) {
    case 'Month':
      return { year, month };
    case 'Quarter':
      return { year, quarterMonths: getQuarterMonths(year, month) };
    case 'Year':
      return { year };
    case 'Week': {
      const day = now.getUTCDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const weekStart = new Date(Date.UTC(year, month - 1, now.getUTCDate() + mondayOffset));
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      return { weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() };
    }
    default:
      return {};
  }
}

function getPrevPeriodParams(period: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  switch (period) {
    case 'Month':
      return month === 1
        ? { year: year - 1, month: 12 }
        : { year, month: month - 1 };
    case 'Quarter': {
      const q = Math.floor((month - 1) / 3);
      const prevQ = q - 1;
      if (prevQ < 0) return { year: year - 1, quarterMonths: [10, 11, 12] };
      return { year, quarterMonths: [prevQ * 3 + 1, prevQ * 3 + 2, prevQ * 3 + 3] };
    }
    case 'Year':
      return { year: year - 1 };
    case 'Week': {
      const day = now.getUTCDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const thisMonday = new Date(Date.UTC(year, month - 1, now.getUTCDate() + mondayOffset));
      const prevMonday = new Date(thisMonday.getTime() - 7 * 86400000);
      return { weekStart: prevMonday.toISOString(), weekEnd: thisMonday.toISOString() };
    }
    default:
      return {};
  }
}

export default function AnalyticsPage() {
  const { apiFetch } = useAuth();
  const { format: formatCurrency } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Month');
  const [trends, setTrends] = useState<TrendEntry[]>([]);

  // Fetch bills for selected period + trends
  const fetchBills = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const params = getPeriodParams(p);
      let url = '/api/v1/bills';
      const parts: string[] = [];
      if ('year' in params && params.year) parts.push(`year=${params.year}`);
      if ('month' in params && params.month) parts.push(`month=${params.month}`);
      if (parts.length) url += '?' + parts.join('&');

      const [billsRes, trendsRes] = await Promise.all([
        apiFetch(url),
        apiFetch('/api/v1/bills/trends?months=12'),
      ]);

      if (billsRes.ok) {
        const data = await billsRes.json();
        let billList = data.bills || data || [];

        // For Quarter: fetch each month of the quarter and merge
        if ('quarterMonths' in params && params.quarterMonths) {
          const quarterBills = await Promise.all(
            params.quarterMonths.map(async (m) => {
              const r = await apiFetch(`/api/v1/bills?year=${params.year}&month=${m}`);
              if (r.ok) {
                const d = await r.json();
                return d.bills || d || [];
              }
              return [];
            })
          );
          billList = quarterBills.flat();
        }

        // For Week: filter client-side to the selected week
        if ('weekStart' in params && params.weekStart && 'weekEnd' in params && params.weekEnd) {
          const start = new Date(params.weekStart as string);
          const end = new Date(params.weekEnd as string);
          billList = billList.filter((b: Bill) => {
            const d = new Date(b.createdAt);
            return d >= start && d < end;
          });
        }

        setBills(billList);
      }
      if (trendsRes.ok) setTrends(await trendsRes.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Re-fetch when period changes
  useEffect(() => {
    fetchBills(period);
  }, [period, fetchBills]);

  // Metrics from fetched bills
  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const avgBill = bills.length > 0 ? Math.round(totalSpent / bills.length) : 0;
  const paidCount = bills.filter((b) => b.isPaid).length;
  const overdueCount = bills.filter((b) => {
    if (b.isPaid || !b.dueDate) return false;
    return new Date(b.dueDate) < new Date();
  }).length;

  // Previous period comparison
  const [prevBills, setPrevBills] = useState<Bill[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const params = getPrevPeriodParams(period);
        let url = '/api/v1/bills';
        const parts: string[] = [];
        if ('year' in params && params.year) parts.push(`year=${params.year}`);
        if ('month' in params && params.month) parts.push(`month=${params.month}`);
        if (parts.length) url += '?' + parts.join('&');

        if ('quarterMonths' in params && params.quarterMonths) {
          const results = await Promise.all(
            params.quarterMonths.map(async (m: number) => {
              const r = await apiFetch(`/api/v1/bills?year=${params.year}&month=${m}`);
              if (r.ok) {
                const d = await r.json();
                return d.bills || d || [];
              }
              return [];
            })
          );
          setPrevBills(results.flat());
        } else if ('weekStart' in params && params.weekStart && 'weekEnd' in params && params.weekEnd) {
          // Fetch all bills and filter to previous week
          const r = await apiFetch('/api/v1/bills');
          if (r.ok) {
            const d = await r.json();
            const allBills = d.bills || d || [];
            const start = new Date(params.weekStart as string);
            const end = new Date(params.weekEnd as string);
            setPrevBills(allBills.filter((b: Bill) => {
              const bd = new Date(b.createdAt);
              return bd >= start && bd < end;
            }));
          }
        } else {
          const r = await apiFetch(url);
          if (r.ok) {
            const d = await r.json();
            setPrevBills(d.bills || d || []);
          }
        }
      } catch {
        setPrevBills([]);
      }
    })();
  }, [period, apiFetch]);

  const prevTotalSpent = prevBills.reduce((sum, b) => sum + b.amount, 0);
  const prevAvgBill = prevBills.length > 0 ? Math.round(prevTotalSpent / prevBills.length) : 0;
  const prevPaidCount = prevBills.filter((b) => b.isPaid).length;

  function calcChange(current: number, previous: number): { text: string; up: boolean } {
    if (previous === 0) return { text: current > 0 ? '+100%' : '0%', up: current >= previous };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { text: `${pct >= 0 ? '+' : ''}${pct}%`, up: pct >= 0 };
  }

  const totalChange = calcChange(totalSpent, prevTotalSpent);
  const avgChange = calcChange(avgBill, prevAvgBill);
  const paidChange = calcChange(paidCount, prevPaidCount);

  // Period label
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const periodLabel = (() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    switch (period) {
      case 'Month':
        return `${MONTH_NAMES[month - 1]} ${year}`;
      case 'Quarter': {
        const q = Math.floor((month - 1) / 3) + 1;
        const qStart = MONTH_NAMES[(q - 1) * 3];
        const qEnd = MONTH_NAMES[(q - 1) * 3 + 2];
        return `Q${q} ${year} (${qStart}–${qEnd})`;
      }
      case 'Year':
        return `${year}`;
      case 'Week': {
        const params = getPeriodParams('Week');
        if (params.weekStart && params.weekEnd) {
          const s = new Date(params.weekStart);
          const e = new Date(new Date(params.weekEnd).getTime() - 86400000);
          return `${MONTH_NAMES[s.getUTCMonth()]} ${s.getUTCDate()} – ${MONTH_NAMES[e.getUTCMonth()]} ${e.getUTCDate()}, ${e.getUTCFullYear()}`;
        }
        return '';
      }
      default:
        return '';
    }
  })();

  // Category breakdown from current period bills
  const sortedCategories = useMemo(() => {
    const catMap = bills.reduce(
      (acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.amount;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }));
  }, [bills, totalSpent]);

  // Spending chart data from trends (monthly totals)
  const maxTrendTotal = Math.max(...trends.map((t) => t.total), 1);

  // Dynamic insights
  const topCategory = sortedCategories[0];

  return (
    <div className="flex flex-col p-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Analytics
          </h1>
          {periodLabel && (
            <span className="text-[13px] text-text-secondary">{periodLabel}</span>
          )}
        </div>
        <div className="flex bg-bg-card rounded-lg border border-border p-[3px]">
          {['Week', 'Month', 'Quarter', 'Year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`h-8 px-3.5 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex gap-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              icon={Wallet}
              label={`Total Spent (${period})`}
              value={formatCurrency(totalSpent)}
              change={totalChange.text}
              up={totalChange.up}
              iconBg="bg-emerald-50"
              iconColor="text-success"
            />
            <MetricCard
              icon={Calculator}
              label="Average Bill"
              value={formatCurrency(avgBill)}
              change={avgChange.text}
              up={avgChange.up}
              iconBg="bg-indigo-50"
              iconColor="text-primary"
            />
            <MetricCard
              icon={CircleCheck}
              label="Paid Bills"
              value={String(paidCount)}
              change={paidChange.text}
              up={paidChange.up}
              iconBg="bg-emerald-50"
              iconColor="text-success"
            />
            <MetricCard
              icon={TriangleAlert}
              label="Overdue Bills"
              value={String(overdueCount)}
              change={`${overdueCount > 0 ? '+' : ''}${overdueCount}`}
              up={false}
              iconBg="bg-amber-50"
              iconColor="text-warning"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="flex gap-5 flex-1">
        {/* Monthly Spending Chart */}
        <div className="bg-bg-card rounded-xl border border-border p-5 flex flex-col gap-4 w-[400px]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-[15px] font-semibold text-text-primary">
              Monthly Spending
            </h3>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">Loading...</div>
          ) : trends.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">No data yet</div>
          ) : (
            <div className="flex items-end gap-2 flex-1 h-[180px]">
              {trends.slice(-8).map((t) => {
                const height = maxTrendTotal > 0 ? (t.total / maxTrendTotal) * 100 : 0;
                const monthLabel = new Date(t.year, t.month - 1).toLocaleString('en', { month: 'short' });
                return (
                  <div key={`${t.year}-${t.month}`} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-mono text-text-muted">{formatCurrency(t.total)}</span>
                    <div
                      className="w-full bg-primary rounded-t-md transition-all hover:bg-primary-dark"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${monthLabel}: ${formatCurrency(t.total)} (${t.count} bills)`}
                    />
                    <span className="text-[10px] text-text-muted">{monthLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-bg-card rounded-xl border border-border p-5 flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-[15px] font-semibold text-text-primary">
              Spending by Category
            </h3>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">Loading...</div>
          ) : sortedCategories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">No data yet</div>
          ) : (
            <div className="flex flex-col gap-3.5 flex-1">
              {sortedCategories.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text-primary">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="text-[11px] text-text-muted w-8 text-right">
                        {cat.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-bg rounded-full">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${cat.pct}%`,
                        backgroundColor: CATEGORY_COLORS[cat.name] || '#6B7280',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-bg-card rounded-xl border border-border p-5 flex flex-col gap-3.5">
        <h3 className="font-heading text-[15px] font-semibold text-text-primary">
          Insights
        </h3>
        {loading ? (
          <div className="text-xs text-text-muted">Loading insights...</div>
        ) : (
          <div className="flex gap-4">
            {/* Top spending category */}
            {topCategory && (
              <div className="flex items-center gap-2.5 p-3 bg-bg rounded-lg flex-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${CATEGORY_COLORS[topCategory.name]}20` }}
                >
                  <TrendingUp className="w-[18px] h-[18px]" style={{ color: CATEGORY_COLORS[topCategory.name] || '#6B7280' }} />
                </div>
                <span className="text-xs text-text-secondary">
                  Top spending: <strong className="text-text-primary">{topCategory.name}</strong> at {formatCurrency(topCategory.amount)} ({topCategory.pct}%)
                </span>
              </div>
            )}

            {/* Overdue warning */}
            {overdueCount > 0 ? (
              <div className="flex items-center gap-2.5 p-3 bg-bg rounded-lg flex-1">
                <TriangleAlert className="w-[18px] h-[18px] text-warning" />
                <span className="text-xs text-text-secondary">
                  <strong className="text-text-primary">{overdueCount} bill{overdueCount > 1 ? 's' : ''}</strong> overdue — pay soon to avoid late fees
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-bg rounded-lg flex-1">
                <CircleCheck className="w-[18px] h-[18px] text-success" />
                <span className="text-xs text-text-secondary">
                  All bills are on track — no overdue payments
                </span>
              </div>
            )}

            {/* Payment progress */}
            <div className="flex items-center gap-2.5 p-3 bg-bg rounded-lg flex-1">
              <CircleCheck className="w-[18px] h-[18px] text-primary" />
              <span className="text-xs text-text-secondary">
                {paidCount} of {bills.length} bills paid
                {bills.length > 0 && (
                  <> — <strong className="text-primary">{Math.round((paidCount / bills.length) * 100)}%</strong> complete</>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
