import { Zap, Brain, FileText } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast",
    description: "Results in seconds",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "Accurate",
    description: "AI-powered recognition",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FileText,
    title: "Detailed",
    description: "Complete information",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const FeatureCards = () => {
  return (
    <div className="px-6 mt-8 mb-8">
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="bg-card rounded-2xl p-4 shadow-card text-center animate-fade-in-up border border-border/40"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-3`}>
              <feature.icon className={`w-5 h-5 ${feature.color}`} strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-0.5">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-[11px] leading-tight">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
