import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/lib/types';

interface FloatingActionButtonProps {
  onQuickIncome: () => void;
  onQuickExpense: () => void;
  onRepeatLast: () => void;
  lastTransaction?: Transaction | null;
}

export function FloatingActionButton({
  onQuickIncome,
  onQuickExpense,
  onRepeatLast,
  lastTransaction,
}: FloatingActionButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
      setIsLongPressing(false);
    }, 500); // 500ms for long press
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  const handleClick = () => {
    if (!showMenu) {
      // Default action - open transaction form with income type
      onQuickIncome();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Quick Actions Menu */}
      {showMenu && (
        <div className="absolute bottom-20 right-0 mb-4 space-y-3 animate-in fade-in slide-in-from-bottom-4">
          {/* Repeat Last Transaction */}
          {lastTransaction && (
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-card border-2",
                "hover:scale-110 active:scale-95 transition-transform touch-manipulation",
                "flex flex-col items-center justify-center gap-1"
              )}
              onClick={() => {
                onRepeatLast();
                setShowMenu(false);
              }}
            >
              <Repeat className="h-5 w-5" />
              <span className="text-[10px] font-medium">Repeat</span>
            </Button>
          )}

          {/* Quick Expense */}
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-destructive/10 border-destructive border-2",
              "hover:scale-110 active:scale-95 transition-transform touch-manipulation",
              "flex flex-col items-center justify-center gap-1"
            )}
            onClick={() => {
              onQuickExpense();
              setShowMenu(false);
            }}
          >
            <TrendingDown className="h-5 w-5 text-destructive" />
            <span className="text-[10px] font-medium text-destructive">Expense</span>
          </Button>

          {/* Quick Income */}
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-success/10 border-success border-2",
              "hover:scale-110 active:scale-95 transition-transform touch-manipulation",
              "flex flex-col items-center justify-center gap-1"
            )}
            onClick={() => {
              onQuickIncome();
              setShowMenu(false);
            }}
          >
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-[10px] font-medium text-success">Income</span>
          </Button>
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        ref={buttonRef}
        size="lg"
        className={cn(
          "h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-success hover:bg-success/90",
          "text-white transition-all duration-200 touch-manipulation",
          isLongPressing && "scale-95",
          showMenu && "rotate-45"
        )}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
      >
        <Plus className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-transform", showMenu && "rotate-90")} />
      </Button>

      {/* Backdrop when menu is open */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm -z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

