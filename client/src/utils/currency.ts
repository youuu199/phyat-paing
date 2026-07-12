/**
 * Currency utilities — shared across all pages.
 *
 * Bills are stored in MMK (Myanmar Kyat) as the base currency.
 * This utility converts and formats amounts using live exchange rates.
 */

export const CURRENCY_META: Record<string, { symbol: string; label: string }> = {
  MMK: { symbol: 'K', label: 'Myanmar Kyat' },
  USD: { symbol: '$', label: 'US Dollar' },
  EUR: { symbol: '€', label: 'Euro' },
  GBP: { symbol: '£', label: 'British Pound' },
  JPY: { symbol: '¥', label: 'Japanese Yen' },
  THB: { symbol: '฿', label: 'Thai Baht' },
};

// Fallback rates (1 unit of currency = X MMK) — used if API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  MMK: 1,
  USD: 2083,
  EUR: 2273,
  GBP: 2632,
  JPY: 13.89,
  THB: 62.5,
};

// Cached live rates (1 unit of currency = X MMK)
let liveRates: Record<string, number> | null = null;

/**
 * Set live rates fetched from backend API.
 */
export function setLiveRates(rates: Record<string, number>) {
  liveRates = rates;
}

/**
 * Get current rates (live or fallback).
 */
function getRates(): Record<string, number> {
  return liveRates || FALLBACK_RATES;
}

/**
 * Convert MMK amount to target currency.
 * @param mmkAmount - Amount in MMK
 * @param toCurrency - Target currency code (e.g. 'USD')
 * @returns Converted amount in target currency
 */
export function convertCurrency(mmkAmount: number, toCurrency: string): number {
  if (toCurrency === 'MMK') return mmkAmount;
  const rates = getRates();
  const mmkPerUnit = rates[toCurrency];
  if (!mmkPerUnit) return mmkAmount;
  // 1 unit of toCurrency = mmkPerUnit MMK
  // So mmkAmount MMK = mmkAmount / mmkPerUnit units of toCurrency
  return Math.round((mmkAmount / mmkPerUnit) * 100) / 100;
}

/**
 * Format amount with currency symbol.
 * @param amount - Amount in MMK
 * @param currency - Target currency code (e.g. 'MMK', 'USD')
 * @returns Formatted string like "K 12,000" or "$5.76"
 */
export function formatCurrency(amount: number, currency: string = 'MMK'): string {
  const meta = CURRENCY_META[currency];
  if (!meta) return `K ${amount.toLocaleString()}`;

  if (currency === 'MMK') {
    return `K ${amount.toLocaleString()}`;
  }

  const converted = convertCurrency(amount, currency);
  return `${meta.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: string = 'MMK'): string {
  return CURRENCY_META[currency]?.symbol || 'K';
}
