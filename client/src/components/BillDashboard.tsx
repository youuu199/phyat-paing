import { useState, useEffect, useCallback } from 'react';
import BillCard from './BillCard';
import CategoryTabs from './CategoryTabs';
import BillUploader from './BillUploader';
import Sidebar from './Sidebar';

interface Bill {
  _id: string;
  title: string;
  amount: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

interface MonthEntry {
  year: number;
  month: number;
  label: string;
  count: number;
}

export default function BillDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [category, setCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableMonths, setAvailableMonths] = useState<MonthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (selectedYear !== null) {
        params.set('year', String(selectedYear));
        if (selectedMonth !== null) params.set('month', String(selectedMonth));
      }

      const qs = params.toString();
      const res = await fetch(`/api/bills${qs ? '?' + qs : ''}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch bills (${res.status})`);
      }

      const data = await res.json();
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, selectedMonth]);

  // Fetch available months (only on mount — doesn't change with filters)
  const fetchMonths = useCallback(async () => {
    try {
      const res = await fetch('/api/bills/months');
      if (res.ok) {
        const data = await res.json();
        setAvailableMonths(data);
      }
    } catch {
      // sidebar just stays empty if the endpoint fails
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  const handleDateSelect = (year: number | null, month: number | null) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setLoading(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      // Refresh both bills and month list (counts may change)
      fetchBills();
      fetchMonths();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete bill');
    }
  };

  const handleUploadSuccess = () => {
    fetchBills();
    fetchMonths();
  };

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="dashboard-layout">
      {/* Main content */}
      <div className="dashboard">
        <BillUploader onUploadSuccess={handleUploadSuccess} />

        <div className="dashboard__summary">
          <h2>
            {category === 'All' ? 'All Bills' : category}
          </h2>
          <p className="dashboard__total">
            {bills.length} bill{bills.length !== 1 ? 's' : ''} ·{' '}
            <strong>{totalSpent.toLocaleString()} MMK</strong> total
          </p>
        </div>

        <CategoryTabs selected={category} onSelect={(c) => { setCategory(c); setLoading(true); }} />

        {loading && <p className="dashboard__status">Loading bills...</p>}

        {error && <p className="dashboard__error">Error: {error}</p>}

        {!loading && !error && bills.length === 0 && (
          <p className="dashboard__empty">
            No bills found{category !== 'All' ? ` in "${category}"` : ''}
            {selectedYear !== null
              ? selectedMonth !== null
                ? ` for ${new Date(selectedYear, selectedMonth - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}`
                : ` in ${selectedYear}`
              : ''}.
            Upload your first bill above!
          </p>
        )}

        <div className="dashboard__grid">
          {bills.map((bill) => (
            <BillCard key={bill._id} bill={bill} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <Sidebar
        months={availableMonths}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelectDate={handleDateSelect}
      />
    </div>
  );
}
