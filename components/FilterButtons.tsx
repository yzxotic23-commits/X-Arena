'use client';

import { Button } from '@/components/ui/button';
import { Users, User, Building2 } from 'lucide-react';

type FilterType = 'Squad vs Squad' | 'Squad → Brand' | 'Brand → Personal';

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const filters: FilterType[] = ['Squad vs Squad', 'Squad → Brand', 'Brand → Personal'];

  const getIcon = (filter: FilterType) => {
    switch (filter) {
      case 'Squad vs Squad':
        return <Users className="w-4 h-4" />;
      case 'Squad → Brand':
        return <Building2 className="w-4 h-4" />;
      case 'Brand → Personal':
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted font-semibold">View:</span>
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={activeFilter === filter ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter)}
          className="flex items-center gap-2"
        >
          {getIcon(filter)}
          <span className="hidden sm:inline">{filter}</span>
          <span className="sm:hidden">{filter.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );
}

