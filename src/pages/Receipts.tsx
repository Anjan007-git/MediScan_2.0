import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore, Receipt } from "@/store/appStore";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MoreHorizontal,
  FileText,
  EyeOff,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import avatarAlex from "@/assets/avatar-alex.jpg";
import { useAuth } from "@/contexts/AuthContext";

type FilterKey = "all" | "month" | "3months" | "older" | "custom";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "month", label: "This Month" },
  { key: "3months", label: "Last 3 Months" },
  { key: "older", label: "Older" },
];

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${date}  •  ${time}`;
};

const monthKey = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const Receipts = () => {
  const navigate = useNavigate();
  const { receipts, hideReceipt, deleteReceipt } = useAppStore();
  const { user: authUser, profile } = useAuth();
  const avatarUrl =
    profile?.avatar_url ||
    (authUser?.user_metadata as any)?.avatar_url ||
    avatarAlex;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return receipts
      .filter((r) => !r.hidden)
      .filter((r) => {
        if (query && !r.pharmacy.toLowerCase().includes(query.toLowerCase())) return false;
        const age = now - r.date;
        if (filter === "month") return age <= 30 * day;
        if (filter === "3months") return age <= 90 * day;
        if (filter === "older") return age > 90 * day;
        if (filter === "custom") {
          if (customFrom && r.date < new Date(customFrom).getTime()) return false;
          if (customTo && r.date > new Date(customTo).getTime() + day) return false;
        }
        return true;
      })
      .sort((a, b) => b.date - a.date);
  }, [receipts, query, filter, customFrom, customTo]);

  const grouped = useMemo(() => {
    const map = new Map<string, Receipt[]>();
    filtered.forEach((r) => {
      const k = monthKey(r.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalSpent = receipts
    .filter((r) => !r.hidden)
    .reduce((s, r) => s + r.total, 0);

  const visibleCount = receipts.filter((r) => !r.hidden).length;

  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      {/* HEADER */}
      <header className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight leading-none">Receipts</h1>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            All your medicine purchase receipts
          </p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-glass active:scale-95 transition"
          aria-label="Open profile"
        >
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-white" />
        </button>
      </header>

      {/* SEARCH */}
      <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.4} />
          <input
            type="text"
            placeholder="Search receipts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass rounded-full pl-11 pr-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition ${
            showFilter || filter === "custom" ? "shadow-glow text-white" : "glass"
          }`}
          style={showFilter || filter === "custom" ? { background: "var(--gradient-primary)" } : undefined}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={2.4} />
        </button>
      </div>

      {/* DATE RANGE PANEL */}
      {showFilter && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Custom date range</p>
            <button
              onClick={() => {
                setCustomFrom("");
                setCustomTo("");
                setFilter("all");
              }}
              className="text-xs font-semibold text-primary"
            >
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">From</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setFilter("custom");
                }}
                className="mt-1 w-full glass-subtle rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">To</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setFilter("custom");
                }}
                className="mt-1 w-full glass-subtle rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5 scrollbar-none animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active ? "text-white shadow-glow" : "glass text-foreground/70 hover:text-foreground"
              }`}
              style={active ? { background: "var(--gradient-primary)" } : undefined}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* GROUPED LIST */}
      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        {grouped.map(([month, list]) => {
          const monthTotal = list.reduce((s, r) => s + r.total, 0);
          return (
            <section key={month} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-foreground">{month}</h2>
                <span className="text-sm font-semibold text-primary">
                  Total {formatINR(monthTotal)}
                </span>
              </div>
              {list.map((r) => (
                <ReceiptCard
                  key={r.id}
                  r={r}
                  menuOpen={openMenu === r.id}
                  onMenu={() => setOpenMenu((v) => (v === r.id ? null : r.id))}
                  onMenuClose={() => setOpenMenu(null)}
                  onOpen={() => navigate(`/receipts/${r.id}`)}
                  onHide={() => {
                    hideReceipt(r.id);
                    setOpenMenu(null);
                  }}
                  onDelete={() => {
                    if (confirm("Delete this receipt permanently?")) {
                      deleteReceipt(r.id);
                    }
                    setOpenMenu(null);
                  }}
                />
              ))}
            </section>
          );
        })}

        {grouped.length === 0 && (
          <div className="glass rounded-2xl py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" strokeWidth={1.8} />
            <p className="text-sm text-muted-foreground">No receipts found</p>
          </div>
        )}
      </div>

      {/* SUMMARY CARD */}
      <section className="glass-tinted rounded-[24px] p-4 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-glow relative overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            <FileText className="relative w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
              <p className="text-lg font-extrabold text-foreground leading-tight">{formatINR(totalSpent)}</p>
            </div>
            <div className="border-l border-border/60 pl-3">
              <p className="text-xs text-muted-foreground font-medium">Receipts</p>
              <p className="text-lg font-extrabold text-foreground leading-tight">{visibleCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => navigate("/receipts/scan")}
        className="fixed bottom-28 right-5 z-30 h-14 pl-4 pr-5 rounded-full flex items-center gap-2 text-white font-bold text-sm shadow-glow active:scale-95 transition glossy"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="Add Receipt"
      >
        <Plus className="w-5 h-5" strokeWidth={2.6} />
        Add Receipt
      </button>
    </div>
  );
};

const ReceiptCard = ({
  r,
  menuOpen,
  onMenu,
  onMenuClose,
  onOpen,
  onHide,
  onDelete,
}: {
  r: Receipt;
  menuOpen: boolean;
  onMenu: () => void;
  onMenuClose: () => void;
  onOpen: () => void;
  onHide: () => void;
  onDelete: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onMenuClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, onMenuClose]);

  return (
    <article className="relative glass rounded-2xl p-3 pr-4 hover:shadow-glass-lg transition-all" style={{ overflow: "visible" }}>
      {/* Menu button — absolutely positioned, won't collide with content */}
      <button
        onClick={onMenu}
        className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground active:bg-primary/10 z-20"
        aria-label="More options"
      >
        <MoreHorizontal className="w-4 h-4" strokeWidth={2.4} />
      </button>

      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 text-left active:scale-[0.99] pr-6"
      >
        <div className="w-[64px] h-[64px] rounded-xl bg-white/80 shadow-soft border border-white/70 shrink-0 p-1.5 flex flex-col gap-0.5 overflow-hidden">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <>
              <p className="text-[7px] font-bold text-foreground/80 leading-none truncate">{r.pharmacy}</p>
              <div className="flex-1 space-y-[1.5px] mt-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-[2px] bg-foreground/15 rounded-full" style={{ width: `${60 + ((i * 13) % 35)}%` }} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-[15px] truncate">{r.pharmacy}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(r.date)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{r.items.length} items</p>
        </div>
        <div className="flex flex-col items-end shrink-0 mt-4">
          <span className="font-extrabold text-foreground text-[15px]">{formatINR(r.total)}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" strokeWidth={2.4} />
        </div>
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-12 right-3 z-[60] glass-strong rounded-2xl p-2 w-40 shadow-float animate-fade-in-up flex flex-col gap-2"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={onHide}
            className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-2 text-sm font-semibold text-foreground hover:bg-primary/5 active:bg-primary/10"
          >
            <EyeOff className="w-4 h-4" strokeWidth={2.4} />
            Hide
          </button>
          <button
            onClick={onDelete}
            className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-2 text-sm font-semibold text-danger hover:bg-danger/5 active:bg-danger/10"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.4} />
            Delete
          </button>
        </div>
      )}
    </article>
  );
};

export default Receipts;
