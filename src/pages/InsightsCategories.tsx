import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill } from "lucide-react";

const categories = [
  { name: "Pain Relief", value: 45, color: "hsl(217 91% 60%)", desc: "Paracetamol, Ibuprofen, Aspirin" },
  { name: "Antibiotics", value: 25, color: "hsl(142 71% 45%)", desc: "Amoxicillin, Azithromycin" },
  { name: "Vitamins", value: 15, color: "hsl(25 95% 55%)", desc: "Vitamin C, D, B-complex" },
  { name: "Others", value: 15, color: "hsl(262 83% 65%)", desc: "Antacids, allergy & more" },
];

const InsightsCategories = () => {
  const navigate = useNavigate();
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
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{c.desc}</p>
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
    </div>
  );
};

export default InsightsCategories;
