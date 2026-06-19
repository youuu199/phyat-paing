interface MonthEntry {
  year: number;
  month: number;
  label: string;
  count: number;
}

interface SidebarProps {
  months: MonthEntry[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onSelectDate: (year: number | null, month: number | null) => void;
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Sidebar({
  months,
  selectedYear,
  selectedMonth,
  onSelectDate,
}: SidebarProps) {
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

  return (
    <aside className="sidebar">
      <h3 className="sidebar__title">📅 Date Filter</h3>

      {/* All Time — clear filter */}
      <button
        className={`sidebar__item sidebar__item--all${isAllTime ? ' sidebar__item--active' : ''}`}
        onClick={() => onSelectDate(null, null)}
      >
        <span>All Time</span>
      </button>

      {years.length === 0 && (
        <p className="sidebar__empty">No bills yet</p>
      )}

      {years.map((year) => {
        const yearMonths = grouped[year].sort((a, b) => b.month - a.month);
        const isYearActive = selectedYear === year && selectedMonth === null;
        const totalInYear = yearMonths.reduce((sum, m) => sum + m.count, 0);

        return (
          <div key={year} className="sidebar__year-group">
            {/* Year header — click to filter by whole year */}
            <button
              className={`sidebar__item sidebar__item--year${isYearActive ? ' sidebar__item--active' : ''}`}
              onClick={() => onSelectDate(year, null)}
            >
              <span className="sidebar__year-label">{year}</span>
              <span className="sidebar__count">{totalInYear}</span>
            </button>

            {/* Months under this year */}
            <div className="sidebar__months">
              {yearMonths.map((m) => {
                const isMonthActive = selectedYear === year && selectedMonth === m.month;
                return (
                  <button
                    key={`${year}-${m.month}`}
                    className={`sidebar__item sidebar__item--month${isMonthActive ? ' sidebar__item--active' : ''}`}
                    onClick={() => onSelectDate(year, m.month)}
                  >
                    <span>{MONTH_ABBR[m.month - 1]}</span>
                    <span className="sidebar__count">{m.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
