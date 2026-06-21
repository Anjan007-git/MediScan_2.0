import { useNavigate } from "react-router-dom";
import { useAppStore, timeAgo, ScanRecord } from "@/store/appStore";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Pill,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  History as HistoryIcon,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const navigate = useNavigate();
  const scans = useAppStore((s) => s.scans);
  const deleteScan = useAppStore((s) => s.deleteScan);
  const { toast } = useToast();
  const [actionScan, setActionScan] = useState<ScanRecord | null>(null);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
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
            <HistoryIcon className="w-7 h-7 text-white" strokeWidth={1.75} />
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
            <ScanItem
              key={s.id}
              scan={s}
              onClick={() => navigate(`/medicine/${s.id}`)}
              onLongPress={() => setActionScan(s)}
            />
          ))}
        </div>
      )}

      {actionScan && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-5"
          onClick={() => setActionScan(null)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="px-5 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-danger" strokeWidth={1.75} />
              </div>
              <h3 className="text-[17px] font-bold text-foreground">Delete this scan?</h3>
              <p className="text-[13px] text-muted-foreground mt-1.5 truncate">{actionScan.name}</p>
              <p className="text-[12px] text-muted-foreground/80 mt-0.5">This action cannot be undone.</p>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const id = actionScan.id;
                  const name = actionScan.name;
                  setActionScan(null);
                  deleteScan(id);
                  toast({ title: "Deleted", description: `${name} removed.` });
                }}
                className="w-full min-h-[48px] rounded-2xl text-[15px] font-bold text-white bg-danger active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                Delete
              </button>
              <button
                onClick={() => setActionScan(null)}
                className="w-full min-h-[48px] rounded-2xl text-[15px] font-semibold text-foreground bg-muted/60 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScanItem = ({
  scan,
  onClick,
  onLongPress,
}: {
  scan: ScanRecord;
  onClick: () => void;
  onLongPress?: () => void;
}) => {
  const timerRef = useRef<number | null>(null);
  const longFiredRef = useRef(false);

  const startPress = () => {
    longFiredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      onLongPress?.();
      try { navigator.vibrate?.(40); } catch { /* */ }
    }, 600);
  };
  const cancelPress = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };
  const handleClick = () => {
    if (longFiredRef.current) return;
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(); }}
      className="glass w-full rounded-2xl p-3 flex items-start gap-3 text-left active:scale-[0.99] hover:shadow-glass-lg transition-all"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-white/60">
        <Pill className="w-6 h-6 text-primary rotate-45" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-foreground text-sm truncate">{scan.name}</h4>
          <StatusBadge status={scan.status} />
        </div>
        {scan.generic && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Generic: {scan.generic}</p>
        )}
        {scan.composition && (
          <p className="text-[11px] text-foreground/70 mt-0.5 truncate">{scan.composition}</p>
        )}
        <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">
          {scan.uses?.[0] || scan.description}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span>{timeAgo(scan.scannedAt)}</span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" strokeWidth={1.8} /> {scan.expiry}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" strokeWidth={1.8} />
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
      <cfg.icon className="w-2.5 h-2.5" strokeWidth={1.9} />
      {cfg.label}
    </span>
  );
};

export default History;
