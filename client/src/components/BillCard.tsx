import { useState, useEffect, useCallback } from 'react';
import type { Bill } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../types';
import BillEditModal from './BillEditModal';
import PaymentToggle from './PaymentToggle';
import RecurringBadge from './RecurringBadge';

interface BillCardProps {
  bill: Bill;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: { title?: string; amount?: number; category?: string; dueDate?: string; isRecurring?: boolean; recurringInterval?: string }) => Promise<void>;
  onPaymentToggle?: (id: string) => Promise<void>;
}

export default function BillCard({ bill, onDelete, onUpdate, onPaymentToggle }: BillCardProps) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close viewer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewing(false);
    },
    [],
  );

  useEffect(() => {
    if (viewing) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [viewing, handleKeyDown]);

  const date = new Date(bill.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDeleteClick = () => {
    if (confirmDelete) {
      // Second click — actually delete
      setDeleting(true);
      onDelete(bill._id).catch(() => setDeleting(false));
    } else {
      // First click — show confirmation
      setConfirmDelete(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const categoryColor = CATEGORY_COLORS[bill.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other;
  const categoryIcon = CATEGORY_ICONS[bill.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Other;

  return (
    <>
      <article className="bill-card" aria-label={`Bill: ${bill.title}`}>
      <div className="bill-card__image-wrap">
        {imgError ? (
          <div className="bill-card__image-fallback" aria-hidden="true">
            🧾
          </div>
        ) : (
          <img
            className="bill-card__image"
            src={bill.imageUrl}
            alt={`Scanned image of ${bill.title}`}
            loading="lazy"
            onError={() => setImgError(true)}
            onClick={() => setViewing(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setViewing(true);
              }
            }}
            tabIndex={0}
            role="button"
            title="Click to view full image"
          />
        )}
      </div>

      <div className="bill-card__body">
        <div className="bill-card__header">
          <h3 className="bill-card__title">{bill.title}</h3>
          <div className="bill-card__badges">
            <span
              className="bill-card__category"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryIcon} {bill.category}
            </span>
            <RecurringBadge bill={bill} />
          </div>
        </div>

        <p className="bill-card__amount">
          {bill.amount.toLocaleString()}
          <span className="bill-card__currency">MMK</span>
        </p>

        <p className="bill-card__date">
          📅 {date}
          {bill.dueDate && (
            <span className="bill-card__due-date">
              {' · Due: '}
              {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </p>

        {onPaymentToggle && (
          <div className="bill-card__payment">
            <PaymentToggle
              isPaid={bill.isPaid || false}
              onToggle={() => onPaymentToggle(bill._id)}
            />
          </div>
        )}

        <div className="bill-card__actions">
          <button
            className="bill-card__edit"
            onClick={() => setEditing(true)}
            aria-label={`Edit bill: ${bill.title}`}
          >
            ✏️ Edit
          </button>
          <button
            className={`bill-card__delete${confirmDelete ? ' bill-card__delete--confirm' : ''}`}
            onClick={handleDeleteClick}
            disabled={deleting}
            aria-label={confirmDelete ? `Confirm delete: ${bill.title}` : `Delete bill: ${bill.title}`}
          >
            {deleting ? '⏳ Deleting...' : confirmDelete ? '⚠️ Click again to confirm' : '🗑 Delete'}
          </button>
        </div>
      </div>
    </article>

      {/* Image viewer modal */}
      {viewing && !imgError && (
        <div
          className="image-viewer"
          onClick={() => setViewing(false)}
          role="dialog"
          aria-label={`Full-size image of ${bill.title}`}
          aria-modal="true"
        >
          <button
            className="image-viewer__close"
            onClick={() => setViewing(false)}
            aria-label="Close image viewer"
            title="Close"
          >
            ✕
          </button>
          <img
            className="image-viewer__image"
            src={bill.imageUrl}
            alt={`Scanned image of ${bill.title}`}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="image-viewer__caption">{bill.title}</p>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <BillEditModal
          bill={bill}
          onSave={onUpdate}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
