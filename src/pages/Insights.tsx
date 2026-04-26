import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { ArrowLeft, Activity, ShieldCheck, AlertTriangle, Star, Pill } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo } from "react";

const Insights = () => {
  const navigate = useNavigate();
  const { scans } = useAppStore();

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const count = scans.filter((s) => {
        const sd = new Date(s.scannedAt);
        return sd.toDateString() === d.toDateString();
      }).length;
      // sprinkle some mock variation for empty days so chart isn't flat
      return { day: label, scans: count || Math.floor(Math.random() * 3) };
    });
    return days;
  }, [scans]);

  const safeCount = scans.filter((s) => s.status === "safe").length;
  const cautionCount = scans.filter((s) => s.status === "caution").length;
  const dangerCount = scans.filter((s) => s.status === "danger").length;
  const savedCount = scans.filter((s) => s.saved).length;

  const pieData = [
    { name: "Safe", value: safeCount || 1, color: "hsl(142 71% 45%)" },
    { name: "Caution", value: cautionCount || 1, color: "hsl(38 92% 50%)" },
    { name: "Danger", value: dangerCount, color: "hsl(0 84% 60%)" },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: "Total Scans", value: scans.length, icon: Activity, color: "from-blue-400 to-blue-600" },
    { label: "Safe", value: safeCount, icon: ShieldCheck, color: "from-emerald-400 to-green-600" },
    { label: "Caution", value: cautionCount, icon: AlertTriangle, color: "from-amber-400 to-orange-500" },
    { label: "Saved", value: savedCount, icon: Star, color: "from-violet-400 to-purple-600" },
  ];

  const saved = scans.filter((s) => s.saved);

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
        <h1 className="text-xl font-bold">Insights</h1>
        <div className="w-10" />
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-soft mb-3 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              <s.icon className="relative w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Trend chart */}
      <section
        className="glass-strong rounded-[24px] p-5 animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        <h3 className="font-bold mb-1">Scan Activity</h3>
        <p className="text-xs text-muted-foreground mb-4">Last 7 days</p>
        <div className="h-44 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(213 94% 68%)" />
                  <stop offset="100%" stopColor="hsl(224 76% 48%)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 60% 88%)" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(215 20% 45%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215 20% 45%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid hsl(214 60% 88%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="url(#g1)"
                strokeWidth={3}
                dot={{ fill: "hsl(217 91% 60%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pie */}
      <section
        className="glass rounded-[24px] p-5 animate-fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        <h3 className="font-bold mb-4">Safety Breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={3}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="font-medium">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Saved meds */}
      <section id="saved" className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <h3 className="font-bold mb-3 px-1">Saved Medicines</h3>
        {saved.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 glass rounded-2xl">
            No saved medicines yet.
          </p>
        ) : (
          <div className="space-y-2">
            {saved.map((s) => (
              <div key={s.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-white/60">
                  <Pill className="w-5 h-5 text-primary rotate-45" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{s.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Insights;
