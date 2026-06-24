interface PaymentToggleProps {
  isPaid: boolean;
  onToggle: () => void;
}

export default function PaymentToggle({ isPaid, onToggle }: PaymentToggleProps) {
  return (
    <label className="payment-toggle">
      <input
        type="checkbox"
        className="payment-toggle__checkbox"
        checked={isPaid}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
      />
      <span className="payment-toggle__label">Paid</span>
    </label>
  );
}
