import { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import type { MonthEntry } from '../types';
import { MONTH_ABBR } from '../types';
import './Sidebar.css';

interface SidebarProps {
  months: MonthEntry[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onSelectDate: (year: number | null, month: number | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  months,
  selectedYear,
  selectedMonth,
  onSelectDate,
  isOpen,
  onClose,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus and restore on close
  useEffect(() => {
    if (!isOpen) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const prevFocused = document.activeElement as HTMLElement | null;

    // Focus the close button when sidebar opens
    const closeBtn = sidebar.querySelector('.sidebar__close') as HTMLElement | null;
    closeBtn?.focus();

    return () => {
      prevFocused?.focus();
    };
  }, [isOpen]);

  // Group months by year
  const grouped = months.reduce<Record<number, MonthEntry[]>>((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {});

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  const isAllTime = selectedYear === null;

  const handleSelect = (year: number | null, month: number | null) => {
    onSelectDate(year, month);
    // On mobile, close sidebar after selection
    if (window.innerWidth <= 640) {
      onClose();
    }
  };

  const sidebarContent = (
    <>
      <div className="sidebar__header">
        <h3 className="sidebar__title">📅 {t('sidebar.title')}</h3>
        <button
          className="sidebar__close"
          onClick={onClose}
          aria-label="Close date filter sidebar"
        >
          ✕
        </button>
      </div>

      <button
        className={`sidebar__item sidebar__item--all${isAllTime ? ' sidebar__item--active' : ''}`}
        onClick={() => handleSelect(null, null)}
        aria-pressed={isAllTime}
      >
        <span>{t('sidebar.allTime')}</span>
      </button>

      {years.length === 0 && (
        <p className="sidebar__empty">{t('sidebar.empty')}</p>
      )}

      <nav aria-label="Browse bills by year and month">
        {years.map((year) => {
          const yearMonths = grouped[year].sort((a, b) => b.month - a.month);
          const isYearActive = selectedYear === year && selectedMonth === null;
          const totalInYear = yearMonths.reduce((sum, m) => sum + m.count, 0);

          return (
            <div key={year} className="sidebar__year-group">
              <button
                className={`sidebar__item sidebar__item--year${isYearActive ? ' sidebar__item--active' : ''}`}
                onClick={() => handleSelect(year, null)}
                aria-pressed={isYearActive}
                aria-expanded={selectedYear === year}
              >
                <span>{year}</span>
                <span className="sidebar__count" aria-label={`${totalInYear} bills`}>
                  {totalInYear}
                </span>
              </button>

              <div className="sidebar__months" role="group" aria-label={`Months in ${year}`}>
                {yearMonths.map((m) => {
                  const isMonthActive = selectedYear === year && selectedMonth === m.month;
                  return (
                    <button
                      key={`${year}-${m.month}`}
                      className={`sidebar__item sidebar__item--month${isMonthActive ? ' sidebar__item--active' : ''}`}
                      onClick={() => handleSelect(year, m.month)}
                      aria-pressed={isMonthActive}
                    >
                      <span>{MONTH_ABBR[m.month - 1]}</span>
                      <span className="sidebar__count" aria-label={`${m.count} bills`}>
                        {m.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`sidebar__overlay${isOpen ? ' sidebar__overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        aria-label="Date filter"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
