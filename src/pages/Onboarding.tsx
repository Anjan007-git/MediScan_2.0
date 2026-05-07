import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import slide1 from "@/assets/onboarding-1.png";
import slide2 from "@/assets/onboarding-2.png";
import slide3 from "@/assets/onboarding-3.png";
import slide4 from "@/assets/onboarding-4.png";

const slides = [
  {
    image: slide1,
    titleParts: [
      { text: "Welcome to ", className: "text-slate-900" },
      { text: "MediScan", className: "text-blue-500" },
    ],
    subtitle: "Your smart AI assistant for medicines, prescriptions and health insights.",
  },
  {
    image: slide2,
    titleParts: [
      { text: "Smart ", className: "text-slate-900" },
      { text: "AI ", className: "text-blue-500" },
      { text: "Insights", className: "text-slate-900" },
    ],
    subtitle: "Get detailed information about your medicines, prescriptions and health in seconds.",
  },
  {
    image: slide3,
    titleParts: [
      { text: "Keep Your Health\n", className: "text-slate-900" },
      { text: "Organized", className: "text-blue-500" },
    ],
    subtitle: "Save and organize prescriptions, bills and scan history securely in one place.",
  },
  {
    image: slide4,
    titleParts: [
      { text: "Your Health,\n", className: "text-slate-900" },
      { text: "Our Priority ", className: "text-blue-500" },
    ],
    subtitle: "Manage all your medicines, prescriptions and health records with confidence.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem("mediscan-onboarded") === "1") {
        navigate("/login", { replace: true });
      }
    } catch {}
  }, [navigate]);

  const finish = (mode: "signin" | "signup") => {
    try {
      localStorage.setItem("mediscan-onboarded", "1");
    } catch {}
    navigate(mode === "signup" ? "/login?mode=signup" : "/login", { replace: true });
  };

  const goNext = () => {
    if (index < slides.length - 1) setIndex(index + 1);
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
    setDrag(deltaX.current);
  };
  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > 60) {
      if (deltaX.current < 0) goNext();
      else goPrev();
    }
    startX.current = null;
    deltaX.current = 0;
    setDrag(0);
  };

  const isLast = index === slides.length - 1;
  const showSkip = index === 1 || index === 2;

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, #F4F8FF 0%, #EAF2FF 50%, #F8FBFF 100%)",
      }}
    >
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-8 sm:pt-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl border-2 border-blue-500 flex items-center justify-center bg-white/40">
            <div className="text-blue-500 text-xl font-bold leading-none">+</div>
          </div>
          <div className="leading-tight">
            <div className="text-[20px] font-bold">
              <span className="text-slate-900">Medi</span>
              <span className="text-blue-500">Scan</span>
            </div>
            <div className="text-[11px] text-slate-500 -mt-0.5">
              Scan. Understand. Stay Healthy.
            </div>
          </div>
        </div>
        {showSkip && (
          <button
            onClick={() => setIndex(slides.length - 1)}
            className="text-slate-700 font-semibold text-[15px] active:opacity-60"
          >
            Skip
          </button>
        )}
        {isLast && (
          <button
            onClick={() => setIndex(0)}
            className="text-slate-700 font-semibold text-[15px] active:opacity-60"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-6 mt-8 sm:mt-10 max-w-md">
        <h1 className="text-[34px] sm:text-[36px] font-extrabold leading-[1.15] whitespace-pre-line tracking-tight">
          {slides[index].titleParts.map((p, i) => (
            <span key={i} className={p.className}>
              {p.text}
            </span>
          ))}
        </h1>
        <p className="mt-4 text-slate-600 text-[16px] leading-relaxed max-w-sm">
          {slides[index].subtitle}
        </p>
      </div>

      {/* Slides container (swipeable) */}
      <div
        className="relative mt-4 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${drag}px))`,
          }}
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full flex-shrink-0 flex justify-center px-6">
              <img
                src={s.image}
                alt=""
                className="w-full max-w-[380px] h-auto object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 sm:pb-10 pt-4">
        {/* Dots */}
        <div className="flex items-center gap-2 mb-6">
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
              className="w-full h-14 rounded-2xl border-2 border-blue-500 bg-white/60 backdrop-blur-md text-blue-600 font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
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
    </div>
  );
};

export default Onboarding;
