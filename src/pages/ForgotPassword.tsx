import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await subscriptionApi.forgotPassword(email);
            setIsSubmitted(true);
            toast({
                title: "Reset link sent",
                description: "check your email for instructions.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/login')} className="-ml-2">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        </div>
                        <CardDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="text-center py-6 space-y-4">
                                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium">Check your email</h3>
                                <p className="text-muted-foreground text-sm">
                                    We have sent a password reset link to <strong>{email}</strong>.
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Send Reset Link
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
