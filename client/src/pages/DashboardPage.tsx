import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Upload,
  Receipt,
  Wallet,
  Clock,
  CalendarClock,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  ShoppingBag,
  X,
  AlertTriangle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { onBillUpload } from '../components/UploadContext';
import { type Bill } from '../types';
import { MetricCardSkeleton, BillRowSkeleton } from '../components/ui/Skeleton';
import ImageLightbox from '../components/ui/ImageLightbox';
import useBreakpoint from '../hooks/useBreakpoint';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electricity: Zap,
  Water: Droplets,
  Internet: Wifi,
  Phone: Smartphone,
  Shopping: ShoppingBag,
};

const CATEGORY_BG: Record<string, string> = {
  Electricity: 'bg-cat-electricity',
  Water: 'bg-cat-water',
  Internet: 'bg-cat-internet',
  Phone: 'bg-cat-phone',
  Shopping: 'bg-cat-shopping',
};

function MetricCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:p-5 bg-bg-card rounded-xl border border-border flex-1 min-w-0">
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${iconColor}`} />
      </div>
      <span className="text-[11px] sm:text-xs text-text-secondary truncate">{label}</span>
      <span className="font-heading text-lg sm:text-[22px] font-bold text-text-primary truncate">
        {value}
      </span>
    </div>
  );
}

function BillRow({ bill, onImageClick, onTogglePaid, formatCurrency }: { bill: Bill; onImageClick?: (src: string, alt: string) => void; onTogglePaid?: (id: string) => void; formatCurrency: (amount: number) => string }) {
  const Icon = CATEGORY_ICONS[bill.category] || Receipt;
  const colorClass = CATEGORY_BG[bill.category] || 'bg-cat-other';

  return (
    <div className="flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 h-auto sm:h-[72px] py-3 sm:py-0 bg-bg-card rounded-xl border border-border">
      {bill.imageUrl ? (
        <img
          src={bill.imageUrl}
          alt={bill.title}
          onClick={() => onImageClick?.(bill.imageUrl, bill.title)}
          className="w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-lg sm:rounded-[10px] object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        />
      ) : (
        <div
          className={`w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-lg sm:rounded-[10px] flex items-center justify-center ${colorClass}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-text-primary truncate">
          {bill.title}
        </span>
        <span className="text-xs text-text-secondary">
          {bill.category}
          {bill.dueDate &&
            ` · ${new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-sm font-semibold text-text-primary">
          {formatCurrency(bill.amount)}
        </span>
        <button
          onClick={() => onTogglePaid?.(bill._id)}
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
            bill.isPaid
              ? 'bg-emerald-50 text-success hover:bg-emerald-100'
              : 'bg-amber-50 text-warning hover:bg-amber-100 cursor-pointer'
          }`}
        >
          {bill.isPaid ? 'Paid ✓' : 'Click to Pay'}
        </button>
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#F59E0B',
  Water: '#3B82F6',
  Internet: '#8B5CF6',
  Phone: '#10B981',
  Shopping: '#EC4899',
};

export default function DashboardPage() {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const { format: formatCurrency } = useCurrency();
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Budget alerts
  const [budgetAlerts, setBudgetAlerts] = useState<{
    enabled: boolean;
    monthlyLimit: number;
    categoryLimits: Record<string, number>;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const fetchBills = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/bills?limit=20&skip=0');
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || data || []);
        setHasMore(data.hasMore || false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Fetch budget alerts settings
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/v1/users/me');
        if (res.ok) {
          const data = await res.json();
          setBudgetAlerts(data.budgetAlerts || null);
        }
      } catch {
        // silently fail
      }
    })();
  }, [apiFetch]);

  // Fetch current month spending for dashboard hero
  useEffect(() => {
    (async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const res = await apiFetch(`/api/v1/bills?year=${year}&month=${month}`);
        if (res.ok) {
          const data = await res.json();
          const monthBills = data.bills || data || [];
          setMonthlyTotal(monthBills.reduce((sum: number, b: Bill) => sum + b.amount, 0));
        }
      } catch { /* silently fail */ }
    })();
  }, [apiFetch]);

  const togglePaid = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/bills/${id}/payment`, { method: 'PATCH' });
      if (res.ok) {
        setBills((prev) =>
          prev.map((b) =>
            b._id === id ? { ...b, isPaid: !b.isPaid, paidAt: !b.isPaid ? new Date().toISOString() : undefined } : b
          )
        );
      }
    } catch {
      // silently fail
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Re-fetch bills when a new upload completes
  useEffect(() => {
    return onBillUpload(() => fetchBills());
  }, [fetchBills]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await apiFetch(`/api/v1/bills?limit=20&skip=${bills.length}`);
      if (res.ok) {
        const data = await res.json();
        setBills((prev) => [...prev, ...(data.bills || [])]);
        setHasMore(data.hasMore || false);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeTab === 'All' || b.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidCount = bills.filter((b) => !b.isPaid).length;
  const upcomingCount = bills.filter((b) => {
    if (!b.dueDate || b.isPaid) return false;
    const due = new Date(b.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const categories = [
    'All',
    'Electricity',
    'Water',
    'Internet',
    'Phone',
    'Shopping',
  ];

  const upcomingBills = bills
    .filter((b) => {
      if (b.isPaid || !b.dueDate) return false;
      const due = new Date(b.dueDate);
      const now = new Date();
      const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categoryBreakdown = bills.reduce(
    (acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + b.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(categoryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 gap-5 sm:gap-7">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <span className="text-[12px] sm:text-[13px] text-text-secondary truncate">{today}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile: search icon that expands. Desktop: inline search */}
          {isMobile ? (
            <>
              {searchOpen ? (
                <div className="flex items-center gap-2 h-10 px-3 bg-bg-card rounded-lg border border-border">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none w-32"
                    autoFocus
                  />
                  <button onClick={() => { setSearchOpen(false); setSearch(''); }}>
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center"
                >
                  <Search className="w-[18px] h-[18px] text-text-primary" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 h-10 px-3.5 bg-bg-card rounded-lg border border-border w-[260px]">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search bills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none flex-1"
              />
            </div>
          )}

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center"
            >
              <Bell className="w-[18px] h-[18px] text-text-primary" />
              {upcomingBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {upcomingBills.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-[300px] sm:w-[320px] bg-bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-heading text-sm font-semibold text-text-primary">
                    Notifications
                  </span>
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {upcomingBills.length === 0 ? (
                    <div className="p-6 text-center text-sm text-text-muted">
                      No upcoming bills
                    </div>
                  ) : (
                    upcomingBills.map((bill) => {
                      const due = new Date(bill.dueDate!);
                      const now = new Date();
                      const diffDays = Math.ceil(
                        (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const dueText =
                        diffDays === 0
                          ? 'Due today'
                          : diffDays === 1
                            ? 'Due tomorrow'
                            : `Due in ${diffDays} days`;
                      return (
                        <div
                          key={bill._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[13px] font-medium text-text-primary truncate">
                              {bill.title}
                            </span>
                            <span className="text-[11px] text-text-secondary">
                              {dueText}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-medium text-text-primary">
                            {formatCurrency(bill.amount)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop: inline upload button. Mobile: hidden (FAB below) */}
          {!isMobile && (
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 h-10 px-4 bg-primary rounded-lg"
            >
              <Upload className="w-4 h-4 text-white" />
              <span className="text-[13px] font-semibold text-white">
                Upload Bill
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Budget Alerts */}
      {!loading && budgetAlerts?.enabled && (() => {
        const alerts: Array<{ message: string; type: 'warning' | 'danger'; detail: string }> = [];

        // Check monthly limit
        if (budgetAlerts.monthlyLimit > 0 && totalSpent > budgetAlerts.monthlyLimit) {
          const pct = Math.round((totalSpent / budgetAlerts.monthlyLimit) * 100);
          alerts.push({
            message: `Monthly budget exceeded`,
            type: 'danger',
            detail: `You've spent ${formatCurrency(totalSpent)} of ${formatCurrency(budgetAlerts.monthlyLimit)} (${pct}%)`,
          });
        } else if (budgetAlerts.monthlyLimit > 0) {
          const pct = Math.round((totalSpent / budgetAlerts.monthlyLimit) * 100);
          if (pct >= 80) {
            alerts.push({
              message: `Monthly budget warning`,
              type: 'warning',
              detail: `You've spent ${formatCurrency(totalSpent)} of ${formatCurrency(budgetAlerts.monthlyLimit)} (${pct}%)`,
            });
          }
        }

        // Check category limits
        for (const [cat, limit] of Object.entries(budgetAlerts.categoryLimits || {})) {
          if (limit > 0 && categoryBreakdown[cat] && categoryBreakdown[cat] > limit) {
            const pct = Math.round((categoryBreakdown[cat] / limit) * 100);
            alerts.push({
              message: `${cat} budget exceeded`,
              type: 'danger',
              detail: `Spent ${formatCurrency(categoryBreakdown[cat])} of ${formatCurrency(limit)} (${pct}%)`,
            });
          }
        }

        if (alerts.length === 0) return null;

        return (
          <div className="flex flex-col gap-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  alert.type === 'danger'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 ${
                    alert.type === 'danger' ? 'text-danger' : 'text-warning'
                  }`}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-text-primary">{alert.message}</span>
                  <span className="text-xs text-text-secondary">{alert.detail}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Metric Cards — 2x2 on mobile, 4 in row on tablet+ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              icon={Receipt}
              label="Total Bills"
              value={String(bills.length)}
              iconBg="bg-indigo-50"
              iconColor="text-primary"
            />
            <MetricCard
              icon={Wallet}
              label="This Month"
              value={formatCurrency(monthlyTotal)}
              iconBg="bg-emerald-50"
              iconColor="text-success"
            />
            <MetricCard
              icon={Clock}
              label="Unpaid Bills"
              value={String(unpaidCount)}
              iconBg="bg-amber-50"
              iconColor="text-warning"
            />
            <MetricCard
              icon={CalendarClock}
              label="Upcoming"
              value={String(upcomingCount)}
              iconBg="bg-red-50"
              iconColor="text-danger"
            />
          </>
        )}
      </div>

      {/* Content Row — stacked on mobile, side-by-side on tablet+ */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 flex-1">
        {/* Bill List */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Category Tabs — horizontal scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 sm:px-3.5 h-9 sm:h-[34px] rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === cat
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-bg-card border border-border text-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Row */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] sm:text-[13px] text-text-secondary">
              {loading ? 'Loading...' : `Showing ${filteredBills.length} bills`}
            </span>
          </div>

          {/* Bills */}
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {loading ? (
              <>
                <BillRowSkeleton />
                <BillRowSkeleton />
                <BillRowSkeleton />
                <BillRowSkeleton />
                <BillRowSkeleton />
                <BillRowSkeleton />
              </>
            ) : filteredBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <Receipt className="w-10 h-10 mb-3" />
                <span className="text-sm">No bills found</span>
              </div>
            ) : (
              filteredBills.map((bill) => (
                <BillRow
                  key={bill._id}
                  bill={bill}
                  onImageClick={(src, alt) => setLightboxImage({ src, alt })}
                  onTogglePaid={togglePaid}
                  formatCurrency={formatCurrency}
                />
              ))
            )}

            {/* Load More */}
            {hasMore && filteredBills.length > 0 && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-medium text-primary hover:bg-bg-card rounded-lg border border-border transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar — hidden on mobile (chart shown below), visible on tablet+ */}
        <div className="hidden sm:flex w-full sm:w-[280px] lg:w-[340px] flex-col gap-5 shrink-0">
          {/* Spending Overview */}
          <div className="bg-bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading text-base font-semibold text-text-primary mb-4">
              Spending Overview
            </h3>
            {loading ? (
              <div className="flex flex-col gap-3">
                <div className="w-[200px] h-[200px] mx-auto bg-gray-200 rounded-full animate-pulse" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse flex-1" />
                  </div>
                ))}
              </div>
            ) : chartData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] || '#6B7280'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2.5 w-full mt-4">
                  {chartData.map((cat) => {
                    const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                    return (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#6B7280' }}
                        />
                        <span className="text-xs text-text-secondary flex-1">{cat.name}</span>
                        <span className="text-xs font-medium text-text-primary">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-text-secondary text-center py-8">
                No spending data
              </div>
            )}
          </div>
        </div>

        {/* Mobile: chart below bills */}
        {isMobile && !loading && chartData.length > 0 && (
          <div className="bg-bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading text-base font-semibold text-text-primary mb-4">
              Spending Overview
            </h3>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || '#6B7280'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5 w-full mt-4">
                {chartData.map((cat) => {
                  const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#6B7280' }}
                      />
                      <span className="text-xs text-text-secondary flex-1">{cat.name}</span>
                      <span className="text-xs font-medium text-text-primary">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Floating Action Button for upload */}
      {isMobile && (
        <button
          onClick={() => navigate('/upload')}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center"
        >
          <Upload className="w-6 h-6" />
        </button>
      )}

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
