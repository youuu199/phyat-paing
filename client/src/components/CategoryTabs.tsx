const CATEGORIES = [
  'All',
  'Electricity',
  'Water',
  'Internet',
  'Phone',
  'Shopping',
  'Other',
];

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
    <div className="category-tabs">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`category-tabs__tab${selected === cat ? ' category-tabs__tab--active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {CATEGORY_EMOJI[cat]} {cat}
        </button>
      ))}
    </div>
  );
}
