import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResultView from "@/components/result/ResultView";
import { getHistoryItem } from "@/lib/storage";
import { getMedicineDetails, Medicine } from "@/lib/medicineApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const MedicinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [confidence, setConfidence] = useState<number | undefined>();
  const [source, setSource] = useState<"scan" | "search" | "upload">("search");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const item = getHistoryItem(id);
    if (!item) {
      setError("Result not found");
      setLoading(false);
      return;
    }
    setImagePreview(item.imagePreview);
    setConfidence(item.confidence);
    setSource(item.source);

    // For search/upload entries with shallow data, enrich via API
    const isShallow =
      item.source !== "scan" &&
      (!item.medicine.uses || !item.medicine.composition);

    if (isShallow) {
      getMedicineDetails(item.medicine.medicineName)
        .then((m) => {
          setMedicine(m);
          setLoading(false);
        })
        .catch((e) => {
          console.warn(e);
          // fall back to whatever we have
          setMedicine(item.medicine);
          setLoading(false);
        });
    } else {
      setMedicine(item.medicine);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="px-5 pt-20 max-w-md mx-auto animate-fade-in-up">
        <div className="glass-strong rounded-[28px] p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground">Fetching medicine details…</p>
        </div>
        <div className="space-y-3 mt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-3xl p-5 animate-pulse-soft">
              <div className="h-4 bg-primary/10 rounded w-1/3 mb-3" />
              <div className="h-3 bg-primary/5 rounded w-full mb-2" />
              <div className="h-3 bg-primary/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="px-5 pt-20 max-w-md mx-auto">
        <div className="glass-strong rounded-[28px] p-8 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">Medicine not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please try again with a clearer image or search manually.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="rounded-full px-6 py-3 text-white font-semibold shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResultView
      medicine={medicine}
      imagePreview={imagePreview}
      confidence={confidence}
      source={source}
    />
  );
};

export default MedicinePage;
