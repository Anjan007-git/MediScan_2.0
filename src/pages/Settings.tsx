import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  ChevronRight,
  Sun,
  Bell,
  Clock,
  ShieldCheck,
  Info,
  FileText,
  Lock,
  HelpCircle,
  ClipboardList,
  Code2,
  LogOut,
  Crown,
  Shield,
  X,
  Sparkles,
  Mail,
} from "lucide-react";
import avatarAlex from "@/assets/avatar-alex.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSetting, user: storeUser, plan, setPlan } = useAppStore();
  const { user: authUser, profile, signOut } = useAuth();
  const displayName =
    storeUser.name ||
    profile?.display_name ||
    (authUser?.user_metadata as any)?.full_name ||
    (authUser?.user_metadata as any)?.name ||
    "there";
  const userEmail = storeUser.email || profile?.email || authUser?.email || "";
  const avatarUrl =
    profile?.avatar_url ||
    (authUser?.user_metadata as any)?.avatar_url ||
    avatarAlex;
  const handleLogout = async () => {
    if (!confirm("Sign out from your account?")) return;
    await signOut();
  };

  return (
    <div className="px-5 pt-12 space-y-5">
      {/* HEADER */}
      <header className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight leading-none">Settings</h1>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            Manage your preferences and account
          </p>
        </div>
        <button
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-glass active:scale-95 transition"
          aria-label="Profile"
        >
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-white" />
        </button>
      </header>

      {/* PROFILE CARD */}
      <button
        onClick={() => navigate("/settings/profile")}
        className="glass-strong w-full rounded-[24px] p-4 flex items-center gap-4 active:scale-[0.99] hover:shadow-glass-lg transition-all animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-glow">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h2 className="font-bold text-foreground text-lg leading-tight truncate">{displayName}</h2>
          <p className="text-[13px] text-muted-foreground truncate inline-flex items-center gap-1">
            <Mail className="w-3 h-3" strokeWidth={1.8} /> {userEmail}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mt-1.5 ${
              plan === "premium" ? "bg-primary/10 text-primary" : "bg-muted text-foreground/70"
            }`}
          >
            {plan === "premium" ? (
              <>
                <Crown className="w-3 h-3" strokeWidth={1.9} fill="currentColor" />
                Premium • ₹99/mo
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" strokeWidth={1.9} />
                Basic • Free
              </>
            )}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={1.8} />
      </button>

      {/* SUBSCRIPTION PLANS */}
      <SectionLabel>Subscription</SectionLabel>
      <section
        className="grid grid-cols-2 gap-3 animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <button
          onClick={() => setPlan("basic")}
          className={`rounded-[20px] p-4 text-left transition-all active:scale-[0.97] overflow-hidden relative ${
            plan === "basic"
              ? "text-white shadow-glow ring-2 ring-white/70"
              : "glass text-foreground"
          }`}
          style={plan === "basic" ? { background: "var(--gradient-primary)" } : undefined}
        >
          {plan === "basic" && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
          )}
          <div className="relative flex items-center gap-2 mb-1.5">
            <Sparkles className={`w-4 h-4 ${plan === "basic" ? "" : "text-foreground/70"}`} strokeWidth={1.8} />
            <span className="text-sm font-bold">Basic</span>
          </div>
          <p className="relative text-2xl font-extrabold">₹0</p>
          <p className={`relative text-[11px] mt-1 ${plan === "basic" ? "opacity-90" : "text-muted-foreground"}`}>
            10 scans / week
          </p>
        </button>
        <button
          onClick={() => navigate("/settings/premium-payment")}
          className={`relative glass rounded-[20px] p-4 text-left transition-all active:scale-[0.97] overflow-hidden ${
            plan === "premium" ? "ring-2 ring-primary shadow-glow" : ""
          }`}
        >
          <div className="relative flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-primary" strokeWidth={1.9} fill="currentColor" />
            <span className="text-sm font-bold text-foreground">Premium</span>
          </div>
          <p className="relative text-2xl font-extrabold text-foreground">
            ₹99<span className="text-xs font-semibold text-muted-foreground">/mo</span>
          </p>
          <p className="relative text-[11px] text-muted-foreground mt-1">Unlimited scans + Insights</p>
        </button>
      </section>

      {/* APPEARANCE */}
      <SectionLabel>Appearance</SectionLabel>
      <section
        className="glass rounded-[24px] p-3.5 flex items-center gap-3 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <IconTile color="primary">
          <Sun className="w-5 h-5 text-primary" strokeWidth={1.75} />
        </IconTile>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-[15px]">Theme</p>
          <p className="text-[12px] text-muted-foreground">Choose your preferred theme</p>
        </div>
        <ThemeToggle
          dark={settings.darkMode}
          onChange={(v) => updateSetting("darkMode", v)}
        />
      </section>

      {/* PREFERENCES */}
      <SectionLabel>Preferences</SectionLabel>
      <section
        className="glass rounded-[24px] p-2 animate-fade-in-up"
        style={{ animationDelay: "140ms" }}
      >
        <PreferenceRow
          icon={<Bell className="w-5 h-5 text-primary" strokeWidth={1.75} fill="currentColor" fillOpacity={0.15} />}
          tile="primary"
          title="Notifications"
          subtitle="Manage your notification preferences"
          value={settings.notifications}
          onToggle={(v) => updateSetting("notifications", v)}
        />
        <Divider />
        <PreferenceRow
          icon={<Clock className="w-5 h-5 text-success" strokeWidth={1.75} />}
          tile="success"
          title="Reminders"
          subtitle="Manage medicine reminders"
          value={settings.remindersEnabled}
          onToggle={(v) => updateSetting("remindersEnabled", v)}
        />
        <Divider />
        <PreferenceRow
          icon={<ShieldCheck className="w-5 h-5 text-violet-500" strokeWidth={1.75} fill="currentColor" fillOpacity={0.15} />}
          tile="violet"
          title="Safety Alerts"
          subtitle="Receive important safety updates"
          value={settings.safetyAlerts}
          onToggle={(v) => updateSetting("safetyAlerts", v)}
        />
      </section>

      {/* APP */}
      <SectionLabel>App</SectionLabel>
      <section
        className="glass rounded-[24px] p-2 animate-fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        <LinkRow
          icon={<Info className="w-5 h-5 text-primary" strokeWidth={1.75} />}
          tile="primary"
          title="About MediScan"
          subtitle="Learn more about the app"
          onClick={() => navigate("/settings/aboutmediscan")}
        />
        <Divider />
        <LinkRow
          icon={<FileText className="w-5 h-5 text-success" strokeWidth={1.75} />}
          tile="success"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onClick={() => navigate("/settings/privacypolicy")}
        />
        <Divider />
        <LinkRow
          icon={<Lock className="w-5 h-5 text-violet-500" strokeWidth={1.75} />}
          tile="violet"
          title="Security"
          subtitle="Manage your data and security"
          onClick={() => navigate("/settings/security")}
        />
        <Divider />
        <LinkRow
          icon={<HelpCircle className="w-5 h-5 text-warning" strokeWidth={1.75} />}
          tile="warning"
          title="Help & Support"
          subtitle="Get help and contact support"
          onClick={() => navigate("/settings/help-support")}
        />
      </section>

      {/* MORE */}
      <SectionLabel>More</SectionLabel>
      <section
        className="glass rounded-[24px] p-2 animate-fade-in-up"
        style={{ animationDelay: "220ms" }}
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <IconTile color="primary">
            <ClipboardList className="w-5 h-5 text-primary" strokeWidth={1.75} />
          </IconTile>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-[15px]">Version</p>
            <p className="text-[12px] text-muted-foreground">v1.0.0</p>
          </div>
          <span className="bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 rounded-full">
            Up to date
          </span>
        </div>
        <Divider />
        <LinkRow
          icon={<Code2 className="w-5 h-5 text-success" strokeWidth={1.75} />}
          tile="success"
          title="Designed by Anjan"
          subtitle={
            <>
              Crafted with <span className="text-base">❤️</span> for better health
            </>
          }
        />
        <Divider />
        <LinkRow
          icon={<LogOut className="w-5 h-5 text-danger" strokeWidth={1.75} />}
          tile="danger"
          title="Log Out"
          subtitle="Sign out from your account"
          onClick={handleLogout}
        />
      </section>

    </div>
  );
};


/* -------------------- Subcomponents -------------------- */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-muted-foreground px-2 -mb-2">{children}</h3>
);

const Divider = () => <div className="h-px bg-border/50 mx-3" />;

type TileColor = "primary" | "success" | "warning" | "danger" | "violet";

const tileMap: Record<TileColor, string> = {
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
  violet: "bg-violet-500/10",
};

const IconTile = ({ color, children }: { color: TileColor; children: React.ReactNode }) => (
  <div
    className={`w-11 h-11 rounded-full ${tileMap[color]} flex items-center justify-center shrink-0`}
  >
    {children}
  </div>
);

interface PrefRowProps {
  icon: React.ReactNode;
  tile: TileColor;
  title: string;
  subtitle: React.ReactNode;
  value: boolean;
  onToggle: (v: boolean) => void;
}

const PreferenceRow = ({ icon, tile, title, subtitle, value, onToggle }: PrefRowProps) => (
  <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
    <IconTile color={tile}>{icon}</IconTile>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-foreground text-[15px]">{title}</p>
      <p className="text-[12px] text-muted-foreground truncate">{subtitle}</p>
    </div>
    <Toggle value={value} onToggle={() => onToggle(!value)} />
    <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" strokeWidth={1.8} />
  </div>
);

interface LinkRowProps {
  icon: React.ReactNode;
  tile: TileColor;
  title: string;
  subtitle: React.ReactNode;
  onClick?: () => void;
}

const LinkRow = ({ icon, tile, title, subtitle, onClick }: LinkRowProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl active:bg-primary/5 transition-colors text-left"
  >
    <IconTile color={tile}>{icon}</IconTile>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-foreground text-[15px]">{title}</p>
      <p className="text-[12px] text-muted-foreground truncate">{subtitle}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
  </button>
);

const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
      value ? "bg-primary shadow-glow" : "bg-muted"
    }`}
    aria-pressed={value}
  >
    <span
      className="absolute top-1/2 left-1 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
      style={{ transform: `translate(${value ? "20px" : "0"}, -50%)` }}
    />
  </button>
);

const ThemeToggle = ({
  dark,
  onChange,
}: {
  dark: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="relative glass-subtle rounded-full p-1 inline-flex w-[140px] shrink-0">
    <span
      className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-soft transition-transform duration-300"
      style={{ transform: dark ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
    />
    <button
      onClick={() => onChange(false)}
      className={`relative flex-1 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${
        !dark ? "text-primary" : "text-muted-foreground"
      }`}
    >
      Light
    </button>
    <button
      onClick={() => onChange(true)}
      className={`relative flex-1 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${
        dark ? "text-primary" : "text-muted-foreground"
      }`}
    >
      Dark
    </button>
  </div>
);

export default Settings;
