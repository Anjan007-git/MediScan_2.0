import { useState, useCallback } from "react";
import { MedicineInfo } from "@/components/MedicineResult";

// Mock medicine database for demonstration (offline/demo mode)
// Note: Brand formulations can vary by market/manufacturer. Always follow the pack label.
const MEDICINE_DATABASE: Record<string, MedicineInfo> = {
  paracip: {
    name: "PARACIP-500",
    generic: "Paracetamol (Acetaminophen)",
    uses: [
      "Used to reduce fever and relieve mild to moderate pain.",
      "Headache, toothache, body aches, backache, muscle aches",
      "Pain and fever associated with cold/flu",
    ],
    composition: "Paracetamol IP 500 mg per tablet (may vary by manufacturer)",
    dosage:
      "Typical adult dose: 500–1000 mg every 4–6 hours as needed. Do not exceed 4000 mg/day from all sources unless your doctor advises otherwise.",
    precautions: [
      "Use caution if you have liver disease, drink alcohol regularly, or are malnourished.",
      "If symptoms persist (fever > 3 days or pain > 5 days), seek medical advice.",
      "Use age/weight-based dosing for children (pediatric formulation preferred).",
    ],
    warnings: [
      "Do not take with other medicines that contain paracetamol (risk of overdose).",
      "Overdose can cause serious liver damage—seek emergency help if too much is taken.",
      "Stop and seek help if rash, swelling, breathing trouble, or severe allergy occurs.",
    ],
  },
  dolo: {
    name: "DOLO-650",
    generic: "Paracetamol (Acetaminophen)",
    uses: [
      "Used to reduce fever and relieve mild to moderate pain.",
      "Headache, toothache, body aches, post-vaccination fever",
      "Pain and fever associated with cold/flu",
    ],
    composition: "Paracetamol IP 650 mg per tablet (may vary by manufacturer)",
    dosage:
      "Typical adult dose: 650 mg every 4–6 hours as needed. Keep total paracetamol from all sources within the daily limit on the pack/doctor’s advice.",
    precautions: [
      "Use caution with liver disease or regular alcohol use.",
      "Avoid duplicate paracetamol products (cold/flu combos often contain it).",
      "Use age/weight-based dosing for children (pediatric formulation preferred).",
    ],
    warnings: [
      "Do not exceed recommended dose (serious liver injury risk).",
      "Seek urgent help if you suspect overdose, even if you feel well.",
      "Stop and seek help if severe skin reaction or allergy occurs.",
    ],
  },
  crocin: {
    name: "CROCIN ADVANCE",
    generic: "Paracetamol (Acetaminophen)",
    uses: [
      "Used to reduce fever and relieve mild to moderate pain.",
      "Headache, toothache, body aches, muscle pain",
      "Pain and fever associated with cold/flu",
    ],
    composition: "Paracetamol 500 mg per tablet (may vary by manufacturer)",
    dosage:
      "Typical adult dose: 500–1000 mg every 4–6 hours as needed. Do not exceed 4000 mg/day from all sources unless your doctor advises otherwise.",
    precautions: [
      "Use caution if you have liver disease or consume alcohol.",
      "If symptoms persist (fever > 3 days or pain > 5 days), seek medical advice.",
      "Use age/weight-based dosing for children (pediatric formulation preferred).",
    ],
    warnings: [
      "Do not take with other paracetamol-containing products.",
      "Overdose can cause serious liver damage—seek emergency help if too much is taken.",
      "Stop and seek help if rash, swelling, breathing trouble, or severe allergy occurs.",
    ],
  },
};

const cloneMedicine = (medicine: MedicineInfo): MedicineInfo => ({
  ...medicine,
  uses: [...medicine.uses],
  precautions: [...medicine.precautions],
  warnings: [...medicine.warnings],
});

const hashString = (input: string) => {
  // Lightweight, stable hash so different images usually map to different demo results.
  let hash = 0;
  for (let i = 0; i < input.length; i += 97) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const useMedicineScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMedicine = useCallback(async (imageData: string): Promise<MedicineInfo> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Demo mode: map different images to different (but fixed) medicines
    const medicines = Object.values(MEDICINE_DATABASE);
    const index = hashString(imageData) % medicines.length;

    // Important: return a fresh object so state updates reliably even if the same medicine is selected again.
    return cloneMedicine(medicines[index]);
  }, []);

  const scanMedicine = useCallback(async (imageData: string) => {
    try {
      setIsScanning(true);
      setError(null);
      // Clear previous result immediately so the UI never shows stale medicine info.
      setResult(null);

      const medicineInfo = await analyzeMedicine(imageData);
      setResult(medicineInfo);
    } catch (err) {
      console.error("Scan error:", err);
      setError("Unable to identify medicine. Please try again with a clearer image.");
    } finally {
      setIsScanning(false);
    }
  }, [analyzeMedicine]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    result,
    error,
    scanMedicine,
    clearResult,
  };
};
