import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { Bell, Pill, Settings2 } from "lucide-react";
import GlassSurface from "./GlassSurface";
import GlassIconButton from "./GlassIconButton";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/scan", label: "Scan" },
  { to: "/receipts", label: "Receipts" },
  { to: "/insights", label: "Insights" },
];

/**
 * GlassNavbar — floating Liquid Glass pill navigation for desktop / tablet.
 * Hidden on mobile, where BottomNav takes over. Routes are unchanged.
 */
const GlassNavbar = () => {
  const mouseContainer = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  return (
    <div
      className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
      aria-label="Primary"
    >
      <div ref={mouseContainer}>
        <GlassSurface
          cornerRadius={999}
          displacementScale={56}
          blurAmount={0.12}
          saturation={130}
          aberrationIntensity={1.2}
          elasticity={0.16}
          mouseContainer={mouseContainer}
          className="h-[64px] w-[min(860px,92vw)]"
        >
          <div className="flex items-center justify-between gap-6 w-full h-full px-7">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
              <span className="relative w-9 h-9 rounded-[12px] overflow-hidden flex items-center justify-center shadow-glow">
                <span className="absolute inset-0 gradient-primary" />
                <Pill className="relative w-4.5 h-4.5 w-[18px] h-[18px] text-white rotate-45" strokeWidth={1.8} />
              </span>
              <span className="text-[17px] font-extrabold tracking-tight">
                <span className="text-gradient">Medi</span>
                <span className="text-foreground">Scan</span>
              </span>
            </NavLink>

            {/* Center links */}
            <nav className="flex items-center gap-1">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    "px-4 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (isActive
                      ? "bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/40")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <GlassIconButton
                aria-label="Reminders"
                className="w-10 h-10"
                onClick={() => (window.location.hash = "#")}
              >
                <Bell className="w-4 h-4 text-primary" strokeWidth={1.8} />
              </GlassIconButton>
              <button
                aria-label="Settings"
                onClick={() => (window.location.hash = "#settings")}
                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/80 shadow-glass active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-full h-full rounded-full gradient-primary flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-white" strokeWidth={1.8} />
                </span>
              </button>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};

export default GlassNavbar;
