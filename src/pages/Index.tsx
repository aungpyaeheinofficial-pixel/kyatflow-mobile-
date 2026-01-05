import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
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
import { useTransactions } from '@/hooks/use-transactions';
import { useParties } from '@/hooks/use-parties';
import { 
  calculateStats, 
  getDailyCashFlow 
} from '@/lib/mockData';
import { Bell, Home, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  const handleDateFilterChange = (filter: DateFilterType, range?: DateRange) => {
    setDateFilter(filter);
    if (range) {
      setDateRange(range);
    }
  };

  const handleQuickIncome = () => {
    setTransactionType('income');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleQuickExpense = () => {
    setTransactionType('expense');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleRepeatLast = () => {
    if (transactions.length > 0) {
      setRepeatTransaction(transactions[transactions.length - 1]);
      setShowTransactionForm(true);
    }
  };

  const setFAB = useSetFAB();
  
  useEffect(() => {
    setFAB({
      onQuickIncome: handleQuickIncome,
      onQuickExpense: handleQuickExpense,
      onRepeatLast: handleRepeatLast,
    });
  }, [setFAB, transactions]);

  return (
    <>
      <AppLayout>
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-50 animate-pulse-subtle" />
                  <Home className="h-6 w-6 text-primary relative z-10" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                    Welcome back! Here's your financial overview.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <CurrencyToggle />
              <Button 
                variant="outline" 
                size="icon" 
                className="hidden lg:flex hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

      {/* Date Filter */}
      <div className="mb-6 sm:mb-8">
        <DateFilter 
          value={dateFilter} 
          dateRange={dateRange}
          onChange={handleDateFilterChange}
        />
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <StatsCards 
          stats={stats} 
          transactions={transactions}
          onCardClick={(type) => {
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
          }}
          dateRange={currentDateRange}
        />
      )}

      {/* Charts & Recent */}
      {isLoading ? (
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-[250px] sm:h-[300px] rounded-xl" />
          <Skeleton className="lg:col-span-1 h-[250px] sm:h-[300px] rounded-xl" />
        </div>
      ) : (
        <div className="mt-6 sm:mt-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Financial Overview</h2>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CashFlowChart data={cashFlowData} />
            </div>
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <RecentTransactions transactions={transactions} />
              <TopExpenseCategories 
                transactions={transactions} 
                dateRange={currentDateRange}
              />
            </div>
          </div>
        </div>
      )}

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
      </AppLayout>

      {/* Floating Action Button - Outside AppLayout */}
    </>
  );
}

export default function Index() {
  return (
    <CurrencyProvider>
      <DashboardContent />
    </CurrencyProvider>
  );
}
