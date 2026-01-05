import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import { 
  TransactionType, 
  PaymentMethod, 
  TransactionCategory,
  PAYMENT_METHODS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '@/lib/types';
import { formatInputWithCommas, parseNumberInput } from '@/lib/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Sparkles,
  Banknote,
  Smartphone,
  Waves,
  CreditCard,
  Wallet,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  banknote: Banknote,
  smartphone: Smartphone,
  waves: Waves,
  'credit-card': CreditCard,
  wallet: Wallet,
  'building-2': Building2,
};

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    type: TransactionType;
    amount: number;
    category: TransactionCategory;
    paymentMethod: PaymentMethod;
    notes: string;
  }) => void;
}

export function TransactionForm({ open, onOpenChange, onSubmit }: TransactionFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [smsText, setSmsText] = useState('');
  const [showSmsParser, setShowSmsParser] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setType('income');
      setAmount('');
      setCategory('');
      setPaymentMethod('cash');
      setNotes('');
      setSmsText('');
      setShowSmsParser(false);
    }
  }, [open]);

  // Auto-parse SMS
  const handleParseSms = () => {
    // Mock parsing - matches pattern like "Ngwe Lwe: 150,000 MMK from Mg Mg..."
    const amountMatch = smsText.match(/(\d{1,3}(?:,\d{3})*)\s*MMK/i);
    const senderMatch = smsText.match(/from\s+([^(]+)/i);
    
    if (amountMatch) {
      setAmount(amountMatch[1]);
      setType('income');
      setPaymentMethod('kbzpay');
      setCategory('sales');
      if (senderMatch) {
        setNotes(`Received from ${senderMatch[1].trim()}`);
      }
      toast({
        title: "SMS Parsed Successfully!",
        description: `Detected ${amountMatch[1]} MMK incoming payment`,
      });
      setShowSmsParser(false);
    } else {
      toast({
        title: "Could not parse SMS",
        description: "Please enter the details manually",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit?.({
      type,
      amount: parseNumberInput(amount),
      category: category as TransactionCategory,
      paymentMethod,
      notes,
    });

    toast({
      title: "Transaction Added!",
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${amount} MMK recorded`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Transaction</DialogTitle>
          <DialogDescription>Record a new money in or out transaction</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Type Toggle */}
          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger 
                value="income" 
                className={cn(
                  "data-[state=active]:bg-success data-[state=active]:text-success-foreground",
                  "flex items-center gap-2 font-medium"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                Money In
              </TabsTrigger>
              <TabsTrigger 
                value="expense" 
                className={cn(
                  "data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground",
                  "flex items-center gap-2 font-medium"
                )}
              >
                <TrendingDown className="h-4 w-4" />
                Money Out
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* SMS Parser Toggle */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowSmsParser(!showSmsParser)}
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Auto-fill from KPay/Wave SMS
          </Button>

          {showSmsParser && (
            <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border animate-slide-up">
              <Label>Paste SMS or receipt text</Label>
              <Textarea
                placeholder="e.g., Ngwe Lwe: 150,000 MMK from Mg Mg (09xxxx) on 12/01/2026. Trans ID: 12345."
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                type="button" 
                onClick={handleParseSms}
                className="w-full"
                disabled={!smsText}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Parse & Auto-fill
              </Button>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount (MMK)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatInputWithCommas(e.target.value))}
                className="text-2xl font-bold h-14 pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                MMK
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TransactionCategory)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span>{value.label}</span>
                    <span className="ml-2 text-muted-foreground text-xs">{value.labelMm}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
                const info = PAYMENT_METHODS[method];
                const Icon = PAYMENT_ICONS[info.icon];
                const isSelected = paymentMethod === method;
                
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-5 w-5" style={{ color: info.color }} />
                    <span className="text-xs font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Add any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant={type === 'income' ? 'income' : 'expense'}
            size="lg"
            className="w-full"
          >
            {type === 'income' ? (
              <>
                <TrendingUp className="h-5 w-5" />
                Record Income
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5" />
                Record Expense
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
