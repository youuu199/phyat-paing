const CATEGORIES = [
  'All',
  'Electricity',
  'Water',
  'Internet',
  'Phone',
  'Shopping',
  'Other',
] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  All: '📋',
  Electricity: '⚡',
  Water: '💧',
  Internet: '🌐',
  Phone: '📱',
  Shopping: '🛒',
  Other: '📌',
};

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <nav className="category-tabs" role="tablist" aria-label="Filter bills by category">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            className={`category-tabs__tab${isActive ? ' category-tabs__tab--active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {CATEGORY_EMOJI[cat]} {cat}
          </button>
        );
      })}
    </nav>
  );
}
