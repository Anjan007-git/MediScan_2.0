import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Camera, PieChart, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/receipts", label: "Receipts", icon: FileText },
  { to: "/scan", label: "Scan", icon: Camera, center: true },
  { to: "/insights", label: "Insights", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number; center: boolean }>({
    left: 0,
    width: 0,
    center: false,
  });

  const activeIndex = (() => {
    const path = location.pathname;
    const idx = items.findIndex(({ to }) =>
      to === "/" ? path === "/" : path.startsWith(to)
    );
    return idx === -1 ? 0 : idx;
  })();

  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    setIndicator({
      left: elRect.left - cRect.left,
      width: elRect.width,
      center: !!items[activeIndex].center,
    });
  }, [activeIndex]);

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      aria-label="Primary"
    >
      <div
        ref={containerRef}
        className="relative rounded-full px-2 py-2 flex items-stretch justify-between shadow-float overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsla(0,0%,100%,0.78) 0%, hsla(214,100%,97%,0.72) 100%)",
          backdropFilter: "blur(32px) saturate(160%)",
          WebkitBackdropFilter: "blur(32px) saturate(160%)",
          border: "1px solid hsla(0,0%,100%,0.55)",
          boxShadow:
            "0 10px 30px -10px rgba(15,23,42,0.18), inset 0 1px 0 hsla(0,0%,100%,0.7)",
        }}
      >
        {/* Sliding liquid highlight */}
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: indicator.left,
            width: indicator.width,
            height: "calc(100% - 8px)",
            background: indicator.center
              ? "radial-gradient(circle at 50% 50%, hsla(217,91%,60%,0.18) 0%, hsla(217,91%,60%,0.06) 60%, transparent 80%)"
              : "linear-gradient(135deg, hsla(217,91%,60%,0.14), hsla(213,94%,68%,0.10))",
            boxShadow: indicator.center
              ? "0 0 28px hsla(217,91%,60%,0.35)"
              : "0 0 18px hsla(217,91%,60%,0.18)",
          }}
        />

        {items.map(({ to, label, icon: Icon, center }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            ref={(el) => (tabRefs.current[i] = el)}
            className="relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 transition-transform active:scale-95"
          >
            {({ isActive }) => {
              const showActive = isActive || i === activeIndex;
              return (
                <>
                  <div
                    className={`flex items-center justify-center transition-all duration-300 ${
                      center ? "w-9 h-9" : "w-7 h-7"
                    }`}
                  >
                    {center ? (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          showActive ? "shadow-[0_6px_20px_rgba(59,130,246,0.55)]" : ""
                        }`}
                        style={{
                          background: showActive
                            ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
                            : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        }}
                      >
                        <Icon
                          className="w-[18px] h-[18px] text-white"
                          strokeWidth={2.4}
                        />
                      </div>
                    ) : (
                      <Icon
                        className={`transition-colors duration-300 ${
                          showActive ? "text-primary" : "text-foreground"
                        }`}
                        style={{ width: 22, height: 22 }}
                        strokeWidth={2.2}
                        fill={showActive ? "currentColor" : "none"}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[11px] leading-none font-medium transition-colors duration-300 ${
                      showActive ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
