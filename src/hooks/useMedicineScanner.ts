import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export interface ScanResult {
  medicine: MedicineInfo | null;
  confidence: number;
  isMedicine: boolean;
}

export const useMedicineScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track the latest scan to prevent race conditions
  const activeScanIdRef = useRef<string | null>(null);

  const scanMedicine = useCallback(
    async (imageData: string) => {
      // Generate a unique scan ID
      const scanId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      activeScanIdRef.current = scanId;

      // Fully reset state before processing
      setResult(null);
      setError(null);
      setIsScanning(true);

      console.log(`[MediScan] Starting scan ${scanId}`);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("analyze-medicine", {
          body: { imageData, scanId },
        });

        // Only apply result if this scan is still the active one
        if (activeScanIdRef.current !== scanId) {
          console.log(`[MediScan] Scan ${scanId} superseded, discarding`);
          return;
        }

        if (fnError) {
          console.error(`[MediScan] Function error:`, fnError);
          setResult(null);
          setError("Unable to detect medicine. Please try again with a clear image.");
          return;
        }

        if (data?.error) {
          console.error(`[MediScan] API error:`, data.error);
          setResult(null);
          setError(data.error);
          return;
        }

        // Validate response has scanId match
        if (data?.scanId && data.scanId !== scanId) {
          console.log(`[MediScan] Scan ID mismatch, discarding`);
          return;
        }

        if (!data?.isMedicine || !data?.medicine?.name) {
          console.log(`[MediScan] No medicine detected, confidence: ${data?.confidence}`);
          setResult(null);
          setError("Unable to detect medicine. Please upload a clear image of a medicine.");
          return;
        }

        console.log(`[MediScan] Detected: ${data.medicine.name} | Confidence: ${data.confidence}%`);

        setResult({
          medicine: data.medicine,
          confidence: data.confidence,
          isMedicine: true,
        });
      } catch (err) {
        console.error(`[MediScan] Scan ${scanId} error:`, err);
        if (activeScanIdRef.current === scanId) {
          setResult(null);
          setError("Unable to detect medicine. Please try again with a clear image.");
        }
      } finally {
        if (activeScanIdRef.current === scanId) {
          setIsScanning(false);
        }
      }
    },
    []
  );

  const clearResult = useCallback(() => {
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
