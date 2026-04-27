import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { ArrowLeft, FileText, Receipt as ReceiptIcon } from "lucide-react";

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { receipts } = useAppStore();
  const r = receipts.find((x) => x.id === id);

  if (!r) {
    return (
      <div className="px-5 pt-12 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Receipt not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-8 space-y-5 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <h1 className="text-lg font-bold">Receipt</h1>
        <div className="w-10 h-10" />
      </header>

      <section className="glass-strong rounded-[28px] p-4">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/80 shadow-soft border border-white/70 p-5 flex flex-col gap-2">
          {r.imageUrl ? (
            <img
              src={r.imageUrl}
              alt={`Receipt from ${r.pharmacy}`}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <>
              <div className="text-center">
                <ReceiptIcon className="w-7 h-7 mx-auto text-foreground/70" strokeWidth={1.8} />
                <p className="font-bold text-foreground mt-1">{r.pharmacy}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(r.date).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-dashed border-foreground/20 my-2" />
              <div className="flex-1 space-y-1.5 text-[12px]">
                {r.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate pr-2">
                      {it.name} ×{it.qty}
                    </span>
                    <span className="font-semibold">{formatINR(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-foreground/20 my-1" />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>{formatINR(r.total)}</span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="glass rounded-[24px] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Items</h2>
          <span className="text-xs text-muted-foreground">{r.items.length} total</span>
        </div>
        <ul className="divide-y divide-border/50">
          {r.items.map((it, i) => (
            <li key={i} className="py-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{it.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Qty {it.qty} • {formatINR(it.price)} each
                </p>
              </div>
              <span className="font-bold text-foreground text-sm">
                {formatINR(it.price * it.qty)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-tinted rounded-[24px] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow relative overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileText className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
            <p className="text-2xl font-extrabold text-foreground">{formatINR(r.total)}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReceiptDetail;
