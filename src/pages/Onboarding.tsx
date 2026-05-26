import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  ScanLine,
  Sparkles,
  FolderHeart,
  ShieldCheck,
  Pill,
  HeartPulse,
  FileText,
  Stethoscope,
  Activity,
  Plus,
} from "lucide-react";

type Slide = {
  titleParts: { text: string; className: string }[];
  subtitle: string;
  illustration: JSX.Element;
};

// ---------- Illustrations (built natively, no uploaded images) ----------

const PhoneFrame = ({ children, accent = "from-sky-400 to-blue-600" }: { children: React.ReactNode; accent?: string }) => (
  <div className="relative">
    {/* Glow */}
    <div className={`absolute -inset-8 rounded-[3rem] bg-gradient-to-br ${accent} opacity-20 blur-3xl`} />
    {/* Floating dots */}
    <div className="absolute -top-6 -left-6 w-3 h-3 rounded-full bg-blue-400/60" />
    <div className="absolute top-10 -right-8 w-2 h-2 rounded-full bg-sky-400/70" />
    <div className="absolute -bottom-4 left-2 w-2.5 h-2.5 rounded-full bg-blue-300/70" />
    <div className="relative w-[240px] sm:w-[260px] h-[480px] sm:h-[520px] rounded-[2.5rem] bg-white shadow-[0_30px_60px_-20px_rgba(37,99,235,0.35)] border border-white p-3">
      <div className="w-full h-full rounded-[2rem] bg-gradient-to-b from-sky-50 to-blue-50 overflow-hidden relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-slate-200" />
        {children}
      </div>
    </div>
  </div>
);

const Slide1Art = () => (
  <PhoneFrame>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
        <Plus className="w-10 h-10 text-white" strokeWidth={3} />
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-slate-900">MediScan</div>
        <div className="text-[11px] text-slate-500">AI Health Companion</div>
      </div>
      <div className="w-full space-y-2 mt-2">
        {[ScanLine, Pill, HeartPulse].map((Icon, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </PhoneFrame>
);

const Slide2Art = () => (
  <PhoneFrame>
    <div className="absolute inset-0 flex flex-col items-center p-5 pt-10">
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-white shadow-inner flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
          <Activity className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="mt-6 w-full bg-white rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <Pill className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-[11px] font-semibold text-slate-800">Paracetamol 500mg</div>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
          <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
          <div className="h-1.5 w-2/3 rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 flex gap-1.5">
          <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-semibold">Safe</div>
          <div className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold">AI Verified</div>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

const Slide3Art = () => (
  <PhoneFrame>
    <div className="absolute inset-0 p-5 pt-10">
      <div className="flex items-center gap-2 mb-4">
        <FolderHeart className="w-5 h-5 text-blue-500" />
        <div className="text-[12px] font-bold text-slate-800">My Health Vault</div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: FileText, label: "Prescriptions", color: "bg-blue-100 text-blue-600" },
          { icon: Pill, label: "Medicines", color: "bg-emerald-100 text-emerald-600" },
          { icon: ScanLine, label: "Scans", color: "bg-violet-100 text-violet-600" },
          { icon: HeartPulse, label: "Reports", color: "bg-rose-100 text-rose-600" },
        ].map(({ icon: Icon, label, color }, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-semibold text-slate-700">{label}</div>
            <div className="text-[9px] text-slate-400">12 items</div>
          </div>
        ))}
      </div>
      <div className="mt-3 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl p-3 text-white">
        <div className="text-[10px] opacity-80">Storage used</div>
        <div className="text-sm font-bold">68% organized</div>
        <div className="mt-1.5 h-1 rounded-full bg-white/30 overflow-hidden">
          <div className="h-full w-2/3 bg-white rounded-full" />
        </div>
      </div>
    </div>
  </PhoneFrame>
);

const Slide4Art = () => (
  <PhoneFrame>
    <div className="absolute inset-0 flex flex-col items-center justify-center p-5">
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 animate-pulse opacity-30" />
        <div className="absolute inset-2 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-blue-500" strokeWidth={2.2} />
        </div>
      </div>
      <div className="mt-5 text-center">
        <div className="text-[13px] font-bold text-slate-900">Protected & Private</div>
        <div className="text-[10px] text-slate-500 mt-0.5">End-to-end secured health data</div>
      </div>
      <div className="mt-4 w-full bg-white rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            <div className="text-[10px] font-semibold text-slate-700">Daily Wellness</div>
          </div>
          <div className="text-[9px] text-emerald-600 font-bold">+12%</div>
        </div>
        <div className="flex items-end gap-1 h-12">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-blue-400 to-sky-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  </PhoneFrame>
);

const slides: Slide[] = [
  {
    titleParts: [
      { text: "Welcome to ", className: "text-slate-900" },
      { text: "MediScan", className: "text-blue-500" },
    ],
    subtitle: "Your smart AI assistant for medicines, prescriptions and health insights.",
    illustration: <Slide1Art />,
  },
  {
    titleParts: [
      { text: "Smart ", className: "text-slate-900" },
      { text: "AI ", className: "text-blue-500" },
      { text: "Insights", className: "text-slate-900" },
    ],
    subtitle: "Get detailed information about your medicines, prescriptions and health in seconds.",
    illustration: <Slide2Art />,
  },
  {
    titleParts: [
      { text: "Keep Your Health\n", className: "text-slate-900" },
      { text: "Organized", className: "text-blue-500" },
    ],
    subtitle: "Save and organize prescriptions, bills and scan history securely in one place.",
    illustration: <Slide3Art />,
  },
  {
    titleParts: [
      { text: "Your Health,\n", className: "text-slate-900" },
      { text: "Our Priority", className: "text-blue-500" },
    ],
    subtitle: "Manage all your medicines, prescriptions and health records with confidence.",
    illustration: <Slide4Art />,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const lockRef = useRef(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const deltaX = useRef(0);
  const swiped = useRef(false);
  const [drag, setDrag] = useState(0);

  const finish = (mode: "signin" | "signup") => {
    try {
      localStorage.setItem("mediscan-onboarded", "1");
    } catch {}
    navigate(mode === "signup" ? "/login?mode=signup" : "/login", { replace: true });
  };

  const step = (dir: 1 | -1) => {
    if (lockRef.current) return;
    setIndex((i) => {
      const next = i + dir;
      if (next < 0 || next > slides.length - 1) return i;
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, 350);
      return next;
    });
  };

  const goNext = () => step(1);
  const goPrev = () => step(-1);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    deltaX.current = 0;
    swiped.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Ignore vertical scrolls
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      startX.current = null;
      setDrag(0);
      return;
    }
    deltaX.current = dx;
    setDrag(dx);
  };
  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > 60 && !swiped.current) {
      swiped.current = true;
      if (deltaX.current < 0) goNext();
      else goPrev();
    }
    startX.current = null;
    startY.current = null;
    deltaX.current = 0;
    setDrag(0);
  };

  const isLast = index === slides.length - 1;
  const showSkip = !isLast;
  const current = slides[index];

  return (
    <div
      className="fixed inset-0 w-full flex flex-col overflow-y-auto lg:overflow-hidden"
      style={{
        minHeight: "100dvh",
        height: "100dvh",
        touchAction: "pan-x",
        background:
          "radial-gradient(1200px 600px at 80% -10%, #DBEAFE 0%, transparent 60%), radial-gradient(900px 500px at -10% 110%, #E0F2FE 0%, transparent 55%), linear-gradient(180deg, #F4F8FF 0%, #F8FBFF 100%)",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl" />

      {/* Header */}
      <header className="relative z-20 w-full">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl border-2 border-blue-500 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <Plus className="text-blue-500 w-5 h-5" strokeWidth={3} />
            </div>
            <div className="leading-tight">
              <div className="text-[20px] font-bold">
                <span className="text-slate-900">Medi</span>
                <span className="text-blue-500">Scan</span>
              </div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Scan. Understand. Stay Healthy.</div>
            </div>
          </div>
          {showSkip ? (
            <button
              onClick={() => setIndex(slides.length - 1)}
              className="text-slate-700 hover:text-blue-600 font-semibold text-[15px] active:opacity-60 transition"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={() => setIndex(0)}
              className="text-slate-700 hover:text-blue-600 font-semibold text-[15px] active:opacity-60 transition"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 w-full min-h-0">
        <div className="mx-auto max-w-6xl h-full px-5 sm:px-8 lg:px-12 py-4 sm:py-8 lg:py-12 grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div
              key={`title-${index}`}
              className="animate-fade-in"
            >
              <h1 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold leading-[1.1] whitespace-pre-line tracking-tight">
                {current.titleParts.map((p, i) => (
                  <span key={i} className={p.className}>
                    {p.text}
                  </span>
                ))}
              </h1>
              <p className="mt-4 sm:mt-5 text-slate-600 text-[15px] sm:text-[17px] lg:text-[18px] leading-relaxed max-w-md mx-auto lg:mx-0">
                {current.subtitle}
              </p>
            </div>

            {/* Desktop CTAs (inline) */}
            <div className="hidden lg:block mt-10">
              {isLast ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <button
                    onClick={() => finish("signin")}
                    className="flex-1 h-14 rounded-2xl border-2 border-blue-500 bg-white/70 backdrop-blur text-blue-600 font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm hover:bg-white transition active:scale-[0.98]"
                  >
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => finish("signup")}
                    className="flex-1 h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition active:scale-[0.98]"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={goNext}
                    className="h-14 px-10 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[16px] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition active:scale-[0.98]"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === index ? "w-7 bg-blue-500" : "w-2 bg-blue-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div
              key={`art-${index}`}
              className="animate-scale-in transition-transform"
              style={{ transform: `translateX(${drag * 0.2}px)` }}
            >
              {current.illustration}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile/Tablet bottom controls */}
      <footer className="lg:hidden relative z-20 w-full px-5 sm:px-8 pb-8 sm:pb-10 pt-2">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2 mb-5 justify-center">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-7 bg-blue-500" : "w-2 bg-blue-200"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => finish("signin")}
                className="w-full h-14 rounded-2xl border-2 border-blue-500 bg-white/70 backdrop-blur-md text-blue-600 font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
              >
                I already have an account. Sign in!
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => finish("signup")}
                className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition"
              >
                Register / Activate
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={goNext}
                className="h-14 px-10 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[16px] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
