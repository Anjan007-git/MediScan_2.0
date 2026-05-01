import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore, Reminder } from "@/store/appStore";
import { ArrowLeft, Bell, Plus, Pill, Clock, Trash2, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reminders = () => {
  const navigate = useNavigate();
  const { reminders, toggleReminder, deleteReminder } = useAppStore();
  const { toast } = useToast();
  const [actionItem, setActionItem] = useState<Reminder | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const active = reminders.filter((r) => r.enabled).length;

  const handleDelete = (r: Reminder) => {
    setActionItem(null);
    setRemovingId(r.id);
    setTimeout(() => {
      deleteReminder(r.id);
      setRemovingId(null);
      toast({ title: "Reminder deleted", description: r.medicine });
    }, 280);
  };

  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      <header className="flex items-center justify-between animate-fade-in-up">
        <button
          onClick={() => navigate("/")}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">Reminders</h1>
        <button
          onClick={() => navigate("/home/reminders/new")}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-glow active:scale-95"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="Add reminder"
        >
          <Plus className="w-5 h-5" strokeWidth={2.6} />
        </button>
      </header>

      <section className="glass-tinted rounded-[24px] p-4 flex items-center gap-4 animate-fade-in-up">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow shrink-0 relative overflow-hidden"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          <Bell className="relative w-5 h-5 text-white" strokeWidth={2.4} fill="currentColor" fillOpacity={0.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">Active reminders</p>
          <p className="text-2xl font-extrabold leading-tight">
            {active} <span className="text-sm font-semibold text-muted-foreground">/ {reminders.length}</span>
          </p>
        </div>
      </section>

      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        {reminders.length === 0 && (
          <div className="glass rounded-2xl py-12 text-center">
            <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-2" strokeWidth={1.8} />
            <p className="text-sm text-muted-foreground">No reminders yet</p>
            <button
              onClick={() => navigate("/home/reminders/new")}
              className="mt-3 text-sm font-semibold text-primary"
            >
              Add your first reminder
            </button>
          </div>
        )}

        {reminders.map((r) => (
          <ReminderItem
            key={r.id}
            r={r}
            removing={removingId === r.id}
            onToggle={() => toggleReminder(r.id)}
            onLongPress={() => setActionItem(r)}
          />
        ))}
      </div>

      <button
        onClick={() => navigate("/home/reminders/new")}
        className="fixed bottom-28 right-5 z-30 h-14 pl-4 pr-5 rounded-full flex items-center gap-2 text-white font-bold text-sm shadow-glow active:scale-95 transition glossy"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="Add Reminder"
      >
        <Plus className="w-5 h-5" strokeWidth={2.6} />
        Reminder
      </button>

      {actionItem && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setActionItem(null)}
        >
          <div
            className="w-full max-w-md mx-3 mb-3 space-y-2 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div className="px-4 py-3 text-center border-b border-border/40">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {actionItem.medicine}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {actionItem.time} · {actionItem.frequency}
                </p>
              </div>
              <button
                onClick={() => handleDelete(actionItem)}
                className="w-full py-3.5 text-[16px] font-semibold text-danger flex items-center justify-center gap-2 active:bg-danger/5"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.4} />
                Delete
              </button>
            </div>
            <button
              onClick={() => setActionItem(null)}
              className="w-full py-3.5 text-[16px] font-bold text-primary rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReminderItem = ({
  r,
  removing,
  onToggle,
  onLongPress,
}: {
  r: Reminder;
  removing: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}) => {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);

  const start = () => {
    fired.current = false;
    timer.current = window.setTimeout(() => {
      fired.current = true;
      onLongPress();
      try {
        navigator.vibrate?.(40);
      } catch {/* */}
    }, 600);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <article
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
      className={`glass rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300 ${
        removing ? "opacity-0 -translate-x-6" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Pill className="w-5 h-5 text-primary rotate-45" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-[15px] truncate">{r.medicine}</p>
        <p className="text-[12px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" strokeWidth={2.4} />
          {r.time} · {r.frequency}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!fired.current) onToggle();
        }}
        className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
          r.enabled ? "bg-primary shadow-glow" : "bg-muted"
        }`}
        aria-pressed={r.enabled}
      >
        <span
          className="absolute top-1/2 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
          style={{ transform: `translate(${r.enabled ? "20px" : "0"}, -50%)` }}
        />
      </button>
    </article>
  );
};

export default Reminders;
