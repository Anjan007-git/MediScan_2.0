import { NavLink } from "react-router-dom";
import { Home, Receipt, Camera, PieChart, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/receipts", label: "Receipts", icon: Receipt },
  { to: "/scan", label: "Scan", icon: Camera, center: true },
  { to: "/insights", label: "Insights", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      aria-label="Primary"
    >
      <div className="glass-strong rounded-[28px] px-3 py-2.5 flex items-end justify-between shadow-float">
        {items.map(({ to, label, icon: Icon, center }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-1 transition-all duration-200 ${
                center ? "-mt-6" : ""
              } ${isActive ? "" : "opacity-70"}`
            }
          >
            {({ isActive }) => (
              <>
                {center ? (
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-glow transition-transform active:scale-95 ${
                      isActive ? "scale-105" : ""
                    }`}
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 to-transparent" />
                    <Icon className="relative w-6 h-6 text-white" strokeWidth={2.4} />
                  </div>
                ) : (
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-primary/15 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                        : ""
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : "text-foreground/60"}`}
                      strokeWidth={isActive ? 2.6 : 2.2}
                      fill={isActive && label === "Home" ? "currentColor" : "none"}
                    />
                    {isActive && (
                      <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                )}
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
