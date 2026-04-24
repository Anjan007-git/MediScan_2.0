// Unified medicine API service
// Primary: RxNorm (suggestions / name normalization) + OpenFDA (drug label info)
// Fallback: bundled dataset of common meds (incl. Indian brands)
// All functions return the same Medicine shape.

const RXNORM = "https://rxnav.nlm.nih.gov/REST";
const OPENFDA = "https://api.fda.gov/drug/label.json";
const REQUEST_TIMEOUT = 8000;
const DEBUG = true;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log("[medicineApi]", ...args);
};

export interface Medicine {
  medicineName: string;
  brandName?: string;
  genericName?: string;
  composition?: string;
  uses?: string;
  dosage?: string;
  sideEffects?: string;
  precautions?: string;
  storage?: string;
  manufacturer?: string;
  source: "RxNorm/OpenFDA" | "OpenFDA" | "RxNorm" | "Fallback" | "AI";
  lastUpdated: string;
  imageUrl?: string;
}

// ---------- helpers ----------
const fetchWithTimeout = async (url: string, ms = REQUEST_TIMEOUT) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(id);
  }
};

const cleanText = (s: unknown): string => {
  if (!s) return "";
  const str = Array.isArray(s) ? s.join("\n\n") : String(s);
  return str
    .replace(/\s*\(\s*[\d.]+\s*\)\s*/g, " ")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// in-memory + localStorage cache
const memCache = new Map<string, Medicine>();
const CACHE_KEY = "mediscan:apicache:v1";
const TTL = 24 * 60 * 60 * 1000;

interface CacheEntry { data: Medicine; ts: number }

const readDiskCache = (): Record<string, CacheEntry> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch { return {}; }
};
const writeDiskCache = (k: string, data: Medicine) => {
  try {
    const all = readDiskCache();
    all[k.toLowerCase()] = { data, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
};
const getCached = (k: string): Medicine | null => {
  const key = k.toLowerCase();
  if (memCache.has(key)) return memCache.get(key)!;
  const all = readDiskCache();
  const e = all[key];
  if (e && Date.now() - e.ts < TTL) {
    memCache.set(key, e.data);
    return e.data;
  }
  return null;
};

// ---------- RxNorm ----------
export const getMedicineSuggestions = async (query: string): Promise<string[]> => {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const r = await fetchWithTimeout(
      `${RXNORM}/spellingsuggestions.json?name=${encodeURIComponent(q)}`
    );
    if (!r.ok) throw new Error(`RxNorm ${r.status}`);
    const j = await r.json();
    const arr: string[] = j?.suggestionGroup?.suggestionList?.suggestion || [];
    const fromFallback = FALLBACK_MEDICINES
      .filter((m) =>
        m.medicineName.toLowerCase().includes(q.toLowerCase()) ||
        m.genericName?.toLowerCase().includes(q.toLowerCase())
      )
      .map((m) => m.medicineName);
    const merged = [...new Set([...fromFallback, ...arr])].slice(0, 8);
    log("suggestions", q, merged.length);
    return merged;
  } catch (e) {
    log("suggestions failed, using fallback", e);
    return FALLBACK_MEDICINES
      .filter((m) => m.medicineName.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8)
      .map((m) => m.medicineName);
  }
};

const findRxcui = async (name: string): Promise<string | null> => {
  try {
    const r = await fetchWithTimeout(
      `${RXNORM}/rxcui.json?name=${encodeURIComponent(name)}&search=2`
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.idGroup?.rxnormId?.[0] || null;
  } catch { return null; }
};

// ---------- OpenFDA ----------
const fetchOpenFda = async (name: string): Promise<Partial<Medicine> | null> => {
  try {
    const search = `(openfda.brand_name:"${name}"+OR+openfda.generic_name:"${name}"+OR+openfda.substance_name:"${name}")`;
    const url = `${OPENFDA}?search=${search}&limit=1`;
    const r = await fetchWithTimeout(url);
    if (!r.ok) return null;
    const j = await r.json();
    const result = j?.results?.[0];
    if (!result) return null;
    const fda = result.openfda || {};
    return {
      brandName: fda.brand_name?.[0],
      genericName: fda.generic_name?.[0],
      manufacturer: fda.manufacturer_name?.[0],
      composition: cleanText(result.active_ingredient || fda.substance_name),
      uses: cleanText(result.indications_and_usage || result.purpose),
      dosage: cleanText(result.dosage_and_administration),
      sideEffects: cleanText(result.adverse_reactions),
      precautions: cleanText(result.warnings || result.warnings_and_cautions || result.precautions),
      storage: cleanText(result.storage_and_handling),
    };
  } catch (e) {
    log("openfda failed", e);
    return null;
  }
};

// ---------- Public API ----------
export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  const q = query.trim();
  if (!q) return [];
  const suggestions = await getMedicineSuggestions(q);
  const top = suggestions.slice(0, 5);
  if (top.length === 0) {
    const fallback = FALLBACK_MEDICINES.filter((m) =>
      m.medicineName.toLowerCase().includes(q.toLowerCase())
    );
    return fallback.length ? fallback : [];
  }
  // Return shallow result cards quickly; full details fetched on click
  return top.map((name) => {
    const fb = FALLBACK_MEDICINES.find(
      (m) => m.medicineName.toLowerCase() === name.toLowerCase()
    );
    return (
      fb || {
        medicineName: name,
        source: "RxNorm",
        lastUpdated: new Date().toISOString(),
      }
    );
  });
};

export const getMedicineDetails = async (name: string): Promise<Medicine> => {
  const cached = getCached(name);
  if (cached) {
    log("cache hit", name);
    return cached;
  }

  // Try OpenFDA first for richest data
  const fda = await fetchOpenFda(name);
  const rxcui = await findRxcui(name);

  // Fallback dataset
  const fb = FALLBACK_MEDICINES.find(
    (m) =>
      m.medicineName.toLowerCase() === name.toLowerCase() ||
      m.genericName?.toLowerCase() === name.toLowerCase()
  );

  if (!fda && !fb) {
    log("no data for", name);
    throw new Error("Medicine not found. Please try a different name or scan the packaging.");
  }

  const merged: Medicine = {
    medicineName: name,
    brandName: fda?.brandName || fb?.brandName || name,
    genericName: fda?.genericName || fb?.genericName,
    composition: fda?.composition || fb?.composition,
    uses: fda?.uses || fb?.uses,
    dosage: fda?.dosage || fb?.dosage,
    sideEffects: fda?.sideEffects || fb?.sideEffects,
    precautions: fda?.precautions || fb?.precautions,
    storage: fda?.storage || fb?.storage,
    manufacturer: fda?.manufacturer || fb?.manufacturer,
    source: fda && rxcui ? "RxNorm/OpenFDA" : fda ? "OpenFDA" : "Fallback",
    lastUpdated: new Date().toISOString(),
  };
  memCache.set(name.toLowerCase(), merged);
  writeDiskCache(name, merged);
  log("fetched", name, "via", merged.source);
  return merged;
};

// Convert legacy AI scanner shape into unified Medicine
export const fromAiResult = (ai: {
  name: string;
  generic?: string;
  uses?: string[];
  composition?: string;
  dosage?: string;
  precautions?: string[];
  warnings?: string[];
  sideEffects?: string[];
  storage?: string;
}): Medicine => ({
  medicineName: ai.name,
  brandName: ai.name,
  genericName: ai.generic,
  composition: ai.composition || "",
  uses: (ai.uses || []).join("\n• "),
  dosage: ai.dosage || "",
  sideEffects: (ai.sideEffects || []).join("\n• "),
  precautions: [...(ai.precautions || []), ...(ai.warnings || [])].join("\n• "),
  storage: ai.storage,
  source: "AI",
  lastUpdated: new Date().toISOString(),
});

// ---------- Fallback dataset ----------
export const FALLBACK_MEDICINES: Medicine[] = [
  {
    medicineName: "Paracetamol (Dolo 650)",
    brandName: "Dolo 650",
    genericName: "Paracetamol",
    composition: "Paracetamol 650 mg",
    uses: "Relief of mild to moderate pain and fever including headache, body ache, toothache, and common cold.",
    dosage: "Adults: 1 tablet every 4–6 hours as needed. Do not exceed 4 g (≈6 tablets) in 24 hours.",
    sideEffects: "Rare: nausea, rash, allergic reaction. Liver damage on overdose.",
    precautions: "Avoid alcohol. Do not exceed recommended dose. Caution in liver disease.",
    storage: "Store below 25°C in a dry place, away from sunlight.",
    manufacturer: "Micro Labs",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Ibuprofen (Brufen)",
    brandName: "Brufen",
    genericName: "Ibuprofen",
    composition: "Ibuprofen 400 mg",
    uses: "Pain relief, fever reduction, anti-inflammatory for arthritis, sprains, dental pain.",
    dosage: "Adults: 1 tablet every 6–8 hours after food. Max 1200 mg/day OTC.",
    sideEffects: "Stomach upset, heartburn, nausea, dizziness, rash.",
    precautions: "Take with food. Avoid in stomach ulcer, kidney disease, late pregnancy.",
    storage: "Store below 30°C, away from moisture.",
    manufacturer: "Abbott",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Cetirizine",
    genericName: "Cetirizine Hydrochloride",
    composition: "Cetirizine 10 mg",
    uses: "Allergic rhinitis, hay fever, hives, itching, skin allergies.",
    dosage: "Adults: 1 tablet (10 mg) once daily, preferably at night.",
    sideEffects: "Drowsiness, dry mouth, fatigue, headache.",
    precautions: "Avoid driving. Avoid alcohol. Reduce dose in kidney impairment.",
    storage: "Store below 25°C in a dry place.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    composition: "Amoxicillin 500 mg",
    uses: "Bacterial infections of ear, nose, throat, urinary tract, skin.",
    dosage: "Adults: 500 mg every 8 hours for 5–7 days as prescribed.",
    sideEffects: "Diarrhea, nausea, rash, allergic reactions.",
    precautions: "Complete full course. Inform doctor of penicillin allergy.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Pantoprazole",
    genericName: "Pantoprazole Sodium",
    composition: "Pantoprazole 40 mg",
    uses: "Acidity, GERD, stomach ulcers, heartburn.",
    dosage: "1 tablet 30 minutes before breakfast, for 4–8 weeks.",
    sideEffects: "Headache, diarrhea, nausea, abdominal pain.",
    precautions: "Long-term use may reduce vitamin B12 / magnesium.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Azithromycin",
    genericName: "Azithromycin",
    composition: "Azithromycin 500 mg",
    uses: "Respiratory infections, throat infection, skin infection, typhoid.",
    dosage: "500 mg once daily for 3–5 days.",
    sideEffects: "Nausea, diarrhea, abdominal pain, taste disturbance.",
    precautions: "Take 1 hour before or 2 hours after meals.",
    storage: "Store below 30°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Metformin",
    genericName: "Metformin Hydrochloride",
    composition: "Metformin 500 mg",
    uses: "Type 2 diabetes mellitus, polycystic ovary syndrome.",
    dosage: "500 mg twice daily with meals; titrate as advised.",
    sideEffects: "Nausea, diarrhea, metallic taste, vitamin B12 deficiency.",
    precautions: "Stop before contrast scans. Caution in kidney disease.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Omeprazole",
    genericName: "Omeprazole",
    composition: "Omeprazole 20 mg",
    uses: "Acid reflux, peptic ulcers, Zollinger-Ellison syndrome.",
    dosage: "20 mg once daily before breakfast for 4–8 weeks.",
    sideEffects: "Headache, abdominal pain, diarrhea, constipation.",
    precautions: "Long-term use may affect bone density.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "ORS (Oral Rehydration Salts)",
    genericName: "Sodium chloride + Potassium chloride + Glucose",
    composition: "WHO formula electrolyte powder",
    uses: "Dehydration from diarrhea, vomiting, heat exhaustion.",
    dosage: "Dissolve 1 sachet in 1 L clean water; sip frequently.",
    sideEffects: "Generally safe. Vomiting if taken too fast.",
    precautions: "Do not concentrate the solution. Use within 24 hours.",
    storage: "Store sachets in a cool, dry place.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Vitamin C",
    genericName: "Ascorbic Acid",
    composition: "Vitamin C 500 mg",
    uses: "Vitamin C deficiency, immune support, antioxidant.",
    dosage: "1 tablet daily after food.",
    sideEffects: "High doses: stomach upset, kidney stones.",
    precautions: "Caution in kidney stones / hemochromatosis.",
    storage: "Store below 25°C, protect from light.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    composition: "Aspirin 75 mg / 325 mg",
    uses: "Pain relief, fever, anti-inflammatory; low-dose for heart protection.",
    dosage: "As prescribed. Low-dose: 75 mg once daily.",
    sideEffects: "Stomach irritation, bleeding risk, tinnitus at high dose.",
    precautions: "Avoid in children with viral illness (Reye's syndrome).",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Loratadine",
    genericName: "Loratadine",
    composition: "Loratadine 10 mg",
    uses: "Non-drowsy antihistamine for allergies, hives.",
    dosage: "1 tablet (10 mg) once daily.",
    sideEffects: "Headache, fatigue, dry mouth.",
    precautions: "Reduce dose in liver disease.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    composition: "Atorvastatin 10–40 mg",
    uses: "High cholesterol, prevention of cardiovascular disease.",
    dosage: "Once daily at night.",
    sideEffects: "Muscle pain, liver enzyme rise, headache.",
    precautions: "Avoid grapefruit. Report unusual muscle pain.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Salbutamol (Asthalin)",
    brandName: "Asthalin",
    genericName: "Salbutamol",
    composition: "Salbutamol 100 mcg/puff",
    uses: "Asthma, bronchospasm, COPD relief.",
    dosage: "1–2 puffs every 4–6 hours as needed.",
    sideEffects: "Tremor, palpitations, headache.",
    precautions: "Caution in heart disease, hyperthyroidism.",
    storage: "Store below 30°C, away from heat.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
  {
    medicineName: "Diclofenac",
    genericName: "Diclofenac Sodium",
    composition: "Diclofenac 50 mg",
    uses: "Pain, inflammation, arthritis, muscle injuries.",
    dosage: "50 mg 2–3 times daily after food.",
    sideEffects: "Stomach pain, nausea, dizziness.",
    precautions: "Avoid in ulcer, kidney disease, late pregnancy.",
    storage: "Store below 25°C.",
    source: "Fallback",
    lastUpdated: "2025-01-01",
  },
];
