'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  className,
  value: externalValue,
  onChange,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');

  const value = externalValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;

  const handleSearch = () => {
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch}>Buscar</Button>
    </div>
  );
}
