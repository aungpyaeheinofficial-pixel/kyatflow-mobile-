import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Transaction } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { kyatsToLakhs } from '@/lib/formatters';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfQuarter, endOfQuarter, eachQuarterOfInterval, startOfYear, endOfYear, eachYearOfInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoneyDisplay } from '@/components/MoneyDisplay';

interface TimeComparisonChartsProps {
  transactions: Transaction[];
}

export function TimeComparisonCharts({ transactions }: TimeComparisonChartsProps) {
  const { showInLakhs } = useCurrency();

  const formatValue = (value: number) => {
    if (showInLakhs) {
      return `${kyatsToLakhs(value).toFixed(2)}L`;
    }
    return `${(value / 1000000).toFixed(1)}M`;
  };

  // Month-over-Month data
  const monthlyData = useMemo(() => {
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

  // Quarter-over-Quarter data
  const quarterlyData = useMemo(() => {
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 1, 0, 1);
    const quarters = eachQuarterOfInterval({
      start: startOfQuarter(twoYearsAgo),
      end: endOfQuarter(now),
    });

    return quarters.map(quarter => {
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
  }, [transactions]);

  // Year-over-Year data
  const yearlyData = useMemo(() => {
    const now = new Date();
    const threeYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
    const years = eachYearOfInterval({
      start: startOfYear(threeYearsAgo),
      end: endOfYear(now),
    });

    return years.map(year => {
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
  }, [transactions]);

  // Calculate MoM growth
  const momGrowth = useMemo(() => {
    if (monthlyData.length < 2) return null;
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    if (previous.income === 0) return null;
    const growth = ((current.income - previous.income) / previous.income) * 100;
    return { value: growth, isPositive: growth >= 0 };
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      {/* Month-over-Month */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary animate-pulse-subtle" />
              Month-over-Month Comparison
            </CardTitle>
            {momGrowth && (
              <div className={cn(
                "flex items-center gap-2 text-sm",
                momGrowth.isPositive ? "text-success" : "text-destructive"
              )}>
                {momGrowth.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {momGrowth.isPositive ? '+' : ''}{momGrowth.value.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '100ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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

      {/* Quarter-over-Quarter */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="animate-fade-in">Quarterly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '250ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="quarter"
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
                <Bar 
                  dataKey="income" 
                  fill="hsl(152, 69%, 40%)" 
                  name="Income"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expense" 
                  fill="hsl(0, 72%, 51%)" 
                  name="Expense"
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

      {/* Year-over-Year */}
      <Card className="animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="animate-fade-in">Year-over-Year Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in" style={{ animationDelay: '350ms' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="year"
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
                <Bar 
                  dataKey="income" 
                  fill="hsl(152, 69%, 40%)" 
                  name="Income"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expense" 
                  fill="hsl(0, 72%, 51%)" 
                  name="Expense"
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
    </div>
  );
}

