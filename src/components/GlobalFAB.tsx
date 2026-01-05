import { FloatingActionButton } from './FloatingActionButton';
import { useTransactions } from '@/hooks/use-transactions';

interface GlobalFABProps {
  onQuickIncome: () => void;
  onQuickExpense: () => void;
  onRepeatLast: () => void;
}

export function GlobalFAB({ onQuickIncome, onQuickExpense, onRepeatLast }: GlobalFABProps) {
  const { transactions } = useTransactions();
  const lastTransaction = transactions.length > 0 ? transactions[transactions.length - 1] : null;

  return (
    <FloatingActionButton
      onQuickIncome={onQuickIncome}
      onQuickExpense={onQuickExpense}
      onRepeatLast={onRepeatLast}
      lastTransaction={lastTransaction}
    />
  );
}

