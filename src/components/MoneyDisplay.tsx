import { useCurrency } from '@/contexts/CurrencyContext';
import { useMyanmarNumbers } from '@/contexts/MyanmarNumbersContext';
import { formatCurrency } from '@/lib/formatters';
import { formatMyanmarCurrency } from '@/lib/myanmarNumbers';
import { cn } from '@/lib/utils';

interface MoneyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  showCurrency?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function MoneyDisplay({ amount, className, showSign = false, showCurrency = false, size = 'md' }: MoneyDisplayProps) {
  const { showInLakhs } = useCurrency();
  const { useMyanmarNumbers: showMyanmarNumbers } = useMyanmarNumbers();
  
  const isPositive = amount >= 0;
  const displayAmount = Math.abs(amount);
  const formatted = formatCurrency(displayAmount, showInLakhs, true);
  const finalFormatted = showMyanmarNumbers 
    ? formatMyanmarCurrency(displayAmount, true)
    : formatted;
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-semibold',
    xl: 'text-2xl font-bold',
    '2xl': 'text-3xl font-bold',
  };

  return (
    <span
      className={cn(
        'tabular-nums tracking-tight',
        sizeClasses[size],
        showSign && (isPositive ? 'text-success' : 'text-destructive'),
        className
      )}
    >
      {showSign && (isPositive ? '+' : '-')}
      {finalFormatted}
      {showCurrency && <span className="ml-1 text-sm opacity-80">MMK</span>}
    </span>
  );
}
