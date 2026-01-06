import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, PAYMENT_METHODS } from '@/lib/types';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import { getRelativeTime } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { memo } from 'react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <a href="/transactions" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No recent transactions"
              description="Your recent transactions will appear here"
              className="py-8"
            />
          ) : (
            <div className="divide-y divide-border">
              {recent.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 4 }}
              className={cn(
                "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors touch-manipulation cursor-pointer",
                "min-h-[64px] sm:min-h-[72px]"
              )}
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
            </motion.div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default memo(RecentTransactions);
