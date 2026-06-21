import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Pill, Clock, Repeat, Save } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";

const ReminderAdd = () => {
  const navigate = useNavigate();
  const { addReminder } = useAppStore();
  const { toast } = useToast();

  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("08:00");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "once">("daily");

  useEffect(() => {
    document.title = "New Reminder · MediScan";
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {/* */}
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
    navigate("/home/reminders");
  };

  return (
    <div className="min-h-screen px-5 pt-12 pb-32 bg-background animate-fade-in-up">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.8} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">New Reminder</h1>
          <p className="text-xs text-muted-foreground">We'll notify you at the set time</p>
        </div>
      </header>

      <section className="glass-strong rounded-[24px] p-5 flex flex-col items-center mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Bell className="w-7 h-7 text-white" strokeWidth={1.8} fill="currentColor" fillOpacity={0.2} />
        </div>
        <p className="text-sm font-semibold mt-3">Set a medicine reminder</p>
        <p className="text-[11px] text-muted-foreground text-center mt-1">
          Keep this app open in a tab for browser notifications to fire.
        </p>
      </section>

      <div className="space-y-3">
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
            <Repeat className="w-4 h-4 text-primary" strokeWidth={1.8} />
            <span className="text-[12px] font-semibold text-foreground/80">Repeat</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["once", "daily", "weekly"] as const).map((f) => {
              const active = frequency === f;
              return (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`rounded-2xl py-3 text-[13px] font-semibold capitalize transition-all active:scale-95 ${
                    active ? "text-white shadow-glow" : "glass text-foreground/70"
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
        className="glossy w-full mt-8 rounded-full py-4 font-bold text-white shadow-glow active:scale-[0.97] transition inline-flex items-center justify-center gap-2"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Save className="w-4 h-4" strokeWidth={1.9} />
        Set Reminder
      </button>
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
      <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
      <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wide">
        {label}
      </span>
    </div>
    {children}
  </div>
);

export default ReminderAdd;
