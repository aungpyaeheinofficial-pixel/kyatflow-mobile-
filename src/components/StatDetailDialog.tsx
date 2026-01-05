import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/lib/types';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { DateRange } from './DateFilter';

interface StatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense' | 'net';
  transactions: Transaction[];
  total: number;
  dateRange?: DateRange;
}

export function StatDetailDialog({
  open,
  onOpenChange,
  type,
  transactions,
  total,
  dateRange,
}: StatDetailDialogProps) {
  const filteredTransactions = transactions.filter(tx => {
    // Filter by type
    if (type === 'income' && tx.type !== 'income') return false;
    if (type === 'expense' && tx.type !== 'expense') return false;
    
    // Filter by date range if provided
    if (dateRange?.from || dateRange?.to) {
      const txDate = new Date(tx.date);
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
    }
    
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const getTitle = () => {
    switch (type) {
      case 'income':
        return 'Income Details';
      case 'expense':
        return 'Expense Details';
      default:
        return 'All Transactions';
    }
  };

  const getCategoryLabel = (category: string, txType: 'income' | 'expense') => {
    if (txType === 'income') {
      return INCOME_CATEGORIES[category]?.label || category;
    }
    return EXPENSE_CATEGORIES[category]?.label || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <MoneyDisplay amount={total} size="lg" />
            <span className="text-sm text-muted-foreground">
              ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'})
            </span>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <Card key={tx.id} className="hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        tx.type === 'income' 
                          ? "bg-success/10 text-success" 
                          : "bg-destructive/10 text-destructive"
                      )}>
                        {tx.type === 'income' ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{tx.notes || getCategoryLabel(tx.category, tx.type)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <PaymentMethodBadge method={tx.paymentMethod} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {tx.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <MoneyDisplay 
                      amount={tx.type === 'income' ? tx.amount : -tx.amount} 
                      showSign 
                      size="md"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

