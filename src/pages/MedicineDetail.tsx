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
} from "lucide-react";

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scans, toggleSaved } = useAppStore();
  const scan = scans.find((s) => s.id === id);

  if (!scan) {
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
    safe: {
      label: "Safe",
      color: "text-success",
      bg: "bg-success/15",
      icon: ShieldCheck,
      desc: "This medicine appears safe for typical use. Always follow prescribed dosage.",
    },
    caution: {
      label: "Caution",
      color: "text-warning",
      bg: "bg-warning/15",
      icon: AlertTriangle,
      desc: "Use under medical supervision. Read warnings and check interactions.",
    },
    danger: {
      label: "Unsafe",
      color: "text-danger",
      bg: "bg-danger/15",
      icon: AlertTriangle,
      desc: "Potentially harmful. Consult a doctor before use.",
    },
  } as const;
  const cfg = statusCfg[scan.status];

  return (
    <div className="px-5 pt-12 pb-8 space-y-5 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <button
          onClick={() => toggleSaved(scan.id)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Save"
        >
          <Star
            className={`w-5 h-5 ${scan.saved ? "text-warning" : "text-muted-foreground"}`}
            strokeWidth={2.4}
            fill={scan.saved ? "currentColor" : "none"}
          />
        </button>
      </header>

      <section className="glass-strong rounded-[28px] p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-soft border border-white/60 mb-3">
          <Pill className="w-10 h-10 text-primary rotate-45" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{scan.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{scan.description}</p>
        <div
          className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}
        >
          <cfg.icon className="w-3.5 h-3.5" strokeWidth={2.6} />
          {cfg.label}
        </div>
      </section>

      <section className="glass rounded-[24px] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Status info</h2>
        <p className="text-sm leading-relaxed text-foreground">{cfg.desc}</p>
      </section>

      <section className="glass rounded-[24px] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Description</h2>
        <p className="text-sm leading-relaxed text-foreground">
          {scan.name} is commonly used as: {scan.description}. Always check the leaflet
          for full information, dosage and contraindications.
        </p>
      </section>

      <section className="glass rounded-[24px] p-5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Type
          </p>
          <p className="text-sm font-bold text-foreground mt-1">{scan.description.split("/")[0].trim()}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Expiry
          </p>
          <p className="text-sm font-bold text-foreground mt-1 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2.4} /> {scan.expiry}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Scanned
          </p>
          <p className="text-sm font-bold text-foreground mt-1 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={2.4} /> {timeAgo(scan.scannedAt)}
          </p>
        </div>
      </section>
    </div>
  );
};

export default MedicineDetail;
