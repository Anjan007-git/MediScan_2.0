import { useState, useCallback } from "react";
import { MedicineInfo } from "@/components/MedicineResult";

// Mock medicine database for demonstration
const MEDICINE_DATABASE: Record<string, MedicineInfo> = {
  paracip: {
    name: "PARACIP-500",
    generic: "Paracetamol",
    uses: [
      "Paracip-500 is used to relieve mild to moderate pain and reduce fever.",
      "Pain relief",
      "Fever reduction",
    ],
    composition: "Each uncoated tablet contains Paracetamol IP 500 mg",
    dosage: "Adults: 500 mg to 1000 mg (1 to 2 tablets) up to a maximum of 4000 mg (8 tablets) daily in divided doses or as directed by the physician.",
    precautions: [
      "Store below 30°C",
      "Protect from light and moisture",
      "Keep out of reach of children",
    ],
    warnings: [
      "Do not exceed the recommended dose",
      "Avoid alcohol while taking this medication",
      "Consult doctor if symptoms persist for more than 3 days",
      "Not recommended for patients with liver disease",
    ],
  },
  dolo: {
    name: "DOLO-650",
    generic: "Paracetamol",
    uses: [
      "Used to treat mild to moderate pain including headache, migraine, toothache, and muscle pain.",
      "Fever reduction",
      "Body ache relief",
    ],
    composition: "Each tablet contains Paracetamol IP 650 mg",
    dosage: "Adults: 1 tablet every 4-6 hours. Maximum 4 tablets in 24 hours.",
    precautions: [
      "Store in a cool, dry place",
      "Keep away from direct sunlight",
      "Do not use if seal is broken",
    ],
    warnings: [
      "Do not take with other paracetamol-containing products",
      "Consult doctor before use if pregnant or breastfeeding",
      "Discontinue use if allergic reaction occurs",
    ],
  },
  crocin: {
    name: "CROCIN ADVANCE",
    generic: "Paracetamol",
    uses: [
      "Fast relief from headache, toothache, and body pain.",
      "Reduces fever quickly",
      "Relieves cold and flu symptoms",
    ],
    composition: "Paracetamol 500 mg with optizorb technology",
    dosage: "Adults and children over 12: 1-2 tablets every 4-6 hours. Max 8 tablets daily.",
    precautions: [
      "Store below 25°C",
      "Keep in original packaging",
      "Not for children under 12 without medical advice",
    ],
    warnings: [
      "Contains paracetamol - avoid with similar medicines",
      "Seek immediate medical help if overdose suspected",
      "May cause liver damage if taken in excess",
    ],
  },
};

export const useMedicineScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMedicine = useCallback(async (_imageData: string): Promise<MedicineInfo> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, randomly select a medicine
    const medicines = Object.values(MEDICINE_DATABASE);
    const randomIndex = Math.floor(Math.random() * medicines.length);
    return medicines[randomIndex];
  }, []);

  const scanMedicine = useCallback(async (imageData: string) => {
    try {
      setIsScanning(true);
      setError(null);
      
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
