import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { QuickTransactionForm } from '@/components/QuickTransactionForm';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { useSetFAB } from '@/contexts/FABContext';
import { TimeComparisonCharts } from '@/components/analytics/TimeComparisonCharts';
import { AdditionalCharts } from '@/components/analytics/AdditionalCharts';
import { InsightsCards } from '@/components/analytics/InsightsCards';
import { ReportBuilder } from '@/components/ReportBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions } from '@/hooks/use-transactions';
import { useParties } from '@/hooks/use-parties';
import { 
  calculateStats, 
  getCategoryBreakdown,
} from '@/lib/mockData';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, FileText, Download, BarChart3, Sparkles, Zap, FileSpreadsheet, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { kyatsToLakhs } from '@/lib/formatters';
import { exportAnalyticsToCSV, exportAnalyticsToExcel, exportAnalyticsToPDF } from '@/lib/analyticsExport';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function AnalyticsContent() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [repeatTransaction, setRepeatTransaction] = useState<any>(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { showInLakhs } = useCurrency();
  const { transactions, isLoading, createTransaction } = useTransactions();
  const { parties } = useParties();
  const setFAB = useSetFAB();

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

  useEffect(() => {
    setFAB({
      onQuickIncome: handleQuickIncome,
      onQuickExpense: handleQuickExpense,
      onRepeatLast: handleRepeatLast,
    });
  }, [setFAB, transactions]);
  
  const stats = useMemo(() => calculateStats(transactions), [transactions]);
  const expenseBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'expense'), [transactions]);
  const incomeBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'income'), [transactions]);
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      exportAnalyticsToCSV(transactions, parties, 'analytics-report');
      toast({
        title: 'Export Successful',
        description: 'Analytics data exported to CSV format',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data to CSV',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportAnalyticsToExcel(transactions, parties, 'analytics-report');
      toast({
        title: 'Export Successful',
        description: 'Analytics data exported to Excel format',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data to Excel',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportAnalyticsToPDF(transactions, parties, 'analytics-report');
      toast({
        title: 'Export Successful',
        description: 'Analytics data exported to PDF format',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data to PDF',
        variant: 'destructive',
      });
    }
  };

  const formatValue = (value: number) => {
    if (showInLakhs) {
      return kyatsToLakhs(value);
    }
    return value;
  };

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
                <BarChart3 className="h-6 w-6 text-primary relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                  Deep insights into your business performance
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Analytics</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setShowReportBuilder(true)}
              className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
            <CurrencyToggle />
          </div>
        </div>
      </div>

      {/* Profit & Loss Summary */}
      <div className="mb-6 sm:mb-8">
        <Card className="animate-fade-in-up hover:shadow-xl transition-all duration-300 border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/95" style={{ animationDelay: '0ms' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-50 animate-pulse-subtle" />
                  <Target className="h-5 w-5 text-primary relative z-10" />
                </div>
                <span>Profit & Loss Summary</span>
              </CardTitle>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Financial Overview</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-5 sm:p-6 rounded-xl bg-gradient-to-br from-success/10 via-success/5 to-transparent hover:from-success/15 hover:via-success/10 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-success/20 animate-fade-in-up relative overflow-hidden group" style={{ animationDelay: '50ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-success/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">Gross Revenue</p>
                  <MoneyDisplay amount={stats.totalIncome} size="lg" className="text-success font-bold" />
                </div>
              </div>
              <div className="text-center p-5 sm:p-6 rounded-xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent hover:from-destructive/15 hover:via-destructive/10 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-destructive/20 animate-fade-in-up relative overflow-hidden group" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">Total Expenses</p>
                  <MoneyDisplay amount={stats.totalExpense} size="lg" className="text-destructive font-bold" />
                </div>
              </div>
              <div className={cn(
                "text-center p-5 sm:p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border animate-fade-in-up relative overflow-hidden group",
                stats.netCashFlow >= 0 
                  ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:from-primary/15 hover:via-primary/10 border-primary/20" 
                  : "bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent hover:from-destructive/15 hover:via-destructive/10 border-destructive/20"
              )} style={{ animationDelay: '150ms' }}>
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                  stats.netCashFlow >= 0 
                    ? "bg-gradient-to-br from-primary/20 via-transparent to-transparent" 
                    : "bg-gradient-to-br from-destructive/20 via-transparent to-transparent"
                )} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                      stats.netCashFlow >= 0 ? "bg-primary/20" : "bg-destructive/20"
                    )}>
                      <Zap className={cn(
                        "h-5 w-5",
                        stats.netCashFlow >= 0 ? "text-primary" : "text-destructive"
                      )} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">Net Profit</p>
                  <MoneyDisplay 
                    amount={stats.netCashFlow} 
                    size="lg" 
                    className={cn(
                      "font-bold",
                      stats.netCashFlow >= 0 ? "text-primary" : "text-destructive"
                    )} 
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/50 via-secondary/30 to-secondary/50 hover:from-secondary/60 hover:via-secondary/40 hover:to-secondary/60 transition-all duration-300 border border-border/50 animate-fade-in-up backdrop-blur-sm" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Profit Margin</span>
                </div>
                <span className={cn(
                  "text-lg sm:text-xl font-bold transition-colors duration-300",
                  stats.netCashFlow >= 0 ? "text-success" : "text-destructive"
                )}>
                  {stats.totalIncome > 0 ? ((stats.netCashFlow / stats.totalIncome) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="mb-6">
        <InsightsCards transactions={transactions} />
      </div>

      {/* View Selector - Mobile Friendly */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Detailed Analysis</span>
          </h2>
        </div>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="comparison">Time Comparison</SelectItem>
            <SelectItem value="detailed">Detailed Charts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content based on selected view */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Breakdown */}
            <Card className="animate-fade-in-up hover:shadow-xl transition-all duration-300 border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/95" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <span>Where Money Goes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] animate-fade-in" style={{ animationDelay: '250ms' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        label={({ category, percentage }) => 
                          `${EXPENSE_CATEGORIES[category]?.label || category} ${percentage}%`
                        }
                        labelLine={false}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            style={{ transition: 'opacity 0.3s ease' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [
                          showInLakhs 
                            ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                            : `${value.toLocaleString()} MMK`,
                          'Amount'
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.75rem',
                          transition: 'all 0.2s ease',
                        }}
                        animationDuration={200}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Income Sources */}
            <Card className="animate-fade-in-up hover:shadow-xl transition-all duration-300 border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/95" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-success/20 to-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <span>Income Sources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] animate-fade-in" style={{ animationDelay: '350ms' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis 
                        type="number"
                        tickFormatter={(v) => showInLakhs ? `${(v/100000).toFixed(0)}L` : `${(v/1000000).toFixed(1)}M`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="category"
                        tickFormatter={(v) => INCOME_CATEGORIES[v]?.label || v}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          showInLakhs 
                            ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                            : `${value.toLocaleString()} MMK`,
                          'Amount'
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.75rem',
                          transition: 'all 0.2s ease',
                        }}
                        animationDuration={200}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="animate-fade-in">
          <TimeComparisonCharts transactions={transactions} />
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="animate-fade-in">
          <AdditionalCharts transactions={transactions} parties={parties} />
        </div>
      )}

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

      <ReportBuilder
        open={showReportBuilder}
        onOpenChange={setShowReportBuilder}
        transactions={transactions}
        parties={parties}
      />
    </AppLayout>
    </>
  );
}

export default function Analytics() {
  return (
    <CurrencyProvider>
      <AnalyticsContent />
    </CurrencyProvider>
  );
}
