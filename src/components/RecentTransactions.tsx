import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, PAYMENT_METHODS } from '@/lib/types';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import { getRelativeTime } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <a href="/transactions" className="text-sm text-primary hover:underline">
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recent.map((tx, index) => (
            <div 
              key={tx.id} 
              className={cn(
                "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors touch-manipulation",
                "animate-fade-in min-h-[64px] sm:min-h-[72px]"
              )}
              style={{ animationDelay: `${(index + 4) * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "flex h-12 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0",
                  tx.type === 'income' 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="h-6 w-6 sm:h-5 sm:w-5" />
                  ) : (
                    <TrendingDown className="h-6 w-6 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{tx.notes || tx.category}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <PaymentMethodBadge method={tx.paymentMethod} size="sm" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(tx.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-2 shrink-0">
                <MoneyDisplay 
                  amount={tx.type === 'income' ? tx.amount : -tx.amount} 
                  showSign 
                  size="md"
                  className={cn(
                    "text-right font-bold",
                    tx.type === 'income' ? "text-success" : "text-destructive"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
