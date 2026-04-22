import {
  ArrowLeft,
  Info,
  Pill,
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Share2,
  Bookmark,
  RefreshCw,
  FlaskConical,
} from "lucide-react";
import { MediCard, MediCardTitle, MediCardContent } from "./ui/MediCard";

export interface MedicineInfo {
  name: string;
  generic: string;
  uses: string[];
  composition: string;
  dosage: string;
  precautions: string[];
  warnings: string[];
  sideEffects?: string[];
  storage?: string;
}

interface MedicineResultProps {
  medicine: MedicineInfo;
  confidence: number;
  onBack: () => void;
}

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const isLow = confidence < 80;
  const tone =
    confidence >= 90
      ? "bg-success/15 text-success border-success/30"
      : confidence >= 80
      ? "bg-warning/20 text-warning-foreground border-warning/30"
      : "bg-danger/15 text-danger border-danger/30";

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${tone}`}>
      {isLow ? <AlertOctagon className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
      {confidence}% confidence
    </div>
  );
};

const StatusTag = ({ confidence }: { confidence: number }) => {
  const status =
    confidence >= 90
      ? { label: "Verified", tone: "bg-success/15 text-success border-success/40", icon: CheckCircle }
      : confidence >= 80
      ? { label: "Caution", tone: "bg-warning/20 text-warning-foreground border-warning/40", icon: AlertTriangle }
      : { label: "Uncertain", tone: "bg-danger/15 text-danger border-danger/40", icon: AlertOctagon };
  const Icon = status.icon;
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.tone}`}>
      <Icon className="w-3 h-3" />
      {status.label}
    </div>
  );
};

const MedicineResult = ({ medicine, confidence, onBack }: MedicineResultProps) => {
  const isLowConfidence = confidence < 80;

  return (
    <div className="pb-8 animate-fade-in-up">
      {/* Medicine Header */}
      <div className="px-6 mt-4">
        <div className="glass-strong rounded-[28px] p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary-glow/25 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:shadow-glass-lg active:scale-95 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <StatusTag confidence={confidence} />
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-primary/10 text-primary border-primary/30">
                  <FlaskConical className="w-3 h-3" />
                  Medicine
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gradient tracking-tight truncate">{medicine.name}</h2>
              <p className="text-muted-foreground text-sm truncate">Generic: {medicine.generic}</p>
              <div className="mt-2">
                <ConfidenceBadge confidence={confidence} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div className="px-6 mt-4">
          <MediCard variant="danger">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 text-danger flex-shrink-0" />
              <div>
                <p className="font-semibold text-danger">Low Confidence Result</p>
                <p className="text-sm text-muted-foreground">
                  This result may be inaccurate. Please scan again with a clearer image for better accuracy.
                </p>
              </div>
            </div>
          </MediCard>
        </div>
      )}

      {/* Content - blurred if low confidence */}
      <div className={isLowConfidence ? "relative" : ""}>
        {isLowConfidence && (
          <div className="absolute inset-0 z-10 bg-card/30 backdrop-blur-sm rounded-xl flex items-start justify-center pt-20 pointer-events-none">
            <p className="bg-card px-4 py-2 rounded-lg shadow-card text-sm font-medium text-foreground">
              Low confidence result – may be inaccurate
            </p>
          </div>
        )}

        {/* What is it used for */}
        <div className="px-6 mt-4">
          <MediCard variant="highlight">
            <MediCardTitle>
              <Info className="w-5 h-5 text-primary" />
              What is it used for?
            </MediCardTitle>
            <MediCardContent>
              <p className="text-foreground">{medicine.uses[0]}</p>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Composition */}
        <div className="px-6 mt-4">
          <MediCard variant="highlight">
            <MediCardTitle>
              <Pill className="w-5 h-5 text-primary" />
              Composition
            </MediCardTitle>
            <MediCardContent>
              <p className="text-foreground">{medicine.composition}</p>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Uses */}
        <div className="px-6 mt-4">
          <MediCard variant="highlight">
            <MediCardTitle>
              <Info className="w-5 h-5 text-primary" />
              Uses
            </MediCardTitle>
            <MediCardContent>
              <ul className="space-y-2">
                {medicine.uses.slice(0, 3).map((use, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {use}
                  </li>
                ))}
              </ul>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Dosage */}
        <div className="px-6 mt-4">
          <MediCard variant="highlight">
            <MediCardTitle>
              <Shield className="w-5 h-5 text-primary" />
              Dosage
            </MediCardTitle>
            <MediCardContent>
              <p className="text-foreground">{medicine.dosage}</p>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Side Effects */}
        {medicine.sideEffects && medicine.sideEffects.length > 0 && (
          <div className="px-6 mt-4">
            <MediCard variant="warning">
              <MediCardTitle className="text-warning-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Side Effects
              </MediCardTitle>
              <MediCardContent>
                <ul className="space-y-3">
                  {medicine.sideEffects.map((effect, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      {effect}
                    </li>
                  ))}
                </ul>
              </MediCardContent>
            </MediCard>
          </div>
        )}

        {/* Precautions */}
        <div className="px-6 mt-4">
          <MediCard variant="warning">
            <MediCardTitle className="text-warning-foreground">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Precautions
            </MediCardTitle>
            <MediCardContent>
              <ul className="space-y-3">
                {medicine.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    {precaution}
                  </li>
                ))}
              </ul>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Important Warnings */}
        <div className="px-6 mt-4">
          <MediCard variant="danger">
            <MediCardTitle className="text-danger">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Important Warnings
            </MediCardTitle>
            <MediCardContent>
              <ul className="space-y-3">
                {medicine.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </MediCardContent>
          </MediCard>
        </div>

        {/* Storage */}
        {medicine.storage && (
          <div className="px-6 mt-4">
            <MediCard variant="highlight">
              <MediCardTitle>
                <Info className="w-5 h-5 text-primary" />
                Storage
              </MediCardTitle>
              <MediCardContent>
                <p className="text-foreground">{medicine.storage}</p>
              </MediCardContent>
            </MediCard>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-6 mt-5 grid grid-cols-3 gap-3">
        <button
          onClick={onBack}
          className="glass rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform hover:shadow-glass-lg"
        >
          <RefreshCw className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Scan Again</span>
        </button>
        <button className="glass rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform hover:shadow-glass-lg">
          <Bookmark className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Save</span>
        </button>
        <button className="glass rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform hover:shadow-glass-lg">
          <Share2 className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Share</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-6 mt-5">
        <div className="glass-subtle rounded-2xl px-4 py-3">
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            This information is for educational purposes only. Always consult a doctor or pharmacist.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineResult;
