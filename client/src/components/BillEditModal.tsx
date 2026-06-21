import { useState } from 'react';
import type { Bill, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../types';

interface BillEditModalProps {
  bill: Bill;
  onSave: (id: string, updates: { title?: string; amount?: number; category?: string }) => Promise<void>;
  onClose: () => void;
}

export default function BillEditModal({ bill, onSave, onClose }: BillEditModalProps) {
  const [title, setTitle] = useState(bill.title);
  const [amount, setAmount] = useState(String(bill.amount));
  const [category, setCategory] = useState<Category>(bill.category as Category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(bill._id, {
        title: title.trim(),
        amount: parsedAmount,
        category,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit bill">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ Edit Bill</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              className="modal-form__input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="edit-amount">Amount (MMK)</label>
            <input
              id="edit-amount"
              className="modal-form__input"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label">Category</label>
            <div className="modal-form__categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`modal-form__category-btn${category === cat ? ' modal-form__category-btn--active' : ''}`}
                  style={{
                    borderColor: category === cat ? CATEGORY_COLORS[cat] : undefined,
                    backgroundColor: category === cat ? `${CATEGORY_COLORS[cat]}20` : undefined,
                  }}
                  onClick={() => setCategory(cat)}
                  disabled={saving}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="modal-form__error" role="alert">⚠️ {error}</p>
          )}

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--save"
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
