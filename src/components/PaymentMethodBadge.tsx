import { PAYMENT_METHODS, PaymentMethod } from '@/lib/types';
import { 
  Banknote, 
  Smartphone, 
  Waves, 
  CreditCard, 
  Wallet, 
  Building2,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  banknote: Banknote,
  smartphone: Smartphone,
  waves: Waves,
  'credit-card': CreditCard,
  wallet: Wallet,
  'building-2': Building2,
};

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function PaymentMethodBadge({ 
  method, 
  size = 'md', 
  showLabel = true,
  className 
}: PaymentMethodBadgeProps) {
  const info = PAYMENT_METHODS[method];
  const Icon = ICONS[info.icon];
  
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all',
        'bg-secondary text-secondary-foreground',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} style={{ color: info.color }} />
      {showLabel && <span>{info.label}</span>}
    </div>
  );
}
