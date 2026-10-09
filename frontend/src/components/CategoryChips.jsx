import React from 'react';

/**
 * Maps category identifier to display label and dot color
 */
function getCategoryMeta(cat) {
  const normalized = (cat || '').toLowerCase();
  switch (normalized) {
    case 'all':
      return { label: 'All', dotColor: 'bg-ink' };
    case 'layoff':
      return { label: 'Layoffs', dotColor: 'bg-[#FF7E7E]' }; // coral
    case 'funding':
      return { label: 'Funding', dotColor: 'bg-[#FFCB56]' }; // amber
    case 'unicorn':
      return { label: 'Unicorns', dotColor: 'bg-[#FFCB56]' }; // amber
    case 'package':
      return { label: 'Packages', dotColor: 'bg-[#FFA259]' }; // orange
    case 'launch':
      return { label: 'Launches', dotColor: 'bg-[#FFEDB9] border border-ink' }; // cream with ink border
    case 'hiring':
      return { label: 'Hiring', dotColor: 'bg-ink-muted' }; // neutral
    case 'other':
      return { label: 'Other', dotColor: 'bg-ink-muted' }; // neutral
    default:
      return {
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        dotColor: 'bg-ink-muted',
      };
  }
}

/**
 * CategoryChips Component:
 * Horizontally scrollable chips with custom color dots and active states.
 */
export default function CategoryChips({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  showAllOption = true,
}) {
  const allList = showAllOption ? ['all', ...categories.filter((c) => c !== 'all')] : categories;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      {allList.map((cat) => {
        const isSelected = (selectedCategory || 'all').toLowerCase() === cat.toLowerCase();
        const { label, dotColor } = getCategoryMeta(cat);

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
              isSelected
                ? 'bg-amber text-ink shadow-soft-sm border border-amber'
                : 'bg-surface text-ink-muted hover:text-ink hover:bg-cream border border-surface-border'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
