import { useState, useCallback, useRef } from "react";
import { MedicineInfo } from "@/components/MedicineResult";

// Mock medicine database for demonstration (offline/demo mode)
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
      "Typical adult dose: 650 mg every 4–6 hours as needed. Keep total paracetamol from all sources within the daily limit on the pack/doctor's advice.",
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

/**
 * Improved hash that samples more of the image data for better differentiation.
 * Uses FNV-1a inspired approach with denser sampling.
 */
const hashImageData = (input: string): number => {
  let hash = 2166136261; // FNV offset basis
  // Sample every 37th char (denser than before) plus first/last 200 chars
  const len = input.length;
  // Hash the length itself for uniqueness
  hash = (hash ^ (len & 0xff)) * 16777619;
  hash = (hash ^ ((len >> 8) & 0xff)) * 16777619;
  hash = (hash ^ ((len >> 16) & 0xff)) * 16777619;

  // Sample densely from the data
  const step = Math.max(1, Math.floor(len / 500));
  for (let i = 0; i < len; i += step) {
    hash = (hash ^ input.charCodeAt(i)) * 16777619;
  }
  return Math.abs(hash | 0);
};

export const useMedicineScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track the latest scan to prevent race conditions
  const activeScanIdRef = useRef<string | null>(null);

  const analyzeMedicine = useCallback(
    async (imageData: string, scanId: string): Promise<MedicineInfo | null> => {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // If a newer scan was started, discard this result
      if (activeScanIdRef.current !== scanId) {
        console.log(`[MediScan] Scan ${scanId} superseded, discarding result`);
        return null;
      }

      const medicines = Object.values(MEDICINE_DATABASE);
      const index = hashImageData(imageData) % medicines.length;
      const selected = cloneMedicine(medicines[index]);

      console.log(
        `[MediScan] Scan ${scanId} | imageLen=${imageData.length} | hash=${hashImageData(imageData)} | result=${selected.name}`
      );

      return selected;
    },
    []
  );

  const scanMedicine = useCallback(
    async (imageData: string) => {
      // Generate a unique scan ID bound to this request
      const scanId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      activeScanIdRef.current = scanId;

      // Fully reset state before processing
      setResult(null);
      setError(null);
      setIsScanning(true);

      console.log(`[MediScan] Starting scan ${scanId} | imageLen=${imageData.length}`);

      try {
        const medicineInfo = await analyzeMedicine(imageData, scanId);

        // Only apply result if this scan is still the active one
        if (activeScanIdRef.current !== scanId) {
          console.log(`[MediScan] Scan ${scanId} result ignored (superseded)`);
          return;
        }

        if (!medicineInfo) {
          setError("Unable to detect correct medicine. Please try again with a clear image.");
        } else {
          setResult(medicineInfo);
        }
      } catch (err) {
        console.error(`[MediScan] Scan ${scanId} error:`, err);
        // Only set error if still the active scan
        if (activeScanIdRef.current === scanId) {
          setResult(null);
          setError("Unable to detect correct medicine. Please try again with a clear image.");
        }
      } finally {
        // Only clear scanning if still the active scan
        if (activeScanIdRef.current === scanId) {
          setIsScanning(false);
        }
      }
    },
    [analyzeMedicine]
  );

  const clearResult = useCallback(() => {
    // Cancel any in-flight scan
    activeScanIdRef.current = null;
    setResult(null);
    setError(null);
    setIsScanning(false);
  }, []);

  return {
    isScanning,
    result,
    error,
    scanMedicine,
    clearResult,
  };
};
