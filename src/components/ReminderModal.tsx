import { useState, useEffect } from "react";
import { X, Bell, Pill, Clock, Repeat } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
}

const ReminderModal = ({ open, onClose }: ReminderModalProps) => {
  const { addReminder } = useAppStore();
  const { toast } = useToast();
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("08:00");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "once">("daily");

  useEffect(() => {
    if (!open) {
      setMedicine("");
      setTime("08:00");
      setFrequency("daily");
    }
  }, [open]);

  if (!open) return null;

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
  };

  const handleSave = async () => {
    if (!medicine.trim()) {
      toast({ title: "Medicine name required", variant: "destructive" });
      return;
    }
    await requestPermission();
    addReminder({ medicine: medicine.trim(), time, frequency, enabled: true });
    toast({
      title: "Reminder set",
      description: `${medicine.trim()} at ${time} (${frequency})`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md glass-strong rounded-t-[28px] sm:rounded-[28px] p-6 pb-8 border border-white/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Bell className="w-5 h-5 text-white" strokeWidth={2.4} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight">New Reminder</h3>
              <p className="text-xs text-muted-foreground">Get notified when it's time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass flex items-center justify-center active:scale-90"
          >
            <X className="w-4 h-4 text-foreground" strokeWidth={2.4} />
          </button>
        </div>

        <div className="space-y-4">
          <Field icon={Pill} label="Medicine name">
            <input
              autoFocus
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm font-medium"
            />
          </Field>

          <Field icon={Clock} label="Time">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground text-sm font-medium"
            />
          </Field>

          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Repeat className="w-4 h-4 text-primary" strokeWidth={2.4} />
              <span className="text-[12px] font-semibold text-foreground/80">Repeat</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["once", "daily", "weekly"] as const).map((f) => {
                const active = frequency === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`rounded-2xl py-2.5 text-[13px] font-semibold capitalize transition-all active:scale-95 ${
                      active
                        ? "text-white shadow-glow"
                        : "glass text-foreground/70"
                    }`}
                    style={active ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="glossy w-full mt-6 rounded-full py-4 font-bold text-white shadow-glow active:scale-[0.97] transition"
          style={{ background: "var(--gradient-primary)" }}
        >
          Set Reminder
        </button>
        <p className="text-[11px] text-center text-muted-foreground mt-3 leading-relaxed">
          We'll send a browser notification at the set time. Keep this app open in a tab for alerts to fire.
        </p>
      </div>
    </div>
  );
};

const Field = ({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="glass rounded-2xl px-4 py-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.4} />
      <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wide">{label}</span>
    </div>
    {children}
  </div>
);

export default ReminderModal;
