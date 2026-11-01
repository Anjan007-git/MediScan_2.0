import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  // Base: glossy top highlight, elastic press, accessible focus ring.
  "glossy relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold select-none " +
    "transition-[transform,box-shadow,filter] duration-200 ease-out " +
    "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:opacity-55 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Blue-tinted translucent glass with strong optical highlight.
        primary:
          "glass-tinted-strong text-primary-foreground shadow-glow hover:brightness-[1.04]",
        // Frosted white glass with soft border highlight.
        secondary:
          "glass-strong text-foreground hover:shadow-glass-lg",
        // Bare frosted surface for tertiary actions.
        ghost: "glass-subtle text-primary hover:shadow-glass",
        // Destructive glass.
        danger: "glass-danger text-danger-foreground hover:brightness-[1.04]",
        // Success glass (confirmations).
        success: "glass-success text-success-foreground hover:brightness-[1.04]",
        // Bare text link styled as button.
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] rounded-full",
        md: "h-11 px-5 text-sm rounded-full",
        lg: "h-13 px-7 text-[15px] rounded-full",
        icon: "h-11 w-11 rounded-full",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  children?: ReactNode;
}

/**
 * GlassButton — the single source of truth for all buttons in MediScan.
 * Variants: primary | secondary | ghost | danger | success | link.
 */
const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, block, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(glassButtonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
GlassButton.displayName = "GlassButton";

export { glassButtonVariants };
export default GlassButton;
