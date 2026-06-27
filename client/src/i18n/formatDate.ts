export function formatDate(date: Date | string, lang: 'en' | 'my', style?: 'short' | 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = lang === 'my' ? 'my-MM' : 'en-US';

  if (style === 'short') {
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}
