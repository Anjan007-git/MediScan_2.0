import * as React from "react";
import { cn } from "@/lib/utils";

interface MediCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "warning" | "danger" | "highlight";
}

const MediCard = React.forwardRef<HTMLDivElement, MediCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-5 transition-all duration-300 relative overflow-hidden",
          {
            "glass": variant === "default",
            "glass-strong text-white": variant === "primary",
            "glass border-l-4 border-l-warning": variant === "warning",
            "glass border-l-4 border-l-danger": variant === "danger",
            "glass border-l-4 border-l-primary": variant === "highlight",
          },
          className
        )}
        {...props}
      />
    );
  }
);

MediCard.displayName = "MediCard";

const MediCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 pb-3 border-b border-white/30", className)}
    {...props}
  />
));
MediCardHeader.displayName = "MediCardHeader";

const MediCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-base font-bold text-foreground flex items-center gap-2 tracking-tight", className)}
    {...props}
  />
));
MediCardTitle.displayName = "MediCardTitle";

const MediCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-3 text-sm leading-relaxed", className)} {...props} />
));
MediCardContent.displayName = "MediCardContent";

export { MediCard, MediCardHeader, MediCardTitle, MediCardContent };
