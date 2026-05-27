import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/appStore";

type Category = { name: string; value: number; color: string; desc: string; count: number };

const CATEGORY_META: Record<string, { color: string; desc: string; match: RegExp }> = {
  "Pain Relief": {
    color: "hsl(217 91% 60%)",
    desc: "Paracetamol, Ibuprofen, Aspirin",
    match: /pain|paracetamol|ibuprofen|aspirin|relief|fever|acetaminophen|naproxen/,
  },
  Antibiotics: {
    color: "hsl(142 71% 45%)",
    desc: "Amoxicillin, Azithromycin",
    match: /antibiotic|amoxi|cillin|cycline|mycin|azithro|cefix|ciproflox/,
  },
  Vitamins: {
    color: "hsl(25 95% 55%)",
    desc: "Vitamin C, D, B-complex",
    match: /vitamin|multivit|supplement|biotin|iron|calcium|zinc|omega/,
  },
  Others: {
    color: "hsl(262 83% 65%)",
    desc: "Antacids, allergy & more",
    match: /.*/,
  },
};

const InsightsCategories = () => {
  const navigate = useNavigate();
  const { scans } = useAppStore();

  const categories = useMemo<Category[]>(() => {
    if (scans.length === 0) return [];
    const buckets: Record<string, number> = {
      "Pain Relief": 0,
      Antibiotics: 0,
      Vitamins: 0,
      Others: 0,
    };
    scans.forEach((s) => {
      const t = `${s.name} ${s.description || ""}`.toLowerCase();
      if (CATEGORY_META["Pain Relief"].match.test(t)) buckets["Pain Relief"]++;
      else if (CATEGORY_META["Antibiotics"].match.test(t)) buckets["Antibiotics"]++;
      else if (CATEGORY_META["Vitamins"].match.test(t)) buckets["Vitamins"]++;
      else buckets["Others"]++;
    });
    const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, v]) => ({
        name,
        count: v,
        value: Math.round((v / total) * 100),
        color: CATEGORY_META[name].color,
        desc: CATEGORY_META[name].desc,
      }))
      .sort((a, b) => b.value - a.value);
  }, [scans]);

  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate("/insights")}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Full breakdown of scanned medicines</p>
        </div>
      </header>

      {categories.length === 0 ? (
        <section
          className="glass rounded-[24px] p-8 flex flex-col items-center text-center animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
          <h3 className="font-bold text-foreground text-base">No medicine categories scanned yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[260px]">
            Start scanning medicines to see your personalized category insights.
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-soft active:scale-95 transition"
            style={{ background: "var(--gradient-primary)" }}
          >
            Scan a medicine
          </button>
        </section>
      ) : (
        <section className="space-y-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          {categories.map((c) => (
            <article key={c.name} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-soft"
                style={{ background: c.color }}
              >
                <Pill className="w-5 h-5 text-white rotate-45" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-[15px]">{c.name}</h3>
                  <span className="font-extrabold text-foreground text-sm">{c.value}%</span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                  {c.count} scan{c.count === 1 ? "" : "s"} · {c.desc}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.value}%`, background: c.color }}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default InsightsCategories;
