import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlassCardVariant = "subtle" | "default" | "strong" | "tinted";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  /** Slight lift + glow on hover (non-touch pointer devices only). */
  interactive?: boolean;
  /** Semantic color edge for status cards (success / warning / danger). */
  tone?: "none" | "success" | "warning" | "danger";
  children: ReactNode;
}

const TONE_EDGE: Record<NonNullable<GlassCardProps["tone"]>, string> = {
  none: "",
  success: "glass-tone-success",
  warning: "glass-tone-warning",
  danger: "glass-tone-danger",
};

/**
 * GlassCard — frosted glass panel used for dense content (results, lists,
 * settings). Pure CSS glass keeps long medical text crisp and cheap to render.
 */
const GlassCard = ({
  variant = "default",
  interactive = false,
  tone = "none",
  className,
  children,
  ...props
}: GlassCardProps) => {
  const variantClass =
    variant === "strong"
      ? "glass-strong"
      : variant === "subtle"
        ? "glass-subtle"
        : variant === "tinted"
          ? "glass-tinted"
          : "glass";

  return (
    <div
      className={cn(
        variantClass,
        interactive && "glass-interactive glass-hoverable",
        tone !== "none" && TONE_EDGE[tone],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
