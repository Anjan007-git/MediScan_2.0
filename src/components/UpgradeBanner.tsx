import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

interface Props {
  message?: string;
  className?: string;
}

const DEFAULT_MSG =
  "Upgrade to MediScan Premium for unlimited scans, unlimited storage, AI-powered insights, and advanced medicine safety tools.";

const UpgradeBanner = ({ message = DEFAULT_MSG, className = "" }: Props) => {
  const navigate = useNavigate();
  return (
    <div
      className={`rounded-2xl p-4 text-white shadow-glow flex items-start gap-3 ${className}`}
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Crown className="w-4 h-4 text-white" strokeWidth={2.6} fill="currentColor" />
      </div>
      <div className="flex-1">
        <p className="text-[13px] leading-snug font-medium">{message}</p>
        <button
          onClick={() => navigate("/settings/premium-payment")}
          className="mt-2 inline-flex items-center px-3.5 py-1.5 rounded-full bg-white text-primary text-[12px] font-bold active:scale-95"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default UpgradeBanner;
