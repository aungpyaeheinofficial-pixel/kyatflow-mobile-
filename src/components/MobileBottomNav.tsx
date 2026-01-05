import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, BarChart3, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/parties', icon: Users, label: 'Parties' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-bottom touch-manipulation animate-slide-in-up shadow-lg">
      <div className="flex items-center justify-around h-16 sm:h-16 px-1 sm:px-2 max-w-screen-xl mx-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 h-full rounded-lg transition-all duration-300 ease-out relative overflow-hidden group',
                'active:bg-secondary/70 min-w-[44px] min-h-[44px]',
                'hover:scale-105 active:scale-95',
                isActive
                  ? 'text-primary bg-primary/10 shadow-sm'
                  : 'text-muted-foreground active:text-foreground active:bg-secondary/50 hover:bg-secondary/30'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full animate-scale-in-center" />
              )}
              
              <item.icon className={cn(
                'h-5 w-5 sm:h-5 sm:w-5 relative z-10 transition-all duration-300',
                isActive 
                  ? 'scale-110' 
                  : 'group-hover:scale-110 group-hover:-translate-y-0.5'
              )} />
              <span className={cn(
                "text-[9px] sm:text-[10px] font-medium leading-tight relative z-10 transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

