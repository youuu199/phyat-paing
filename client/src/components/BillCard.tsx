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
  Electricity: '#fbbf24',
  Water: '#38bdf8',
  Internet: '#a78bfa',
  Phone: '#34d399',
  Shopping: '#f472b6',
  Other: '#9ca3af',
};

export default function BillCard({ bill, onDelete }: BillCardProps) {
  const date = new Date(bill.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bill-card">
      <img
        className="bill-card__image"
        src={bill.imageUrl}
        alt={bill.title}
        loading="lazy"
      />

      <div className="bill-card__body">
        <div className="bill-card__header">
          <h3 className="bill-card__title">{bill.title}</h3>
          <span
            className="bill-card__category"
            style={{ background: CATEGORY_COLORS[bill.category] || CATEGORY_COLORS.Other }}
          >
            {bill.category}
          </span>
        </div>

        <p className="bill-card__amount">
          {bill.amount.toLocaleString()} <span className="bill-card__currency">MMK</span>
        </p>

        <p className="bill-card__date">{date}</p>

        <button
          className="bill-card__delete"
          onClick={() => onDelete(bill._id)}
          title="Delete bill"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
