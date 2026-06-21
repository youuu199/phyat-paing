import { useState, useEffect, useCallback, useRef } from 'react';
import BillCard from './BillCard';
import CategoryTabs from './CategoryTabs';
import BillUploader from './BillUploader';
import Sidebar from './Sidebar';
import SpendingOverview from './SpendingOverview';
import MonthlyTrendChart from './MonthlyTrendChart';
import UpcomingBills from './UpcomingBills';
import { useToast } from './Toast';
import { useAuth } from './AuthContext';
import type { Bill, MonthEntry } from '../types';

const SKELETON_COUNT = 6;

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-card__image" />
      <div className="skeleton-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton skeleton-card__title" />
          <div className="skeleton skeleton-card__badge" />
        </div>
        <div className="skeleton skeleton-card__amount" />
        <div className="skeleton skeleton-card__date" />
      </div>
    </div>
  );
}

export default function BillDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [category, setCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableMonths, setAvailableMonths] = useState<MonthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();
  const { apiFetch } = useAuth();
  const initialLoadDone = useRef(false);

  const fetchBills = useCallback(async () => {
    try {
      setError(null);
      if (!initialLoadDone.current) {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (selectedYear !== null) {
        params.set('year', String(selectedYear));
        if (selectedMonth !== null) params.set('month', String(selectedMonth));
      }

      const qs = params.toString();
      const res = await apiFetch(`/api/bills${qs ? '?' + qs : ''}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch bills (${res.status})`);
      }

      const data = await res.json();
      setBills(data.bills || data); // Handle both paginated and legacy response
      initialLoadDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, selectedMonth, apiFetch]);

  const fetchMonths = useCallback(async () => {
    try {
      const res = await apiFetch('/api/bills/months');
      if (res.ok) {
        const data = await res.json();
        setAvailableMonths(data);
      }
    } catch {
      // sidebar stays empty if endpoint fails
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  const handleDateSelect = (year: number | null, month: number | null) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchBills();
      fetchMonths();
      toast('Bill deleted successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete bill';
      toast(msg, 'error');
      throw err;
    }
  };

  const handleUploadSuccess = () => {
    fetchBills();
    fetchMonths();
    toast('Bill processed and saved!', 'success');
  };

  const handleUpdate = async (id: string, updates: { title?: string; amount?: number; category?: string; dueDate?: string; isRecurring?: boolean; recurringInterval?: string }) => {
    try {
      const res = await apiFetch(`/api/bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      fetchBills();
      toast('Bill updated successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update bill';
      toast(msg, 'error');
      throw err;
    }
  };

  const handlePaymentToggle = async (id: string) => {
    try {
      const res = await apiFetch(`/api/bills/${id}/payment`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Payment toggle failed');
      fetchBills();
      toast('Payment status updated', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment';
      toast(msg, 'error');
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchBills();
  };

  // Client-side search filtering
  const filteredBills = searchQuery.trim()
    ? bills.filter((bill) =>
        bill.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bills;

  const totalSpent = filteredBills.reduce((sum, b) => sum + b.amount, 0);

  const categoryLabel =
    selectedYear !== null
      ? selectedMonth !== null
        ? new Date(selectedYear, selectedMonth - 1).toLocaleString('en', {
            month: 'long',
            year: 'numeric',
          })
        : String(selectedYear)
      : null;

  return (
    <div className="dashboard-layout">
      {/* Main content */}
      <div className="dashboard">
        <BillUploader onUploadSuccess={handleUploadSuccess} />

        {/* Analytics section */}
        <div className="dashboard__analytics">
          <SpendingOverview />
          <div className="dashboard__analytics-side">
            <MonthlyTrendChart />
            <UpcomingBills />
          </div>
        </div>

        {/* Summary row with mobile sidebar toggle */}
        <div className="summary-row">
          <div className="dashboard__summary" style={{ marginBottom: 0 }}>
            <h2>
              {category === 'All' ? 'All Bills' : category}
              {categoryLabel && (
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginLeft: 'var(--space-2)' }}>
                  · {categoryLabel}
                </span>
              )}
            </h2>
            <p className="dashboard__total">
              {!loading && (
                <>
                  {bills.length} bill{bills.length !== 1 ? 's' : ''} ·{' '}
                  <strong>{totalSpent.toLocaleString()} MMK</strong> total
                </>
              )}
            </p>
          </div>

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open date filter"
          >
            📅 Filter
          </button>
        </div>

        <CategoryTabs
          selected={category}
          onSelect={(c) => setCategory(c)}
        />

        {/* Search bar */}
        <div className="dashboard__search">
          <span className="dashboard__search-icon" aria-hidden="true">🔍</span>
          <input
            className="dashboard__search-input"
            type="text"
            placeholder="Search bills by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search bills"
          />
          {searchQuery && (
            <button
              className="dashboard__search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="dashboard__error" role="alert">
            <span className="dashboard__error-icon">⚠️</span>
            <p className="dashboard__error-message">{error}</p>
            <button className="dashboard__retry-btn" onClick={handleRetry}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="dashboard__grid">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredBills.length === 0 && (
          <div className="dashboard__empty">
            <span className="dashboard__empty-icon" aria-hidden="true">
              📭
            </span>
            <p className="dashboard__empty-text">
              {searchQuery
                ? `No bills matching "${searchQuery}"`
                : `No bills found${category !== 'All' ? ` in "${category}"` : ''}${categoryLabel ? ` for ${categoryLabel}` : ''}.`
              }
              {!searchQuery && ' Upload your first bill above!'}
            </p>
          </div>
        )}

        {/* Bill grid */}
        {!loading && !error && filteredBills.length > 0 && (
          <div className="dashboard__grid">
            {filteredBills.map((bill) => (
              <BillCard key={bill._id} bill={bill} onDelete={handleDelete} onUpdate={handleUpdate} onPaymentToggle={handlePaymentToggle} />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        months={availableMonths}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelectDate={handleDateSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
