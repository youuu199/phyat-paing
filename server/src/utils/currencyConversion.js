/**
 * Real-time currency conversion utilities.
 *
 * Fetches live exchange rates from a free API (no key required).
 * Caches rates for 1 hour to avoid excessive API calls.
 * All bills are stored in MMK as the base currency.
 */

// Cached rates and timestamp
let cachedRates = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const SUPPORTED_CURRENCIES = ['MMK', 'USD', 'EUR', 'GBP', 'JPY', 'THB'];

/**
 * Fetch live exchange rates from frankfurter.app + open.er-api.com
 * Falls back to hardcoded rates if API is unavailable.
 */
async function fetchRates() {
  const now = Date.now();
  if (cachedRates && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedRates;
  }

  try {
    // Use open.er-api.com — free, no key, supports MMK
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    if (data.result === 'success' && data.rates) {
      const rates = data.rates;
      // Convert everything relative to MMK
      // API gives: 1 USD = X of each currency
      // We need: 1 unit of currency X = Y MMK
      const mmkPerUnit = {};
      for (const currency of SUPPORTED_CURRENCIES) {
        if (currency === 'MMK') {
          mmkPerUnit['MMK'] = 1;
        } else if (rates[currency]) {
          // 1 USD = rates[currency] units of that currency
          // So 1 unit of that currency = rates['MMK'] / rates[currency] MMK
          mmkPerUnit[currency] = rates['MMK'] / rates[currency];
        }
      }

      cachedRates = mmkPerUnit;
      cacheTimestamp = now;
      console.log('[currency] Live rates fetched:', JSON.stringify(mmkPerUnit));
      return mmkPerUnit;
    }
    throw new Error('API response invalid');
  } catch (err) {
    console.warn('[currency] Failed to fetch live rates, using fallback:', err.message);

    // Fallback hardcoded rates (1 unit of currency = X MMK)
    cachedRates = {
      MMK: 1,
      USD: 2083,
      EUR: 2273,
      GBP: 2632,
      JPY: 13.89,
      THB: 62.5,
    };
    cacheTimestamp = now;
    return cachedRates;
  }
}

/**
 * Convert an amount from a given currency to MMK using live rates.
 *
 * @param {number} amount - Amount in the original currency
 * @param {string} fromCurrency - Currency code (MMK, USD, EUR, GBP, JPY, THB)
 * @returns {Promise<number>} Amount in MMK (rounded to nearest integer)
 */
export async function convertToMMK(amount, fromCurrency) {
  if (!amount || amount <= 0) return 0;
  if (fromCurrency === 'MMK') return Math.round(amount);

  const rates = await fetchRates();
  const rate = rates[fromCurrency];
  if (!rate) {
    console.warn(`[currency] Unknown currency "${fromCurrency}", treating as MMK`);
    return Math.round(amount);
  }

  return Math.round(amount * rate);
}

/**
 * Get current rates for API response (frontend can use these).
 * @returns {Promise<Object>} Rates object (1 unit of currency = X MMK)
 */
export async function getCurrentRates() {
  return fetchRates();
}
