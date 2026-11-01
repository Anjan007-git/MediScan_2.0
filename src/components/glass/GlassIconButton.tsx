import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassIconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders the icon; keep lucide icons at strokeWidth 1.7–1.9. */
  children: React.ReactNode;
  /** Rounded square (default: circular glass). */
  squared?: boolean;
}

/**
 * GlassIconButton — circular frosted glass surface for icon-only actions
 * (close, back, delete, camera shutter, etc.).
 */
const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  ({ className, squared = false, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "glass-strong glass-interactive inline-flex items-center justify-center",
        squared ? "rounded-2xl" : "rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
GlassIconButton.displayName = "GlassIconButton";

export default GlassIconButton;
