
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { budgetApi, transactionApi } from '@/lib/api';
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/CurrencyContext';
import { kyatsToLakhs } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export function BudgetOverview() {
    const [budgets, setBudgets] = useState<any>(null);
    const [spending, setSpending] = useState<any>({ day: 0, week: 0, month: 0, year: 0 });
    const [loading, setLoading] = useState(true);
    const { showInLakhs } = useCurrency();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [budgetData, transactions] = await Promise.all([
                budgetApi.get(),
                transactionApi.getAll()
            ]);

            setBudgets(budgetData);

            // Calculate spending
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));

            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day == 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);

            let daySpent = 0, weekSpent = 0, monthSpent = 0, yearSpent = 0;

            transactions.filter(t => t.type === 'expense').forEach(t => {
                const tDate = new Date(t.date);
                if (tDate >= startOfDay) daySpent += t.amount;
                if (tDate >= startOfWeek) weekSpent += t.amount;
                if (tDate >= startOfMonth) monthSpent += t.amount;
                if (tDate >= startOfYear) yearSpent += t.amount;
            });

            setSpending({ day: daySpent, week: weekSpent, month: monthSpent, year: yearSpent });

        } catch (error) {
            console.error("Failed to load budget data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-40 w-full rounded-xl" />;
    }

    if (!budgets || (!budgets.daily_limit && !budgets.weekly_limit && !budgets.monthly_limit)) {
        // Only show if at least one budget is set, otherwise maybe show a "Set Budget" CTA?
        // Let's show a small CTA
        return (
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Set Spending Limits</h3>
                            <p className="text-xs text-muted-foreground">Track your expenses against a budget.</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/budgets')}>
                        Set Up
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const renderBudgetRow = (label: string, limit: string, spent: number) => {
        const limitNum = parseFloat(limit) || 0;
        if (limitNum <= 0) return null;

        const percentage = Math.min((spent / limitNum) * 100, 100);
        const isExceeded = spent > limitNum;
        const isWarning = percentage >= 80;

        return (
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className={cn("font-semibold", isExceeded ? "text-destructive" : "")}>
                        {showInLakhs ? kyatsToLakhs(spent).toFixed(2) + ' L' : spent.toLocaleString()} / {showInLakhs ? kyatsToLakhs(limitNum).toFixed(2) + ' L' : parseFloat(limit).toLocaleString()}
                    </span>
                </div>
                <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={cn(
                        isExceeded ? "bg-destructive" : isWarning ? "bg-orange-500" : "bg-primary"
                    )}
                />
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Wallet className="h-4 w-4 text-primary" />
                    Budget Overview
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/budgets')}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderBudgetRow("Daily", budgets.daily_limit, spending.day)}
                {renderBudgetRow("Weekly", budgets.weekly_limit, spending.week)}
                {renderBudgetRow("Monthly", budgets.monthly_limit, spending.month)}
            </CardContent>
        </Card>
    );
}
