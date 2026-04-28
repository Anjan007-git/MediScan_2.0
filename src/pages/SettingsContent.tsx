import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Kind = "about" | "privacy" | "security" | "help";

const CONTENT: Record<Kind, { title: string; body: React.ReactNode }> = {
  about: {
    title: "About MediScan",
    body: (
      <>
        <p>
          MediScan is your personal AI-powered medicine companion. Scan any
          medicine packaging to instantly get accurate information about its
          uses, dosage, side effects, and safety.
        </p>
        <p>
          Track your purchases with smart receipts, set reminders so you never
          miss a dose, and keep a personal log of every medicine you scan.
        </p>
        <p className="text-muted-foreground text-xs">
          MediScan does not replace professional medical advice. Always consult
          a qualified pharmacist or doctor.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <p>
          We respect your privacy. Scans, receipts, and reminders are stored
          locally on your device and synced only to your authenticated account.
        </p>
        <p>
          Camera access is used only when you actively scan. We do not record,
          stream, or share your camera feed.
        </p>
        <p>You can delete your data at any time from Settings → Security.</p>
      </>
    ),
  },
  security: {
    title: "Security",
    body: (
      <>
        <p>
          Your account is protected with industry-standard encryption. Sessions
          are signed and refreshed automatically.
        </p>
        <p>
          Data is encrypted in transit (HTTPS) and at rest. You can enable
          biometric unlock and two-factor authentication anytime.
        </p>
        <p>For account-related concerns reach out via Help &amp; Support.</p>
      </>
    ),
  },
  help: {
    title: "Help & Support",
    body: (
      <>
        <p>Need help? We're here for you.</p>
        <p>
          📧{" "}
          <a className="text-primary font-semibold" href="mailto:support@mediscan.app">
            support@mediscan.app
          </a>
        </p>
        <p>
          🌐 Visit our help center at{" "}
          <span className="text-primary font-semibold">help.mediscan.app</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Response time: typically under 24 hours.
        </p>
      </>
    ),
  },
};

const ALIAS: Record<string, Kind> = {
  about: "about",
  aboutmediscan: "about",
  privacy: "privacy",
  privacypolicy: "privacy",
  security: "security",
  help: "help",
  "help-support": "help",
};

const SettingsContent = () => {
  const navigate = useNavigate();
  const { kind } = useParams<{ kind: string }>();
  const k: Kind = (kind && ALIAS[kind]) || "about";
  const c = CONTENT[k];

  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate("/settings")}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">{c.title}</h1>
      </header>

      <section className="glass-strong rounded-[24px] p-5 space-y-3 text-sm text-foreground/90 leading-relaxed animate-fade-in-up">
        {c.body}
      </section>
    </div>
  );
};

export default SettingsContent;
