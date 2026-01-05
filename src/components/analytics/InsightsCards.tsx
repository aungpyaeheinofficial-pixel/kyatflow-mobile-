import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Target,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth, getDay } from 'date-fns';

interface InsightsCardsProps {
  transactions: Transaction[];
}

export function InsightsCards({ transactions }: InsightsCardsProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Current month transactions
    const currentMonthTx = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= currentMonthStart && txDate <= currentMonthEnd;
    });

    // Last month transactions
    const lastMonthTx = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= lastMonthStart && txDate <= lastMonthEnd;
    });

    // Expense comparison
    const currentExpense = currentMonthTx
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const lastExpense = lastMonthTx
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenseChange = lastExpense > 0 
      ? ((currentExpense - lastExpense) / lastExpense) * 100 
      : 0;

    // Biggest expense category
    const expenseByCategory = new Map<string, number>();
    currentMonthTx
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const existing = expenseByCategory.get(tx.category) || 0;
        expenseByCategory.set(tx.category, existing + tx.amount);
      });

    const biggestCategory = Array.from(expenseByCategory.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const totalExpense = currentExpense;
    const categoryPercentage = biggestCategory 
      ? (biggestCategory[1] / totalExpense) * 100 
      : 0;

    // Day of week analysis
    const dayMap = new Map<number, number>();
    currentMonthTx
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const day = getDay(new Date(tx.date));
        const existing = dayMap.get(day) || 0;
        dayMap.set(day, existing + tx.amount);
      });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topSpendingDay = Array.from(dayMap.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Average transaction amount
    const allAmounts = transactions.map(tx => tx.amount);
    const averageAmount = allAmounts.length > 0
      ? allAmounts.reduce((sum, amt) => sum + amt, 0) / allAmounts.length
      : 0;

    return {
      expenseChange: {
        value: Math.abs(expenseChange),
        isPositive: expenseChange >= 0,
      },
      biggestCategory: biggestCategory 
        ? {
            name: EXPENSE_CATEGORIES[biggestCategory[0]]?.label || biggestCategory[0],
            percentage: categoryPercentage,
            amount: biggestCategory[1],
          }
        : null,
      topSpendingDay: topSpendingDay
        ? {
            name: dayNames[topSpendingDay[0]],
            amount: topSpendingDay[1],
          }
        : null,
      averageAmount,
    };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Expense Change */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: '0ms' }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110",
              insights.expenseChange.isPositive
                ? "bg-destructive/10 text-destructive"
                : "bg-success/10 text-success"
            )}>
              {insights.expenseChange.isPositive ? (
                <TrendingUp className="h-6 w-6 animate-pulse-subtle" />
              ) : (
                <TrendingDown className="h-6 w-6 animate-pulse-subtle" />
              )}
            </div>
            <Badge 
              variant={insights.expenseChange.isPositive ? "destructive" : "default"}
              className="text-xs animate-scale-in"
              style={{ animationDelay: '100ms' }}
            >
              {insights.expenseChange.isPositive ? '+' : '-'}
              {insights.expenseChange.value.toFixed(1)}%
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1 animate-fade-in">
            Expenses This Month
          </h3>
          <p className="text-lg font-semibold animate-fade-in" style={{ animationDelay: '50ms' }}>
            {insights.expenseChange.isPositive ? 'Increased' : 'Decreased'} by{' '}
            {insights.expenseChange.value.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Compared to last month
          </p>
        </CardContent>
      </Card>

      {/* Biggest Category */}
      {insights.biggestCategory && (
        <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 hover:scale-110">
                <Target className="h-6 w-6 animate-pulse-subtle" />
              </div>
              <Badge variant="secondary" className="text-xs animate-scale-in" style={{ animationDelay: '150ms' }}>
                {insights.biggestCategory.percentage.toFixed(0)}%
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1 animate-fade-in">
              Biggest Expense Category
            </h3>
            <p className="text-lg font-semibold mb-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
              {insights.biggestCategory.name}
            </p>
            <MoneyDisplay 
              amount={insights.biggestCategory.amount} 
              size="sm"
              className="text-muted-foreground animate-fade-in"
              style={{ animationDelay: '100ms' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Spending Day */}
      {insights.topSpendingDay && (
        <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 hover:scale-110">
                <Calendar className="h-6 w-6 animate-pulse-subtle" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1 animate-fade-in">
              Top Spending Day
            </h3>
            <p className="text-lg font-semibold mb-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
              {insights.topSpendingDay.name}
            </p>
            <MoneyDisplay 
              amount={insights.topSpendingDay.amount} 
              size="sm"
              className="text-muted-foreground animate-fade-in"
              style={{ animationDelay: '100ms' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Average Transaction */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: '300ms' }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success transition-all duration-300 hover:scale-110">
              <DollarSign className="h-6 w-6 animate-pulse-subtle" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1 animate-fade-in">
            Average Transaction
          </h3>
          <MoneyDisplay 
            amount={insights.averageAmount} 
            size="lg"
            className="font-semibold animate-fade-in"
            style={{ animationDelay: '50ms' }}
          />
          <p className="text-xs text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Across all transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

