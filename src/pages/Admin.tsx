
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authStorage } from '@/lib/auth';
import { api } from '@/lib/api';
import { Shield, Key, RefreshCw, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data interface - in real app, fetch from API
interface RedemptionCode {
    id: string;
    code: string;
    is_used: boolean;
    created_at: string;
}

export default function Admin() {
    const [codes, setCodes] = useState<RedemptionCode[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const user = authStorage.getCurrentUser();

    // In a real app, you'd fetch this from the backend
    // For now, we will simulate or use a new API endpoint if we created one.
    // Since we didn't create a "list codes" API yet, we can add one or 
    // just focus on the "Generate" part which is most important.

    // Let's implement a simple "Generate Code" that calls a new backend endpoint
    // We will need to add this endpoint to the backend first.

    const generateCode = async () => {
        setLoading(true);
        try {
            // We need to implement this endpoint in backend/src/routes/auth.ts
            const response = await api.post('/auth/generate-code', {});

            if (response.success) {
                const newCode = response.code;
                setCodes(prev => [{
                    id: Date.now().toString(),
                    code: newCode,
                    is_used: false,
                    created_at: new Date().toISOString()
                }, ...prev]);

                toast({
                    title: 'Code Generated',
                    description: `New code: ${newCode}`,
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied to clipboard" });
    };

    if (user?.email !== 'admin@kyatflow.com') { // Simple protection
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">This area is restricted to administrators.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage premium access</p>
                    </div>
                    <Button onClick={generateCode} disabled={loading} className="gap-2">
                        <Key className="h-4 w-4" />
                        {loading ? 'Generating...' : 'Generate New Code'}
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Codes</CardTitle>
                            <CardDescription>Generated premium activation codes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {codes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No codes generated in this session.
                                    </div>
                                ) : (
                                    codes.map((code) => (
                                        <motion.div
                                            key={code.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border"
                                        >
                                            <div className="font-mono font-bold text-lg tracking-wider">
                                                {code.code}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${code.is_used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {code.is_used ? 'USED' : 'ACTIVE'}
                                                </span>
                                                <Button size="icon" variant="ghost" onClick={() => copyCode(code.code)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
