import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import {
  TransactionType,
  PaymentMethod,
  TransactionCategory,
  PAYMENT_METHODS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  Transaction,
} from '@/lib/types';
import { formatInputWithCommas, parseNumberInput } from '@/lib/formatters';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useParties } from '@/hooks/use-parties';

interface QuickTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    type: TransactionType;
    amount: number;
    category: TransactionCategory;
    paymentMethod: PaymentMethod;
    notes?: string;
    date?: Date;
    partyId?: string;
  }) => void;
  initialType?: TransactionType;
  lastTransaction?: Transaction | null;
  transactions?: Transaction[];
}

export function QuickTransactionForm({
  open,
  onOpenChange,
  onSubmit,
  initialType = 'income',
  lastTransaction,
  transactions = [],
}: QuickTransactionFormProps) {
  const { toast } = useToast();
  const { parties } = useParties();
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Get recent categories (last 5 used)
  const recentCategories = useMemo(() => {
    const categoryCounts = new Map<TransactionCategory, number>();
    transactions
      .filter(tx => tx.type === type)
      .slice(-20) // Last 20 transactions
      .forEach(tx => {
        const count = categoryCounts.get(tx.category) || 0;
        categoryCounts.set(tx.category, count + 1);
      });

    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);
  }, [transactions, type]);

  // Get top 5 categories by amount
  const topCategories = useMemo(() => {
    const categoryAmounts = new Map<TransactionCategory, number>();
    transactions
      .filter(tx => tx.type === type)
      .forEach(tx => {
        const amount = categoryAmounts.get(tx.category) || 0;
        categoryAmounts.set(tx.category, amount + tx.amount);
      });

    return Array.from(categoryAmounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);
  }, [transactions, type]);

  // Quick categories = recent + top (unique)
  const quickCategories = useMemo(() => {
    const combined = [...recentCategories, ...topCategories];
    return Array.from(new Set(combined)).slice(0, 5);
  }, [recentCategories, topCategories]);

  // Get last used payment method
  useEffect(() => {
    if (transactions.length > 0) {
      const lastTx = transactions[transactions.length - 1];
      setPaymentMethod(lastTx.paymentMethod);
    }
  }, [transactions]);

  // Initialize from last transaction if repeating
  useEffect(() => {
    if (open && lastTransaction) {
      setType(lastTransaction.type);
      setAmount(lastTransaction.amount.toString());
      setCategory(lastTransaction.category);
      setPaymentMethod(lastTransaction.paymentMethod);
      setNotes(lastTransaction.notes || '');
      if (lastTransaction.partyId) {
        setSelectedPartyId(lastTransaction.partyId);
      }
    } else if (open) {
      setType(initialType);
      setAmount('');
      setCategory('');
      setNotes('');
      setSelectedPartyId('');
      setDate(new Date());
      setShowAdvanced(false);
    }
  }, [open, lastTransaction, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please enter amount and select a category',
        variant: 'destructive',
      });
      return;
    }

    onSubmit?.({
      type,
      amount: parseNumberInput(amount),
      category: category as TransactionCategory,
      paymentMethod,
      notes: notes || undefined,
      date: showAdvanced ? date : new Date(),
      partyId: selectedPartyId || undefined,
    });

    toast({
      title: 'Transaction Added!',
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${amount} MMK recorded`,
    });

    onOpenChange(false);
  };

  const handleNumberInput = (value: string) => {
    if (value === '') {
      setAmount('');
      return;
    }
    // Allow numbers and commas
    const cleaned = value.replace(/[^\d,]/g, '');
    setAmount(formatInputWithCommas(cleaned));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">Quick Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Step 1: Transaction Type */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={cn(
                  "h-12 sm:h-14 text-sm sm:text-base font-medium touch-manipulation",
                  type === 'income' && "bg-success hover:bg-success/90"
                )}
                onClick={() => setType('income')}
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Money In
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                className={cn(
                  "h-12 sm:h-14 text-sm sm:text-base font-medium touch-manipulation",
                  type === 'expense' && "bg-destructive hover:bg-destructive/90"
                )}
                onClick={() => setType('expense')}
              >
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Money Out
              </Button>
            </div>

            {/* Quick Categories */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Categories</Label>
              <div className="flex flex-wrap gap-2">
                {quickCategories.length > 0 ? (
                  quickCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={category === cat ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer px-4 py-2 text-sm",
                        category === cat && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setCategory(cat)}
                    >
                      {categories[cat]?.label || cat}
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No recent categories. Select from dropdown.
                  </div>
                )}
              </div>
              {quickCategories.length < Object.keys(categories).length && (
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as TransactionCategory)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Or select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Amount - Large Number Pad */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount (MMK)</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleNumberInput(e.target.value)}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold h-16 sm:h-20 text-center pr-12 sm:pr-16"
                />
                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-lg">
                  MMK
                </span>
              </div>
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[10000, 50000, 100000, 500000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toLocaleString())}
                  >
                    {(amt / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Method - Last Used Highlighted */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Payment Method</Label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
                  const isSelected = paymentMethod === method;
                  const isLastUsed = transactions.length > 0 && 
                    transactions[transactions.length - 1]?.paymentMethod === method;

                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : isLastUsed
                          ? "border-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <PaymentMethodBadge method={method} size="sm" />
                      {isLastUsed && !isSelected && (
                        <span className="text-[10px] text-primary">Last used</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optional Fields - Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between"
              >
                <span className="text-sm font-medium">Additional Options</span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Date/Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={format(date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="h-12"
                />
              </div>

              {/* Party */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer/Supplier
                </Label>
                <Select
                  value={selectedPartyId}
                  onValueChange={setSelectedPartyId}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select party (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name} ({party.type === 'customer' ? 'Customer' : 'Supplier'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className={cn(
              "w-full h-14 text-base font-medium",
              type === 'income'
                ? "bg-success hover:bg-success/90"
                : "bg-destructive hover:bg-destructive/90"
            )}
          >
            {type === 'income' ? (
              <>
                <TrendingUp className="h-5 w-5 mr-2" />
                Record Income
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 mr-2" />
                Record Expense
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

