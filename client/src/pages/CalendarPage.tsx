import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  ShoppingBag,
  Receipt,
  X,
  CircleCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { type Bill } from '../types';
import { CalendarSkeleton } from '../components/ui/Skeleton';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electricity: Zap,
  Water: Droplets,
  Internet: Wifi,
  Phone: Smartphone,
  Shopping: ShoppingBag,
  Other: Receipt,
};

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#F59E0B',
  Water: '#3B82F6',
  Internet: '#8B5CF6',
  Phone: '#10B981',
  Shopping: '#EC4899',
  Other: '#6B7280',
};

function DayBillsPanel({
  bills,
  date,
  onClose,
  onTogglePaid,
  formatCurrency,
}: {
  bills: Bill[];
  date: string;
  onClose: () => void;
  onTogglePaid: (id: string) => void;
  formatCurrency: (amount: number) => string;
}) {
  const dateObj = new Date(date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const dayLabel = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-bg-card rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">{dayName}</span>
            <h2 className="font-heading text-lg font-semibold text-text-primary">{dayLabel}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="p-5">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-text-muted">
              <Receipt className="w-8 h-8 mb-2" />
              <span className="text-sm">No bills for this day</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {bills.map((bill) => {
                const Icon = CATEGORY_ICONS[bill.category] || Receipt;
                const color = CATEGORY_COLORS[bill.category] || '#6B7280';
                const isOverdue = !bill.isPaid && bill.dueDate && new Date(bill.dueDate) < new Date();

                return (
                  <div
                    key={bill._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isOverdue ? 'border-red-200 bg-red-50/50' : 'border-border bg-bg'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-text-primary truncate">
                        {bill.title}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {bill.category}
                        {!bill.dueDate && <span className="text-text-muted"> · created this day</span>}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-sm font-semibold text-text-primary">
                        {formatCurrency(bill.amount)}
                      </span>
                      <button
                        onClick={() => onTogglePaid(bill._id)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                          bill.isPaid
                            ? 'bg-emerald-50 text-success'
                            : isOverdue
                              ? 'bg-red-50 text-danger cursor-pointer hover:bg-red-100'
                              : 'bg-amber-50 text-warning cursor-pointer hover:bg-amber-100'
                        }`}
                      >
                        {bill.isPaid ? 'Paid ✓' : isOverdue ? 'Overdue' : 'Unpaid'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { apiFetch } = useAuth();
  const { format: formatCurrency } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/bills');
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      bills: Bill[];
      hasOverdue: boolean;
    }[] = [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        bills: [],
        hasOverdue: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBills = bills.filter((b) => {
        // Use dueDate if set, otherwise fall back to createdAt
        const refDate = b.dueDate || b.createdAt;
        if (!refDate) return false;
        return refDate.startsWith(dateStr);
      });
      const hasOverdue = dayBills.some(
        (b) => !b.isPaid && b.dueDate && new Date(b.dueDate) < new Date()
      );
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        bills: dayBills,
        hasOverdue,
      });
    }

    // Fill remaining rows
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        bills: [],
        hasOverdue: false,
      });
    }

    return days;
  }, [year, month, firstDay, daysInMonth, daysInPrevMonth, bills]);

  // Selected day bills
  const selectedDayBills = useMemo(() => {
    if (!selectedDay) return [];
    return bills.filter((b) => {
      const refDate = b.dueDate || b.createdAt;
      return refDate && refDate.startsWith(selectedDay);
    });
  }, [selectedDay, bills]);

  // Month stats
  const monthBills = bills.filter((b) => {
    const refDate = b.dueDate || b.createdAt;
    if (!refDate) return false;
    const d = new Date(refDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthTotal = monthBills.reduce((sum, b) => sum + b.amount, 0);
  const monthPaid = monthBills.filter((b) => b.isPaid).length;
  const monthUnpaid = monthBills.filter((b) => !b.isPaid).length;
  const monthOverdue = monthBills.filter(
    (b) => !b.isPaid && b.dueDate && new Date(b.dueDate) < new Date()
  ).length;

  // Upcoming unpaid bills (next 30 days)
  const upcomingBills = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return bills
      .filter((b) => {
        if (b.isPaid || !b.dueDate) return false;
        const due = new Date(b.dueDate);
        return due >= now && due <= in30Days;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [bills]);

  return (
    <div className="flex flex-col p-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Calendar
          </h1>
          <span className="font-heading text-lg text-text-secondary font-medium">
            {monthName}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-bg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-bg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="h-8 px-3 bg-primary rounded-md text-xs font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Calendar Grid */}
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden flex-1">
            {/* Week Header */}
            <div className="flex bg-bg">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="flex-1 h-10 flex items-center justify-center text-xs font-semibold text-text-muted"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  onClick={() => d.isCurrentMonth && setSelectedDay(d.dateStr)}
                  className={`min-h-[88px] p-1.5 border-b border-r border-border transition-colors ${
                    d.isCurrentMonth
                      ? selectedDay === d.dateStr
                        ? 'bg-primary/5 ring-1 ring-primary/20 cursor-pointer'
                        : 'bg-bg-card hover:bg-bg cursor-pointer'
                      : 'bg-bg'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      d.isToday
                        ? 'bg-primary text-white font-semibold'
                        : d.isCurrentMonth
                          ? 'text-text-primary'
                          : 'text-text-muted'
                    }`}
                  >
                    {d.day}
                  </div>

                  {/* Bill chips */}
                  {d.bills.length > 0 && d.isCurrentMonth && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {d.bills.slice(0, 2).map((b, j) => {
                        const color = CATEGORY_COLORS[b.category] || '#6B7280';
                        const isOverdue = !b.isPaid && b.dueDate && new Date(b.dueDate) < new Date();
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-medium truncate leading-tight ${
                              isOverdue
                                ? 'bg-red-50 text-red-700'
                                : b.isPaid
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-bg text-text-secondary'
                            }`}
                            style={!isOverdue && !b.isPaid ? { borderLeft: `2px solid ${color}` } : undefined}
                          >
                            {b.title.length > 10 ? b.title.slice(0, 10) + '…' : b.title}
                          </div>
                        );
                      })}
                      {d.bills.length > 2 && (
                        <span className="text-[9px] text-text-muted px-1">
                          +{d.bills.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Dots for non-current-month days */}
                  {d.bills.length > 0 && !d.isCurrentMonth && (
                    <div className="flex gap-1 mt-1 justify-center">
                      {d.bills.slice(0, 3).map((b, j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[b.category] || '#6B7280' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Sidebar */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
          {/* Month Summary */}
          <div className="bg-bg-card rounded-xl border border-border p-[18px] flex flex-col gap-3">
            <h3 className="font-heading text-[15px] font-semibold text-text-primary">
              {monthName}
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Total Amount</span>
                <span className="font-mono text-sm font-bold text-text-primary">{formatCurrency(monthTotal)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-success" />
                  <span className="text-[13px] text-text-secondary">Paid</span>
                </div>
                <span className="text-sm font-semibold text-success">{monthPaid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-warning" />
                  <span className="text-[13px] text-text-secondary">Unpaid</span>
                </div>
                <span className="text-sm font-semibold text-warning">{monthUnpaid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                  <span className="text-[13px] text-text-secondary">Overdue</span>
                </div>
                <span className="text-sm font-semibold text-danger">{monthOverdue}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="bg-bg-card rounded-xl border border-border p-[18px] flex flex-col gap-3.5">
            <h3 className="font-heading text-[15px] font-semibold text-text-primary">
              Upcoming Bills
            </h3>
            {upcomingBills.length === 0 ? (
              <span className="text-xs text-text-muted">No upcoming bills</span>
            ) : (
              upcomingBills.map((bill) => {
                const Icon = CATEGORY_ICONS[bill.category] || Receipt;
                const color = CATEGORY_COLORS[bill.category] || '#6B7280';
                const dueDate = new Date(bill.dueDate!);
                const now = new Date();
                const diffDays = Math.ceil(
                  (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const dueText =
                  diffDays === 0
                    ? 'Today'
                    : diffDays === 1
                      ? 'Tomorrow'
                      : `In ${diffDays} days`;

                return (
                  <div
                    key={bill._id}
                    className="flex items-center gap-2.5 p-2.5 bg-bg rounded-lg"
                  >
                    <div
                      className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
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
      </div>

      {/* Day Bills Panel */}
      {selectedDay && (
        <DayBillsPanel
          bills={selectedDayBills}
          date={selectedDay}
          onClose={() => setSelectedDay(null)}
          onTogglePaid={togglePaid}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
