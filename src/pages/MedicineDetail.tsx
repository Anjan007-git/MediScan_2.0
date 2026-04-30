import { useNavigate, useParams } from "react-router-dom";
import { useAppStore, timeAgo } from "@/store/appStore";
import {
  ArrowLeft,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Star,
  Info,
  Shield,
  AlertOctagon,
  FlaskConical,
  CheckCircle,
} from "lucide-react";

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scans, saved, toggleSaved, addSavedMedicine, removeSavedMedicine, isMedicineSaved } =
    useAppStore();

  // Lookup as scan first, then as saved medicine
  const scan = scans.find((s) => s.id === id);
  const savedItem = saved.find((s) => s.id === id);

  const data = scan
    ? {
        id: scan.id,
        name: scan.name,
        generic: scan.generic,
        status: scan.status,
        description: scan.description,
        composition: scan.composition,
        uses: scan.uses,
        dosage: scan.dosage,
        precautions: scan.precautions,
        warnings: scan.warnings,
        sideEffects: scan.sideEffects,
        storage: scan.storage,
        scannedAt: scan.scannedAt,
        expiry: scan.expiry,
        kind: "scan" as const,
      }
    : savedItem
    ? {
        id: savedItem.id,
        name: savedItem.name,
        generic: savedItem.generic,
        status: savedItem.status,
        description: savedItem.description,
        composition: savedItem.composition,
        uses: savedItem.uses,
        dosage: savedItem.dosage,
        precautions: savedItem.precautions,
        warnings: savedItem.warnings,
        sideEffects: savedItem.sideEffects,
        storage: savedItem.storage,
        scannedAt: savedItem.savedAt,
        expiry: "—",
        kind: "saved" as const,
      }
    : null;

  if (!data) {
    return (
      <div className="px-5 pt-12 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Medicine not found.</p>
        </div>
      </div>
    );
  }

  const statusCfg = {
    safe: { label: "Safe", color: "text-success", bg: "bg-success/15", icon: ShieldCheck },
    caution: { label: "Caution", color: "text-warning", bg: "bg-warning/15", icon: AlertTriangle },
    danger: { label: "Unsafe", color: "text-danger", bg: "bg-danger/15", icon: AlertOctagon },
  } as const;
  const cfg = statusCfg[data.status];

  const isFav =
    data.kind === "scan"
      ? !!scan?.saved || isMedicineSaved(data.name)
      : true;

  const handleToggleSave = () => {
    if (data.kind === "scan" && scan) {
      toggleSaved(scan.id);
      // Mirror to saved list
      if (!isMedicineSaved(data.name)) {
        addSavedMedicine({
          name: data.name,
          generic: data.generic,
          status: data.status,
          description: data.description,
          composition: data.composition,
          uses: data.uses,
          dosage: data.dosage,
          precautions: data.precautions,
          warnings: data.warnings,
          sideEffects: data.sideEffects,
          storage: data.storage,
        });
      } else {
        const item = saved.find((s) => s.name.toLowerCase() === data.name.toLowerCase());
        if (item) removeSavedMedicine(item.id);
      }
    } else if (savedItem) {
      removeSavedMedicine(savedItem.id);
      navigate(-1);
    }
  };

  return (
    <div className="px-5 pt-12 pb-8 space-y-4 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <button
          onClick={handleToggleSave}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Save"
        >
          <Star
            className={`w-5 h-5 ${isFav ? "text-warning" : "text-muted-foreground"}`}
            strokeWidth={2.4}
            fill={isFav ? "currentColor" : "none"}
          />
        </button>
      </header>

      {/* HERO — solid white-ish frosted card for legibility */}
      <section
        className="rounded-[28px] p-6 text-center shadow-[0_8px_25px_rgba(0,0,0,0.08)] border border-white/60"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-soft border border-white/60 mb-3">
          <Pill className="w-10 h-10 text-primary rotate-45" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{data.name}</h1>
        {data.generic && (
          <p className="text-sm text-muted-foreground mt-1">Generic: {data.generic}</p>
        )}
        <div
          className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}
        >
          <cfg.icon className="w-3.5 h-3.5" strokeWidth={2.6} />
          {cfg.label}
        </div>
      </section>

      <DetailCard icon={Info} title="What is it used for?" tone="primary">
        <p className="text-sm leading-relaxed text-foreground">
          {data.uses?.[0] || data.description || "Information not available."}
        </p>
      </DetailCard>

      {data.composition && (
        <DetailCard icon={FlaskConical} title="Composition" tone="primary">
          <p className="text-sm leading-relaxed text-foreground">{data.composition}</p>
        </DetailCard>
      )}

      {data.uses && data.uses.length > 0 && (
        <DetailCard icon={Info} title="Uses" tone="primary">
          <ul className="space-y-2">
            {data.uses.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {data.dosage && (
        <DetailCard icon={Shield} title="Dosage" tone="primary">
          <p className="text-sm leading-relaxed text-foreground">{data.dosage}</p>
        </DetailCard>
      )}

      {data.sideEffects && data.sideEffects.length > 0 && (
        <DetailCard icon={AlertTriangle} title="Side Effects" tone="warning">
          <ul className="space-y-2">
            {data.sideEffects.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-warning mt-1 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {data.precautions && data.precautions.length > 0 && (
        <DetailCard icon={AlertTriangle} title="Precautions" tone="warning">
          <ul className="space-y-2">
            {data.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-warning mt-1 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {data.warnings && data.warnings.length > 0 && (
        <DetailCard icon={AlertOctagon} title="Important Warnings" tone="danger">
          <ul className="space-y-2">
            {data.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-danger mt-1 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {data.storage && (
        <DetailCard icon={Info} title="Storage" tone="primary">
          <p className="text-sm leading-relaxed text-foreground">{data.storage}</p>
        </DetailCard>
      )}

      <section
        className="rounded-[20px] p-4 grid grid-cols-2 gap-3 border border-white/60"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)" }}
      >
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Expiry
          </p>
          <p className="text-sm font-bold text-foreground mt-1 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2.4} /> {data.expiry}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {data.kind === "saved" ? "Saved" : "Scanned"}
          </p>
          <p className="text-sm font-bold text-foreground mt-1 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={2.4} /> {timeAgo(data.scannedAt)}
          </p>
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground px-2 leading-relaxed">
        This information is for educational purposes only. Always consult a qualified doctor or
        pharmacist before using any medicine.
      </p>
    </div>
  );
};

const toneMap = {
  primary: "border-l-primary",
  warning: "border-l-warning",
  danger: "border-l-danger",
} as const;

const DetailCard = ({
  icon: Icon,
  title,
  tone = "primary",
  children,
}: {
  icon: any;
  title: string;
  tone?: keyof typeof toneMap;
  children: React.ReactNode;
}) => (
  <section
    className={`rounded-[20px] p-4 border-l-4 ${toneMap[tone]} border-white/60 shadow-[0_4px_18px_rgba(0,0,0,0.05)]`}
    style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
  >
    <h3 className="font-bold text-foreground text-[15px] flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-primary" strokeWidth={2.4} />
      {title}
    </h3>
    {children}
  </section>
);

export default MedicineDetail;
