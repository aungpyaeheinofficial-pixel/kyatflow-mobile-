
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authStorage } from '@/lib/auth';
import { subscriptionApi } from '@/lib/api';
import { Shield, Key, RefreshCw, Copy, Check, Users, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data interface - in real app, fetch from API
interface RedemptionCode {
    id: string;
    code: string;
    is_used: boolean;
    created_at: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    subscription_status: string;
    subscription_end_date: string | null;
    created_at: string;
}

export default function Admin() {
    const [codes, setCodes] = useState<RedemptionCode[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const { toast } = useToast();
    const user = authStorage.getCurrentUser();

    useEffect(() => {
        if (user?.email === 'admin@kyatflow.com') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await subscriptionApi.getAllUsers();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            // Don't toast error on mount, just log
        } finally {
            setUsersLoading(false);
        }
    };

    const generateCode = async () => {
        setLoading(true);
        try {
            const response = await subscriptionApi.generateCode();

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

    const manualUpgrade = async (userId: string, status: string, days?: number) => {
        try {
            await subscriptionApi.updateUserStatus(userId, status, days);
            toast({ title: "User Updated", variant: "success" });
            fetchUsers(); // Refresh list
        } catch (error) {
            toast({ title: "Update Failed", variant: "destructive" });
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
            <div className="space-y-6 pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage premium access & users</p>
                    </div>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {/* Code Generator */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Code Generator
                            </CardTitle>
                            <CardDescription>Generate new premium activation codes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={generateCode} disabled={loading} className="w-full gap-2 mb-4">
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                Generate New Code
                            </Button>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {codes.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        No recent codes.
                                    </div>
                                ) : (
                                    codes.map((code) => (
                                        <div key={code.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg border text-sm">
                                            <code className="font-mono font-bold tracking-wider">{code.code}</code>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyCode(code.code)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats or other tools could go here */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Quick Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-primary/10 rounded-xl text-center">
                                <div className="text-2xl font-bold text-primary">{users.length}</div>
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Users</div>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-xl text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.subscription_status === 'pro').length}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pro Users</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            User Management
                        </CardTitle>
                        <CardDescription>Manage user roles and subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {usersLoading ? (
                            <div className="text-center py-8">Loading users...</div>
                        ) : (
                            <div className="space-y-4">
                                {users.map((u) => (
                                    <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4">
                                        <div>
                                            <div className="font-semibold">{u.name}</div>
                                            <div className="text-sm text-muted-foreground">{u.email}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase
                                                    ${u.subscription_status === 'pro' ? 'bg-green-100 text-green-700' :
                                                        u.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    {u.subscription_status}
                                                </span>
                                                {u.subscription_end_date && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(u.subscription_end_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {u.subscription_status !== 'pro' && (
                                                <Button size="sm" onClick={() => manualUpgrade(u.id, 'pro')} className="bg-green-600 hover:bg-green-700 text-white">
                                                    Upgrade to Pro
                                                </Button>
                                            )}
                                            {u.subscription_status === 'pro' && (
                                                <Button size="sm" variant="outline" onClick={() => manualUpgrade(u.id, 'free')}>
                                                    Revoke Pro
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
