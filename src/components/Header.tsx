import { Pill } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col items-center pt-8 pb-4 px-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-card shadow-card flex items-center justify-center">
          <Pill className="w-8 h-8 text-primary rotate-45" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold text-gradient">MediScan</h1>
      </div>
      
      <div className="mt-6 w-full max-w-sm">
        <div className="bg-card/80 backdrop-blur-sm rounded-full py-4 px-6 shadow-card text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Instantly identify medicines with AI-powered analysis
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
