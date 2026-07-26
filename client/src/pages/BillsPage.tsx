import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  Receipt,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  ShoppingBag,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/Toast';
import { useCurrency } from '../hooks/useCurrency';
import { onBillUpload } from '../components/UploadContext';
import { type Bill } from '../types';
import { BillTableSkeleton } from '../components/ui/Skeleton';
import ImageLightbox from '../components/ui/ImageLightbox';
import useBreakpoint from '../hooks/useBreakpoint';

interface MonthEntry {
  year: number;
  month: number;
  label: string;
  count: number;
}

const CATEGORIES = ['All', 'Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electricity: Zap,
  Water: Droplets,
  Internet: Wifi,
  Phone: Smartphone,
  Shopping: ShoppingBag,
  Other: Receipt,
};

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: 'bg-cat-electricity',
  Water: 'bg-cat-water',
  Internet: 'bg-cat-internet',
  Phone: 'bg-cat-phone',
  Shopping: 'bg-cat-shopping',
  Other: 'bg-cat-other',
};

interface BillFormData {
  title: string;
  amount: string;
  category: string;
  dueDate: string;
}

const emptyForm: BillFormData = { title: '', amount: '', category: 'Electricity', dueDate: '' };

function BillFormModal({
  bill,
  onClose,
  onSave,
  onSaveWithImage,
  isMobile,
}: {
  bill?: Bill | null;
  onClose: () => void;
  onSave: (data: BillFormData) => Promise<void>;
  onSaveWithImage?: (data: BillFormData, file: File) => Promise<void>;
  isMobile: boolean;
}) {
  const [form, setForm] = useState<BillFormData>(
    bill
      ? {
          title: bill.title,
          amount: String(bill.amount),
          category: bill.category,
          dueDate: bill.dueDate ? bill.dueDate.split('T')[0] : '',
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setSaving(true);
    try {
      if (imageFile && onSaveWithImage) {
        await onSaveWithImage(form, imageFile);
      } else {
        await onSave(form);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[480px] max-h-[90vh] overflow-y-auto ${
          isMobile ? 'mx-0' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            {bill ? 'Edit Bill' : 'New Bill'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-bg">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Image Upload */}
          {bill && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-primary">Bill Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-[140px] object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-[11px]">
                    <ImageIcon className="w-3 h-3" />
                    New image selected
                  </div>
                </div>
              ) : bill.imageUrl ? (
                <div className="relative group">
                  <img
                    src={bill.imageUrl}
                    alt={bill.title}
                    className="w-full h-[140px] object-cover rounded-lg border border-border"
                  />
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-5 h-5 text-white mb-1" />
                    <span className="text-[12px] text-white font-medium">Click to replace image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-[140px] bg-bg rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-text-muted mb-2" />
                  <span className="text-[13px] text-text-muted">Click to upload bill image</span>
                  <span className="text-[11px] text-text-muted/60 mt-1">JPEG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-primary">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Electricity Bill - June"
              className="h-11 sm:h-10 px-3 bg-bg rounded-lg border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[13px] font-medium text-text-primary">Amount (K)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                className="h-11 sm:h-10 px-3 bg-bg rounded-lg border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary font-mono"
                required
                min="0"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[13px] font-medium text-text-primary">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-11 sm:h-10 px-3 bg-bg rounded-lg border border-border text-sm text-text-primary outline-none focus:border-primary w-full appearance-none"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-primary">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="h-11 sm:h-10 px-3 bg-bg rounded-lg border border-border text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="h-11 sm:h-10 px-5 rounded-lg border border-border text-[13px] text-text-secondary hover:bg-bg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim() || !form.amount}
              className="h-11 sm:h-10 px-6 bg-primary rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : bill ? 'Save Changes' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterDropdown({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (cat: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 w-[200px] bg-bg-card rounded-xl border border-border shadow-lg z-50 p-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => { onSelect(cat); onClose(); }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
            selected === cat ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-bg'
          }`}
        >
          {selected === cat && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          {cat}
        </button>
      ))}
    </div>
  );
}

export default function BillsPage() {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Month navigation
  const [months, setMonths] = useState<MonthEntry[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Fetch available months
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/v1/bills/months');
        if (res.ok) {
          const data = await res.json();
          setMonths(data);
          if (data.length > 0) {
            setSelectedMonthIndex(0); // default to latest month
          }
        }
      } catch { /* silent */ }
    })();
  }, [apiFetch]);

  const selectedMonth = months[selectedMonthIndex];

  // Fetch bills for selected month
  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    (async () => {
      try {
        const url = `/api/v1/bills?year=${selectedMonth.year}&month=${selectedMonth.month}&limit=20&skip=0`;
        const res = await apiFetch(url);
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
    })();
  }, [selectedMonth, apiFetch]);

  // Re-fetch months and bills when a new upload completes
  useEffect(() => {
    return onBillUpload(() => {
      // Re-fetch months
      (async () => {
        try {
          const res = await apiFetch('/api/v1/bills/months');
          if (res.ok) {
            const data = await res.json();
            setMonths(data);
          }
        } catch { /* silent */ }
      })();
    });
  }, [apiFetch]);

  const goToPrevMonth = () => {
    setSelectedMonthIndex((prev) => Math.min(prev + 1, months.length - 1));
  };

  const goToNextMonth = () => {
    setSelectedMonthIndex((prev) => Math.max(prev - 1, 0));
  };

  const loadMore = async () => {
    if (!selectedMonth || loadingMore) return;
    setLoadingMore(true);
    try {
      const url = `/api/v1/bills?year=${selectedMonth.year}&month=${selectedMonth.month}&limit=20&skip=${bills.length}`;
      const res = await apiFetch(url);
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

  // Summary for current month
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidCount = bills.filter((b) => b.isPaid).length;

  const filteredBills = bills.filter((b) => {
    if (filterCategory === 'All') return true;
    return b.category === filterCategory;
  });

  const togglePaid = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/bills/${id}/payment`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setBills((prev) =>
          prev.map((b) => (b._id === id ? { ...b, isPaid: updated.isPaid, paidAt: updated.paidAt } : b))
        );
        toast(updated.isPaid ? 'Bill marked as paid! 🎉' : 'Marked as unpaid', 'success');
      }
    } catch {
      toast('Failed to update payment status', 'error');
    }
  }, [apiFetch, toast]);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/bills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBills((prev) => prev.filter((b) => b._id !== id));
        toast('Bill deleted successfully', 'success');
      } else {
        toast('Failed to delete bill', 'error');
      }
    } catch {
      toast('Failed to delete bill', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleSaveBill = async (data: BillFormData) => {
    if (editingBill) {
      const res = await apiFetch(`/api/v1/bills/${editingBill._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          amount: Number(data.amount),
          category: data.category,
          dueDate: data.dueDate || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBills((prev) => prev.map((b) => (b._id === editingBill._id ? { ...b, ...updated } : b)));
        toast('Bill updated successfully', 'success');
      } else {
        toast('Failed to update bill', 'error');
        throw new Error('Failed');
      }
    } else {
      toast('Use Upload page to create bills with OCR', 'info');
    }
  };

  const handleSaveBillWithImage = async (data: BillFormData, file: File) => {
    if (!editingBill) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', data.title);
    formData.append('amount', String(Number(data.amount)));
    formData.append('category', data.category);
    if (data.dueDate) formData.append('dueDate', data.dueDate);

    const res = await apiFetch(`/api/v1/bills/${editingBill._id}`, {
      method: 'PATCH',
      body: formData,
    });
    if (res.ok) {
      const updated = await res.json();
      setBills((prev) => prev.map((b) => (b._id === editingBill._id ? { ...b, ...updated } : b)));
      toast('Bill updated successfully', 'success');
    } else {
      toast('Failed to update bill', 'error');
      throw new Error('Failed');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Amount', 'Due Date', 'Status'];
    const rows = filteredBills.map((b) => [
      b.title,
      b.category,
      b.amount,
      b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '',
      b.isPaid ? 'Paid' : 'Unpaid',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported successfully', 'success');
  };

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">Bills</h1>
          <span className="text-[12px] sm:text-[13px] text-text-secondary hidden sm:block">Manage and track your utility bills</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 h-10 sm:h-[38px] px-3 sm:px-3.5 bg-bg-card rounded-lg border border-border text-text-secondary text-[13px] hover:bg-bg"
            >
              <Filter className="w-[15px] h-[15px]" />
              <span className="hidden sm:inline">{filterCategory === 'All' ? 'Filter' : filterCategory}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showFilter && (
              <FilterDropdown
                selected={filterCategory}
                onSelect={setFilterCategory}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-10 sm:h-[38px] px-3 sm:px-3.5 bg-bg-card rounded-lg border border-border text-text-secondary text-[13px] hover:bg-bg"
          >
            <Download className="w-[15px] h-[15px]" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 h-10 sm:h-[38px] px-3 sm:px-4 bg-primary rounded-lg text-white text-[13px] font-semibold hover:bg-primary-dark"
          >
            <Plus className="w-[15px] h-[15px]" />
            <span className="hidden sm:inline">New Bill</span>
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      {months.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={goToNextMonth}
            disabled={selectedMonthIndex <= 0}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-2 h-9 sm:h-[38px] px-3 sm:px-4 bg-bg-card rounded-lg border border-border hover:bg-bg transition-colors"
            >
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-[13px] sm:text-[14px] font-semibold text-text-primary">{selectedMonth?.label}</span>
              <span className="text-[11px] sm:text-[12px] text-text-muted">({selectedMonth?.count})</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            {showMonthDropdown && (
              <div className="absolute left-0 top-12 w-[220px] bg-bg-card rounded-xl border border-border shadow-lg z-50 p-2 max-h-[300px] overflow-y-auto">
                {months.map((m, i) => (
                  <button
                    key={`${m.year}-${m.month}`}
                    onClick={() => { setSelectedMonthIndex(i); setShowMonthDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      i === selectedMonthIndex ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-bg'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[11px] text-text-muted">{m.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={goToPrevMonth}
            disabled={selectedMonthIndex >= months.length - 1}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>

          {/* Month summary */}
          <div className="flex items-center gap-3 sm:gap-4 sm:ml-4 sm:pl-4 sm:border-l border-border">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider">Total</span>
              <span className="text-[13px] sm:text-[15px] font-bold text-text-primary font-mono">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider">Paid</span>
              <span className="text-[13px] sm:text-[15px] font-bold text-emerald-600">{paidCount}/{bills.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table (desktop) / Card list (mobile) */}
      {loading ? (
        <BillTableSkeleton />
      ) : isMobile ? (
        /* Mobile: Card list */
        <div className="flex flex-col gap-2.5">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Receipt className="w-10 h-10 mb-3" />
              <span className="text-sm">
                {filterCategory === 'All' ? 'No bills yet' : `No ${filterCategory} bills`}
              </span>
            </div>
          ) : (
            filteredBills.map((bill) => {
              const Icon = CATEGORY_ICONS[bill.category] || Receipt;
              const colorClass = CATEGORY_COLORS[bill.category] || 'bg-cat-other';

              return (
                <div key={bill._id} className="flex flex-col gap-3 p-4 bg-bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    {bill.imageUrl ? (
                      <img
                        src={bill.imageUrl}
                        alt={bill.title}
                        onClick={() => setLightboxImage({ src: bill.imageUrl, alt: bill.title })}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-text-primary truncate">{bill.title}</span>
                      <span className="text-xs text-text-secondary">{bill.category}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-text-primary">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        {bill.dueDate
                          ? new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'No due date'}
                      </span>
                      <button
                        onClick={() => togglePaid(bill._id)}
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                          bill.isPaid
                            ? 'bg-emerald-50 text-success'
                            : 'bg-amber-50 text-warning'
                        }`}
                      >
                        {bill.isPaid ? 'Paid ✓' : 'Pay'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditingBill(bill); setShowFormModal(true); }}
                        className="w-8 h-8 rounded-md bg-bg flex items-center justify-center hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                      {deleteConfirm === bill._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(bill._id)}
                            className="h-7 px-2 bg-danger rounded text-[11px] font-medium text-white"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="h-7 px-2 bg-bg rounded border border-border text-[11px] text-text-muted"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(bill._id)}
                          className="w-8 h-8 rounded-md bg-bg flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More */}
          {hasMore && filteredBills.length > 0 && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 mt-2 text-sm font-medium text-primary hover:bg-bg-card rounded-lg border border-border transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      ) : (
        /* Desktop: Table */
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center h-12 px-5 bg-bg text-text-muted text-xs font-semibold">
            <div className="w-[280px]">Bill</div>
            <div className="w-[130px]">Category</div>
            <div className="w-[130px]">Amount</div>
            <div className="w-[130px]">Due Date</div>
            <div className="w-[100px]">Status</div>
            <div className="w-[100px]">Actions</div>
          </div>

          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Receipt className="w-10 h-10 mb-3" />
              <span className="text-sm">
                {filterCategory === 'All' ? 'No bills yet' : `No ${filterCategory} bills`}
              </span>
            </div>
          ) : (
            filteredBills.map((bill) => {
              const Icon = CATEGORY_ICONS[bill.category] || Receipt;
              const colorClass = CATEGORY_COLORS[bill.category] || 'bg-cat-other';

              return (
                <div key={bill._id} className="flex items-center h-14 px-5 border-t border-border hover:bg-bg/50 transition-colors">
                  <div className="flex items-center gap-3 w-[280px]">
                    {bill.imageUrl ? (
                      <img
                        src={bill.imageUrl}
                        alt={bill.title}
                        onClick={() => setLightboxImage({ src: bill.imageUrl, alt: bill.title })}
                        className="w-[34px] h-[34px] rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-text-primary truncate">{bill.title}</span>
                  </div>
                  <div className="w-[130px] text-[13px] text-text-secondary">{bill.category}</div>
                  <div className="w-[130px] font-mono text-[13px] font-medium text-text-primary">{formatCurrency(bill.amount)}</div>
                  <div className="w-[130px] text-[13px] text-text-secondary">
                    {bill.dueDate
                      ? new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </div>
                  <div className="w-[100px]">
                    <button
                      onClick={() => togglePaid(bill._id)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                        bill.isPaid
                          ? 'bg-emerald-50 text-success hover:bg-emerald-100'
                          : 'bg-amber-50 text-warning hover:bg-amber-100 cursor-pointer'
                      }`}
                    >
                      {bill.isPaid ? 'Paid ✓' : 'Click to Pay'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 w-[100px]">
                    <button
                      onClick={() => { setEditingBill(bill); setShowFormModal(true); }}
                      className="w-[30px] h-[30px] rounded-md bg-bg flex items-center justify-center hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    {deleteConfirm === bill._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="h-7 px-2 bg-danger rounded text-[11px] font-medium text-white"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="h-7 px-2 bg-bg rounded border border-border text-[11px] text-text-muted"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(bill._id)}
                        className="w-[30px] h-[30px] rounded-md bg-bg flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Load More */}
          {hasMore && filteredBills.length > 0 && (
            <div className="flex justify-center py-4 border-t border-border">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 text-sm font-medium text-primary hover:bg-bg rounded-lg border border-border transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <BillFormModal
          bill={editingBill}
          onClose={() => { setShowFormModal(false); setEditingBill(null); }}
          onSave={handleSaveBill}
          onSaveWithImage={handleSaveBillWithImage}
          isMobile={isMobile}
        />
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
