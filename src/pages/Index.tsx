import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { QuickTransactionForm } from '@/components/QuickTransactionForm';
import { useSetFAB } from '@/contexts/FABContext';
import { StatsCards } from '@/components/StatsCards';
import { CashFlowChart } from '@/components/CashFlowChart';
import { RecentTransactions } from '@/components/RecentTransactions';
import { TopExpenseCategories } from '@/components/TopExpenseCategories';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { DateFilter, DateFilterType, DateRange } from '@/components/DateFilter';
import { StatDetailDialog } from '@/components/StatDetailDialog';
import { TargetDialog } from '@/components/TargetDialog';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTransactions } from '@/hooks/use-transactions';
import { useParties } from '@/hooks/use-parties';
import {
  calculateStats,
  getDailyCashFlow
} from '@/lib/mockData';
import { Home, TrendingUp } from 'lucide-react';
import { DashboardSkeleton } from '@/components/EnhancedSkeleton';
import { motion } from 'framer-motion';

function DashboardContent() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('thisMonth');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedStatType, setSelectedStatType] = useState<'income' | 'expense' | 'net' | 'balance' | 'pending' | 'target' | null>(null);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [repeatTransaction, setRepeatTransaction] = useState<any>(null);
  const { transactions, isLoading, createTransaction } = useTransactions();
  const { parties } = useParties();
  const { t } = useLanguage();

  const currentDateRange = useMemo(() => {
    if (dateFilter === 'custom' && dateRange) {
      return dateRange;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
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
      default:
        return undefined;
    }
  }, [dateFilter, dateRange]);

  const stats = useMemo(() => calculateStats(transactions, currentDateRange, parties), [transactions, currentDateRange, parties]);
  const cashFlowData = useMemo(() => getDailyCashFlow(transactions, currentDateRange), [transactions, currentDateRange]);

  const handleDateFilterChange = useCallback((filter: DateFilterType, range?: DateRange) => {
    setDateFilter(filter);
    if (range) {
      setDateRange(range);
    }
  }, []);

  const handleQuickIncome = useCallback(() => {
    setTransactionType('income');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  }, []);

  const handleQuickExpense = useCallback(() => {
    setTransactionType('expense');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  }, []);

  const handleRepeatLast = useCallback(() => {
    if (transactions.length > 0) {
      setRepeatTransaction(transactions[transactions.length - 1]);
      setShowTransactionForm(true);
    }
  }, [transactions]);

  const setFAB = useSetFAB();

  useEffect(() => {
    setFAB({
      onQuickIncome: handleQuickIncome,
      onQuickExpense: handleQuickExpense,
      onRepeatLast: handleRepeatLast,
    });
  }, [setFAB, transactions]);

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-50 animate-pulse-subtle" />
              <Home className="h-6 w-6 text-primary relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => window.location.href = '/subscription'}
            >
              Upgrade to Pro
            </Button>
            <CurrencyToggle />
          </div>
        </div>
      </motion.div>

      {/* Date Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6"
      >
        <DateFilter
          value={dateFilter}
          dateRange={dateRange}
          onChange={handleDateFilterChange}
        />
      </motion.div>

      {/* Stats Cards - Show immediately with cached data */}
      <StatsCards
        stats={stats}
        transactions={transactions}
        onCardClick={useCallback((type) => {
          if (type === 'target') {
            setShowTargetDialog(true);
          } else if (type === 'balance' || type === 'pending') {
            // Navigate to relevant page or show info
            if (type === 'pending') {
              window.location.href = '/parties';
            }
          } else {
            setSelectedStatType(type);
          }
        }, [])}
        dateRange={currentDateRange}
      />

      {/* Charts & Recent - Show immediately with cached data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-6 space-y-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">{t('dashboard.financialOverview')}</h2>
        </div>
        <div className="grid gap-4 grid-cols-1">
          <CashFlowChart data={cashFlowData} />
          <div className="space-y-4">
            <RecentTransactions transactions={transactions} />
            <TopExpenseCategories
              transactions={transactions}
              dateRange={currentDateRange}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Transaction Form Modal */}
      <QuickTransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        initialType={transactionType}
        lastTransaction={repeatTransaction}
        transactions={transactions}
        onSubmit={(data) => {
          createTransaction({
            date: data.date || new Date(),
            amount: data.amount,
            type: data.type,
            category: data.category,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            partyId: data.partyId,
          });
        }}
      />

      {/* Stat Detail Dialog */}
      {selectedStatType && (selectedStatType === 'income' || selectedStatType === 'expense' || selectedStatType === 'net') && (
        <StatDetailDialog
          open={!!selectedStatType}
          onOpenChange={(open) => !open && setSelectedStatType(null)}
          type={selectedStatType}
          transactions={transactions}
          total={
            selectedStatType === 'income' ? stats.totalIncome :
              selectedStatType === 'expense' ? stats.totalExpense :
                stats.netCashFlow
          }
          dateRange={currentDateRange}
        />
      )}

      {/* Target Dialog */}
      <TargetDialog
        open={showTargetDialog}
        onOpenChange={setShowTargetDialog}
        currentIncome={stats.totalIncome}
      />
    </AppLayout >
  );
}

const Index = memo(function Index() {
  return (
    <CurrencyProvider>
      <DashboardContent />
    </CurrencyProvider>
  );
});

export default Index;
