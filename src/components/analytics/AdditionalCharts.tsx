import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Transaction, Party, PAYMENT_METHODS } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { kyatsToLakhs } from '@/lib/formatters';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, getDay } from 'date-fns';
import { CreditCard, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface AdditionalChartsProps {
  transactions: Transaction[];
  parties?: Party[];
}

export function AdditionalCharts({ transactions, parties = [] }: AdditionalChartsProps) {
  const { showInLakhs } = useCurrency();

  const formatValue = (value: number) => {
    if (showInLakhs) {
      return `${kyatsToLakhs(value).toFixed(2)}L`;
    }
    return `${(value / 1000000).toFixed(1)}M`;
  };

  // Cash Flow Trend (6 months)
  const cashFlowTrend = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(now),
    });

    return months.map(month => {
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
        monthShort: format(month, 'MMM'),
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions]);

  // Income vs Expense (Monthly bar chart)
  const incomeVsExpense = useMemo(() => {
    return cashFlowTrend.map(item => ({
      month: item.monthShort,
      Income: item.income,
      Expense: item.expense,
    }));
  }, [cashFlowTrend]);

  // Top 5 Customers/Suppliers
  const topParties = useMemo(() => {
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

    return Array.from(partyMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, parties]);

  // Payment Method Distribution
  const paymentMethodData = useMemo(() => {
    const methodMap = new Map<string, number>();

    transactions.forEach(tx => {
      const existing = methodMap.get(tx.paymentMethod) || 0;
      methodMap.set(tx.paymentMethod, existing + tx.amount);
    });

    return Array.from(methodMap.entries())
      .map(([method, amount]) => ({
        name: PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]?.label || method,
        value: amount,
        method,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = [
    'hsl(152, 69%, 40%)',
    'hsl(211, 100%, 50%)',
    'hsl(45, 100%, 50%)',
    'hsl(262, 80%, 50%)',
    'hsl(339, 100%, 50%)',
    'hsl(210, 40%, 40%)',
  ];

  // Daily Average Spending (by day of week)
  const dailyAverage = useMemo(() => {
    const dayMap = new Map<number, { count: number; total: number }>();

    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const day = getDay(new Date(tx.date));
        const existing = dayMap.get(day) || { count: 0, total: 0 };
        dayMap.set(day, {
          count: existing.count + 1,
          total: existing.total + tx.amount,
        });
      });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const data = dayMap.get(i) || { count: 0, total: 0 };
      return {
        day: dayNames[i],
        average: data.count > 0 ? data.total / data.count : 0,
        count: data.count,
      };
    });
  }, [transactions]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Cash Flow Trend */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse-subtle" />
            Cash Flow Trend (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '50ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="monthShort"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={formatValue}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    showInLakhs 
                      ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                      : `${value.toLocaleString()} MMK`,
                    name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                  animationDuration={200}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(152, 69%, 40%)" 
                  strokeWidth={2}
                  name="Income"
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  dot={{ r: 4, transition: 'all 0.2s' }}
                  activeDot={{ r: 6, transition: 'all 0.2s' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(0, 72%, 51%)" 
                  strokeWidth={2}
                  name="Expense"
                  animationBegin={100}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  dot={{ r: 4, transition: 'all 0.2s' }}
                  activeDot={{ r: 6, transition: 'all 0.2s' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Net"
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  dot={{ r: 4, transition: 'all 0.2s' }}
                  activeDot={{ r: 6, transition: 'all 0.2s' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income vs Expense */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive animate-pulse-subtle" />
            Income vs Expense (Monthly)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '150ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={formatValue}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    showInLakhs 
                      ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                      : `${value.toLocaleString()} MMK`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                  animationDuration={200}
                />
                <Legend />
                <Bar 
                  dataKey="Income" 
                  fill="hsl(152, 69%, 40%)"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="Expense" 
                  fill="hsl(0, 72%, 51%)"
                  animationBegin={100}
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Customers/Suppliers */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary animate-pulse-subtle" />
            Top 5 Customers/Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '250ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topParties} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  type="number"
                  tickFormatter={formatValue}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [
                    showInLakhs 
                      ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                      : `${value.toLocaleString()} MMK`,
                    'Total'
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
                  dataKey="total" 
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

      {/* Payment Method Distribution */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary animate-pulse-subtle" />
            Payment Method Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '350ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
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

      {/* Daily Average Spending */}
      <Card className="lg:col-span-2 animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary animate-pulse-subtle" />
            Daily Average Spending (by Day of Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '450ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyAverage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={formatValue}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    showInLakhs 
                      ? `${kyatsToLakhs(value).toFixed(2)} Lakhs`
                      : `${value.toLocaleString()} MMK`,
                    name === 'average' ? 'Average' : 'Count'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                  animationDuration={200}
                />
                <Legend />
                <Bar 
                  dataKey="average" 
                  fill="hsl(0, 72%, 51%)" 
                  name="Average Spending"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

