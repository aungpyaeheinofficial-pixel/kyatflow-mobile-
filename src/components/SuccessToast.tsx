import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessToastProps {
  title: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
}

export function SuccessToast({ 
  title, 
  description, 
  onClose,
  duration = 3000 
}: SuccessToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-card shadow-lg border border-border"
      >
        <div className="p-4">
          <div className="flex items-start">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.1 
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
              </motion.div>
            </motion.div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-semibold text-foreground"
              >
                {title}
              </motion.p>
              {description && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {description}
                </motion.p>
              )}
            </div>
            {onClose && (
              <div className="ml-4 flex shrink-0">
                <button
                  onClick={onClose}
                  className="inline-flex rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <motion.div
          className="h-1 bg-success/20"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

