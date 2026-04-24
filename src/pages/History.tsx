import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Clock, Pill, Bookmark, ScanSearch } from "lucide-react";
import { getHistory, getSaved, removeHistory, removeSaved, clearHistory, HistoryItem } from "@/lib/storage";
import { toast } from "sonner";

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - ts) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const Card = ({ item, onOpen, onDelete }: { item: HistoryItem; onOpen: () => void; onDelete: () => void }) => (
  <div className="glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] hover:shadow-glass-lg transition-all">
    <button onClick={onOpen} className="flex-1 flex items-center gap-3 text-left min-w-0">
      {item.imagePreview ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden glass-subtle p-0.5 flex-shrink-0">
          <img src={item.imagePreview} alt="" className="w-full h-full object-cover rounded-lg" />
        </div>
      ) : (
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-glow flex-shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Pill className="w-6 h-6 rotate-45" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-sm truncate">{item.medicine.medicineName}</p>
        {item.medicine.uses && (
          <p className="text-xs text-muted-foreground truncate">
            {item.medicine.uses.split(/\.|\n/)[0]}
          </p>
        )}
        <p className="text-[10px] text-primary font-semibold mt-0.5">{formatDate(item.scannedAt)}</p>
      </div>
    </button>
    <button
      onClick={onDelete}
      className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center text-danger active:scale-90 transition-transform"
      aria-label="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const History = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"history" | "saved">("history");
  const [items, setItems] = useState<HistoryItem[]>([]);

  const refresh = () => {
    setItems(tab === "history" ? getHistory() : getSaved());
  };

  useEffect(refresh, [tab]);

  const handleDelete = (id: string) => {
    if (tab === "history") removeHistory(id);
    else removeSaved(id);
    refresh();
    toast.success("Removed");
  };

  const handleClearAll = () => {
    if (tab === "history") {
      clearHistory();
      refresh();
      toast.success("History cleared");
    }
  };

  return (
    <div className="px-5 pt-12 pb-6 max-w-md mx-auto animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">History</h1>
      <p className="text-sm text-muted-foreground mb-5">Your scanned & saved medicines</p>

      {/* Tabs */}
      <div className="glass rounded-full p-1 flex mb-4">
        {(["history", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t ? "text-white shadow-glow" : "text-muted-foreground"
            }`}
            style={tab === t ? { background: "var(--gradient-primary)" } : {}}
          >
            {t === "history" ? "All" : "Saved"}
          </button>
        ))}
      </div>

      {tab === "history" && items.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-danger inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center mt-4">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            {tab === "history" ? <Clock className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-foreground mb-1">
            {tab === "history" ? "No history yet" : "No saved medicines"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {tab === "history"
              ? "Scan or search to start building your history"
              : "Save medicines from the result page"}
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="rounded-full px-5 py-2.5 text-sm text-white font-semibold shadow-glow inline-flex items-center gap-2"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ScanSearch className="w-4 h-4" /> Start scanning
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card
              key={it.id}
              item={it}
              onOpen={() => navigate(`/medicine/${it.id}`)}
              onDelete={() => handleDelete(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
