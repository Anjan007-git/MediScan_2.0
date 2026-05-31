import { useState } from "react";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { redeemPromoCode } from "@/lib/premium";
import { useAppStore } from "@/store/appStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PromoCodeModal = ({ open, onOpenChange }: Props) => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setPlan = useAppStore((s) => s.setPlan);

  const reset = () => {
    setCode("");
    setSubmitting(false);
  };

  const handleApply = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const result = await redeemPromoCode(code.trim());
      if (result.ok) {
        setPlan("premium");
        toast.success("🎉 Promo code applied successfully! Premium activated.");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "❌ Invalid promo code. Please try again.");
      }
    } catch {
      toast.error("❌ Invalid promo code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <div
            className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Gift className="w-6 h-6 text-white" strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-center">Enter Promo Code</DialogTitle>
          <DialogDescription className="text-center">
            Apply your code to unlock Premium benefits instantly.
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your promo code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] font-semibold tracking-wider text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          disabled={submitting}
        />

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <button
            onClick={handleApply}
            disabled={submitting || !code.trim()}
            className="w-full rounded-xl py-3 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Apply
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full rounded-xl py-3 font-semibold bg-muted text-foreground"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeModal;
