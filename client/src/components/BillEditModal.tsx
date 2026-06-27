import { useState } from 'react';
import type { Bill, BillUpdate, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import './BillEditModal.css';

interface BillEditModalProps {
  bill: Bill;
  onSave: (id: string, updates: BillUpdate) => Promise<void>;
  onClose: () => void;
}

export default function BillEditModal({ bill, onSave, onClose }: BillEditModalProps) {
  const [title, setTitle] = useState(bill.title);
  const [amount, setAmount] = useState(String(bill.amount));
  const [category, setCategory] = useState<Category>(bill.category as Category);
  const [dueDate, setDueDate] = useState(bill.dueDate ? bill.dueDate.split('T')[0] : '');
  const [isRecurring, setIsRecurring] = useState(bill.isRecurring || false);
  const [recurringInterval, setRecurringInterval] = useState<string>(bill.recurringInterval || 'monthly');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError(t('modal.errorAmount'));
      return;
    }

    if (!title.trim()) {
      setError(t('modal.errorTitle'));
      return;
    }

    setSaving(true);
    try {
      await onSave(bill._id, {
        title: title.trim(),
        amount: parsedAmount,
        category,
        dueDate: dueDate || undefined,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('modal.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit bill">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ {t('modal.editBill')}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="edit-title">{t('modal.title')}</label>
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
            <label className="modal-form__label" htmlFor="edit-amount">{t('modal.amount')}</label>
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
            <label className="modal-form__label">{t('modal.category')}</label>
            <div className="modal-form__categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`modal-form__category-btn${category === cat ? ' modal-form__category-btn--active' : ''}`}
                  style={{ '--cat-color': CATEGORY_COLORS[cat] } as React.CSSProperties}
                  onClick={() => setCategory(cat)}
                  disabled={saving}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="edit-due-date">{t('modal.dueDate')}</label>
            <input
              id="edit-due-date"
              className="modal-form__input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="modal-form__field">
            <label className="modal-form__checkbox-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={saving}
              />
              🔄 {t('modal.recurring')}
            </label>
            {isRecurring && (
              <div className="modal-form__recurring-options">
                {(['monthly', 'quarterly', 'yearly'] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    className={`modal-form__category-btn${recurringInterval === interval ? ' modal-form__category-btn--active' : ''}`}
                    onClick={() => setRecurringInterval(interval)}
                    disabled={saving}
                  >
                    {interval === 'monthly' ? `📅 ${t('modal.monthly')}` : interval === 'quarterly' ? `📆 ${t('modal.quarterly')}` : `🗓️ ${t('modal.yearly')}`}
                  </button>
                ))}
              </div>
            )}
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
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--save"
              disabled={saving}
            >
              {saving ? `⏳ ${t('modal.saving')}` : `💾 ${t('modal.save')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
