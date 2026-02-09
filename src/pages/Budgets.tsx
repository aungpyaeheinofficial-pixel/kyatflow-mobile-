
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { budgetApi } from '@/lib/api';
import { Wallet, Save, Target, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function Budgets() {
    const [budgets, setBudgets] = useState({
        daily_limit: 0,
        weekly_limit: 0,
        monthly_limit: 0,
        yearly_limit: 0
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const data = await budgetApi.get();
            setBudgets({
                daily_limit: parseFloat(data.daily_limit) || 0,
                weekly_limit: parseFloat(data.weekly_limit) || 0,
                monthly_limit: parseFloat(data.monthly_limit) || 0,
                yearly_limit: parseFloat(data.yearly_limit) || 0,
            });
        } catch (error) {
            console.error('Failed to fetch budgets', error);
            toast({ title: "Error", description: "Failed to load budgets", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await budgetApi.update(budgets);
            toast({ title: "Success", description: "Budgets saved successfully", variant: "success" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save budgets", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: keyof typeof budgets, value: string) => {
        const numValue = parseFloat(value);
        setBudgets(prev => ({
            ...prev,
            [key]: isNaN(numValue) ? 0 : numValue
        }));
    };

    return (
        <AppLayout>
            <div className="space-y-6 pb-20">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-primary" />
                        Budget Settings
                    </h1>
                    <p className="text-muted-foreground">Set your spending limits to get notified when you exceed them.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Daily Limit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Daily Limit</CardTitle>
                            <CardDescription>Max spending per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    value={budgets.daily_limit || ''}
                                    onChange={(e) => handleChange('daily_limit', e.target.value)}
                                    placeholder="0.00"
                                />
                                <div className="text-sm font-medium">MMK</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChange('daily_limit', '0')}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Limit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Weekly Limit</CardTitle>
                            <CardDescription>Max spending per week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    value={budgets.weekly_limit || ''}
                                    onChange={(e) => handleChange('weekly_limit', e.target.value)}
                                    placeholder="0.00"
                                />
                                <div className="text-sm font-medium">MMK</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChange('weekly_limit', '0')}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Limit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Monthly Limit</CardTitle>
                            <CardDescription>Max spending per month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    value={budgets.monthly_limit || ''}
                                    onChange={(e) => handleChange('monthly_limit', e.target.value)}
                                    placeholder="0.00"
                                />
                                <div className="text-sm font-medium">MMK</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChange('monthly_limit', '0')}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Yearly Limit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Yearly Limit</CardTitle>
                            <CardDescription>Max spending per year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    value={budgets.yearly_limit || ''}
                                    onChange={(e) => handleChange('yearly_limit', e.target.value)}
                                    placeholder="0.00"
                                />
                                <div className="text-sm font-medium">MMK</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChange('yearly_limit', '0')}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
                        {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save className="h-4 w-4" />}
                        Save Budgets
                    </Button>
                </div>

                {/* Informational Section */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <InfoIcon className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold mb-1">How Budgets Work</h3>
                                <p className="text-sm text-muted-foreground">
                                    When you add an expense, KyatFlow checks if your total spending for the day, week, month, or year exceeds the limits you set here.
                                    If you go over, you will receive a notification.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function InfoIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
