import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarFABProps {
  onClick: () => void;
  collapsed?: boolean;
}

export function SidebarFAB({ onClick, collapsed = false }: SidebarFABProps) {
  return (
    <Button
      size="lg"
      className={cn(
        "rounded-xl bg-success hover:bg-success/90",
        "text-white font-semibold shadow-lg text-sm sm:text-base",
        "transition-all duration-300 ease-out hover:scale-105 active:scale-95",
        "touch-manipulation relative overflow-hidden group",
        collapsed ? "w-12 h-12 p-0" : "w-full h-12 sm:h-14",
        "hover:shadow-xl hover:shadow-success/30"
      )}
      onClick={onClick}
      title={collapsed ? "Quick Add" : undefined}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      
      <Plus className={cn(
        "relative z-10 transition-all duration-300",
        collapsed ? "h-5 w-5 group-hover:rotate-90" : "h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 group-hover:rotate-90"
      )} />
      {!collapsed && (
        <>
          <span className="relative z-10 hidden sm:inline transition-all duration-300">Quick Add</span>
          <span className="relative z-10 sm:hidden transition-all duration-300">Add</span>
        </>
      )}
    </Button>
  );
}

