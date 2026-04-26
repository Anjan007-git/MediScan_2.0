import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  ArrowLeft,
  Bell,
  Fingerprint,
  Moon,
  Globe,
  ChevronRight,
  Trash2,
  Shield,
  Info,
  LogOut,
  Clock,
} from "lucide-react";
import avatarAlex from "@/assets/avatar-alex.jpg";

const Settings = () => {
  const navigate = useNavigate();
  const { user, settings, updateSetting, reminders, toggleReminder, clearHistory } = useAppStore();

  return (
    <div className="px-5 pt-12 space-y-5">
      <header className="flex items-center justify-between animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.4} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-10" />
      </header>

      {/* Profile */}
      <section
        className="glass-strong rounded-[24px] p-5 flex items-center gap-4 animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-glow">
          <img src={avatarAlex} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-sm text-muted-foreground">alex@mediscan.app</p>
        </div>
        <button className="glass-subtle rounded-full px-3 py-1.5 text-xs font-semibold text-primary">
          Edit
        </button>
      </section>

      {/* Preferences */}
      <section className="glass rounded-2xl p-2 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <SettingRow
          icon={Bell}
          color="from-blue-400 to-blue-600"
          label="Notifications"
          toggle
          value={settings.notifications}
          onToggle={(v) => updateSetting("notifications", v)}
        />
        <SettingRow
          icon={Fingerprint}
          color="from-violet-400 to-purple-600"
          label="Biometric Lock"
          toggle
          value={settings.biometric}
          onToggle={(v) => updateSetting("biometric", v)}
        />
        <SettingRow
          icon={Moon}
          color="from-slate-500 to-slate-700"
          label="Dark Mode"
          toggle
          value={settings.darkMode}
          onToggle={(v) => updateSetting("darkMode", v)}
        />
        <SettingRow
          icon={Globe}
          color="from-emerald-400 to-green-600"
          label="Language"
          rightLabel={settings.language}
        />
      </section>

      {/* Reminders */}
      <section id="reminders" className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <h3 className="font-bold mb-3 px-1">Medicine Reminders</h3>
        <div className="glass rounded-2xl p-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft relative overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                <Clock className="relative w-5 h-5 text-white" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.medicine}</p>
                <p className="text-xs text-muted-foreground">
                  {r.time} · {r.frequency}
                </p>
              </div>
              <Toggle value={r.enabled} onToggle={() => toggleReminder(r.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="glass rounded-2xl p-2 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
        <SettingRow icon={Shield} color="from-blue-400 to-blue-600" label="Privacy Policy" link />
        <SettingRow icon={Info} color="from-slate-400 to-slate-600" label="About MediScan" link rightLabel="v1.0.0" />
        <SettingRow
          icon={Trash2}
          color="from-rose-400 to-red-600"
          label="Clear Scan History"
          link
          onClick={() => {
            if (confirm("Clear all scan history?")) clearHistory();
          }}
          danger
        />
      </section>

      <button className="glass w-full rounded-full py-3.5 flex items-center justify-center gap-2 text-danger font-semibold active:scale-[0.98]">
        <LogOut className="w-4 h-4" strokeWidth={2.4} /> Sign Out
      </button>
    </div>
  );
};

interface RowProps {
  icon: any;
  color: string;
  label: string;
  toggle?: boolean;
  link?: boolean;
  value?: boolean;
  rightLabel?: string;
  onToggle?: (v: boolean) => void;
  onClick?: () => void;
  danger?: boolean;
}

const SettingRow = ({ icon: Icon, color, label, toggle, link, value, rightLabel, onToggle, onClick, danger }: RowProps) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-3 border-b border-border/50 last:border-0 ${
      onClick || link ? "active:bg-primary/5 cursor-pointer rounded-xl" : ""
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-soft relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
      <Icon className="relative w-4.5 h-4.5 text-white" strokeWidth={2.4} />
    </div>
    <span className={`flex-1 text-sm font-semibold ${danger ? "text-danger" : "text-foreground"}`}>
      {label}
    </span>
    {toggle && <Toggle value={!!value} onToggle={() => onToggle?.(!value)} />}
    {link && (
      <div className="flex items-center gap-1 text-muted-foreground">
        {rightLabel && <span className="text-xs">{rightLabel}</span>}
        <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
      </div>
    )}
    {!toggle && !link && rightLabel && (
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="text-xs">{rightLabel}</span>
        <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
      </div>
    )}
  </div>
);

const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`relative w-11 h-6 rounded-full transition-colors ${
      value ? "bg-primary shadow-glow" : "bg-muted"
    }`}
    aria-pressed={value}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        value ? "translate-x-[22px]" : "translate-x-0.5"
      }`}
    />
  </button>
);

export default Settings;
