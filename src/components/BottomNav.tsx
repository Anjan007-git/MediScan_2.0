import { Home, Search, Camera, Clock, Settings as SettingsIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/scan", icon: Camera, label: "Scan", primary: true },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-strong rounded-[28px] px-2 py-2 flex items-end justify-around shadow-float relative overflow-visible">
          {items.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;

            if (item.primary) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative -mt-7"
                  aria-label={item.label}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-glow transition-transform active:scale-95 relative overflow-hidden glossy",
                      active && "ring-4 ring-primary/30"
                    )}
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                    <Icon className="w-7 h-7 text-white relative" strokeWidth={2.4} />
                  </div>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all active:scale-95 min-w-[56px]"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    active
                      ? "bg-primary/15 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)]"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={active ? 2.6 : 2}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.15 : 0}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
