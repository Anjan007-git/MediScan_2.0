import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Camera, PieChart, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/receipts", label: "Receipts", icon: FileText },
  { to: "/scan", label: "Scan", icon: Camera },
  { to: "/insights", label: "Insights", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

const NAV_HEIGHT = 64;
const PILL_HEIGHT = 44;
const PILL_WIDTH = 56;

const BottomNav = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState({ x: 0, ready: false });

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
    const cx = elRect.left + elRect.width / 2 - cRect.left;
    setIndicator({ x: cx - PILL_WIDTH / 2, ready: true });
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
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      aria-label="Primary"
    >
      <div
        ref={containerRef}
        className="relative rounded-full flex items-center justify-around overflow-hidden"
        style={{
          height: NAV_HEIGHT,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow:
            "0 14px 44px -12px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        {/* Contained capsule highlight */}
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            top: (NAV_HEIGHT - PILL_HEIGHT) / 2,
            left: 0,
            transform: `translateX(${indicator.x}px)`,
            transition: indicator.ready
              ? "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
            background:
              "linear-gradient(135deg, #60A5FA 0%, #3B82F6 60%, #1D4ED8 100%)",
            borderRadius: 16,
            boxShadow:
              "0 6px 16px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
            opacity: indicator.ready ? 1 : 0,
          }}
        />

        {items.map(({ to, label, icon: Icon }, i) => {
          const isActive = i === activeIndex;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              ref={(el) => (itemRefs.current[i] = el)}
              className="relative z-10 flex-1 h-full flex items-center justify-center transition-transform duration-200 active:scale-95"
              aria-label={label}
            >
              <Icon
                className="transition-all duration-300"
                style={{
                  width: 22,
                  height: 22,
                  color: isActive ? "#ffffff" : "#6B7280",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
                strokeWidth={isActive ? 2.5 : 2.2}
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
