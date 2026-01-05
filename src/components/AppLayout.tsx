import { 
  Home, 
  Receipt, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  Menu,
  X,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SidebarFAB } from '@/components/SidebarFAB';
import { useFAB } from '@/contexts/FABContext';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/parties', icon: Users, label: 'Parties' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export function AppLayout({ children, onAddTransaction }: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop sidebar collapse
  const fabHandlers = useFAB();
  
  const handleSidebarFABClick = () => {
    if (fabHandlers) {
      fabHandlers.onQuickIncome();
    } else if (onAddTransaction) {
      onAddTransaction();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger Menu */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 min-w-[48px] min-h-[48px] touch-manipulation"
            aria-label="Toggle menu"
          >
            <Menu className={cn(
              "h-6 w-6 transition-transform duration-300",
              sidebarOpen && "rotate-90"
            )} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              KyatFlow
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SidebarFAB 
            onClick={handleSidebarFABClick}
            className="lg:hidden h-10 w-10 min-w-[48px] min-h-[48px]"
          />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className={cn(
            "lg:hidden fixed top-14 sm:top-16 left-0 bottom-0 w-64 sm:w-72 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex flex-col h-full overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10">
                    <TrendingUp className="h-6 w-6 text-sidebar-primary" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-sidebar-foreground">KyatFlow</h1>
                    <p className="text-xs text-sidebar-foreground/60">Smart Finance OS</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 min-w-[48px] min-h-[48px]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1">
                <ul className="space-y-1">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px] touch-manipulation",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Desktop Sidebar - Hidden on mobile/tablet, shown on lg+ */}
      <aside className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out z-40",
        sidebarCollapsed ? "lg:w-20" : "lg:w-64 xl:w-72"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar pb-4 transition-all duration-300"
          style={{ paddingLeft: sidebarCollapsed ? '1rem' : '1.5rem', paddingRight: sidebarCollapsed ? '1rem' : '1.5rem' }}
        >
          {/* Logo & Toggle Button */}
          <div className="flex h-20 shrink-0 items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 relative overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sidebar-primary/20 shrink-0">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/30 via-transparent to-sidebar-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Icon with subtle animation */}
              <TrendingUp className="h-6 w-6 text-sidebar-primary relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              {/* Subtle pulse effect */}
              <div className="absolute inset-0 rounded-xl border border-sidebar-primary/20 animate-pulse-subtle" />
            </div>
            <div className={cn(
              "transition-all duration-300 group-hover:translate-x-1 overflow-hidden",
              sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="text-xl font-bold text-sidebar-foreground bg-gradient-to-r from-sidebar-foreground to-sidebar-primary bg-clip-text text-transparent transition-all duration-300 group-hover:from-sidebar-primary group-hover:to-sidebar-foreground whitespace-nowrap">
                KyatFlow
              </h1>
              <p className="text-xs text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80 transition-colors duration-300 whitespace-nowrap">
                Smart Finance OS
              </p>
            </div>
            {/* Collapse Toggle Button (Hamburger/Collapse) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "shrink-0 h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-300 ease-out",
                sidebarCollapsed ? "mx-auto" : "ml-auto",
                "hover:scale-110 active:scale-95"
              )}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <ChevronLeft className="h-4 w-4 transition-transform duration-300 hover:translate-x-[-2px]" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <li 
                    key={item.path}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      to={item.path}
                      className={cn(
                        'group flex gap-x-3 rounded-xl p-3 text-sm font-medium leading-6 transition-all duration-300 ease-out relative overflow-hidden',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-sidebar-accent/20'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm',
                        sidebarCollapsed && 'justify-center',
                        'hover:scale-[1.02] active:scale-[0.98]'
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {/* Active indicator background */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/10 via-sidebar-primary/5 to-transparent animate-fade-in" />
                      )}
                      
                      {/* Ripple effect on active */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl border-2 border-sidebar-primary/30 animate-pulse-subtle" />
                      )}
                      
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 relative z-10 transition-all duration-300",
                        isActive 
                          ? "text-sidebar-accent-foreground scale-110" 
                          : "group-hover:scale-110 group-hover:rotate-3"
                      )} />
                      <span className={cn(
                        "relative z-10 transition-all duration-300 ease-out whitespace-nowrap",
                        sidebarCollapsed 
                          ? "w-0 opacity-0 overflow-hidden scale-0" 
                          : "w-auto opacity-100 scale-100"
                      )}>
                        {item.label}
                      </span>
                      
                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-50 shadow-xl shadow-sidebar-accent/20 transform translate-x-[-4px] group-hover:translate-x-0">
                          {item.label}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-accent rotate-45" />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Sidebar FAB Button */}
            <div className="mt-auto pt-4">
              <SidebarFAB onClick={handleSidebarFABClick} collapsed={sidebarCollapsed} />
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-background/80 backdrop-blur-lg px-4 py-3 shadow-soft lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden transition-all duration-300 group-hover:scale-110">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <TrendingUp className="h-5 w-5 text-primary relative z-10 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-foreground transition-all duration-300">
            KyatFlow
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-sidebar animate-slide-in-right shadow-2xl">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 relative overflow-hidden transition-all duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/30 via-transparent to-sidebar-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <TrendingUp className="h-5 w-5 text-sidebar-primary relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-lg font-bold text-sidebar-foreground bg-gradient-to-r from-sidebar-foreground to-sidebar-primary bg-clip-text text-transparent group-hover:from-sidebar-primary group-hover:to-sidebar-foreground transition-all duration-300">
                  KyatFlow
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-sidebar-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="px-4">
              <ul className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li 
                      key={item.path}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-300 ease-out relative overflow-hidden',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-sidebar-accent/20'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm',
                          'hover:scale-[1.02] active:scale-[0.98]'
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/10 via-sidebar-primary/5 to-transparent animate-fade-in" />
                            <div className="absolute inset-0 rounded-xl border-2 border-sidebar-primary/30 animate-pulse-subtle" />
                          </>
                        )}
                        
                        <item.icon className={cn(
                          "h-5 w-5 relative z-10 transition-all duration-300",
                          isActive 
                            ? "text-sidebar-accent-foreground scale-110" 
                            : "group-hover:scale-110 group-hover:rotate-3"
                        )} />
                        <span className="relative z-10 transition-all duration-300">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Desktop Header with Hamburger (when sidebar is collapsed) */}
      {sidebarCollapsed && (
        <div className="hidden lg:block fixed top-0 left-20 right-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border h-16">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="mr-2"
              title="Expand sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64 xl:pl-72"
      )}>
        <div className={cn(
          "px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto w-full",
          // Mobile: Add top padding for header, bottom padding for nav
          "pt-16 sm:pt-20 pb-20 sm:pb-24",
          // Desktop: Normal padding
          "lg:pt-8 lg:pb-8",
          sidebarCollapsed && "lg:pt-20"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
