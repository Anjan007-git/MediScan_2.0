import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore, Receipt } from "@/store/appStore";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Plus,
  X,
  FileSpreadsheet,
} from "lucide-react";
import avatarAlex from "@/assets/avatar-alex.jpg";

type FilterKey = "all" | "month" | "3months" | "older";

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
  const { receipts, addReceipt } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return receipts
      .filter((r) => {
        if (query && !r.pharmacy.toLowerCase().includes(query.toLowerCase())) return false;
        const age = now - r.date;
        if (filter === "month") return age <= 30 * day;
        if (filter === "3months") return age <= 90 * day;
        if (filter === "older") return age > 90 * day;
        return true;
      })
      .sort((a, b) => b.date - a.date);
  }, [receipts, query, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Receipt[]>();
    filtered.forEach((r) => {
      const k = monthKey(r.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalSpent = receipts.reduce((s, r) => s + r.total, 0);

  return (
    <div className="px-5 pt-12 space-y-5">
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
          <img src={avatarAlex} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-white" />
        </button>
      </header>

      {/* SEARCH */}
      <div
        className="flex items-center gap-3 animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            strokeWidth={2.4}
          />
          <input
            type="text"
            placeholder="Search receipts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass rounded-full pl-11 pr-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          className="w-12 h-12 glass rounded-full flex items-center justify-center active:scale-95 transition"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-4 h-4 text-foreground" strokeWidth={2.4} />
        </button>
      </div>

      {/* FILTER TABS */}
      <div
        className="flex gap-2.5 overflow-x-auto -mx-5 px-5 scrollbar-none animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "text-white shadow-glow"
                  : "glass text-foreground/70 hover:text-foreground"
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
                <ReceiptCard key={r.id} r={r} />
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
      <section
        className="glass-tinted rounded-[24px] p-4 relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "240ms" }}
      >
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
              <p className="text-lg font-extrabold text-foreground leading-tight">
                {formatINR(totalSpent)}
              </p>
            </div>
            <div className="border-l border-border/60 pl-3">
              <p className="text-xs text-muted-foreground font-medium">Total Receipts</p>
              <p className="text-lg font-extrabold text-foreground leading-tight">
                {receipts.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 shadow-glow active:scale-95 transition overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
            aria-label="Add receipt"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            <FileSpreadsheet className="relative w-4 h-4 text-white" strokeWidth={2.4} />
            <span className="relative text-[8px] font-bold text-white leading-none mt-0.5">
              Add Receipt
            </span>
          </button>
        </div>
      </section>

      {showAdd && <AddReceiptModal onClose={() => setShowAdd(false)} onAdd={addReceipt} />}
    </div>
  );
};

const ReceiptCard = ({ r }: { r: Receipt }) => {
  return (
    <article className="glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] hover:shadow-glass-lg transition-all">
      {/* Thumbnail */}
      <div className="w-[70px] h-[70px] rounded-xl bg-white/80 shadow-soft border border-white/70 shrink-0 p-1.5 flex flex-col gap-0.5 overflow-hidden">
        <p className="text-[7px] font-bold text-foreground/80 leading-none truncate">{r.pharmacy}</p>
        <div className="flex-1 space-y-[1.5px] mt-0.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] bg-foreground/15 rounded-full"
              style={{ width: `${60 + ((i * 13) % 35)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-[15px] truncate">{r.pharmacy}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(r.date)}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{r.items.length} items</p>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch py-0.5 shrink-0">
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground active:bg-primary/10"
          aria-label="More"
        >
          <MoreHorizontal className="w-4 h-4" strokeWidth={2.4} />
        </button>
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-foreground text-[15px]">{formatINR(r.total)}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.4} />
        </div>
      </div>
    </article>
  );
};

const AddReceiptModal = ({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (r: Receipt) => void;
}) => {
  const [pharmacy, setPharmacy] = useState("");
  const [total, setTotal] = useState("");
  const [items, setItems] = useState("1");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy || !total) return;
    const itemCount = Math.max(1, parseInt(items, 10) || 1);
    onAdd({
      id: `r${Date.now()}`,
      pharmacy: pharmacy.trim(),
      date: Date.now(),
      total: parseFloat(total) || 0,
      items: Array.from({ length: itemCount }, (_, i) => ({
        name: `Item ${i + 1}`,
        qty: 1,
        price: (parseFloat(total) || 0) / itemCount,
      })),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-[28px] p-6 w-full max-w-md shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Receipt</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center active:scale-90"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Pharmacy</label>
            <input
              type="text"
              value={pharmacy}
              onChange={(e) => setPharmacy(e.target.value)}
              placeholder="e.g. Apollo Pharmacy"
              className="mt-1 w-full glass rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Total (₹)</label>
              <input
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full glass rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Items</label>
              <input
                type="number"
                min="1"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="mt-1 w-full glass rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <button
            type="submit"
            className="glossy relative w-full rounded-full py-3.5 mt-2 font-semibold text-white shadow-glow active:scale-[0.97] transition"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="inline w-4 h-4 mr-1 -mt-0.5" strokeWidth={2.6} />
            Add Receipt
          </button>
        </form>
      </div>
    </div>
  );
};

export default Receipts;
