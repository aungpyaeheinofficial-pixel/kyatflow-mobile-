import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
} from 'recharts';
import { kyatsToLakhs } from '@/lib/formatters';

interface CashFlowChartProps {
  data: { date: string; income: number; expense: number; net: number }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const { showInLakhs } = useCurrency();

  const chartData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    displayIncome: showInLakhs ? kyatsToLakhs(d.income) : d.income,
    displayExpense: showInLakhs ? kyatsToLakhs(d.expense) : d.expense,
    displayNet: showInLakhs ? kyatsToLakhs(d.net) : d.net,
  }));

  const formatValue = (value: number) => {
    if (showInLakhs) {
      return `${value.toFixed(1)} L`;
    }
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <Card className="col-span-full animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Cash Flow</CardTitle>
            <p className="text-sm text-muted-foreground">Last 30 days overview</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Expense</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] w-full touch-pan-x touch-pan-y">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: 'var(--shadow-md)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  showInLakhs ? `${value.toFixed(2)} Lakhs` : `${value.toLocaleString()} MMK`,
                  name === 'displayIncome' ? 'Income' : 'Expense'
                ]}
              />
              <Area
                type="monotone"
                dataKey="displayIncome"
                stroke="hsl(152, 69%, 40%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="displayExpense"
                stroke="hsl(0, 72%, 51%)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
