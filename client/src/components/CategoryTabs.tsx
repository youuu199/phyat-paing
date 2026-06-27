import { CATEGORY_LABELS, ALL_CATEGORIES, CATEGORY_WITH_ALL_EMOJI } from '../types';
import type { CategoryFilter } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import './CategoryTabs.css';

interface CategoryTabsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const { t, lang } = useTranslation();
  return (
    <nav className="category-tabs" role="tablist" aria-label="Filter bills by category">
      {ALL_CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        const label = cat === 'All' ? t('categories.All') : CATEGORY_LABELS[cat]?.[lang] || cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            className={`category-tabs__tab${isActive ? ' category-tabs__tab--active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {CATEGORY_WITH_ALL_EMOJI[cat]} {label}
          </button>
        );
      })}
    </nav>
  );
}
