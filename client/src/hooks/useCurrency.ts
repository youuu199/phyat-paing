import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { formatCurrency, convertCurrency, getCurrencySymbol, CURRENCY_META, setLiveRates } from '../utils/currency';

/**
 * Hook to get user's selected currency and formatting functions.
 * Fetches currency setting + live exchange rates from backend on mount.
 */
export function useCurrency() {
  const { user, apiFetch } = useAuth();
  const [currency, setCurrency] = useState<string>('MMK');
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Fetch user's currency setting
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiFetch('/api/v1/users/me');
        if (res.ok) {
          const data = await res.json();
          if (data.currency) {
            setCurrency(data.currency);
          }
        }
      } catch {
        // Default to MMK
      }
    })();
  }, [user, apiFetch]);

  // Fetch live exchange rates
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiFetch('/api/v1/users/rates');
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            setLiveRates(data.rates);
          }
        }
      } catch {
        // Use fallback rates
      } finally {
        setRatesLoaded(true);
      }
    })();
  }, [user, apiFetch]);

  return {
    currency,
    setCurrency,
    ratesLoaded,
    format: (amount: number) => formatCurrency(amount, currency),
    convert: (mmkAmount: number) => convertCurrency(mmkAmount, currency),
    symbol: getCurrencySymbol(currency),
    currencies: CURRENCY_META,
  };
}
