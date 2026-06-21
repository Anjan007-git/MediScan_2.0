import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { House, ReceiptText, ScanLine, ChartPie, Settings2 } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: House },
  { to: "/receipts", label: "Receipts", icon: ReceiptText },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/insights", label: "Insights", icon: ChartPie },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const NAV_HEIGHT = 68;
const PILL_HEIGHT = 56;
const ACTIVE_BLUE = "#007AFF";

const BottomNav = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false });

  const activeIndex = (() => {
    const path = location.pathname;
    const idx = items.findIndex(({ to }) =>
      to === "/" ? path === "/" : path.startsWith(to)
    );
    return idx === -1 ? 0 : idx;
  })();

  const measure = () => {
    const el = itemRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const w = Math.min(elRect.width - 6, 86);
    const cx = elRect.left + elRect.width / 2 - cRect.left;
    setIndicator({ x: cx - w / 2, w, ready: true });
  };

  useLayoutEffect(measure, [activeIndex]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
      aria-label="Primary"
    >
      <div
        ref={containerRef}
        className="relative flex items-center justify-around overflow-hidden"
        style={{
          height: NAV_HEIGHT,
          borderRadius: 40,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(25px) saturate(180%)",
          WebkitBackdropFilter: "blur(25px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
        }}
      >
        {/* Soft white pill highlight (contained inside navbar) */}
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: indicator.w,
            height: PILL_HEIGHT,
            top: (NAV_HEIGHT - PILL_HEIGHT) / 2,
            left: 0,
            transform: `translateX(${indicator.x}px)`,
            transition: indicator.ready
              ? "transform 250ms ease-in-out, width 250ms ease-in-out"
              : "none",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 24,
            boxShadow: "0 4px 15px rgba(0,122,255,0.12)",
            opacity: indicator.ready ? 1 : 0,
          }}
        />

        {items.map(({ to, label, icon: Icon }, i) => {
          const isActive = i === activeIndex;
          const color = isActive ? ACTIVE_BLUE : "#3F3F46";
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              ref={(el) => (itemRefs.current[i] = el)}
              className="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-[3px] active:scale-95 transition-transform duration-200"
              aria-label={label}
            >
              <Icon
                style={{
                  width: 22,
                  height: 22,
                  color,
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  transition: "transform 250ms ease-in-out, color 200ms ease",
                }}
                strokeWidth={isActive ? 1.9 : 1.7}
              />
              <span
                style={{
                  fontSize: 11,
                  lineHeight: 1,
                  color: isActive ? ACTIVE_BLUE : "#6B7280",
                  fontWeight: isActive ? 600 : 500,
                  transition: "color 200ms ease",
                }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
