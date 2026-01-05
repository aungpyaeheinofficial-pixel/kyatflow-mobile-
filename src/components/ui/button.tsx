import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-dark hover:shadow-medium active:scale-[0.96] active:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 active:scale-[0.96] active:shadow-sm",
        outline:
          "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground active:scale-[0.96] active:bg-secondary/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 active:scale-[0.96] active:shadow-sm",
        ghost: "hover:bg-secondary hover:text-secondary-foreground active:scale-[0.96] active:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98]",
        // KyatFlow custom variants
        income: "bg-success text-success-foreground shadow-soft hover:bg-success/90 active:scale-[0.96] active:shadow-sm",
        expense: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 active:scale-[0.96] active:shadow-sm",
        quickAction: "bg-primary text-primary-foreground shadow-glow hover:shadow-lg hover:scale-[1.02] active:scale-[0.96] font-semibold active:shadow-md",
        glass: "bg-card/80 backdrop-blur-lg border border-border/50 text-foreground hover:bg-card/90 shadow-soft active:scale-[0.96]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, onMouseDown, onTouchStart, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [isPressed, setIsPressed] = React.useState(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      // Haptic feedback for touch devices
      if ('ontouchstart' in window) {
        haptics.medium();
      }
      onMouseDown?.(e);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      haptics.medium();
      onTouchStart?.(e);
    };

    const handleTouchEnd = () => {
      setIsPressed(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Light haptic for click events on touch devices
      if ('ontouchstart' in window && !isPressed) {
        haptics.light();
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isPressed && "scale-[0.96]"
        )}
        ref={ref}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
