interface PaymentToggleProps {
  isPaid: boolean;
  onToggle: () => void;
}

export default function PaymentToggle({ isPaid, onToggle }: PaymentToggleProps) {
  return (
    <button
      className={`payment-toggle${isPaid ? ' payment-toggle--paid' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
      title={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
    >
      {isPaid ? '✅ Paid' : '⬜ Unpaid'}
    </button>
  );
}
