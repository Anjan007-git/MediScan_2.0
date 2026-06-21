import { useNavigate } from "react-router-dom";
import { useAppStore, SavedMedicine } from "@/store/appStore";
import {
  ArrowLeft,
  Pill,
  Star,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Saved = () => {
  const navigate = useNavigate();
  const { saved, removeSavedMedicine } = useAppStore();
  const { toast } = useToast();

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
          <h1 className="text-[26px] font-extrabold tracking-tight leading-none">Saved</h1>
          <p className="text-sm text-muted-foreground mt-1">{saved.length} medicines</p>
        </div>
      </header>

      {saved.length === 0 ? (
        <div className="glass-strong rounded-[28px] p-8 text-center mt-12 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-glow mb-4"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Star className="w-7 h-7 text-white" strokeWidth={1.75} fill="currentColor" fillOpacity={0.3} />
          </div>
          <h3 className="text-lg font-bold text-foreground">No saved medicines</h3>
          <p className="text-sm text-muted-foreground mt-1">
            After scanning, tap Save on the result to keep it here.
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="mt-5 rounded-full px-6 py-3 text-white font-semibold shadow-glow active:scale-95"
            style={{ background: "var(--gradient-primary)" }}
          >
            Scan a medicine
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up">
          {saved.map((s) => (
            <SavedItem
              key={s.id}
              item={s}
              onOpen={() => navigate(`/medicine/${s.id}`)}
              onRemove={() => {
                removeSavedMedicine(s.id);
                toast({ title: "Removed from saved" });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SavedItem = ({
  item,
  onRemove,
  onOpen,
}: {
  item: SavedMedicine;
  onRemove: () => void;
  onOpen: () => void;
}) => {
  const map = {
    safe: { bg: "bg-success-light", text: "text-success", icon: ShieldCheck, label: "Safe" },
    caution: { bg: "bg-warning-light", text: "text-warning", icon: AlertTriangle, label: "Caution" },
    danger: { bg: "bg-danger-light", text: "text-danger", icon: AlertTriangle, label: "Unsafe" },
  } as const;
  const cfg = map[item.status];
  return (
    <div className="glass rounded-2xl p-3 flex items-center gap-3">
      <button
        onClick={onOpen}
        className="flex-1 flex items-center gap-3 text-left min-w-0 active:scale-[0.99]"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-white/60">
          <Pill className="w-6 h-6 text-primary rotate-45" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-foreground text-sm truncate">{item.name}</h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
            >
              <cfg.icon className="w-2.5 h-2.5" strokeWidth={1.9} />
              {cfg.label}
            </span>
          </div>
          {item.generic && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Generic: {item.generic}</p>
          )}
          {item.composition && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.composition}</p>
          )}
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{item.uses?.[0] || item.description}</p>
        </div>
      </button>
      <button
        onClick={onRemove}
        className="w-9 h-9 rounded-full glass flex items-center justify-center text-danger active:scale-90 shrink-0"
        aria-label="Remove"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default Saved;
