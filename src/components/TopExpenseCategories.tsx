import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { Transaction, EXPENSE_CATEGORIES, TransactionCategory } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Circle } from 'lucide-react';

interface TopExpenseCategoriesProps {
  transactions: Transaction[];
  dateRange?: { from: Date | undefined; to: Date | undefined };
}

export function TopExpenseCategories({ transactions, dateRange }: TopExpenseCategoriesProps) {
  const topCategories = useMemo(() => {
    // Filter expenses within date range
    let filteredTransactions = transactions.filter(t => t.type === 'expense');
    
    if (dateRange?.from || dateRange?.to) {
      filteredTransactions = filteredTransactions.filter(t => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (txDate < fromDate) return false;
        }
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (txDate > toDate) return false;
        }
        
        return true;
      });
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredTransactions = filteredTransactions.filter(t => t.date >= startOfMonth);
    }
    
    // Calculate total expenses
    const totalExpenses = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const byCategory = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<TransactionCategory, number>);
    
    // Get top 3
    return Object.entries(byCategory)
      .map(([category, amount]) => ({
        category: category as TransactionCategory,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        label: EXPENSE_CATEGORIES[category]?.label || category,
        labelMm: EXPENSE_CATEGORIES[category]?.labelMm || category,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions, dateRange]);

  if (topCategories.length === 0) {
    return (
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No expenses found
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryColors = [
    { dot: 'text-destructive', bg: 'bg-destructive' },
    { dot: 'text-orange-500', bg: 'bg-orange-500' },
    { dot: 'text-amber-500', bg: 'bg-amber-500' },
  ];

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Expense Categories
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">This month's biggest expenses</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.map((item, index) => (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className={cn(
                  "h-2.5 w-2.5 fill-current",
                  categoryColors[index]?.dot || "text-muted"
                )} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.labelMm}</p>
                </div>
              </div>
              <div className="text-right">
                <MoneyDisplay amount={item.amount} size="sm" className="text-destructive" />
                <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  categoryColors[index]?.bg || "bg-primary"
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

