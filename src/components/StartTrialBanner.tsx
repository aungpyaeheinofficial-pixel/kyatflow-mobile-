
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscriptionApi } from '@/lib/api';
import { authStorage, User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export function StartTrialBanner() {
    const user = authStorage.getCurrentUser();
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!user || user.subscriptionStatus !== 'free' || !isVisible) {
        return null;
    }

    const handleStartTrial = async () => {
        setLoading(true);
        try {
            const response = await subscriptionApi.startTrial(user.id);
            if (response && response.user) {
                // Update local user data
                const updatedUser: User = {
                    ...user,
                    subscriptionStatus: 'trial',
                    subscriptionEndDate: response.user.subscriptionEndDate
                };
                authStorage.setUser(updatedUser);

                toast({
                    title: "Trial Activated!",
                    description: "Your 3-day premium trial starts now.",
                    variant: "success",
                });

                // Reload to refresh UI state across the app
                window.location.reload();
            }
        } catch (error) {
            toast({
                title: "Activation Failed",
                description: "Could not start trial. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50"
                >
                    <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-white/70 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-white/20 p-2 rounded-full mt-1">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Start Free Premium Trial</h3>
                                <p className="text-sm text-white/90 mb-3">
                                    Experience all Pro features free for 3 days. No credit card required.
                                </p>
                                <Button
                                    onClick={handleStartTrial}
                                    disabled={loading}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full font-semibold bg-white text-primary hover:bg-white/90"
                                >
                                    {loading ? 'Activating...' : 'Start 3-Day Trial Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
