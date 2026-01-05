// Analytics Export Utilities for Excel, PDF, and CSV
import { Transaction, Party, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from './types';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfQuarter, endOfQuarter, eachQuarterOfInterval, startOfYear, endOfYear, eachYearOfInterval, getDay } from 'date-fns';
import { calculateStats, getCategoryBreakdown } from './mockData';

interface AnalyticsData {
  stats: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    profitMargin: number;
  };
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  incomeBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthlyData: Array<{ month: string; income: number; expense: number; net: number }>;
  quarterlyData: Array<{ quarter: string; income: number; expense: number; net: number }>;
  yearlyData: Array<{ year: string; income: number; expense: number; net: number }>;
  topParties: Array<{ name: string; type: string; total: number }>;
  paymentMethodData: Array<{ name: string; value: number; percentage: number }>;
  dailyAverage: Array<{ day: string; average: number; count: number }>;
  insights: {
    expenseChange: { value: number; isPositive: boolean };
    biggestCategory: { name: string; percentage: number; amount: number } | null;
    topSpendingDay: { name: string; amount: number } | null;
    averageAmount: number;
  };
}

// Prepare analytics data
export const prepareAnalyticsData = (
  transactions: Transaction[],
  parties: Party[] = []
): AnalyticsData => {
  const stats = calculateStats(transactions);
  const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
  const incomeBreakdown = getCategoryBreakdown(transactions, 'income');

  // Monthly data
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: endOfMonth(now),
  });

  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = monthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      month: format(month, 'MMM yyyy'),
      income,
      expense,
      net: income - expense,
    };
  });

  // Quarterly data
  const twoYearsAgo = new Date(now.getFullYear() - 1, 0, 1);
  const quarters = eachQuarterOfInterval({
    start: startOfQuarter(twoYearsAgo),
    end: endOfQuarter(now),
  });

  const quarterlyData = quarters.map(quarter => {
    const quarterStart = startOfQuarter(quarter);
    const quarterEnd = endOfQuarter(quarter);
    
    const quarterTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= quarterStart && txDate <= quarterEnd;
    });

    const income = quarterTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = quarterTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      quarter: `Q${Math.floor(quarter.getMonth() / 3) + 1} ${quarter.getFullYear()}`,
      income,
      expense,
      net: income - expense,
    };
  });

  // Yearly data
  const threeYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
  const years = eachYearOfInterval({
    start: startOfYear(threeYearsAgo),
    end: endOfYear(now),
  });

  const yearlyData = years.map(year => {
    const yearStart = startOfYear(year);
    const yearEnd = endOfYear(year);
    
    const yearTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= yearStart && txDate <= yearEnd;
    });

    const income = yearTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = yearTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      year: year.getFullYear().toString(),
      income,
      expense,
      net: income - expense,
    };
  });

  // Top parties
  const partyMap = new Map<string, { name: string; type: 'customer' | 'supplier'; total: number }>();
  transactions.forEach(tx => {
    if (!tx.partyId) return;
    const party = parties.find(p => p.id === tx.partyId);
    if (!party) return;

    const key = party.id;
    const existing = partyMap.get(key);
    if (existing) {
      existing.total += tx.amount;
    } else {
      partyMap.set(key, {
        name: party.name,
        type: party.type,
        total: tx.amount,
      });
    }
  });

  const topParties = Array.from(partyMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Payment method distribution
  const methodMap = new Map<string, number>();
  transactions.forEach(tx => {
    const existing = methodMap.get(tx.paymentMethod) || 0;
    methodMap.set(tx.paymentMethod, existing + tx.amount);
  });

  const totalByMethod = Array.from(methodMap.values()).reduce((sum, val) => sum + val, 0);
  const paymentMethodData = Array.from(methodMap.entries())
    .map(([method, amount]) => ({
      name: PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]?.label || method,
      value: amount,
      percentage: totalByMethod > 0 ? (amount / totalByMethod) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Daily average
  const dayMap = new Map<number, { count: number; total: number }>();
  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const day = new Date(tx.date).getDay();
      const existing = dayMap.get(day) || { count: 0, total: 0 };
      dayMap.set(day, {
        count: existing.count + 1,
        total: existing.total + tx.amount,
      });
    });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyAverage = Array.from({ length: 7 }, (_, i) => {
    const data = dayMap.get(i) || { count: 0, total: 0 };
    return {
      day: dayNames[i],
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    };
  });

  // Insights
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthTx = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= currentMonthStart && txDate <= currentMonthEnd;
  });

  const lastMonthTx = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= lastMonthStart && txDate <= lastMonthEnd;
  });

  const currentExpense = currentMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const lastExpense = lastMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenseChange = lastExpense > 0 
    ? ((currentExpense - lastExpense) / lastExpense) * 100 
    : 0;

  const expenseByCategory = new Map<string, number>();
  currentMonthTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const existing = expenseByCategory.get(tx.category) || 0;
      expenseByCategory.set(tx.category, existing + tx.amount);
    });

  const biggestCategory = Array.from(expenseByCategory.entries())
    .sort((a, b) => b[1] - a[1])[0];

  const categoryPercentage = biggestCategory && currentExpense > 0
    ? (biggestCategory[1] / currentExpense) * 100 
    : 0;

  const dayMap2 = new Map<number, number>();
  currentMonthTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const day = new Date(tx.date).getDay();
      const existing = dayMap2.get(day) || 0;
      dayMap2.set(day, existing + tx.amount);
    });

  const topSpendingDay = Array.from(dayMap2.entries())
    .sort((a, b) => b[1] - a[1])[0];

  const allAmounts = transactions.map(tx => tx.amount);
  const averageAmount = allAmounts.length > 0
    ? allAmounts.reduce((sum, amt) => sum + amt, 0) / allAmounts.length
    : 0;

  return {
    stats: {
      ...stats,
      profitMargin: stats.totalIncome > 0 ? (stats.netCashFlow / stats.totalIncome) * 100 : 0,
    },
    expenseBreakdown: expenseBreakdown.map(item => ({
      category: EXPENSE_CATEGORIES[item.category]?.label || item.category,
      amount: item.amount,
      percentage: item.percentage,
    })),
    incomeBreakdown: incomeBreakdown.map(item => ({
      category: INCOME_CATEGORIES[item.category]?.label || item.category,
      amount: item.amount,
      percentage: item.percentage,
    })),
    monthlyData,
    quarterlyData,
    yearlyData,
    topParties,
    paymentMethodData,
    dailyAverage,
    insights: {
      expenseChange: {
        value: Math.abs(expenseChange),
        isPositive: expenseChange >= 0,
      },
      biggestCategory: biggestCategory ? {
        name: EXPENSE_CATEGORIES[biggestCategory[0]]?.label || biggestCategory[0],
        percentage: categoryPercentage,
        amount: biggestCategory[1],
      } : null,
      topSpendingDay: topSpendingDay ? {
        name: dayNames[topSpendingDay[0]],
        amount: topSpendingDay[1],
      } : null,
      averageAmount,
    },
  };
};

// Export to CSV
export const exportAnalyticsToCSV = (
  transactions: Transaction[],
  parties: Party[],
  filename: string = 'analytics-report'
) => {
  const data = prepareAnalyticsData(transactions, parties);
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  let csv = `Analytics Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n`;
  csv += `Generated by KyatFlow\n\n`;

  // Summary Statistics
  csv += `=== SUMMARY STATISTICS ===\n`;
  csv += `Metric,Value (MMK),Percentage\n`;
  csv += `Total Income,${data.stats.totalIncome.toLocaleString()},\n`;
  csv += `Total Expenses,${data.stats.totalExpense.toLocaleString()},\n`;
  csv += `Net Cash Flow,${data.stats.netCashFlow.toLocaleString()},\n`;
  csv += `Profit Margin,${data.stats.profitMargin.toFixed(2)}%,\n\n`;

  // Expense Breakdown
  csv += `=== EXPENSE BREAKDOWN ===\n`;
  csv += `Category,Amount (MMK),Percentage\n`;
  data.expenseBreakdown.forEach(item => {
    csv += `${item.category},${item.amount.toLocaleString()},${item.percentage.toFixed(2)}%\n`;
  });
  csv += `\n`;

  // Income Breakdown
  csv += `=== INCOME BREAKDOWN ===\n`;
  csv += `Category,Amount (MMK),Percentage\n`;
  data.incomeBreakdown.forEach(item => {
    csv += `${item.category},${item.amount.toLocaleString()},${item.percentage.toFixed(2)}%\n`;
  });
  csv += `\n`;

  // Monthly Data
  csv += `=== MONTHLY COMPARISON (Last 6 Months) ===\n`;
  csv += `Month,Income (MMK),Expense (MMK),Net (MMK)\n`;
  data.monthlyData.forEach(item => {
    csv += `${item.month},${item.income.toLocaleString()},${item.expense.toLocaleString()},${item.net.toLocaleString()}\n`;
  });
  csv += `\n`;

  // Quarterly Data
  csv += `=== QUARTERLY PERFORMANCE ===\n`;
  csv += `Quarter,Income (MMK),Expense (MMK),Net (MMK)\n`;
  data.quarterlyData.forEach(item => {
    csv += `${item.quarter},${item.income.toLocaleString()},${item.expense.toLocaleString()},${item.net.toLocaleString()}\n`;
  });
  csv += `\n`;

  // Yearly Data
  csv += `=== YEARLY TRENDS ===\n`;
  csv += `Year,Income (MMK),Expense (MMK),Net (MMK)\n`;
  data.yearlyData.forEach(item => {
    csv += `${item.year},${item.income.toLocaleString()},${item.expense.toLocaleString()},${item.net.toLocaleString()}\n`;
  });
  csv += `\n`;

  // Top Parties
  csv += `=== TOP 5 CUSTOMERS/SUPPLIERS ===\n`;
  csv += `Name,Type,Total Amount (MMK)\n`;
  data.topParties.forEach(item => {
    csv += `${item.name},${item.type},${item.total.toLocaleString()}\n`;
  });
  csv += `\n`;

  // Payment Method Distribution
  csv += `=== PAYMENT METHOD DISTRIBUTION ===\n`;
  csv += `Method,Amount (MMK),Percentage\n`;
  data.paymentMethodData.forEach(item => {
    csv += `${item.name},${item.value.toLocaleString()},${item.percentage.toFixed(2)}%\n`;
  });
  csv += `\n`;

  // Daily Average
  csv += `=== DAILY AVERAGE SPENDING ===\n`;
  csv += `Day,Average Amount (MMK),Transaction Count\n`;
  data.dailyAverage.forEach(item => {
    csv += `${item.day},${item.average.toLocaleString()},${item.count}\n`;
  });
  csv += `\n`;

  // Insights
  csv += `=== KEY INSIGHTS ===\n`;
  csv += `Metric,Value\n`;
  csv += `Expense Change This Month,${data.insights.expenseChange.isPositive ? '+' : '-'}${data.insights.expenseChange.value.toFixed(2)}%\n`;
  if (data.insights.biggestCategory) {
    csv += `Biggest Expense Category,${data.insights.biggestCategory.name} (${data.insights.biggestCategory.percentage.toFixed(2)}%)\n`;
  }
  if (data.insights.topSpendingDay) {
    csv += `Top Spending Day,${data.insights.topSpendingDay.name} (${data.insights.topSpendingDay.amount.toLocaleString()} MMK)\n`;
  }
  csv += `Average Transaction Amount,${data.insights.averageAmount.toLocaleString()} MMK\n`;

  // Download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to Excel (TSV format) - Complete Analytics Page Data
export const exportAnalyticsToExcel = (
  transactions: Transaction[],
  parties: Party[],
  filename: string = 'analytics-report'
) => {
  const data = prepareAnalyticsData(transactions, parties);
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  let tsv = `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `📊 COMPLETE ANALYTICS REPORT - ENTIRE PAGE DATA\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\t\n`;
  tsv += `Generated by: KyatFlow - Smart Finance OS\t\n`;
  tsv += `Total Transactions: ${transactions.length}\t\n`;
  tsv += `Total Parties: ${parties.length}\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n\n`;

  // Summary Statistics
  tsv += `=== SUMMARY STATISTICS ===\t\n`;
  tsv += `Metric\tValue (MMK)\tPercentage\n`;
  tsv += `Total Income\t${data.stats.totalIncome.toLocaleString()}\t\n`;
  tsv += `Total Expenses\t${data.stats.totalExpense.toLocaleString()}\t\n`;
  tsv += `Net Cash Flow\t${data.stats.netCashFlow.toLocaleString()}\t\n`;
  tsv += `Profit Margin\t${data.stats.profitMargin.toFixed(2)}%\t\n\n`;

  // Expense Breakdown
  tsv += `=== EXPENSE BREAKDOWN ===\t\n`;
  tsv += `Category\tAmount (MMK)\tPercentage\n`;
  data.expenseBreakdown.forEach(item => {
    tsv += `${item.category}\t${item.amount.toLocaleString()}\t${item.percentage.toFixed(2)}%\n`;
  });
  tsv += `\n`;

  // Income Breakdown
  tsv += `=== INCOME BREAKDOWN ===\t\n`;
  tsv += `Category\tAmount (MMK)\tPercentage\n`;
  data.incomeBreakdown.forEach(item => {
    tsv += `${item.category}\t${item.amount.toLocaleString()}\t${item.percentage.toFixed(2)}%\n`;
  });
  tsv += `\n`;

  // Monthly Data
  tsv += `=== MONTHLY COMPARISON (Last 6 Months) ===\t\n`;
  tsv += `Month\tIncome (MMK)\tExpense (MMK)\tNet (MMK)\n`;
  data.monthlyData.forEach(item => {
    tsv += `${item.month}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Quarterly Data
  tsv += `=== QUARTERLY PERFORMANCE ===\t\n`;
  tsv += `Quarter\tIncome (MMK)\tExpense (MMK)\tNet (MMK)\n`;
  data.quarterlyData.forEach(item => {
    tsv += `${item.quarter}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Yearly Data
  tsv += `=== YEARLY TRENDS ===\t\n`;
  tsv += `Year\tIncome (MMK)\tExpense (MMK)\tNet (MMK)\n`;
  data.yearlyData.forEach(item => {
    tsv += `${item.year}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Top Parties
  tsv += `=== TOP 5 CUSTOMERS/SUPPLIERS ===\t\n`;
  tsv += `Name\tType\tTotal Amount (MMK)\n`;
  data.topParties.forEach(item => {
    tsv += `${item.name}\t${item.type}\t${item.total.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Payment Method Distribution
  tsv += `=== PAYMENT METHOD DISTRIBUTION ===\t\n`;
  tsv += `Method\tAmount (MMK)\tPercentage\n`;
  data.paymentMethodData.forEach(item => {
    tsv += `${item.name}\t${item.value.toLocaleString()}\t${item.percentage.toFixed(2)}%\n`;
  });
  tsv += `\n`;

  // Daily Average
  tsv += `=== DAILY AVERAGE SPENDING ===\t\n`;
  tsv += `Day\tAverage Amount (MMK)\tTransaction Count\n`;
  data.dailyAverage.forEach(item => {
    tsv += `${item.day}\t${item.average.toLocaleString()}\t${item.count}\n`;
  });
  tsv += `\n`;

  // Insights
  tsv += `=== KEY INSIGHTS ===\t\n`;
  tsv += `Metric\tValue\n`;
  tsv += `Expense Change This Month\t${data.insights.expenseChange.isPositive ? '+' : '-'}${data.insights.expenseChange.value.toFixed(2)}%\n`;
  if (data.insights.biggestCategory) {
    tsv += `Biggest Expense Category\t${data.insights.biggestCategory.name} (${data.insights.biggestCategory.percentage.toFixed(2)}%)\n`;
  }
  if (data.insights.topSpendingDay) {
    tsv += `Top Spending Day\t${data.insights.topSpendingDay.name} (${data.insights.topSpendingDay.amount.toLocaleString()} MMK)\n`;
  }
  tsv += `Average Transaction Amount\t${data.insights.averageAmount.toLocaleString()} MMK\n`;
  tsv += `\n`;

  // ========== OVERVIEW TAB DATA ==========
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `📈 OVERVIEW TAB - CHART DATA\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n\n`;

  // Expense Breakdown Pie Chart Data
  tsv += `--- WHERE MONEY GOES (Expense Breakdown Chart) ---\t\n`;
  tsv += `Category\tAmount (MMK)\tPercentage\tColor\n`;
  data.expenseBreakdown.forEach((item, index) => {
    tsv += `${item.category}\t${item.amount.toLocaleString()}\t${item.percentage.toFixed(2)}%\tChart Color ${index + 1}\n`;
  });
  tsv += `\n`;

  // Income Sources Bar Chart Data
  tsv += `--- INCOME SOURCES (Bar Chart Data) ---\t\n`;
  tsv += `Category\tAmount (MMK)\tPercentage\n`;
  data.incomeBreakdown.forEach(item => {
    tsv += `${item.category}\t${item.amount.toLocaleString()}\t${item.percentage.toFixed(2)}%\n`;
  });
  tsv += `\n`;

  // ========== TIME COMPARISON TAB DATA ==========
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `📅 TIME COMPARISON TAB - ALL COMPARISON DATA\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n\n`;

  // Month-over-Month Line Chart Data
  tsv += `--- MONTH-OVER-MONTH COMPARISON (Line Chart) ---\t\n`;
  tsv += `Month\tIncome (MMK)\tExpense (MMK)\tNet Cash Flow (MMK)\tGrowth Rate\n`;
  data.monthlyData.forEach((item, index) => {
    const prevItem = index > 0 ? data.monthlyData[index - 1] : null;
    const growthRate = prevItem && prevItem.income > 0 
      ? (((item.income - prevItem.income) / prevItem.income) * 100).toFixed(2) + '%'
      : 'N/A';
    tsv += `${item.month}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\t${growthRate}\n`;
  });
  tsv += `\n`;

  // Quarter-over-Quarter Bar Chart Data
  tsv += `--- QUARTER-OVER-QUARTER PERFORMANCE (Bar Chart) ---\t\n`;
  tsv += `Quarter\tIncome (MMK)\tExpense (MMK)\tNet Cash Flow (MMK)\n`;
  data.quarterlyData.forEach(item => {
    tsv += `${item.quarter}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Year-over-Year Bar Chart Data
  tsv += `--- YEAR-OVER-YEAR TRENDS (Bar Chart) ---\t\n`;
  tsv += `Year\tIncome (MMK)\tExpense (MMK)\tNet Cash Flow (MMK)\tYear-over-Year Growth\n`;
  data.yearlyData.forEach((item, index) => {
    const prevItem = index > 0 ? data.yearlyData[index - 1] : null;
    const yoyGrowth = prevItem && prevItem.income > 0
      ? (((item.income - prevItem.income) / prevItem.income) * 100).toFixed(2) + '%'
      : 'N/A';
    tsv += `${item.year}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\t${yoyGrowth}\n`;
  });
  tsv += `\n`;

  // ========== DETAILED CHARTS TAB DATA ==========
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `📊 DETAILED CHARTS TAB - ALL CHART DATA\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n\n`;

  // Cash Flow Trend
  tsv += `--- CASH FLOW TREND (6 Months Line Chart) ---\t\n`;
  tsv += `Month\tIncome (MMK)\tExpense (MMK)\tNet Cash Flow (MMK)\n`;
  data.monthlyData.forEach(item => {
    tsv += `${item.month}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${item.net.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Income vs Expense
  tsv += `--- INCOME VS EXPENSE (Monthly Bar Chart Comparison) ---\t\n`;
  tsv += `Month\tIncome (MMK)\tExpense (MMK)\tDifference (MMK)\n`;
  data.monthlyData.forEach(item => {
    tsv += `${item.month}\t${item.income.toLocaleString()}\t${item.expense.toLocaleString()}\t${(item.income - item.expense).toLocaleString()}\n`;
  });
  tsv += `\n`;

  // Top 5 Customers/Suppliers
  tsv += `--- TOP 5 CUSTOMERS/SUPPLIERS (By Transaction Value) ---\t\n`;
  tsv += `Rank\tName\tType\tTotal Amount (MMK)\tPercentage of Total\n`;
  const totalPartyAmount = data.topParties.reduce((sum, p) => sum + p.total, 0);
  data.topParties.forEach((item, index) => {
    const percentage = totalPartyAmount > 0 ? ((item.total / totalPartyAmount) * 100).toFixed(2) : '0.00';
    tsv += `${index + 1}\t${item.name}\t${item.type}\t${item.total.toLocaleString()}\t${percentage}%\n`;
  });
  tsv += `\n`;

  // Payment Method Distribution
  tsv += `--- PAYMENT METHOD DISTRIBUTION (Pie Chart) ---\t\n`;
  tsv += `Payment Method\tTotal Amount (MMK)\tPercentage\tTransaction Count\n`;
  data.paymentMethodData.forEach(item => {
    const txCount = transactions.filter(tx => {
      const methodLabel = PAYMENT_METHODS[tx.paymentMethod as keyof typeof PAYMENT_METHODS]?.label || tx.paymentMethod;
      return methodLabel === item.name;
    }).length;
    tsv += `${item.name}\t${item.value.toLocaleString()}\t${item.percentage.toFixed(2)}%\t${txCount}\n`;
  });
  tsv += `\n`;

  // Daily Average Spending
  tsv += `--- DAILY AVERAGE SPENDING (By Day of Week) ---\t\n`;
  tsv += `Day of Week\tAverage Amount (MMK)\tTotal Transactions\tTotal Amount (MMK)\n`;
  data.dailyAverage.forEach(item => {
    const totalAmount = item.average * item.count;
    tsv += `${item.day}\t${item.average.toLocaleString()}\t${item.count}\t${totalAmount.toLocaleString()}\n`;
  });
  tsv += `\n`;

  // ========== END OF REPORT ==========
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;
  tsv += `END OF ANALYTICS REPORT\t\n`;
  tsv += `═══════════════════════════════════════════════════════════════\t\n`;

  // Download
  const blob = new Blob(['\ufeff' + tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-complete-${timestamp}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to PDF
export const exportAnalyticsToPDF = async (
  transactions: Transaction[],
  parties: Party[],
  filename: string = 'analytics-report'
) => {
  const data = prepareAnalyticsData(transactions, parties);
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Analytics Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 12px 20px;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-radius: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #1f2937;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .summary-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .summary-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          .summary-item strong {
            display: block;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .summary-item .value {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
          }
          .insights-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .insight-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Analytics Report</h1>
          <p>Generated on ${timestamp} by KyatFlow</p>
        </div>

        <div class="summary-box">
          <h2 style="margin-bottom: 15px; color: #1e40af;">Summary Statistics</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>Total Income</strong>
              <div class="value">${data.stats.totalIncome.toLocaleString()} MMK</div>
            </div>
            <div class="summary-item">
              <strong>Total Expenses</strong>
              <div class="value">${data.stats.totalExpense.toLocaleString()} MMK</div>
            </div>
            <div class="summary-item">
              <strong>Net Cash Flow</strong>
              <div class="value" style="color: ${data.stats.netCashFlow >= 0 ? '#10b981' : '#ef4444'};">${data.stats.netCashFlow.toLocaleString()} MMK</div>
            </div>
            <div class="summary-item">
              <strong>Profit Margin</strong>
              <div class="value">${data.stats.profitMargin.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <!-- OVERVIEW TAB DATA -->
        <div class="tab-section">
          <div class="tab-title">📈 OVERVIEW TAB - Chart Data</div>
          
          <div class="section">
            <div class="section-title">Where Money Goes (Expense Breakdown Pie Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount (MMK)</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${data.expenseBreakdown.map(item => `
                  <tr>
                    <td>${item.category}</td>
                    <td>${item.amount.toLocaleString()}</td>
                    <td>${item.percentage.toFixed(2)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Income Sources (Bar Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount (MMK)</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${data.incomeBreakdown.map(item => `
                  <tr>
                    <td>${item.category}</td>
                    <td>${item.amount.toLocaleString()}</td>
                    <td>${item.percentage.toFixed(2)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TIME COMPARISON TAB DATA -->
        <div class="tab-section">
          <div class="tab-title">📅 TIME COMPARISON TAB - All Comparison Data</div>
          
          <div class="section">
            <div class="section-title">Month-over-Month Comparison (Line Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income (MMK)</th>
                  <th>Expense (MMK)</th>
                  <th>Net (MMK)</th>
                  <th>Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                ${data.monthlyData.map((item, index) => {
                  const prevItem = index > 0 ? data.monthlyData[index - 1] : null;
                  const growthRate = prevItem && prevItem.income > 0 
                    ? (((item.income - prevItem.income) / prevItem.income) * 100).toFixed(2) + '%'
                    : 'N/A';
                  return `
                    <tr>
                      <td>${item.month}</td>
                      <td>${item.income.toLocaleString()}</td>
                      <td>${item.expense.toLocaleString()}</td>
                      <td style="color: ${item.net >= 0 ? '#10b981' : '#ef4444'};">${item.net.toLocaleString()}</td>
                      <td>${growthRate}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Quarterly Performance (Bar Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Income (MMK)</th>
                  <th>Expense (MMK)</th>
                  <th>Net (MMK)</th>
                </tr>
              </thead>
              <tbody>
                ${data.quarterlyData.map(item => `
                  <tr>
                    <td>${item.quarter}</td>
                    <td>${item.income.toLocaleString()}</td>
                    <td>${item.expense.toLocaleString()}</td>
                    <td style="color: ${item.net >= 0 ? '#10b981' : '#ef4444'};">${item.net.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Year-over-Year Trends (Bar Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Income (MMK)</th>
                  <th>Expense (MMK)</th>
                  <th>Net (MMK)</th>
                  <th>YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                ${data.yearlyData.map((item, index) => {
                  const prevItem = index > 0 ? data.yearlyData[index - 1] : null;
                  const yoyGrowth = prevItem && prevItem.income > 0
                    ? (((item.income - prevItem.income) / prevItem.income) * 100).toFixed(2) + '%'
                    : 'N/A';
                  return `
                    <tr>
                      <td>${item.year}</td>
                      <td>${item.income.toLocaleString()}</td>
                      <td>${item.expense.toLocaleString()}</td>
                      <td style="color: ${item.net >= 0 ? '#10b981' : '#ef4444'};">${item.net.toLocaleString()}</td>
                      <td>${yoyGrowth}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- DETAILED CHARTS TAB DATA -->
        <div class="tab-section">
          <div class="tab-title">📊 DETAILED CHARTS TAB - All Chart Data</div>
          
          <div class="section">
            <div class="section-title">Cash Flow Trend (6 Months Line Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income (MMK)</th>
                  <th>Expense (MMK)</th>
                  <th>Net Cash Flow (MMK)</th>
                </tr>
              </thead>
              <tbody>
                ${data.monthlyData.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td>${item.income.toLocaleString()}</td>
                    <td>${item.expense.toLocaleString()}</td>
                    <td style="color: ${item.net >= 0 ? '#10b981' : '#ef4444'};">${item.net.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Income vs Expense (Monthly Bar Chart Comparison)</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income (MMK)</th>
                  <th>Expense (MMK)</th>
                  <th>Difference (MMK)</th>
                </tr>
              </thead>
              <tbody>
                ${data.monthlyData.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td>${item.income.toLocaleString()}</td>
                    <td>${item.expense.toLocaleString()}</td>
                    <td style="color: ${(item.income - item.expense) >= 0 ? '#10b981' : '#ef4444'};">${(item.income - item.expense).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Top 5 Customers/Suppliers (By Transaction Value)</div>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Total Amount (MMK)</th>
                  <th>Percentage of Total</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const totalPartyAmount = data.topParties.reduce((sum, p) => sum + p.total, 0);
                  return data.topParties.map((item, index) => {
                    const percentage = totalPartyAmount > 0 ? ((item.total / totalPartyAmount) * 100).toFixed(2) : '0.00';
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.type}</td>
                        <td>${item.total.toLocaleString()}</td>
                        <td>${percentage}%</td>
                      </tr>
                    `;
                  }).join('');
                })()}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Payment Method Distribution (Pie Chart)</div>
            <table>
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Total Amount (MMK)</th>
                  <th>Percentage</th>
                  <th>Transaction Count</th>
                </tr>
              </thead>
              <tbody>
                ${data.paymentMethodData.map(item => {
                  const txCount = transactions.filter(tx => {
                    const methodLabel = PAYMENT_METHODS[tx.paymentMethod as keyof typeof PAYMENT_METHODS]?.label || tx.paymentMethod;
                    return methodLabel === item.name;
                  }).length;
                  return `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.value.toLocaleString()}</td>
                      <td>${item.percentage.toFixed(2)}%</td>
                      <td>${txCount}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Daily Average Spending (By Day of Week)</div>
            <table>
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Average Amount (MMK)</th>
                  <th>Total Transactions</th>
                  <th>Total Amount (MMK)</th>
                </tr>
              </thead>
              <tbody>
                ${data.dailyAverage.map(item => {
                  const totalAmount = item.average * item.count;
                  return `
                    <tr>
                      <td>${item.day}</td>
                      <td>${item.average.toLocaleString()}</td>
                      <td>${item.count}</td>
                      <td>${totalAmount.toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="insights-box">
          <h2 style="margin-bottom: 15px; color: #92400e;">Key Insights</h2>
          <div class="insight-item">
            <strong>Expense Change This Month:</strong> 
            ${data.insights.expenseChange.isPositive ? '+' : '-'}${data.insights.expenseChange.value.toFixed(2)}% 
            ${data.insights.expenseChange.isPositive ? '(Increased)' : '(Decreased)'}
          </div>
          ${data.insights.biggestCategory ? `
            <div class="insight-item">
              <strong>Biggest Expense Category:</strong> 
              ${data.insights.biggestCategory.name} (${data.insights.biggestCategory.percentage.toFixed(2)}% - ${data.insights.biggestCategory.amount.toLocaleString()} MMK)
            </div>
          ` : ''}
          ${data.insights.topSpendingDay ? `
            <div class="insight-item">
              <strong>Top Spending Day:</strong> 
              ${data.insights.topSpendingDay.name} (${data.insights.topSpendingDay.amount.toLocaleString()} MMK)
            </div>
          ` : ''}
          <div class="insight-item">
            <strong>Average Transaction Amount:</strong> 
            ${data.insights.averageAmount.toLocaleString()} MMK
          </div>
        </div>

        <div class="footer">
          <p>This report was generated by KyatFlow - Smart Finance OS for Myanmar SMEs</p>
          <p>© ${new Date().getFullYear()} KyatFlow. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Wait a bit then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

