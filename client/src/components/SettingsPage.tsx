import { useState, useEffect } from 'react';
import { CATEGORIES, CATEGORY_ICONS } from '../types';
import type { Category } from '../types';
import { useToast } from './Toast';
import { useTranslation } from '../i18n/useTranslation';
import type { Lang } from '../i18n/LanguageContext';
import ExportButtons from './ExportButtons';
import { useBudgets } from '../hooks/useBudgets';
import './SettingsPage.css';

const CURRENCY_STORAGE_KEY = 'bill-organizer-currency';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { toast } = useToast();
  const { lang, setLang, t } = useTranslation();
  const { budgets, setBudgets } = useBudgets();
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || 'MMK';
  });

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, [currency]);

  const handleBudgetChange = (category: Category, value: string) => {
    const num = value ? parseInt(value, 10) : undefined;
    setBudgets((prev) => ({ ...prev, [category]: num }));
  };

  const handleSave = () => {
    toast(t('settings.saved'), 'success');
  };

  return (
    <div className="page-container">
      <button className="page-container__back" onClick={onBack}>
        ← {t('settings.back')}
      </button>

      <div className="settings-page">
        <h2>⚙️ {t('settings.title')}</h2>

        {/* Language */}
        <section className="settings-page__section">
          <h3>🌐 {t('settings.language')}</h3>
          <div className="settings-page__field">
            <label htmlFor="language">{t('settings.language')}</label>
            <select
              id="language"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="en">English</option>
              <option value="my">မြန်မာ (Myanmar)</option>
            </select>
          </div>
        </section>

        {/* Currency */}
        <section className="settings-page__section">
          <h3>💱 {t('settings.currency')}</h3>
          <div className="settings-page__field">
            <label htmlFor="currency">{t('settings.displayCurrency')}</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="MMK">MMK (Myanmar Kyat)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="THB">THB (Thai Baht)</option>
            </select>
          </div>
        </section>

        {/* Budget limits */}
        <section className="settings-page__section">
          <h3>📊 {t('settings.budgets')}</h3>
          <p className="settings-page__hint">{t('settings.budgetsHint')}</p>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="settings-page__budget-row">
              <span className="settings-page__budget-icon">{CATEGORY_ICONS[cat]}</span>
              <label className="settings-page__budget-label">{cat}</label>
              <input
                className="settings-page__budget-input"
                type="number"
                min="0"
                placeholder={t('settings.noLimit')}
                value={budgets[cat] ?? ''}
                onChange={(e) => handleBudgetChange(cat, e.target.value)}
                aria-label={`Monthly budget for ${cat}`}
              />
              <span className="settings-page__budget-unit">{currency}</span>
            </div>
          ))}
        </section>

        {/* Export */}
        <section className="settings-page__section">
          <h3>📤 {t('settings.export')}</h3>
          <p className="settings-page__hint">{t('settings.exportHint')}</p>
          <ExportButtons />
        </section>

        <button className="settings-page__save" onClick={handleSave}>
          💾 {t('settings.save')}
        </button>
      </div>
    </div>
  );
}
