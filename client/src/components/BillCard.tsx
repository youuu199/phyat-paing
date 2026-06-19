import { useState, useEffect, useCallback } from 'react';

interface Bill {
  _id: string;
  title: string;
  amount: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

interface BillCardProps {
  bill: Bill;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#eab308',
  Water: '#0ea5e9',
  Internet: '#8b5cf6',
  Phone: '#10b981',
  Shopping: '#ec4899',
  Other: '#6b7280',
};

const CATEGORY_ICONS: Record<string, string> = {
  Electricity: '⚡',
  Water: '💧',
  Internet: '🌐',
  Phone: '📱',
  Shopping: '🛒',
  Other: '📌',
};

export default function BillCard({ bill, onDelete }: BillCardProps) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(bill._id);
    } catch {
      setDeleting(false);
    }
  };

  const categoryColor = CATEGORY_COLORS[bill.category] || CATEGORY_COLORS.Other;
  const categoryIcon = CATEGORY_ICONS[bill.category] || CATEGORY_ICONS.Other;

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
          <span
            className="bill-card__category"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryIcon} {bill.category}
          </span>
        </div>

        <p className="bill-card__amount">
          {bill.amount.toLocaleString()}
          <span className="bill-card__currency">MMK</span>
        </p>

        <p className="bill-card__date">
          📅 {date}
        </p>

        <div className="bill-card__actions">
          <button
            className="bill-card__delete"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Delete bill: ${bill.title}`}
          >
            {deleting ? '⏳ Deleting...' : '🗑 Delete'}
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
    </>
  );
}
