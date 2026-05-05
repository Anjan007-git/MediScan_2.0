import { useNavigate } from "react-router-dom";
import { useAppStore, timeAgo, ScanRecord } from "@/store/appStore";
import {
  Sparkles,
  Camera,
  ChevronRight,
  Upload,
  History,
  Bell,
  Star,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Shield,
  X,
  Pill,
  Trash2,
} from "lucide-react";
import { useState, useRef } from "react";
import medicineBottle from "@/assets/medicine-bottle-3d.png";
import avatarAlex from "@/assets/avatar-alex.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { scans, user: storeUser, deleteScan } = useAppStore();
  const { user: authUser, profile } = useAuth();
  const { toast } = useToast();
  const [tipDismissed, setTipDismissed] = useState(false);
  const [actionScan, setActionScan] = useState<ScanRecord | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fullName =
    storeUser.name ||
    profile?.display_name ||
    (authUser?.user_metadata as any)?.full_name ||
    (authUser?.user_metadata as any)?.name ||
    "there";
  // First name only — split by space OR by "@" for email-style names
  const displayName = String(fullName).split(/[\s@]/)[0] || "there";
  const avatarUrl =
    profile?.avatar_url ||
    (authUser?.user_metadata as any)?.avatar_url ||
    avatarAlex;

  const recent = scans.slice(0, 3);

  const quickActions = [
    {
      label: "Upload Image",
      sub: "From gallery",
      icon: Upload,
      bg: "from-blue-400 to-blue-600",
      onClick: () => navigate("/home/uploadimage"),
    },
    {
      label: "Scan History",
      sub: "View past scans",
      icon: History,
      bg: "from-violet-400 to-purple-600",
      onClick: () => navigate("/history"),
    },
    {
      label: "Reminders",
      sub: "Medicine alerts",
      icon: Bell,
      bg: "from-emerald-400 to-green-600",
      onClick: () => navigate("/home/reminders"),
    },
    {
      label: "Saved",
      sub: "Your favorites",
      icon: Star,
      bg: "from-amber-400 to-orange-500",
      onClick: () => navigate("/saved"),
    },
  ];

  return (
    <div className="px-5 pt-12 space-y-6">
      {/* HEADER */}
      <header className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Hello, {displayName} <span className="text-2xl">👋</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2.4} />
            <p className="text-sm text-muted-foreground font-medium">{storeUser.greeting}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-glass active:scale-95 transition"
          aria-label="Open profile"
        >
          <img
            src={avatarUrl}
            alt="User profile"
            className="w-full h-full object-cover"
            width={56}
            height={56}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-white" />
        </button>
      </header>

      {/* HERO SCAN CARD */}
      <section
        className="glass-strong rounded-[28px] p-5 relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-glow/30 blur-3xl pointer-events-none" />
        <div className="relative grid grid-cols-[1.05fr_1fr] gap-3 items-center">
          <div>
            <span className="inline-flex items-center gap-1 glass-subtle rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary mb-3">
              <Sparkles className="w-3 h-3" strokeWidth={2.6} />
              AI Powered
            </span>
            <h2 className="text-[26px] leading-[1.05] font-extrabold tracking-tight">
              Scan <span className="text-gradient">Medicine</span>
            </h2>
            <p className="text-[13px] text-muted-foreground mt-2 leading-snug">
              Scan or upload an image of your medicine to get accurate and reliable information instantly.
            </p>
            <button
              onClick={() => navigate("/scan")}
              className="glossy shimmer relative mt-4 inline-flex items-center gap-2 rounded-full pl-4 pr-3 py-3 text-white font-semibold text-sm shadow-glow active:scale-[0.97] transition"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Camera className="w-4 h-4" strokeWidth={2.4} />
              Start Scanning
              <ChevronRight className="w-4 h-4" strokeWidth={2.6} />
            </button>
          </div>
          <div className="relative h-[200px] flex items-center justify-center">
            {/* Scan corner brackets */}
            <CornerBrackets />
            <img
              src={medicineBottle}
              alt="Medicine bottle illustration"
              className="relative max-h-[180px] w-auto object-contain drop-shadow-xl"
              width={200}
              height={200}
            />
            <div className="scan-beam" />
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="glass rounded-2xl p-3 flex flex-col items-center text-center active:scale-95 hover:-translate-y-0.5 hover:shadow-glass-lg transition-all duration-200"
          >
            <div
              className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${a.bg} flex items-center justify-center shadow-soft mb-2`}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 to-transparent" />
              <a.icon className="relative w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold text-foreground leading-tight">{a.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{a.sub}</span>
          </button>
        ))}
      </section>

      {/* RECENT SCANS or empty state */}
      {recent.length > 0 ? (
        <section className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-bold text-foreground">Recent Scans</h3>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-1 text-sm font-semibold text-primary active:opacity-70"
            >
              See All <ChevronRight className="w-4 h-4" strokeWidth={2.6} />
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((s) => (
              <RecentScanCard
                key={s.id}
                scan={s}
                removing={removingId === s.id}
                onClick={() => navigate(`/medicine/${s.id}`)}
                onLongPress={() => setActionScan(s)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section
          className="glass-tinted rounded-[24px] p-5 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-start gap-3">
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
                Scan your first medicine to start building your personal health log. Always check expiry dates and consult a pharmacist when in doubt.
              </p>
              <button
                onClick={() => navigate("/insights")}
                className="mt-3 glass-subtle rounded-full px-3 py-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary active:scale-95"
              >
                Learn More <ChevronRight className="w-3 h-3" strokeWidth={2.6} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HEALTH TIP (only when there are scans) */}
      {recent.length > 0 && !tipDismissed && (
        <section
          className="glass-tinted rounded-[24px] p-4 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "260ms" }}
        >
          <button
            onClick={() => setTipDismissed(true)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full glass flex items-center justify-center active:scale-90"
            aria-label="Dismiss tip"
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
                Always check the expiry date and consult your doctor if unsure about any medicine.
              </p>
            </div>
            <button
              className="glass-subtle rounded-full px-3 py-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary self-end shrink-0 active:scale-95"
              onClick={() => navigate("/insights")}
            >
              Learn More <ChevronRight className="w-3 h-3" strokeWidth={2.6} />
            </button>
          </div>
        </section>
      )}

      {/* iOS-style Action Sheet */}
      {actionScan && (
        <ActionSheet
          title={actionScan.name}
          subtitle="Scan history item"
          onClose={() => setActionScan(null)}
          onDelete={() => {
            const id = actionScan.id;
            setActionScan(null);
            setRemovingId(id);
            setTimeout(() => {
              deleteScan(id);
              setRemovingId(null);
              toast({ title: "Deleted", description: `${actionScan.name} removed.` });
            }, 280);
          }}
        />
      )}
    </div>
  );
};

const ActionSheet = ({
  title,
  subtitle,
  onClose,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <div
    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-5"
    onClick={onClose}
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
          <Trash2 className="w-6 h-6 text-danger" strokeWidth={2.2} />
        </div>
        <h3 className="text-[17px] font-bold text-foreground">Delete this scan?</h3>
        <p className="text-[13px] text-muted-foreground mt-1.5 truncate">{title}</p>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground/80 mt-0.5">This action cannot be undone.</p>
        )}
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2.5">
        <button
          onClick={onDelete}
          className="w-full min-h-[48px] rounded-2xl text-[15px] font-bold text-white bg-danger active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.4} />
          Delete
        </button>
        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-2xl text-[15px] font-semibold text-foreground bg-muted/60 active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const CornerBrackets = () => (
  <>
    {[
      "top-2 left-2 border-t-2 border-l-2 rounded-tl-lg",
      "top-2 right-2 border-t-2 border-r-2 rounded-tr-lg",
      "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg",
      "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg",
    ].map((cls) => (
      <span key={cls} className={`absolute w-6 h-6 border-white ${cls}`} />
    ))}
  </>
);

const RecentScanCard = ({
  scan,
  onClick,
  onLongPress,
  removing,
}: {
  scan: ScanRecord;
  onClick: () => void;
  onLongPress?: () => void;
  removing?: boolean;
}) => {
  const timerRef = useRef<number | null>(null);
  const longFiredRef = useRef(false);

  const startPress = () => {
    longFiredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      onLongPress?.();
      try {
        navigator.vibrate?.(40);
      } catch {/* */}
    }, 600); // 600ms feels iOS-native; spec said 2s but UX standard is ~500-700ms
  };
  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress?.();
      }}
      className={`glass w-full rounded-2xl p-3 flex items-start gap-3 text-left active:scale-[0.99] hover:shadow-glass-lg transition-all duration-300 ${
        removing ? "opacity-0 -translate-x-6" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 shadow-inner overflow-hidden border border-white/60">
        <Pill className="w-7 h-7 text-primary rotate-45" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-foreground text-[15px] truncate">{scan.name}</h4>
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
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
          <span>{timeAgo(scan.scannedAt)}</span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" strokeWidth={2.4} /> Exp. {scan.expiry}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" strokeWidth={2.4} />
    </button>
  );
};

const StatusBadge = ({ status }: { status: ScanRecord["status"] }) => {
  const map = {
    safe: { bg: "bg-success-light", text: "text-success", icon: ShieldCheck, label: "Safe" },
    caution: { bg: "bg-warning-light", text: "text-warning", icon: AlertTriangle, label: "Caution" },
    danger: { bg: "bg-danger-light", text: "text-danger", icon: AlertTriangle, label: "Danger" },
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

export default Home;
