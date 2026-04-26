import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { Receipt, ChevronRight, Search, Calendar, ArrowLeft } from "lucide-react";

const Receipts = () => {
  const navigate = useNavigate();
  const { receipts } = useAppStore();
  const [query, setQuery] = useState("");

  const filtered = receipts.filter((r) =>
    r.pharmacy.toLowerCase().includes(query.toLowerCase())
  );

  const total = receipts.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="px-5 pt-12 space-y-5">
      <header className="flex items-center justify-between animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.4} />
        </button>
        <h1 className="text-xl font-bold">Receipts</h1>
        <div className="w-10" />
      </header>

      {/* Summary */}
      <section
        className="glass-strong rounded-[24px] p-5 relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-glow/30 blur-3xl" />
        <p className="relative text-xs uppercase tracking-widest font-semibold text-primary">Total spent</p>
        <p className="relative text-3xl font-extrabold mt-1">${total.toFixed(2)}</p>
        <p className="relative text-sm text-muted-foreground mt-1">{receipts.length} receipts this month</p>
      </section>

      {/* Search */}
      <div className="relative animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.4} />
        <input
          type="text"
          placeholder="Search pharmacy..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full glass rounded-full pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        {filtered.map((r) => (
          <article key={r.id} className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-soft relative overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                <Receipt className="relative w-5 h-5 text-white" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground">{r.pharmacy}</h3>
                  <span className="font-bold text-primary">${r.total.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" strokeWidth={2.4} />
                  {new Date(r.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <ul className="mt-2 space-y-1">
                  {r.items.map((it) => (
                    <li
                      key={it.name}
                      className="flex justify-between text-[12px] text-foreground/80"
                    >
                      <span className="truncate">
                        {it.name} <span className="text-muted-foreground">×{it.qty}</span>
                      </span>
                      <span className="font-semibold">${it.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No receipts found.</p>
        )}
      </div>
    </div>
  );
};

export default Receipts;
