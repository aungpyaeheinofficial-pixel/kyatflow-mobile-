
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { authStorage } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    haptics.medium();

    // Validation
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      haptics.error();
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await authStorage.login(email, password);
      } else {
        result = await authStorage.register(email, password, name);
      }

      setIsLoading(false);

      if (result.success && result.user) {
        haptics.success();
        setIsSuccess(true);

        toast({
          title: isLogin ? 'Welcome back!' : 'Account Created',
          description: isLogin ? 'Successfully logged in.' : 'Your 3-day trial has started!',
          variant: 'success',
        });

        // Preload the dashboard component for instant navigation
        import('./Index').then(() => {
          // Smooth transition - minimal delay for success animation
          setTimeout(() => {
            const from = (location.state as any)?.from?.pathname || '/';
            navigate(from, { replace: true });
          }, 500);
        });
      } else {
        haptics.error();
        setError(result.error || (isLogin ? 'Login failed' : 'Registration failed'));
        toast({
          title: 'Error',
          description: result.error || 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsLoading(false);
      haptics.error();
      setError('An error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }, [email, password, name, isLogin, location.state, navigate, toast]);

  const handleInputFocus = useCallback((field: string) => {
    setFocusedField(field);
    haptics.light();
  }, []);

  const handleInputBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    haptics.light();
    setShowPassword(prev => !prev);
  }, []);

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setError('');
    setIsSuccess(false);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="w-full max-w-md px-6 sm:px-8 z-10">
        {/* Logo & Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-xl shadow-primary/20 mb-4 relative overflow-hidden"
          >
            <TrendingUp className="h-8 w-8 text-white relative z-10" />
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
            KyatFlow
          </h1>
          <p className="text-muted-foreground font-medium">
            Smart Finance OS for Myanmar
          </p>
        </motion.div>

        {/* Auth Card */}
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-2xl shadow-foreground/5 bg-card/80 backdrop-blur-md overflow-hidden">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium mb-4"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Min Min"
                          className="h-12 bg-background/50 rounded-xl"
                          required={!isLogin}
                        />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="h-12 bg-background/50 rounded-xl"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 bg-background/50 rounded-xl pr-10"
                          required
                          autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold rounded-xl mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Please wait...</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {isLogin ? 'Sign In' : 'Create Account'}
                          <ArrowRight size={18} />
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={toggleMode}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {isLogin ? "New to KyatFlow? Create Account" : "Already have an account? Sign In"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6 text-success">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Success!</h2>
              <p className="text-muted-foreground">Redirecting you to dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(Login);
