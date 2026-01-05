import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  CalendarIcon,
  DollarSign,
  CreditCard,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PaymentMethod, TransactionCategory, PAYMENT_METHODS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { MoneyDisplay } from '@/components/MoneyDisplay';

export interface FilterState {
  dateRange: { from: Date | undefined; to: Date | undefined };
  amountRange: [number, number];
  paymentMethods: PaymentMethod[];
  type: 'all' | 'income' | 'expense';
  categories: TransactionCategory[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function AdvancedFilters({ filters, onChange, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAmountChange = (values: number[]) => {
    onChange({
      ...filters,
      amountRange: [values[0], values[1]] as [number, number],
    });
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const methods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter(m => m !== method)
      : [...filters.paymentMethods, method];
    onChange({ ...filters, paymentMethods: methods });
  };

  const toggleCategory = (category: TransactionCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories });
  };

  const activeFiltersCount = 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.amountRange[0] > 10000 || filters.amountRange[1] < 10000000 ? 1 : 0) +
    (filters.paymentMethods.length > 0 ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0);

  const categories = filters.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-xs">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => {
                    onChange({
                      ...filters,
                      dateRange: {
                        from: range?.from,
                        to: range?.to,
                      },
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <Label className="text-xs">Amount Range</Label>
            <div className="space-y-3 px-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <MoneyDisplay amount={filters.amountRange[0]} size="xs" />
                <MoneyDisplay amount={filters.amountRange[1]} size="xs" />
              </div>
              <Slider
                value={filters.amountRange}
                onValueChange={handleAmountChange}
                min={10000}
                max={10000000}
                step={10000}
                className="w-full"
              />
            </div>
          </div>

          {/* Type Toggle */}
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select
              value={filters.type}
              onValueChange={(v) => onChange({ ...filters, type: v as 'all' | 'income' | 'expense' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label className="text-xs">Payment Methods</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {filters.paymentMethods.length > 0
                    ? `${filters.paymentMethods.length} selected`
                    : 'All methods'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={filters.paymentMethods.includes(key as PaymentMethod)}
                        onCheckedChange={() => togglePaymentMethod(key as PaymentMethod)}
                      />
                      <Label
                        htmlFor={key}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Categories
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, cat]) => (
              <Badge
                key={key}
                variant={filters.categories.includes(key as TransactionCategory) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(key as TransactionCategory)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

