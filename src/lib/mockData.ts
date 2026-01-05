import { Transaction, Party, DashboardStats, CategoryBreakdown, TransactionCategory, CATEGORY_COLORS, PaymentMethod } from './types';

// Generate mock transactions for the last 30 days
export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  const incomeCategories: TransactionCategory[] = ['sales', 'services', 'other_income'];
  const expenseCategories: TransactionCategory[] = ['inventory', 'rent', 'utilities', 'salaries', 'transport', 'marketing', 'equipment'];
  const paymentMethods = ['cash', 'kbzpay', 'wavemoney', 'cbpay', 'ayapay', 'bank_transfer'] as const;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // 2-4 transactions per day
    const numTransactions = Math.floor(Math.random() * 3) + 2;
    
    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.4; // 60% income
      const type = isIncome ? 'income' : 'expense';
      const categories = isIncome ? incomeCategories : expenseCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Amounts between 50,000 and 5,000,000 MMK
      const amount = Math.floor(Math.random() * 4950000) + 50000;
      
      transactions.push({
        id: `txn_${i}_${j}`,
        date: new Date(date.setHours(Math.floor(Math.random() * 12) + 8)),
        amount,
        type,
        category,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: isIncome ? `Sale #${1000 + i * 10 + j}` : `${category} expense`,
        createdAt: date,
        updatedAt: date,
      });
    }
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateMockParties(): Party[] {
  const customers = [
    { name: 'U Kyaw Win', phone: '09123456789', balance: 1500000 },
    { name: 'Daw Su Su', phone: '09234567890', balance: 750000 },
    { name: 'Ko Myo', phone: '09345678901', balance: -250000 },
    { name: 'Ma Thida', phone: '09456789012', balance: 2000000 },
  ];
  
  const suppliers = [
    { name: 'Golden Star Trading', phone: '09567890123', balance: -3500000 },
    { name: 'Myanmar Wholesale', phone: '09678901234', balance: -1200000 },
    { name: 'City Supplies', phone: '09789012345', balance: -800000 },
  ];
  
  const now = new Date();
  
  return [
    ...customers.map((c, i) => ({
      id: `cust_${i}`,
      ...c,
      type: 'customer' as const,
      createdAt: now,
      updatedAt: now,
    })),
    ...suppliers.map((s, i) => ({
      id: `supp_${i}`,
      ...s,
      type: 'supplier' as const,
      createdAt: now,
      updatedAt: now,
    })),
  ];
}

export function calculateStats(
  transactions: Transaction[],
  dateRange?: { from: Date | undefined; to: Date | undefined },
  parties?: Party[]
): DashboardStats {
  let filteredTransactions = transactions;
  
  if (dateRange?.from || dateRange?.to) {
    filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
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
      
      return true;
    });
  } else {
    // Default to last 30 days if no range specified
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filteredTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);
  }
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate total balance (Cash + Digital wallets)
  // This represents the running balance from all transactions
  const digitalWalletMethods: PaymentMethod[] = ['kbzpay', 'wavemoney', 'cbpay', 'ayapay', 'bank_transfer'];
  
  // Calculate balance by processing all transactions chronologically
  let cashBalance = 0;
  let digitalBalance = 0;
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  sortedTransactions.forEach(t => {
    const amount = t.type === 'income' ? t.amount : -t.amount;
    if (t.paymentMethod === 'cash') {
      cashBalance += amount;
    } else if (digitalWalletMethods.includes(t.paymentMethod)) {
      digitalBalance += amount;
    }
  });
  
  const totalBalance = cashBalance + digitalBalance;
  
  // Calculate receivables and payables from parties
  let receivables = 0;
  let payables = 0;
  if (parties) {
    receivables = parties
      .filter(p => p.type === 'customer' && p.balance > 0)
      .reduce((sum, p) => sum + p.balance, 0);
    
    payables = parties
      .filter(p => p.type === 'supplier' && p.balance < 0)
      .reduce((sum, p) => sum + Math.abs(p.balance), 0);
  } else {
    // Fallback to mock values
    receivables = 4000000;
    payables = 5500000;
  }
  
  const pendingPayments = receivables + payables;
  
  return {
    totalIncome,
    totalExpense,
    netCashFlow: totalIncome - totalExpense,
    receivables,
    payables,
    totalBalance,
    pendingPayments,
  };
}

export function getCategoryBreakdown(transactions: Transaction[], type: 'income' | 'expense'): CategoryBreakdown[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filtered = transactions.filter(t => t.type === type && t.date >= thirtyDaysAgo);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  
  const byCategory = filtered.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(byCategory)
    .map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
      percentage: Math.round((amount / total) * 100),
      color: CATEGORY_COLORS[category as TransactionCategory],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getDailyCashFlow(
  transactions: Transaction[],
  dateRange?: { from: Date | undefined; to: Date | undefined }
): { date: string; income: number; expense: number; net: number }[] {
  let filteredTransactions = transactions;
  let startDate: Date;
  let endDate: Date = new Date();
  
  if (dateRange?.from || dateRange?.to) {
    startDate = dateRange.from || new Date(0);
    endDate = dateRange.to || new Date();
    
    filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
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
      
      return true;
    });
  } else {
    // Default to last 30 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }
  
  const dailyData: Record<string, { income: number; expense: number }> = {};
  
  // Initialize all days in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = currentDate.toISOString().split('T')[0];
    dailyData[key] = { income: 0, expense: 0 };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fill with transaction data
  filteredTransactions.forEach(t => {
    const key = t.date.toISOString().split('T')[0];
    if (dailyData[key]) {
      if (t.type === 'income') {
        dailyData[key].income += t.amount;
      } else {
        dailyData[key].expense += t.amount;
      }
    }
  });
  
  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
