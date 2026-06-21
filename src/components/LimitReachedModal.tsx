import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: "medicine" | "receipt";
}

const COPY = {
  medicine: {
    title: "Weekly Scan Limit Reached",
    description:
      "You've used all 10 medicine scans available in your Free plan. Upgrade to Premium for unlimited scans.",
  },
  receipt: {
    title: "Monthly Receipt Limit Reached",
    description:
      "You've reached the monthly receipt scan limit. Upgrade to Premium for unlimited receipt scans.",
  },
};

const LimitReachedModal = ({ open, onOpenChange, kind }: Props) => {
  const navigate = useNavigate();
  const copy = COPY[kind];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{ background: "var(--gradient-primary)" }}>
            <Crown className="w-6 h-6 text-white" strokeWidth={1.8} fill="currentColor" />
          </div>
          <AlertDialogTitle className="text-center">{copy.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {copy.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              navigate("/settings/premium-payment");
            }}
            className="w-full rounded-xl text-white font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            Upgrade to Premium
          </AlertDialogAction>
          <AlertDialogCancel className="w-full rounded-xl mt-0">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LimitReachedModal;
