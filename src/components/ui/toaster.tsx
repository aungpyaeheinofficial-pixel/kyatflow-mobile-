import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'info':
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          const isSuccess = variant === 'success' || (!variant && title?.toString().toLowerCase().includes('success') || title?.toString().toLowerCase().includes('added') || title?.toString().toLowerCase().includes('saved'));
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
            >
              <Toast 
                key={id} 
                {...props}
                className={cn(
                  isSuccess && "border-success/20 bg-success/5",
                  variant === 'destructive' && "border-destructive/20"
                )}
              >
                {isSuccess && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15 
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 mr-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </motion.div>
                )}
                {variant && !isSuccess && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mr-3">
                    {getIcon(variant)}
                  </div>
                )}
                <div className="grid gap-1 flex-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && <ToastDescription>{description}</ToastDescription>}
                </div>
                {action}
                <ToastClose />
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
}
