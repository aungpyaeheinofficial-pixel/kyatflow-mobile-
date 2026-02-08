import {
  TrendingUp,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SidebarFAB } from '@/components/SidebarFAB';
import { useFAB } from '@/contexts/FABContext';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { memo, useCallback } from 'react';
import { StartTrialBanner } from '@/components/StartTrialBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

function AppLayoutComponent({ children, onAddTransaction }: AppLayoutProps) {
  const location = useLocation();
  const fabHandlers = useFAB();

  const handleSidebarFABClick = useCallback(() => {
    haptics.medium();
    if (fabHandlers) {
      fabHandlers.onQuickIncome();
    } else if (onAddTransaction) {
      onAddTransaction();
    }
  }, [fabHandlers, onAddTransaction]);

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Simple Mobile Header - Logo Only */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border h-14 flex items-center justify-between px-4 safe-area-top"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10"
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="h-5 w-5 text-primary" />
          </motion.div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            KyatFlow
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SidebarFAB
            onClick={handleSidebarFABClick}
          />
        </div>
      </motion.header>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Main Content */}
      {/* 
        Dynamic Spacing Calculation:
        - Bottom Nav Height: 4rem (64px)
        - Safe Area Inset Bottom: env(safe-area-inset-bottom) (0-34px typically)
        - Extra Spacing: 2rem (32px) for visual breathing room and to prevent overlap
        - Total: ~96-130px depending on device safe area
        This ensures last item is fully visible above navigation bar with comfortable spacing
      */}
      <main
        className="pt-14 px-4 max-w-screen-xl mx-auto w-full"
        style={{
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom) + 2rem)',
          minHeight: 'calc(100vh - 3.5rem - 4rem)',
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <StartTrialBanner />
    </div >
  );
}

export const AppLayout = memo(AppLayoutComponent);
