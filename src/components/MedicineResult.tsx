import { 
  ArrowLeft, 
  Info, 
  Pill, 
  Shield, 
  AlertTriangle,
  CheckCircle
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
}

interface MedicineResultProps {
  medicine: MedicineInfo;
  onBack: () => void;
}

const MedicineResult = ({ medicine, onBack }: MedicineResultProps) => {
  return (
    <div className="pb-8 animate-fade-in-up">
      {/* Medicine Header */}
      <div className="px-6 mt-4">
        <MediCard className="bg-gradient-to-br from-primary-light to-card">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-full bg-card/80 flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-primary">{medicine.name}</h2>
              <p className="text-muted-foreground text-sm">Generic: {medicine.generic}</p>
            </div>
          </div>
        </MediCard>
      </div>

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

      {/* Disclaimer */}
      <div className="px-6 mt-6">
        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          This information is for educational purposes only. Always consult a doctor or pharmacist.
        </p>
      </div>
    </div>
  );
};

export default MedicineResult;
