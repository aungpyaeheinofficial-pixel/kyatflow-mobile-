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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Auto-fill demo credentials on page load
  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      setEmail('demo@kyatflow.com');
      setPassword('demo123');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    haptics.medium();
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      haptics.error();
      return;
    }

    setIsLoading(true);

    try {
      const result = await authStorage.login(email, password);
      
      setIsLoading(false);

      if (result.success && result.user) {
        haptics.success();
        setIsSuccess(true);
        
        // Preload the dashboard component for instant navigation
        import('./Index').then(() => {
          // Smooth transition - minimal delay for success animation
          setTimeout(() => {
            const from = (location.state as any)?.from?.pathname || '/';
            navigate(from, { replace: true });
          }, 200);
        });
      } else {
        haptics.error();
        setError(result.error || 'Login failed. Please try again.');
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsLoading(false);
      haptics.error();
      setError('An error occurred. Please try again.');
      toast({
        title: 'Login Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }, [email, password, location.state, navigate, toast]);

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh */}
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
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-2xl shadow-primary/20 mb-6 relative overflow-hidden"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <TrendingUp className="h-10 w-10 text-white relative z-10" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-3 tracking-tight"
          >
            KyatFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-muted-foreground text-lg font-medium"
          >
            Smart Finance OS for Myanmar
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Card className="border-0 shadow-2xl shadow-foreground/5 bg-card/80 backdrop-blur-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <CardContent className="p-8 relative z-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
                    <AnimatePresence>
              {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                        >
                  {error}
                        </motion.div>
              )}
                    </AnimatePresence>

              {/* Email Field */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                          ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="demo@kyatflow.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                          onFocus={() => handleInputFocus('email')}
                          onBlur={handleInputBlur}
                    required
                    className={cn(
                            "h-14 bg-background/50 border-2 rounded-2xl transition-all duration-300 pl-4 pr-4 text-base",
                            "focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/10",
                            "placeholder:text-muted-foreground/50",
                            error && "border-destructive focus:border-destructive",
                            focusedField === 'email' && "scale-[1.02]"
                    )}
                    disabled={isLoading}
                    autoComplete="email"
                          style={{
                            willChange: 'transform, border-color',
                            transform: 'translateZ(0)',
                          }}
                        />
                        {focusedField === 'email' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -inset-0.5 rounded-2xl bg-primary/10 -z-10"
                          />
                        )}
                </div>
                    </motion.div>

              {/* Password Field */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-semibold text-foreground/90">
                    Password
                  </Label>
                  <button
                    type="button"
                          onClick={togglePasswordVisibility}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                          ref={passwordInputRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                          onFocus={() => handleInputFocus('password')}
                          onBlur={handleInputBlur}
                    required
                    className={cn(
                            "h-14 bg-background/50 border-2 rounded-2xl transition-all duration-300 pl-4 pr-14 text-base",
                            "focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/10",
                            "placeholder:text-muted-foreground/50",
                            error && "border-destructive focus:border-destructive",
                            focusedField === 'password' && "scale-[1.02]"
                    )}
                    disabled={isLoading}
                    autoComplete="current-password"
                          style={{
                            willChange: 'transform, border-color',
                            transform: 'translateZ(0)',
                          }}
                        />
                        {focusedField === 'password' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -inset-0.5 rounded-2xl bg-primary/10 -z-10"
                          />
                        )}
                        <motion.button
                    type="button"
                          onClick={togglePasswordVisibility}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                        </motion.button>
                </div>
                    </motion.div>

              {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
              <Button
                type="submit"
                        className="w-full h-14 bg-gradient-to-r from-primary via-primary/95 to-primary text-white font-semibold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 text-base relative overflow-hidden group"
                disabled={isLoading}
                        style={{
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                        }}
                      >
                        {/* Button shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                {isLoading ? (
                          <div className="flex items-center gap-3 relative z-10">
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                    <span>Signing in...</span>
                  </div>
                ) : (
                          <div className="flex items-center gap-2 relative z-10">
                    <span>Sign In</span>
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                    <ArrowRight className="h-5 w-5" />
                            </motion.div>
                  </div>
                )}
              </Button>
                    </motion.div>
            </form>

                  {/* Quick Demo Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 pt-6 border-t border-border/50"
                  >
                    <p className="text-xs text-center text-muted-foreground">
                      Demo credentials are pre-filled. Just click Sign In.
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/10 mb-6"
              >
                <CheckCircle2 className="h-12 w-12 text-success" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Success!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                Welcome back!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(Login);
