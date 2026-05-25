import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};


const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// In-memory rate limiter (per edge function instance)
// Limits: 10 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  // Periodic cleanup to avoid unbounded growth
  if (ipHits.size > 1000) {
    for (const [k, v] of ipHits) {
      const fresh = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) ipHits.delete(k);
      else ipHits.set(k, fresh);
    }
  }
  return hits.length > RATE_LIMIT_MAX;
}

// ~10 MB raw → ~13.4 MB base64. Allow some padding.
const MAX_IMAGE_PAYLOAD = 14_000_000;

const parseAiJson = (content: unknown) => {
  const text = Array.isArray(content)
    ? content.map((part: any) => (typeof part === "string" ? part : part?.text || "")).join("\n")
    : String(content || "");

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
};

const callAiGateway = async (lovableApiKey: string, body: Record<string, unknown>) => {
  let lastResponse: Response | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": lovableApiKey,
        "X-Lovable-AIG-SDK": "mediscan-edge-fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    lastResponse = response;
    if (response.ok || ![408, 429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
      return response;
    }

    console.warn(`[analyze-medicine] AI gateway retry ${attempt} after HTTP ${response.status}`);
    await response.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
  return lastResponse!;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let scanId: string | undefined;

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return jsonResponse({ error: "Too many requests. Please wait a moment and try again." }, 429);
    }

    // Require authentication — prevents anonymous abuse of AI credits
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      console.warn("[analyze-medicine] Missing Authorization header");
      return jsonResponse({ error: "Authentication required." }, 401);
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      console.warn("[analyze-medicine] Invalid session claims", claimsErr?.message);
      return jsonResponse({ error: "Invalid or expired session." }, 401);
    }

    const requestBody = await req.json().catch((error) => {
      console.error("[analyze-medicine] Failed to parse request JSON", error);
      return null;
    });
    const imageData = requestBody?.imageData;
    scanId = requestBody?.scanId;
    console.log(
      `[analyze-medicine] Request scanId=${scanId || "missing"} | type=${typeof imageData} | bytes=${
        typeof imageData === "string" ? imageData.length : 0
      } | mime=${typeof imageData === "string" ? imageData.slice(5, imageData.indexOf(";")) : "n/a"}`
    );


    if (!imageData || typeof imageData !== "string") {
      return jsonResponse({ error: "No image data provided", scanId }, 400);
    }

    if (!imageData.startsWith("data:image/")) {
      return jsonResponse({ error: "Invalid image format", scanId }, 400);
    }

    if (imageData.length > MAX_IMAGE_PAYLOAD) {
      return jsonResponse({ error: "Image too large. Please upload an image under 10 MB.", scanId }, 413);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonResponse({ error: "Service is temporarily unavailable.", scanId }, 500);
    }

    const systemPrompt = `You are a medicine identification expert. Analyze the provided image and determine if it contains a medicine (tablet strip, bottle, packaging, etc.).

CRITICAL RULES:
1. Only return results if the image CLEARLY contains a recognizable medicine product.
2. If the image does NOT contain medicine (e.g., a tree, person, food, random object), return null.
3. If the image is too blurry or unclear to identify, return null.
4. Never guess or hallucinate medicine information.
5. Provide a confidence score from 0 to 100.

Return your response as a JSON object with this EXACT structure:
{
  "isMedicine": true/false,
  "confidence": <number 0-100>,
  "medicine": {
    "name": "<brand name>",
    "generic": "<generic/chemical name>",
    "uses": ["<use 1>", "<use 2>", "<use 3>"],
    "composition": "<active ingredients with strengths>",
    "dosage": "<typical adult dosage instructions>",
    "precautions": ["<precaution 1>", "<precaution 2>", "<precaution 3>"],
    "warnings": ["<warning 1>", "<warning 2>", "<warning 3>"],
    "sideEffects": ["<side effect 1>", "<side effect 2>", "<side effect 3>"],
    "storage": "<storage instructions>"
  }
}

If isMedicine is false, set medicine to null and confidence to how sure you are it's NOT medicine.
If isMedicine is true, confidence should reflect how sure you are about the identification.`;

    const response = await callAiGateway(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-pro",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image. Is it a medicine? If yes, identify it and provide detailed information. Return ONLY the JSON object, no markdown or extra text.",
              },
              {
                type: "image_url",
                image_url: { url: imageData },
              },
            ],
          },
        ],
    });

    console.log(`[analyze-medicine] AI response status=${response.status} scanId=${scanId}`);

    if (!response.ok) {
      const statusCode = response.status;
      if (statusCode === 429) {
        return jsonResponse({ error: "Rate limit exceeded. Please try again in a moment.", scanId }, 429);
      }
      if (statusCode === 402) {
        return jsonResponse({ error: "AI credits exhausted. Please add funds.", scanId }, 402);
      }
      const errText = await response.text();
      console.error(`AI gateway error [${statusCode}]:`, errText);
      return jsonResponse({ error: "Failed to analyze image", scanId }, 500);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    console.log(
      `[analyze-medicine] AI payload scanId=${scanId} | hasContent=${Boolean(content)} | finish=${
        aiResponse.choices?.[0]?.finish_reason || "unknown"
      }`
    );

    if (!content) {
      return jsonResponse({ error: "No response from AI", scanId }, 500);
    }

    // Parse the JSON from the AI response (strip markdown code fences if present)
    let parsed;
    try {
      parsed = parseAiJson(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return jsonResponse({ error: "Unable to process AI response", scanId }, 500);
    }

    // Validate the response. Accept partial medicine data when the model clearly
    // identified a medicine so the UI does not show a false failure for usable scans.
    const hasMedicineFields = Boolean(
      parsed.medicine &&
        (parsed.medicine.name ||
          parsed.medicine.generic ||
          parsed.medicine.composition ||
          (Array.isArray(parsed.medicine.uses) && parsed.medicine.uses.length > 0))
    );
    if (!parsed.isMedicine || !hasMedicineFields) {
      console.log(`[analyze-medicine] No medicine detected scanId=${scanId} confidence=${parsed.confidence || 0}`);
      return jsonResponse(
        {
          isMedicine: false,
          confidence: parsed.confidence || 0,
          medicine: null,
          scanId,
        },
        200
      );
    }

    console.log(`[analyze-medicine] scanId=${scanId} | detected=${parsed.medicine.name} | confidence=${parsed.confidence}`);

    return jsonResponse(
      {
        isMedicine: true,
        confidence: Number(parsed.confidence) || 80,
        medicine: {
          name: String(parsed.medicine.name || parsed.medicine.generic || "Medicine detected"),
          generic: String(parsed.medicine.generic || "Consult a healthcare professional"),
          uses: Array.isArray(parsed.medicine.uses) && parsed.medicine.uses.length ? parsed.medicine.uses : ["Consult a healthcare professional for verified uses."],
          composition: String(parsed.medicine.composition || parsed.medicine.generic || "Not identified from image"),
          dosage: String(parsed.medicine.dosage || "Follow the label or consult a healthcare professional."),
          precautions: Array.isArray(parsed.medicine.precautions) && parsed.medicine.precautions.length ? parsed.medicine.precautions : ["Verify this result with a pharmacist or doctor before use."],
          warnings: Array.isArray(parsed.medicine.warnings) && parsed.medicine.warnings.length ? parsed.medicine.warnings : ["Do not use medicine based only on AI identification."],
          sideEffects: Array.isArray(parsed.medicine.sideEffects) ? parsed.medicine.sideEffects : [],
          storage: String(parsed.medicine.storage || "Store according to the package instructions."),
        },
        scanId,
      },
      200
    );
  } catch (e) {
    console.error("analyze-medicine error:", e);
    return jsonResponse({ error: "An unexpected error occurred. Please try again.", scanId }, 500);
  }
});
