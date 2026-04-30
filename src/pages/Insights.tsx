import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
  ReferenceDot,
} from "recharts";
import {
  Info,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Bell,
  Shield,
  X,
} from "lucide-react";
import avatarAlex from "@/assets/avatar-alex.jpg";
import { useAuth } from "@/contexts/AuthContext";

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Period = "week" | "month" | "year";

const PERIOD_LABEL: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

const Insights = () => {
  const navigate = useNavigate();
  const { scans, receipts, reminders } = useAppStore();
  const { user: authUser, profile } = useAuth();
  const avatarUrl =
    profile?.avatar_url ||
    (authUser?.user_metadata as any)?.avatar_url ||
    avatarAlex;
  const [tipDismissed, setTipDismissed] = useState(false);
  const [period, setPeriod] = useState<Period>("month");

  const periodStart = useMemo(() => {
    const d = new Date();
    if (period === "week") {
      d.setDate(d.getDate() - 7);
    } else if (period === "month") {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setFullYear(d.getFullYear() - 1);
    }
    return d.getTime();
  }, [period]);

  const filteredScans = useMemo(
    () => scans.filter((s) => s.scannedAt >= periodStart),
    [scans, periodStart]
  );
  const filteredReceipts = useMemo(
    () => receipts.filter((r) => r.date >= periodStart),
    [receipts, periodStart]
  );

  // Weekly bar chart data — actual scans only (last 7 days, no demo floor)
  const weeklyBars = useMemo(() => {
    const labels = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return labels.map((label, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const count = scans.filter((s) => {
        const d = new Date(s.scannedAt);
        return d.toDateString() === day.toDateString();
      }).length;
      return { label, value: count };
    });
  }, [scans]);

  // Real status counts (no demo floors)
  const safeCount = filteredScans.filter((s) => s.status === "safe").length;
  const cautionCount = filteredScans.filter((s) => s.status === "caution").length;
  const dangerCount = filteredScans.filter((s) => s.status === "danger").length;
  const totalScans = safeCount + cautionCount + dangerCount;

  // Real spending — only filtered receipts
  const totalSpent = filteredReceipts.reduce((s, r) => s + r.total, 0);

  // Spending line — bucketed by week within the period
  const spendLine = useMemo(() => {
    if (filteredReceipts.length === 0) {
      return [{ x: 1, y: 0 }];
    }
    const sorted = [...filteredReceipts].sort((a, b) => a.date - b.date);
    return sorted.map((r, i) => ({ x: i + 1, y: r.total }));
  }, [filteredReceipts]);

  const peakPoint = spendLine.reduce((m, p) => (p.y > m.y ? p : m), spendLine[0]);

  // Categories computed from real scans by simple keyword grouping
  const categories = useMemo(() => {
    if (filteredScans.length === 0) return [] as { name: string; value: number; color: string }[];
    const buckets: Record<string, number> = {
      "Pain Relief": 0,
      Antibiotics: 0,
      Vitamins: 0,
      Others: 0,
    };
    filteredScans.forEach((s) => {
      const t = `${s.name} ${s.description || ""}`.toLowerCase();
      if (/pain|paracetamol|ibuprofen|aspirin|relief|fever/.test(t)) buckets["Pain Relief"]++;
      else if (/antibiotic|amoxi|cillin|cycline|mycin/.test(t)) buckets["Antibiotics"]++;
      else if (/vitamin|multivit|supplement|biotin|iron|calcium/.test(t)) buckets["Vitamins"]++;
      else buckets["Others"]++;
    });
    const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = {
      "Pain Relief": "hsl(217 91% 60%)",
      Antibiotics: "hsl(142 71% 45%)",
      Vitamins: "hsl(25 95% 55%)",
      Others: "hsl(262 83% 65%)",
    };
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, v]) => ({ name, value: Math.round((v / total) * 100), color: colors[name] }));
  }, [filteredScans]);

  return (
    <div className="px-5 pt-12 space-y-5">
      {/* HEADER */}
      <header className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight leading-none">Insights</h1>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            Your health insights and trends
          </p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-glass active:scale-95 transition"
          aria-label="Profile"
        >
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-white" />
        </button>
      </header>

      {/* SCAN OVERVIEW */}
      <section
        className="glass-strong rounded-[24px] p-5 animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-foreground">Scan Overview</h2>
            <Info className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </div>
          <PeriodPill value={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
          <div>
            <p className="text-xs text-muted-foreground">Total scans</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-extrabold leading-none">{totalScans}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{PERIOD_LABEL[period]}</p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBars} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(213 94% 75%)" />
                    <stop offset="100%" stopColor="hsl(217 91% 55%)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(215 20% 45%)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={10}>
                  {weeklyBars.map((_, i) => (
                    <Cell key={i} fill="url(#barG)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* STATUS CARDS */}
      <section
        className="grid grid-cols-3 gap-3 animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        <StatusCard
          icon={ShieldCheck}
          label="Safe"
          value={safeCount}
          color="success"
          accent="hsl(142 71% 45%)"
          progress={(safeCount / totalScans) * 100}
        />
        <StatusCard
          icon={AlertTriangle}
          label="Caution"
          value={cautionCount}
          color="warning"
          accent="hsl(38 92% 50%)"
          progress={(cautionCount / totalScans) * 100}
        />
        <StatusCard
          icon={ShieldAlert}
          label="Unsafe"
          value={dangerCount}
          color="danger"
          accent="hsl(0 84% 60%)"
          progress={(dangerCount / totalScans) * 100}
        />
      </section>

      {/* MOST SCANNED CATEGORIES */}
      <section
        className="glass rounded-[24px] p-5 animate-fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Most Scanned Categories</h3>
          <button
            onClick={() => navigate("/insights/categories")}
            className="w-8 h-8 rounded-full glass-subtle flex items-center justify-center active:scale-90"
            aria-label="View all categories"
          >
            <ChevronRight className="w-4 h-4 text-primary" strokeWidth={2.6} />
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No scans yet — start scanning to see your most used categories.
          </p>
        ) : (
          <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    innerRadius={32}
                    outerRadius={56}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {categories.map((c) => (
                      <Cell key={c.name} fill={c.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="font-medium text-foreground/90">{c.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* SPENDING OVERVIEW */}
      <section
        className="glass-strong rounded-[24px] p-5 animate-fade-in-up"
        style={{ animationDelay: "240ms" }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-foreground">Spending Overview</h3>
            <Info className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </div>
          <PeriodPill value={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
          <div>
            <p className="text-xs text-muted-foreground">Total spent ({PERIOD_LABEL[period].toLowerCase()})</p>
            <p className="text-2xl font-extrabold mt-1 leading-tight">{formatINR(totalSpent)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">{filteredReceipts.length} receipts</span>
            </div>
            {filteredReceipts.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  Avg {formatINR(totalSpent / filteredReceipts.length)}/receipt
                </span>
              </div>
            )}
          </div>
          <div className="h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendLine} margin={{ top: 18, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
                <XAxis dataKey="x" hide />
                <Tooltip content={() => null} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2.5}
                  fill="url(#spendArea)"
                />
                <ReferenceDot
                  x={peakPoint.x}
                  y={peakPoint.y}
                  r={5}
                  fill="white"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Floating peak label */}
            {peakPoint && peakPoint.y > 0 && (
              <div className="absolute top-0 right-[28%] glass rounded-full px-2 py-0.5 text-[10px] font-bold text-primary shadow-soft">
                {formatINR(peakPoint.y)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MEDICINE REMINDERS */}
      <section
        className="glass rounded-[24px] p-4 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-foreground">Medicine Reminders</h3>
          <button
            onClick={() => navigate("/settings#reminders")}
            className="text-sm font-semibold text-primary active:opacity-70"
          >
            View All
          </button>
        </div>
        <div>
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reminders set yet.
            </p>
          ) : (
            reminders.slice(0, 2).map((r, i) => {
              const isEvening = i === 1;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isEvening ? "bg-warning-light" : "bg-success-light"
                    }`}
                  >
                    <Bell
                      className={`w-5 h-5 ${isEvening ? "text-warning" : "text-success"}`}
                      strokeWidth={2.2}
                      fill="currentColor"
                      fillOpacity={0.15}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{r.medicine}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 capitalize">
                      {r.frequency}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{r.time}</span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* HEALTH TIP */}
      {!tipDismissed && (
        <section
          className="glass-tinted rounded-[24px] p-4 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={() => setTipDismissed(true)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full glass flex items-center justify-center active:scale-90"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2.5} />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-glow relative overflow-hidden"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              <Shield className="relative w-6 h-6 text-white" strokeWidth={2.4} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm">Health Tip</h4>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Always complete your full course of antibiotics as prescribed by your doctor.
              </p>
            </div>
            <button className="glass-subtle rounded-full px-3 py-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary self-end shrink-0 active:scale-95">
              Learn More <ChevronRight className="w-3 h-3" strokeWidth={2.6} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const PeriodPill = ({
  value,
  onChange,
}: {
  value: Period;
  onChange: (v: Period) => void;
}) => {
  const [open, setOpen] = useState(false);
  const options: Period[] = ["week", "month", "year"];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass-subtle rounded-full px-3 py-1.5 inline-flex items-center gap-1 text-xs font-semibold text-foreground/80 active:scale-95"
      >
        {PERIOD_LABEL[value]} <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.4} />
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="absolute right-0 top-full mt-1 z-20 glass-strong rounded-2xl p-1.5 min-w-[130px] shadow-glass-lg">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  value === o ? "bg-primary text-white" : "text-foreground/80 hover:bg-primary/10"
                }`}
              >
                {PERIOD_LABEL[o]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface StatusCardProps {
  icon: any;
  label: string;
  value: number;
  color: "success" | "warning" | "danger";
  accent: string;
  progress: number;
}

const StatusCard = ({ icon: Icon, label, value, color, accent, progress }: StatusCardProps) => {
  const colorClasses = {
    success: { text: "text-success", bg: "bg-success-light", track: "bg-success/15" },
    warning: { text: "text-warning", bg: "bg-warning-light", track: "bg-warning/15" },
    danger: { text: "text-danger", bg: "bg-danger-light", track: "bg-danger/15" },
  }[color];

  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div
          className={`w-7 h-7 rounded-lg ${colorClasses.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${colorClasses.text}`} strokeWidth={2.4} fill="currentColor" fillOpacity={0.15} />
        </div>
        <span className={`font-semibold text-sm ${colorClasses.text}`}>{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-foreground leading-none mb-3">{value}</p>
      <div className={`h-1.5 rounded-full ${colorClasses.track} overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(progress, 100)}%`, background: accent }}
        />
      </div>
    </div>
  );
};

export default Insights;
