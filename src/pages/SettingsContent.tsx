import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

type Kind = "about" | "privacy" | "security" | "help";

interface Section {
  heading?: string;
  intro?: string;
  bullets?: string[];
  footer?: string;
}

const CONTENT: Record<Kind, { title: string; sections: Section[] }> = {
  about: {
    title: "About MediScan",
    sections: [
      {
        intro:
          "MediScan is your smart medicine companion — a modern, AI-powered platform that helps you understand your medication safely and confidently.",
        bullets: [
          "Smart medicine scanning platform powered by AI",
          "AI-based information extraction from packaging and labels",
          "Helps users understand medicine usage, dosage and safety",
          "Tracks usage history, reminders and personal preferences",
          "Designed for clarity, speed and a premium mobile experience",
        ],
        footer:
          "MediScan is for informational purposes only and does not replace professional medical advice.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        intro: "Your privacy is at the core of everything we build.",
        bullets: [
          "User data is fully protected and stored securely",
          "We never share or sell your personal information",
          "Secure authentication system protects your account",
          "Data is used only to power features inside the app",
          "Camera access is used only when you actively scan",
          "You can delete your data at any time from Settings",
        ],
      },
    ],
  },
  security: {
    title: "Security",
    sections: [
      {
        intro: "We take security seriously and follow industry-standard practices.",
        bullets: [
          "Encrypted login sessions with automatic refresh",
          "Safe data handling — encrypted in transit and at rest",
          "No unauthorized access to your scans or history",
          "Privacy-first design across the entire experience",
          "Optional biometric unlock and session protection",
        ],
      },
    ],
  },
  help: {
    title: "Help & Support",
    sections: [
      {
        heading: "Get Support",
        bullets: [
          "Contact our support team via email anytime",
          "Browse our help center for common questions",
          "Step-by-step troubleshooting guidance",
          "Personalized user assistance for account issues",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        bullets: [
          "How does scanning work? — Point the camera at the medicine label.",
          "Is my data private? — Yes, fully encrypted and account-bound.",
          "Can I use MediScan offline? — Browsing is offline; scanning needs internet.",
          "How do reminders work? — They trigger locally with sound + glass alerts.",
        ],
        footer: "📧 support@mediscan.app  •  🌐 help.mediscan.app  •  Reply within 24 hours.",
      },
    ],
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

      {c.sections.map((s, i) => (
        <section
          key={i}
          className="glass-strong rounded-[24px] p-5 space-y-3 animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {s.heading && (
            <h2 className="text-base font-bold text-foreground">{s.heading}</h2>
          )}
          {s.intro && (
            <p className="text-sm leading-relaxed text-foreground/90">{s.intro}</p>
          )}
          {s.bullets && (
            <ul className="space-y-2.5">
              {s.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {s.footer && (
            <p className="text-xs text-muted-foreground pt-2 leading-relaxed border-t border-border/40 mt-3">
              {s.footer}
            </p>
          )}
        </section>
      ))}
    </div>
  );
};

export default SettingsContent;
