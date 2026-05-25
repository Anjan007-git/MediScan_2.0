import { useState, useCallback, useRef } from "react";
import { MedicineInfo } from "@/components/MedicineResult";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/appStore";

export interface ScanResult {
  medicine: MedicineInfo | null;
  confidence: number;
  isMedicine: boolean;
}

const MAX_ANALYSIS_EDGE_BYTES = 6_000_000;
const MAX_IMAGE_DIMENSION = 1600;

const getImageMeta = (imageData: string) => ({
  length: imageData.length,
  approxKb: Math.round(imageData.length / 1024),
  mime: imageData.match(/^data:([^;]+);/)?.[1] || "unknown",
});

const preprocessImageForAnalysis = async (imageData: string): Promise<string> => {
  const meta = getImageMeta(imageData);
  if (!imageData.startsWith("data:image/")) {
    throw new Error("Invalid image format. Please upload a supported image file.");
  }

  const shouldNormalize =
    meta.length > MAX_ANALYSIS_EDGE_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(meta.mime);

  if (!shouldNormalize) {
    console.log("[MediScan] Image preprocessing skipped", meta);
    return imageData;
  }

  console.log("[MediScan] Image preprocessing started", meta);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("[MediScan] Canvas unavailable; using original image");
        resolve(imageData);
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      const normalized = canvas.toDataURL("image/jpeg", 0.82);
      console.log("[MediScan] Image preprocessing completed", {
        original: meta,
        normalized: getImageMeta(normalized),
        width,
        height,
      });
      resolve(normalized);
    };
    image.onerror = () => {
      console.warn("[MediScan] Image preprocessing failed; using original payload", meta);
      resolve(imageData);
    };
    image.src = imageData;
  });
};

export const useMedicineScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track the latest scan to prevent race conditions
  const activeScanIdRef = useRef<string | null>(null);

  const callAnalyzeMedicine = useCallback(async (payload: { imageData: string; scanId: string }, accessToken: string) => {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-medicine`;
    console.log("[MediScan] Calling analyze-medicine", {
      scanId: payload.scanId,
      functionUrl,
      payload: getImageMeta(payload.imageData),
      hasAccessToken: Boolean(accessToken),
      hasSupabaseUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
      hasPublishableKey: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY),
    });

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        let responseBody: any = null;
        try {
          responseBody = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          console.error("[MediScan] Response JSON parse failure", {
            scanId: payload.scanId,
            status: response.status,
            responseText,
            parseError,
          });
        }

        console.log("[MediScan] analyze-medicine response", {
          scanId: payload.scanId,
          attempt,
          status: response.status,
          ok: response.ok,
          body: responseBody,
        });

        if (response.ok) return responseBody;

        const message = responseBody?.error || responseBody?.message || `Scan service returned HTTP ${response.status}`;
        if (![408, 429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
          throw new Error(message);
        }
        lastError = new Error(message);
        await new Promise((resolve) => setTimeout(resolve, 700));
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Scan request failed");
        console.error("[MediScan] analyze-medicine request failed", {
          scanId: payload.scanId,
          attempt,
          error: lastError.message,
        });
        if (attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }

    throw lastError || new Error("Scan request failed");
  }, []);

  const scanMedicine = useCallback(
    async (imageData: string) => {
      // Generate a unique scan ID
      const scanId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      activeScanIdRef.current = scanId;

      // Fully reset state before processing
      setResult(null);
      setError(null);
      setIsScanning(true);

      console.log(`[MediScan] Starting scan ${scanId} | payload=${Math.round(imageData.length / 1024)}KB`);

      try {
        // Ensure we have a fresh session and explicitly pass the bearer token.
        // supabase.functions.invoke usually attaches Authorization automatically,
        // but in some deployments (preview/Vercel) it can be missing — pass it manually.
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          console.error(`[MediScan] No active session — user not authenticated`);
          setResult(null);
          setError("You're signed out. Please sign in again to scan medicine.");
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke("analyze-medicine", {
          body: { imageData, scanId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Only apply result if this scan is still the active one
        if (activeScanIdRef.current !== scanId) {
          console.log(`[MediScan] Scan ${scanId} superseded, discarding`);
          return;
        }

        if (fnError) {
          // Try to extract the real error body from FunctionsHttpError
          let detail = "";
          try {
            const ctx = (fnError as { context?: Response }).context;
            if (ctx && typeof ctx.json === "function") {
              const body = await ctx.json();
              detail = body?.error || JSON.stringify(body);
            } else if (ctx && typeof ctx.text === "function") {
              detail = await ctx.text();
            }
          } catch (_) {
            /* ignore parse failure */
          }
          console.error(`[MediScan] Function error:`, fnError, "| detail:", detail);
          setResult(null);
          setError(detail || "Unable to detect medicine. Please try again with a clear image.");
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

        // Persist to scan history with full details
        try {
          const status: "safe" | "caution" | "danger" =
            data.confidence >= 90 ? "safe" : data.confidence >= 80 ? "caution" : "danger";
          const med = data.medicine;
          useAppStore.getState().addScan({
            id: scanId,
            name: med.name,
            description: med.uses?.[0] || med.composition || med.generic || "",
            status,
            scannedAt: Date.now(),
            expiry: "—",
            generic: med.generic,
            composition: med.composition,
            uses: med.uses,
            dosage: med.dosage,
            precautions: med.precautions,
            warnings: med.warnings,
            sideEffects: med.sideEffects,
            storage: med.storage,
            confidence: data.confidence,
          });
        } catch (e) {
          console.warn("[MediScan] Failed to persist scan:", e);
        }
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
