import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Require authentication — prevents anonymous abuse of AI credits
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageData, scanId } = await req.json();


    if (!imageData || typeof imageData !== "string") {
      return new Response(
        JSON.stringify({ error: "No image data provided", scanId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageData.startsWith("data:image/")) {
      return new Response(
        JSON.stringify({ error: "Invalid image format", scanId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageData.length > MAX_IMAGE_PAYLOAD) {
      return new Response(
        JSON.stringify({ error: "Image too large. Please upload an image under 10 MB.", scanId }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service is temporarily unavailable.", scanId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
      }),
    });

    if (!response.ok) {
      const statusCode = response.status;
      if (statusCode === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", scanId }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (statusCode === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds.", scanId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error(`AI gateway error [${statusCode}]:`, errText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image", scanId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI", scanId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the AI response (strip markdown code fences if present)
    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Unable to process AI response", scanId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the response
    if (!parsed.isMedicine || !parsed.medicine || !parsed.medicine.name) {
      return new Response(
        JSON.stringify({
          isMedicine: false,
          confidence: parsed.confidence || 0,
          medicine: null,
          scanId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-medicine] scanId=${scanId} | detected=${parsed.medicine.name} | confidence=${parsed.confidence}`);

    return new Response(
      JSON.stringify({
        isMedicine: true,
        confidence: parsed.confidence,
        medicine: parsed.medicine,
        scanId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-medicine error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
