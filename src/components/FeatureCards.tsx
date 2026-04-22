import { Zap, Brain, FileText } from "lucide-react";

const features = [
  { icon: Zap, title: "Fast", description: "Results in seconds" },
  { icon: Brain, title: "Accurate", description: "AI-powered recognition" },
  { icon: FileText, title: "Detailed", description: "Complete information" },
];

const FeatureCards = () => {
  return (
    <div className="px-6 mt-5 mb-8">
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="glass rounded-3xl p-4 text-center animate-fade-in-up hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${300 + index * 80}ms` }}
          >
            <div className="relative w-11 h-11 rounded-2xl mx-auto mb-3 flex items-center justify-center glass-subtle overflow-hidden">
              <feature.icon className="relative w-5 h-5 text-primary" strokeWidth={2.4} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-0.5">{feature.title}</h3>
            <p className="text-muted-foreground text-[11px] leading-tight">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
