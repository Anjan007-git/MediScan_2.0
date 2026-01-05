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
          "rounded-2xl p-5 transition-all duration-300",
          {
            "bg-card shadow-card": variant === "default",
            "gradient-teal text-primary-foreground shadow-card": variant === "primary",
            "bg-warning-light border border-warning/20": variant === "warning",
            "bg-danger-light border border-danger/20": variant === "danger",
            "bg-primary-light border border-primary/20": variant === "highlight",
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
    className={cn("flex items-center gap-3 pb-3 border-b border-border/50", className)}
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
    className={cn("text-lg font-semibold text-foreground flex items-center gap-2", className)}
    {...props}
  />
));
MediCardTitle.displayName = "MediCardTitle";

const MediCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
));
MediCardContent.displayName = "MediCardContent";

export { MediCard, MediCardHeader, MediCardTitle, MediCardContent };
