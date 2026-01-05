import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export type DateFilterType = 'today' | 'thisWeek' | 'thisMonth' | 'custom' | 'all';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateFilterProps {
  value: DateFilterType;
  dateRange?: DateRange;
  onChange: (filter: DateFilterType, range?: DateRange) => void;
}

export function DateFilter({ value, dateRange, onChange }: DateFilterProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const getDateRange = (filter: DateFilterType): DateRange => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { from: today, to: today };
      case 'thisWeek': {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        return { from: startOfWeek, to: today };
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: startOfMonth, to: today };
      }
      case 'custom':
        return dateRange || { from: undefined, to: undefined };
      default:
        return { from: undefined, to: undefined };
    }
  };

  const getLabel = () => {
    switch (value) {
      case 'today':
        return 'Today';
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  const handleFilterChange = (filter: DateFilterType) => {
    if (filter === 'custom') {
      setIsCustomOpen(true);
      // Don't change filter yet, wait for date selection
    } else {
      onChange(filter);
      setIsCustomOpen(false);
    }
  };

  const handleCustomRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange('custom', range);
      setIsCustomOpen(false);
    } else if (range) {
      // Partial selection - update range but keep dialog open
      onChange('custom', range);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-lg border p-1">
        <Button
          variant={value === 'today' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('today')}
          className="h-8 px-3"
        >
          Today
        </Button>
        <Button
          variant={value === 'thisWeek' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('thisWeek')}
          className="h-8 px-3"
        >
          This Week
        </Button>
        <Button
          variant={value === 'thisMonth' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('thisMonth')}
          className="h-8 px-3"
        >
          This Month
        </Button>
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={value === 'custom' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
            >
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={{
                from: dateRange?.from,
                to: dateRange?.to,
              }}
              onSelect={(range) => {
                handleCustomRangeChange({
                  from: range?.from,
                  to: range?.to,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant={value === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('all')}
          className="h-8 px-3"
        >
          All Time
        </Button>
      </div>
      {value !== 'all' && (
        <div className="text-sm text-muted-foreground">
          {getDateRange(value).from && getDateRange(value).to && (
            <span>
              {format(getDateRange(value).from!, 'MMM d')} - {format(getDateRange(value).to!, 'MMM d')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

