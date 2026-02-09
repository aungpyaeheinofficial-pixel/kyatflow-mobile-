import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authStorage } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Lock, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpirationGuardProps {
    children: ReactNode;
}

export function ExpirationGuard({ children }: ExpirationGuardProps) {
    const user = authStorage.getCurrentUser();
    const location = useLocation();
    const navigate = useNavigate();

    // If no user, or on login page, or on subscription page, allow access
    // Note: Login page is usually outside AppLayout, but Subscription is inside.
    if (!user || location.pathname === '/subscription' || location.pathname === '/login') {
        return <>{children}</>;
    }

    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const now = new Date();

    // Check if expired
    const isExpired = (endDate && now > endDate) || user.subscriptionStatus === 'expired';

    if (isExpired) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full space-y-6"
                >
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <Lock className="w-10 h-10 text-red-600" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            {user.subscriptionStatus === 'trial' ? 'Trial Expired' : 'Subscription Expired'}
                        </h2>
                        <p className="text-muted-foreground">
                            Your {user.subscriptionStatus === 'trial' ? '3-day trial' : 'Pro membership'} has ended.
                            Please renew to continue using KyatFlow.
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Button
                            className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                            onClick={() => navigate('/subscription')}
                        >
                            Renew Subscription <ArrowRight className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                authStorage.logout();
                                window.location.href = '/login';
                            }}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
