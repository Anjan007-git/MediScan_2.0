import { MediCard } from "./ui/MediCard";

const features = [
  {
    title: "Fast",
    description: "Results in seconds",
  },
  {
    title: "Accurate",
    description: "AI-powered recognition",
  },
  {
    title: "Detailed",
    description: "Complete information",
  },
];

const FeatureCards = () => {
  return (
    <div className="px-6 mt-8 mb-8 space-y-4">
      {features.map((feature, index) => (
        <MediCard
          key={feature.title}
          className="py-6 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gradient mb-1">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {feature.description}
            </p>
          </div>
        </MediCard>
      ))}
    </div>
  );
};

export default FeatureCards;
