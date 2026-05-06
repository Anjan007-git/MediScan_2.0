import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, HeartPulse, Stethoscope, AlertTriangle } from "lucide-react";

const HealthTip = () => {
  const navigate = useNavigate();
  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Health Tips</h1>
          <p className="text-xs text-muted-foreground">Stay safe, stay informed</p>
        </div>
      </header>

      {/* Hero advisory */}
      <section
        className="rounded-[24px] p-5 text-white shadow-glow relative overflow-hidden animate-fade-in-up"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight">Doctor first, always</h2>
            <p className="text-sm mt-1 opacity-95 leading-relaxed">
              Take medicines only with your doctor's recommendation. Self-medication can cause serious side effects.
            </p>
          </div>
        </div>
      </section>

      <Card
        icon={HeartPulse}
        title="Safe medicine usage"
        bullets={[
          "Read the label and follow exact dosage instructions.",
          "Never share prescription medicines with others.",
          "Check expiry dates before every use.",
          "Store medicines in a cool, dry place — away from children.",
        ]}
      />

      <Card
        icon={Sparkles}
        title="AI-assisted insights"
        bullets={[
          "MediScan AI extracts details from packaging to help you understand a medicine quickly.",
          "AI insights are educational — they do not replace professional medical advice.",
          "Always verify critical information with a pharmacist or doctor.",
        ]}
      />

      <Card
        icon={Stethoscope}
        title="Preventive healthcare"
        bullets={[
          "Schedule regular health check-ups, even when you feel fine.",
          "Stay hydrated and maintain a balanced diet.",
          "Get adequate sleep and manage stress.",
          "Keep an updated list of medications you take.",
        ]}
      />

      <section className="glass rounded-[20px] p-4 flex items-start gap-3 animate-fade-in-up">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" strokeWidth={2.4} />
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Medical Disclaimer:</span> The information shown
          in MediScan is provided for educational and informational purposes only and is not a
          substitute for professional medical advice, diagnosis, or treatment. Always seek the
          advice of your physician or qualified health provider with any questions you may have
          regarding a medical condition or medication.
        </p>
      </section>
    </div>
  );
};

const Card = ({
  icon: Icon,
  title,
  bullets,
}: {
  icon: any;
  title: string;
  bullets: string[];
}) => (
  <section className="glass-strong rounded-[24px] p-5 animate-fade-in-up">
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-glow relative overflow-hidden"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        <Icon className="relative w-5 h-5 text-white" strokeWidth={2.4} />
      </div>
      <h3 className="font-bold text-foreground text-base">{title}</h3>
    </div>
    <ul className="space-y-2">
      {bullets.map((b, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground/85 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default HealthTip;
