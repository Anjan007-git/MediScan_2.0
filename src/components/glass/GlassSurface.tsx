import { useRef, type CSSProperties, type ReactNode } from "react";
import LiquidGlass from "liquid-glass-react";
import { cn } from "@/lib/utils";

/**
 * Feature-detects whether the browser can render the authentic displacement
 * refraction (SVG filter on a backdrop-filtered layer). Safari/Firefox only
 * partially support feDisplacementMap on backdrops, so we degrade gracefully
 * to the CSS frosted-glass fallback.
 */
const supportsRefraction = (): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const backdrop =
    CSS.supports?.("backdrop-filter", "blur(2px)") ||
    CSS.supports?.("-webkit-backdrop-filter", "blur(2px)");
  const svgFilter =
    typeof SVGFEComponentTransferElement !== "undefined" &&
    typeof SVGFEImageElement !== "undefined";
  return Boolean(backdrop && svgFilter);
};

export interface GlassSurfaceProps {
  children: ReactNode;
  /** Disable the refraction library and use the CSS glass fallback. */
  fallback?: boolean;
  /** Refraction strength of the edge lensing. */
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  /** Mouse-follow elasticity (0 = static, 1 = very elastic). */
  elasticity?: number;
  cornerRadius?: number;
  padding?: string;
  overLight?: boolean;
  mode?: "standard" | "polar" | "prominent" | "shader";
  /** Element whose bounds drive the mouse effect (defaults to the surface). */
  mouseContainer?: React.RefObject<HTMLElement | null> | null;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * GlassSurface — authentic Liquid Glass refraction surface.
 *
 * liquid-glass-react renders a self-centering floating layer, so this wrapper
 * positions it absolutely inside a relative box and forces the internal glass
 * element to fill that box (see `.lg-native` / `.lg-fill` styles in index.css).
 * When refraction is unsupported it renders the CSS glass fallback instead.
 */
const GlassSurface = ({
  children,
  fallback = false,
  displacementScale = 64,
  blurAmount = 0.1,
  saturation = 140,
  aberrationIntensity = 1.6,
  elasticity = 0.12,
  cornerRadius = 28,
  padding = "0px",
  overLight = false,
  mode = "standard",
  mouseContainer = null,
  className,
  style,
  onClick,
}: GlassSurfaceProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const useLibrary = !fallback && supportsRefraction();

  if (!useLibrary) {
    return (
      <div
        className={cn("glass-strong lg-fallback", className)}
        style={{ borderRadius: cornerRadius, ...style }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative lg-host", className)}
      style={style}
    >
      <LiquidGlass
        className="lg-native lg-fill"
        displacementScale={displacementScale}
        blurAmount={blurAmount}
        saturation={saturation}
        aberrationIntensity={aberrationIntensity}
        elasticity={elasticity}
        cornerRadius={cornerRadius}
        padding={padding}
        overLight={overLight}
        mode={mode}
        mouseContainer={mouseContainer}
        onClick={onClick}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </LiquidGlass>
    </div>
  );
};

export default GlassSurface;
