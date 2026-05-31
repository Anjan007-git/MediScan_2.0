import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Check, ShieldCheck, Sparkles, Infinity as InfinityIcon, BarChart3, Bell, Gift } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import PromoCodeModal from "@/components/PromoCodeModal";

const features = [
  { icon: InfinityIcon, label: "Unlimited medicine scans" },
  { icon: BarChart3, label: "Advanced insights & analytics" },
  { icon: Bell, label: "Smart reminders with sound alerts" },
  { icon: ShieldCheck, label: "Priority safety alerts" },
  { icon: Sparkles, label: "Early access to new features" },
];

const PremiumPayment = () => {
  const navigate = useNavigate();
  const { plan } = useAppStore();
  const [promoOpen, setPromoOpen] = useState(false);

  const handleProceed = () => {
    toast.info("Razorpay integration coming soon", {
      description: "You'll be able to pay securely with Razorpay shortly.",
    });
  };

  return (
    <div className="px-5 pt-12 pb-8 space-y-5 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.4} />
        </button>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight leading-none">Upgrade to Premium</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Unlock everything MediScan has to offer
          </p>
        </div>
      </header>

      {/* Plan card */}
      <section
        className="relative rounded-[28px] p-6 text-white shadow-glow overflow-hidden"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-2">
          <Crown className="w-5 h-5" strokeWidth={2.6} fill="currentColor" />
          <span className="text-sm font-bold tracking-wide uppercase">Premium Plan</span>
        </div>
        <div className="relative mt-3 flex items-end gap-1">
          <span className="text-5xl font-extrabold leading-none">₹99</span>
          <span className="text-sm font-semibold opacity-90 mb-1">/month</span>
        </div>
        <p className="relative text-[12px] opacity-90 mt-2">Cancel anytime. Billed monthly.</p>
      </section>

      {/* Features */}
      <section className="glass-strong rounded-[24px] p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">What's included</h3>
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" strokeWidth={2.4} />
            </div>
            <p className="text-[14px] font-medium text-foreground flex-1">{label}</p>
            <Check className="w-4 h-4 text-success" strokeWidth={3} />
          </div>
        ))}
      </section>

      {/* Promo code card */}
      <section className="glass-strong rounded-[24px] p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-primary)" }}>
          <Gift className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-foreground flex items-center gap-1.5">
            <span aria-hidden>🎁</span> Have a promo code?
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              className="text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline cursor-pointer font-semibold"
            >
              Click here to enter your code
            </button>{" "}
            and unlock Premium benefits.
          </p>
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={handleProceed}
        className="w-full rounded-2xl py-4 text-white font-bold text-[15px] shadow-glow active:scale-[0.98] transition-all"
        style={{ background: "var(--gradient-primary)" }}
      >
        Proceed to Payment
      </button>

      {plan === "premium" && (
        <p className="text-center text-[12px] text-success font-semibold">
          ✓ Premium is active on your account
        </p>
      )}

      <PromoCodeModal open={promoOpen} onOpenChange={setPromoOpen} />
    </div>
  );
};

export default PremiumPayment;
