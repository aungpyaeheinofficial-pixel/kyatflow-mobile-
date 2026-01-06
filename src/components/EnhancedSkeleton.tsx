import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Shimmer effect for skeleton
const shimmer = {
  background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite',
};

export function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2 skeleton-shimmer" />
        <Skeleton className="h-3 w-20 skeleton-shimmer" />
      </CardContent>
    </Card>
  );
}

export function TransactionSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-4 py-4 border-b"
    >
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-12 w-12 rounded-xl skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 skeleton-shimmer" />
          <Skeleton className="h-3 w-24 skeleton-shimmer" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 skeleton-shimmer" />
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40 skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg skeleton-shimmer" />
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <TransactionSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="space-y-4">
        {/* Total Balance - Large */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Income & Expenses - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
            >
              <StatsCardSkeleton />
            </motion.div>
          ))}
        </div>

        {/* Net Cash Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <StatsCardSkeleton />
        </motion.div>
      </div>

      {/* Charts Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <ChartSkeleton />
      </motion.div>
    </div>
  );
}

// Add shimmer animation to CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

