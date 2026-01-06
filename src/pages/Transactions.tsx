import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { QuickTransactionForm } from '@/components/QuickTransactionForm';
import { useSetFAB } from '@/contexts/FABContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import { AdvancedFilters, FilterState } from '@/components/AdvancedFilters';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ListSkeleton } from '@/components/EnhancedSkeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction, TransactionCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PaymentMethod, PAYMENT_METHODS } from '@/lib/types';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronDown,
  Trash2,
  Download,
  MoreVertical,
  X,
  CheckSquare,
  Square,
  Edit,
  Tag,
  FileEdit,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { exportTransactionsAsCSV } from '@/lib/dataExport';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmptyState } from '@/components/EmptyState';
import { useFAB } from '@/contexts/FABContext';

function TransactionsContent() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fabHandlers = useFAB();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [repeatTransaction, setRepeatTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<'category' | 'paymentMethod' | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    amountRange: [10000, 10000000],
    paymentMethods: [],
    type: 'all',
    categories: [],
  });
  
  const { transactions, isLoading, createTransaction, deleteTransaction, updateTransaction } = useTransactions();
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      if (searchQuery && !tx.notes?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !tx.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Advanced filters
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      
      if (filters.dateRange.from && tx.date < filters.dateRange.from) return false;
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (tx.date > toDate) return false;
      }
      
      if (tx.amount < filters.amountRange[0] || tx.amount > filters.amountRange[1]) return false;
      
      if (filters.paymentMethods.length > 0 && !filters.paymentMethods.includes(tx.paymentMethod)) return false;
      
      if (filters.categories.length > 0 && !filters.categories.includes(tx.category)) return false;
      
      return true;
    });
  }, [transactions, searchQuery, filters]);
  
  const handleSelectAll = useCallback(() => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(tx => tx.id)));
    }
  }, [selectedTransactions.size, filteredTransactions]);
  
  const handleSelectTransaction = useCallback((id: string) => {
    setSelectedTransactions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);
  
  const handleBulkDelete = useCallback(() => {
    if (selectedTransactions.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTransactions.size} transaction(s)?`)) {
      selectedTransactions.forEach(id => deleteTransaction(id));
      setSelectedTransactions(new Set());
      toast({
        title: 'Transactions Deleted',
        description: `${selectedTransactions.size} transaction(s) have been deleted.`,
      });
    }
  }, [selectedTransactions, deleteTransaction, toast]);
  
  const handleBulkExport = useCallback(() => {
    if (selectedTransactions.size === 0) return;
    const selected = transactions.filter(tx => selectedTransactions.has(tx.id));
    exportTransactionsAsCSV(selected);
    toast({
      title: 'Export Successful',
      description: `${selectedTransactions.size} transaction(s) exported.`,
    });
  }, [selectedTransactions, transactions, toast]);
  
  const handleBulkCategorize = useCallback((category: TransactionCategory) => {
    if (selectedTransactions.size === 0) return;
    const count = selectedTransactions.size;
    selectedTransactions.forEach(id => {
      updateTransaction({ id, updates: { category } });
    });
    setSelectedTransactions(new Set());
    toast({
      title: 'Category Updated',
      description: `${count} transaction(s) updated.`,
    });
  }, [selectedTransactions, updateTransaction, toast]);

  const handleBulkEdit = useCallback((field: 'category' | 'paymentMethod', value: string) => {
    if (selectedTransactions.size === 0) return;
    const count = selectedTransactions.size;
    const updates: any = { [field]: value };
    
    selectedTransactions.forEach(id => {
      updateTransaction({ id, updates });
    });
    
    setSelectedTransactions(new Set());
    setShowBulkEditDialog(false);
    setBulkEditField(null);
    
    toast({
      title: 'Success',
      description: `${count} transaction(s) have been updated.`,
    });
  }, [selectedTransactions, updateTransaction, toast]);

  const handleBulkEditOpen = useCallback((field: 'category' | 'paymentMethod') => {
    setBulkEditField(field);
    setShowBulkEditDialog(true);
  }, []);
  
  const handleDuplicate = useCallback((transaction: Transaction) => {
    createTransaction({
      date: new Date(),
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      partyId: transaction.partyId,
    });
  }, [createTransaction]);

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
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold lg:text-3xl">{t('transactions.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('transactions.subtitle')}
          </p>
        </div>
        <CurrencyToggle />
      </div>

      {/* Search and Quick Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('transactions.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={showAdvancedFilters ? "default" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('transactions.advancedFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mb-4">
          <AdvancedFilters 
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({
              dateRange: { from: undefined, to: undefined },
              amountRange: [10000, 10000000],
              paymentMethods: [],
              type: 'all',
              categories: [],
            })}
          />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedTransactions.size > 0 && (
        <Card className="mb-4 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {selectedTransactions.size} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransactions(new Set())}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Tag className="h-4 w-4 mr-1" />
                      Category
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Income</div>
                    {Object.entries(INCOME_CATEGORIES).map(([key, value]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => handleBulkCategorize(key as TransactionCategory)}
                      >
                        {value.label}
                      </DropdownMenuItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">Expense</div>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => handleBulkCategorize(key as TransactionCategory)}
                      >
                        {value.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkEditOpen('category')}>
                      <Tag className="h-4 w-4 mr-2" />
                      Change Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkEditOpen('paymentMethod')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Change Payment Method
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={t('transactions.noTransactions')}
              description="Start tracking your finances by adding your first transaction"
              actionLabel="Add Transaction"
              onAction={() => {
                if (fabHandlers) {
                  fabHandlers.onQuickIncome();
                }
              }}
            />
          ) : (
            <div className="divide-y divide-border">
              {/* Select All Header */}
              <div className="flex items-center gap-3 px-6 py-3 bg-secondary/30">
                <Checkbox
                  checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {t('transactions.selectAll')} ({filteredTransactions.length} {t('transactions.title').toLowerCase()})
                </span>
              </div>
              
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ 
                      delay: index * 0.02, 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    layout
                    whileHover={{ x: 4, backgroundColor: "hsl(var(--secondary) / 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 transition-colors cursor-pointer group touch-manipulation rounded-lg",
                      "min-h-[72px]",
                      selectedTransactions.has(tx.id) && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                    onClick={() => {
                      haptics.light();
                      setSelectedTransaction(tx);
                    }}
                  >
                  <Checkbox
                    checked={selectedTransactions.has(tx.id)}
                    onCheckedChange={(checked) => {
                      haptics.selection();
                      handleSelectTransaction(tx.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 min-w-[24px] min-h-[24px]"
                  />
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0",
                      tx.type === 'income' 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    )}>
                      {tx.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{tx.notes || tx.category}</p>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1 flex-wrap">
                        <PaymentMethodBadge method={tx.paymentMethod} size="sm" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {tx.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <MoneyDisplay 
                      amount={tx.type === 'income' ? tx.amount : -tx.amount} 
                      showSign 
                      size="md"
                      className={cn(
                        "text-right font-bold",
                        tx.type === 'income' ? "text-success" : "text-destructive"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity min-w-[40px] min-h-[40px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.medium();
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          haptics.success();
                          deleteTransaction(tx.id);
                        } else {
                          haptics.light();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

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

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
        onUpdate={(id, updates) => updateTransaction({ id, updates })}
        onDelete={(id) => {
          deleteTransaction(id);
          setSelectedTransaction(null);
        }}
        onDuplicate={handleDuplicate}
      />

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedTransactions.size} Transaction(s)</DialogTitle>
            <DialogDescription>
              {bulkEditField === 'category' 
                ? 'Select a new category for all selected transactions'
                : 'Select a new payment method for all selected transactions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {bulkEditField === 'category' && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(value) => handleBulkEdit('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Income Categories</div>
                    {Object.entries(INCOME_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Expense Categories</div>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {bulkEditField === 'paymentMethod' && (
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select onValueChange={(value) => handleBulkEdit('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                      <SelectItem key={key} value={key}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulkEditDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

const Transactions = memo(function Transactions() {
  return (
    <CurrencyProvider>
      <TransactionsContent />
    </CurrencyProvider>
  );
});

export default Transactions;
