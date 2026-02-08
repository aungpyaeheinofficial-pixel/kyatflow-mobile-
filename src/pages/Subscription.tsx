
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { paymentConfig } from '@/config/payment';
import { Check, Shield, Zap, RefreshCw, Smartphone, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Subscription() {
    const user = authStorage.getCurrentUser();
    const [unlockCode, setUnlockCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const { toast } = useToast();

    const isPro = user?.subscriptionStatus === 'pro';
    const remainingTrial = user?.subscriptionEndDate
        ? Math.ceil((new Date(user.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const handleNotifyPayment = async (method: string) => {
        if (!user) return;
        setNotifying(true);
        try {
            await subscriptionApi.notifyPayment({
                userId: user.id,
                username: user.name,
                paymentMethod: method,
            });
            toast({
                title: 'Payment Notification Sent',
                description: 'Admin has been notified. We will verify and send you a code shortly.',
                variant: 'success',
            });
            // Open Telegram for good measure
            window.open('https://t.me/kyatflowmm', '_blank');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to notify server. Please contact us on Telegram.',
                variant: 'destructive',
            });
        } finally {
            setNotifying(false);
        }
    };

    const handleUnlock = async () => {
        if (!unlockCode) return;
        setLoading(true);
        try {
            if (!user) throw new Error('Not logged in');
            const res = await subscriptionApi.verifyCode(unlockCode, user.id);

            if (res && res.success) {
                toast({
                    title: 'Premium Unlocked!',
                    description: 'You are now a PRO member. Enjoy full access!',
                    variant: 'success',
                });
                // Reload to update user state
                window.location.reload();
            } else {
                throw new Error('Invalid code');
            }
        } catch (error) {
            toast({
                title: 'Activation Failed',
                description: 'Invalid or expired code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 pb-20">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {isPro ? 'Pro Membership Active' : 'Upgrade to Pro'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isPro
                            ? 'Thank you for supporting KyatFlow!'
                            : `You have ${Math.max(0, remainingTrial)} days remaining in your trial.`}
                    </p>
                </div>

                {/* Status Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isPro ? <Shield className="h-5 w-5 text-primary" /> : <RefreshCw className="h-5 w-5 text-orange-500" />}
                            Current Status: <span className={isPro ? "text-primary" : "text-orange-500"}>{isPro ? 'PRO' : 'TRIAL'}</span>
                        </CardTitle>
                    </CardHeader>
                </Card>

                {!isPro && (
                    <>
                        {/* Features */}
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-lg">Why Go Pro?</h3>
                            <ul className="space-y-3">
                                {[
                                    'Unlimited Transactions & Parties',
                                    'Advanced Analytics & Export',
                                    'Cloud Backup & multi-device (Coming Soon)',
                                    'Priority Support'
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                            <Check size={14} />
                                        </div>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Pricing */}
                        <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-xl font-bold">
                                POPULAR
                            </div>
                            <CardHeader>
                                <CardTitle>Monthly Plan</CardTitle>
                                <CardDescription>Full access to all features</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    20,000 MMK <span className="text-sm font-normal text-muted-foreground">/ month</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Payment Methods</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            {/* Ideally a QR code image here */}
                                            <Smartphone className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-700">{paymentConfig.kpay.name}</h4>
                                            <p className="text-sm font-medium">{paymentConfig.kpay.phoneNumber}</p>
                                            <p className="text-xs text-muted-foreground">{paymentConfig.kpay.accountName}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="ml-auto text-blue-600"
                                            onClick={() => {
                                                navigator.clipboard.writeText(paymentConfig.kpay.phoneNumber);
                                                toast({ description: "Phone number copied!" });
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="p-4 border-red-500/20 bg-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <Smartphone className="h-8 w-8 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-700">{paymentConfig.ayapay.name}</h4>
                                            <p className="text-sm font-medium">{paymentConfig.ayapay.phoneNumber}</p>
                                            <p className="text-xs text-muted-foreground">{paymentConfig.ayapay.accountName}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="ml-auto text-red-600"
                                            onClick={() => {
                                                navigator.clipboard.writeText(paymentConfig.ayapay.phoneNumber);
                                                toast({ description: "Phone number copied!" });
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            <div className="bg-muted p-4 rounded-xl text-center space-y-3">
                                <p className="text-sm font-medium">After payment, send screenshot to:</p>
                                <Button
                                    className="w-full gap-2 bg-[#0088cc] hover:bg-[#0077b5]"
                                    onClick={() => window.open(paymentConfig.telegramSupport, '_blank')}
                                >
                                    <Send className="h-4 w-4" />
                                    Send Screenshot on Telegram
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Admin will send you an Activation Code within 24 hours.
                                </p>
                            </div>
                        </div>

                        {/* Activation Code */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Have a Code?</h3>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Premium Code"
                                    value={unlockCode}
                                    onChange={(e) => setUnlockCode(e.target.value)}
                                />
                                <Button onClick={handleUnlock} disabled={loading || !unlockCode}>
                                    {loading ? '...' : 'Unlock'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
