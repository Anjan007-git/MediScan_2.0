import { useNavigate } from "react-router-dom";
import { useAppStore, timeAgo, ScanRecord } from "@/store/appStore";
import {
  ArrowLeft,
  Pill,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  History as HistoryIcon,
} from "lucide-react";

const History = () => {
  const navigate = useNavigate();
  const scans = useAppStore((s) => s.scans);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.4} />
        </button>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight leading-none">Scan History</h1>
          <p className="text-sm text-muted-foreground mt-1">{scans.length} scans</p>
        </div>
      </header>

      {scans.length === 0 ? (
        <div className="glass-strong rounded-[28px] p-8 text-center mt-12 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-glow mb-4"
            style={{ background: "var(--gradient-primary)" }}
          >
            <HistoryIcon className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
          <h3 className="text-lg font-bold text-foreground">No scans yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Start scanning medicines to build your history.
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="mt-5 rounded-full px-6 py-3 text-white font-semibold shadow-glow active:scale-95"
            style={{ background: "var(--gradient-primary)" }}
          >
            Scan Now
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up">
          {scans.map((s) => (
            <ScanItem key={s.id} scan={s} onClick={() => navigate(`/receipts#${s.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

const ScanItem = ({ scan, onClick }: { scan: ScanRecord; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="glass w-full rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.99] hover:shadow-glass-lg transition-all"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-white/60">
        <Pill className="w-6 h-6 text-primary rotate-45" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-foreground text-sm truncate">{scan.name}</h4>
          <StatusBadge status={scan.status} />
        </div>
        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{scan.description}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span>{timeAgo(scan.scannedAt)}</span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" strokeWidth={2.4} /> {scan.expiry}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2.4} />
    </button>
  );
};

const StatusBadge = ({ status }: { status: ScanRecord["status"] }) => {
  const map = {
    safe: { bg: "bg-success-light", text: "text-success", icon: ShieldCheck, label: "Safe" },
    caution: { bg: "bg-warning-light", text: "text-warning", icon: AlertTriangle, label: "Caution" },
    danger: { bg: "bg-danger-light", text: "text-danger", icon: AlertTriangle, label: "Unsafe" },
  } as const;
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
    >
      <cfg.icon className="w-2.5 h-2.5" strokeWidth={2.6} />
      {cfg.label}
    </span>
  );
};

export default History;
