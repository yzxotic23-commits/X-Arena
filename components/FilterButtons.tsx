'use client';

import { Button } from '@/components/ui/button';
import { Users, User, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

type FilterType = 'Squad → Personal' | 'Squad → Brand';

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const filters: FilterType[] = ['Squad → Personal', 'Squad → Brand'];
  
  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'Squad → Personal':
        return translations.leaderboardTable.squadVsSquad || 'Squad → Personal';
      case 'Squad → Brand':
        return translations.leaderboardTable.squadToBrand;
      default:
        return filter;
    }
  };

  const getIcon = (filter: FilterType) => {
    switch (filter) {
      case 'Squad → Personal':
        return <Users className="w-4 h-4" />;
      case 'Squad → Brand':
        return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-2 ${
              activeFilter === filter
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-primary hover:bg-primary/10'
            }`}
          >
            {getIcon(filter)}
            <span className="hidden sm:inline">{getFilterLabel(filter)}</span>
            <span className="sm:hidden">{getFilterLabel(filter).split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

