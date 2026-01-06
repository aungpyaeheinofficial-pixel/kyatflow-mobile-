import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, BarChart3, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { path: '/', icon: Home, key: 'nav.dashboard' },
  { path: '/transactions', icon: Receipt, key: 'nav.transactions' },
  { path: '/analytics', icon: BarChart3, key: 'nav.analytics' },
  { path: '/parties', icon: Users, key: 'nav.parties' },
  { path: '/settings', icon: Settings, key: 'nav.settings' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const handleNavClick = () => {
    haptics.light();
  };

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border touch-manipulation shadow-lg"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(4rem + env(safe-area-inset-bottom))',
        minHeight: 'calc(4rem + env(safe-area-inset-bottom))',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-screen-xl mx-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-1"
            >
              <Link
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-all duration-200 relative',
                  'active:bg-secondary/70 min-w-[44px] min-h-[44px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="h-5 w-5 relative z-10" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight relative z-10 transition-all",
                  isActive && "font-semibold"
                )}>
                  {t(item.key)}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
