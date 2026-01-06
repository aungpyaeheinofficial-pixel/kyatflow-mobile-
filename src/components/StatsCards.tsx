import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DashboardStats, Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, memo } from 'react';
import { targetStorage } from '@/lib/targets';
import { Badge } from '@/components/ui/badge';
import { haptics } from '@/lib/haptics';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsCardsProps {
  stats: DashboardStats;
  transactions: Transaction[];
  onCardClick?: (type: 'income' | 'expense' | 'net' | 'balance' | 'pending' | 'target') => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
}

export function StatsCards({ stats, transactions, onCardClick, dateRange }: StatsCardsProps) {
  const { t } = useLanguage();
  
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

  const handleCardClick = (type: string) => {
    haptics.light();
    onCardClick?.(type as any);
  };

  return (
    <div className="space-y-4">
      {/* Total Balance - Prominent Top Card with Teal Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card 
            className={cn(
              "overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 border-0 shadow-xl",
              onCardClick && "cursor-pointer"
            )}
            onClick={() => handleCardClick('balance')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-base font-medium">
                      {t('dashboard.totalBalance')}
                    </CardTitle>
                  </div>
                  <MoneyDisplay 
                    amount={stats.totalBalance} 
                    size="xl" 
                    className="text-white font-bold mb-1"
                    showCurrency={true}
                  />
                  <p className="text-white/80 text-sm mt-1">
                    {t('dashboard.cashDigitalWallets')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Income & Expenses - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Income */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card 
              className={cn(
                "overflow-hidden border-2 hover:shadow-lg transition-all",
                onCardClick && "cursor-pointer"
              )}
              onClick={() => handleCardClick('income')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
                  {t('dashboard.totalIncome')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MoneyDisplay 
                  amount={stats.totalIncome} 
                  size="lg" 
                  className="text-foreground font-bold mb-2"
                />
                {trends.income && (
                  <div className="flex items-center gap-1.5">
                    <ArrowDownRight className={cn(
                      "h-4 w-4",
                      trends.income.isPositive ? "text-success rotate-180" : "text-destructive"
                    )} />
                    <span className={cn(
                      "text-sm font-semibold",
                      trends.income.isPositive ? "text-success" : "text-destructive"
                    )}>
                      {trends.income.value >= 0 ? '+' : ''}{trends.income.value.toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card 
              className={cn(
                "overflow-hidden border-2 hover:shadow-lg transition-all",
                onCardClick && "cursor-pointer"
              )}
              onClick={() => handleCardClick('expense')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
                  {t('dashboard.totalExpenses')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MoneyDisplay 
                  amount={stats.totalExpense} 
                  size="lg" 
                  className="text-foreground font-bold mb-2"
                />
                {trends.expense && (
                  <div className="flex items-center gap-1.5">
                    <ArrowDownRight className={cn(
                      "h-4 w-4",
                      trends.expense.isPositive ? "text-success" : "text-destructive rotate-180"
                    )} />
                    <span className={cn(
                      "text-sm font-semibold",
                      trends.expense.isPositive ? "text-success" : "text-destructive"
                    )}>
                      {trends.expense.value >= 0 ? '+' : ''}{trends.expense.value.toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Net Cash Flow - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card 
            className={cn(
              "overflow-hidden border-2 hover:shadow-lg transition-all",
              onCardClick && "cursor-pointer"
            )}
            onClick={() => handleCardClick('net')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                    {t('dashboard.netCashFlow')}
                  </CardTitle>
                  <MoneyDisplay 
                    amount={stats.netCashFlow} 
                    size="xl" 
                    className={cn(
                      "font-bold",
                      stats.netCashFlow >= 0 ? "text-success" : "text-destructive"
                    )}
                    showCurrency={true}
                  />
                </div>
                {trends.net && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10">
                    <ArrowUpRight className={cn(
                      "h-4 w-4",
                      trends.net.isPositive ? "text-success" : "text-destructive rotate-180"
                    )} />
                    <span className={cn(
                      "text-sm font-bold",
                      trends.net.isPositive ? "text-success" : "text-destructive"
                    )}>
                      {trends.net.value >= 0 ? '+' : ''}{trends.net.value.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pending Payments - Alert Card */}
      {stats.pendingPayments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card 
              className={cn(
                "overflow-hidden bg-destructive/5 border-2 border-destructive/20 hover:shadow-lg transition-all",
                onCardClick && "cursor-pointer"
              )}
              onClick={() => handleCardClick('pending')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t('dashboard.pendingPayments')}
                    </CardTitle>
                  </div>
                  <Badge variant="destructive" className="h-6 px-2 text-xs font-semibold">
                    Alert
                  </Badge>
                </div>
                <MoneyDisplay 
                  amount={stats.pendingPayments} 
                  size="xl" 
                  className="text-destructive font-bold mb-2"
                  showCurrency={true}
                />
                <p className="text-sm text-muted-foreground">
                  Receivables: {(stats.receivables / 1000000).toFixed(1)}M | Payables: {(stats.payables / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Monthly Target - Optional */}
      {monthlyTarget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card 
              className={cn(
                "overflow-hidden border-2 hover:shadow-lg transition-all",
                onCardClick && "cursor-pointer"
              )}
              onClick={() => handleCardClick('target')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      isTargetMet ? "bg-success/10" : "bg-primary/10"
                    )}>
                      <Target className={cn(
                        "h-5 w-5",
                        isTargetMet ? "text-success" : "text-primary"
                      )} />
                    </div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      {t('dashboard.monthlyTarget')}
                    </CardTitle>
                  </div>
                  <div className={cn(
                    "text-sm font-bold",
                    isTargetMet ? "text-success" : "text-muted-foreground"
                  )}>
                    {targetProgress.toFixed(0)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Target: <MoneyDisplay amount={monthlyTarget} size="xs" className="inline" /></span>
                    <span>Current: <MoneyDisplay amount={stats.totalIncome} size="xs" className="inline" /></span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isTargetMet ? "bg-success" : "bg-primary"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(targetProgress, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  {isTargetMet && (
                    <p className="text-xs text-success font-medium">{t('dashboard.targetAchieved')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default memo(StatsCards);
