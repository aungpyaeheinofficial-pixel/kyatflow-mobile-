import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DashboardStats, Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, AlertCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { targetStorage } from '@/lib/targets';
import { Badge } from '@/components/ui/badge';
import { haptics } from '@/lib/haptics';

interface StatsCardsProps {
  stats: DashboardStats;
  transactions: Transaction[];
  onCardClick?: (type: 'income' | 'expense' | 'net' | 'balance' | 'pending' | 'target') => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
}

export function StatsCards({ stats, transactions, onCardClick, dateRange }: StatsCardsProps) {
  // Calculate actual trends by comparing with previous period
  const trends = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Determine current period
    let currentStart: Date;
    let currentEnd: Date = today;
    let previousStart: Date;
    let previousEnd: Date;
    
    if (dateRange?.from && dateRange?.to) {
      currentStart = new Date(dateRange.from);
      currentEnd = new Date(dateRange.to);
      const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - periodDays);
    } else {
      // Default to this month
      currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
      previousEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    }
    
    // Calculate current period totals
    const currentIncome = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate >= currentStart && txDate <= currentEnd && t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentExpense = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate >= currentStart && txDate <= currentEnd && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate previous period totals
    const previousIncome = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate >= previousStart && txDate <= previousEnd && t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const previousExpense = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate >= previousStart && txDate <= previousEnd && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate percentages
    const incomeChange = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : currentIncome > 0 ? 100 : 0;
      
    const expenseChange = previousExpense > 0 
      ? ((currentExpense - previousExpense) / previousExpense) * 100 
      : currentExpense > 0 ? 100 : 0;
    
    const previousNet = previousIncome - previousExpense;
    const netChange = previousNet !== 0 
      ? ((stats.netCashFlow - previousNet) / Math.abs(previousNet)) * 100 
      : stats.netCashFlow !== 0 ? (stats.netCashFlow > 0 ? 100 : -100) : 0;
    
    return {
      income: {
        value: incomeChange,
        isPositive: incomeChange >= 0,
      },
      expense: {
        value: expenseChange,
        isPositive: expenseChange < 0, // Lower expense is better
      },
      net: {
        value: netChange,
        isPositive: netChange >= 0,
      },
    };
  }, [transactions, stats.netCashFlow, dateRange]);

  // Calculate target vs actual
  const monthlyTarget = targetStorage.getMonthlyIncomeTarget();
  const targetProgress = monthlyTarget > 0 
    ? (stats.totalIncome / monthlyTarget) * 100 
    : 0;
  const isTargetMet = stats.totalIncome >= monthlyTarget && monthlyTarget > 0;

  const cards = [
    {
      title: 'Total Balance',
      titleMm: 'စုစုပေါင်းလက်ကျန်ငွေ',
      value: stats.totalBalance,
      icon: CreditCard,
      trend: null,
      accent: 'primary',
      type: 'balance' as const,
      subtitle: 'Cash + Digital Wallets',
    },
    {
      title: 'Total Income',
      titleMm: 'စုစုပေါင်းဝင်ငွေ',
      value: stats.totalIncome,
      icon: TrendingUp,
      trend: trends.income,
      accent: 'success',
      type: 'income' as const,
    },
    {
      title: 'Total Expenses',
      titleMm: 'စုစုပေါင်းကုန်ကျစရိတ်',
      value: stats.totalExpense,
      icon: TrendingDown,
      trend: trends.expense,
      accent: 'destructive',
      type: 'expense' as const,
    },
    {
      title: 'Net Cash Flow',
      titleMm: 'အသားတင်ငွေလည်ပတ်မှု',
      value: stats.netCashFlow,
      icon: Wallet,
      trend: trends.net,
      accent: stats.netCashFlow >= 0 ? 'primary' : 'destructive',
      type: 'net' as const,
    },
    {
      title: 'Pending Payments',
      titleMm: 'ပေးရန်ရရန်ရှိငွေ',
      value: stats.pendingPayments,
      icon: AlertCircle,
      trend: null,
      accent: 'destructive',
      type: 'pending' as const,
      hasWarning: stats.pendingPayments > 0,
      subtitle: `Receivables: ${(stats.receivables / 1000000).toFixed(1)}M | Payables: ${(stats.payables / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Monthly Target',
      titleMm: 'လစဉ်ရည်မှန်းချက်',
      value: stats.totalIncome,
      target: monthlyTarget,
      icon: Target,
      trend: null,
      accent: isTargetMet ? 'success' : 'primary',
      type: 'target' as const,
      progress: targetProgress,
      isTargetMet,
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-medium",
            "animate-slide-up card-hover",
            onCardClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => {
            if ('ontouchstart' in window) {
              haptics.light();
            }
            onCardClick?.(card.type);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                {card.hasWarning && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alert
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70">{card.titleMm}</p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground/60 mt-0.5">{card.subtitle}</p>
              )}
            </div>
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              card.accent === 'success' && "bg-success/10 text-success",
              card.accent === 'destructive' && "bg-destructive/10 text-destructive",
              card.accent === 'primary' && "bg-primary/10 text-primary",
            )}>
              <card.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <MoneyDisplay 
              amount={card.value} 
              size="lg" 
              className={cn(
                card.accent === 'success' && "text-success",
                card.accent === 'destructive' && "text-destructive",
                card.accent === 'primary' && (card.value >= 0 ? "text-primary" : "text-destructive"),
              )}
            />
            {card.trend && (
              <div className="mt-3 flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md",
                  card.trend.isPositive 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {card.trend.isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  <span className={cn(
                    "text-xs font-semibold",
                    card.trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {card.trend.value >= 0 ? '+' : ''}{card.trend.value.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            )}
            {card.type === 'target' && monthlyTarget > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: <MoneyDisplay amount={monthlyTarget} size="xs" className="inline" /></span>
                  <span className={cn(
                    "font-semibold",
                    isTargetMet ? "text-success" : "text-muted-foreground"
                  )}>
                    {targetProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isTargetMet ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(targetProgress, 100)}%` }}
                  />
                </div>
                {isTargetMet && (
                  <p className="text-xs text-success font-medium">✓ Target achieved!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
