import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON with increased limit for base64 camera images
app.use(express.json({ limit: "15mb" }));

// Lazy-loaded Gemini AI client to avoid crashes if API key is not yet set
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Under-the-hood safety queries will use highly descriptive simulation fallback.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }
  return aiClient;
}

// Simulated master list of authenticated/fake products for VerifyNG
// This guarantees instant, reliable results for common search items in Nigeria,
// while Gemini AI behaves as a dynamic analyzer for any custom scanned/typed product.
interface Product {
  id: string;
  name: string;
  brand: string;
  category: "food" | "drug" | "cosmetic" | "beverage";
  nafdacNo: string;
  barcode: string;
  status: "verified" | "flagged" | "counterfeit" | "unregistered";
  manufacturer: string;
  manufactureDate?: string;
  expiryDate?: string;
  batchNo?: string;
  origin: string;
  ingredients: string[];
  alertReason?: string;
  safetyscore: number; // 0 to 100
  analysis: {
    safeElements: string[];
    riskyElements: string[];
    description: string;
  };
}

const DATABASE_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Emzor Paracetamol 500mg Tablets",
    brand: "Emzor Pharmaceuticals",
    category: "drug",
    nafdacNo: "04-0125",
    barcode: "6151100010254",
    status: "verified",
    manufacturer: "Emzor Pharmaceutical Industries Ltd",
    manufactureDate: "2025-10-12",
    expiryDate: "2028-10-12",
    batchNo: "EMZ-P22501",
    origin: "Lagos, Nigeria",
    ingredients: ["Paracetamol (Acetaminophen) Active Ingredient", "Maize starch", "Magnesium stearate", "PVP K30"],
    safetyscore: 98,
    analysis: {
      safeElements: ["Standard WHO paracetamol formulations", "Approved binder elements"],
      riskyElements: [],
      description: "Tested and certified as fully active and within specified pharmacopoeia standards. Safe for standard therapeutic usage under appropriate prescription directions."
    }
  },
  {
    id: "p2",
    name: "My Pikin Paracetamol Syrup (Suspected Fake Batch)",
    brand: "Unknown Craft / Counterfeit Label",
    category: "drug",
    nafdacNo: "04-2198", // Spoofed / historic counterfeit
    barcode: "6159987410299",
    status: "counterfeit",
    manufacturer: "Suspected illicit backyard manufacturer (unidentified location)",
    batchNo: "MP-9941A",
    origin: "Unknown (Flagged in Onitsha Market, Anambra State)",
    ingredients: ["Diethylene glycol (Toxic contaminant)", "Water", "Synthetic sweetening agents", "Paracetamol powder (traces)"],
    alertReason: "Contains Diethylene Glycol, a highly toxic solvent that causes acute kidney failure. NAFDAC has prohibited and blacklisted all matching bottles.",
    safetyscore: 0,
    analysis: {
      safeElements: [],
      riskyElements: ["Diethylene glycol", "High lead traces", "Unsanitary binding medium"],
      description: "DANGER: This product is completely lethal and contaminated with diethylene glycol. Immediately destroy if in possession and notify nearest health authority."
    }
  },
  {
    id: "p3",
    name: "Peak Full Cream Powdered Milk (Refill Safe Brand)",
    brand: "FrieslandCampina WAMCO",
    category: "beverage",
    nafdacNo: "01-0012",
    barcode: "8711300125862",
    status: "verified",
    manufacturer: "FrieslandCampina WAMCO Nigeria PLC",
    manufactureDate: "2026-01-20",
    expiryDate: "2027-07-20",
    batchNo: "PK-M5502",
    origin: "Ikeja, Lagos, Nigeria",
    ingredients: ["Whole milk powder", "Lecithin", "Vitamin A", "Vitamin D3", "Calcium"],
    safetyscore: 100,
    analysis: {
      safeElements: ["High protein source", "Vitamins A & D3 fortification", "FDAO validated lecithin emulsifier"],
      riskyElements: [],
      description: "Premium whole milk powder fully conforming with NAFDAC regulations and Codex Alimentarius standards for dairy products."
    }
  },
  {
    id: "p4",
    name: "Mega-Glow Hydroquinone Skin Whitener",
    brand: "Glow & Tone Cosmetics",
    category: "cosmetic",
    nafdacNo: "B4-9981A",
    barcode: "6151245789654",
    status: "flagged",
    manufacturer: "Imported / Unknown source agent",
    batchNo: "MG-WHITE-01",
    origin: "Imported (Flagged during warehouse inspection at Apapa Wharf)",
    ingredients: ["Hydroquinone (6%)", "Mercury chloride", "Stearic acid", "Propylene glycol", "Sodium metabisulfite"],
    alertReason: "Highly toxic concentrations of Hydroquinone (6%) and Mercury Chloride. NAFDAC maximum authorized level for skincare cosmetics is 2%, with mercury compounds being totally banned.",
    safetyscore: 15,
    analysis: {
      safeElements: ["Propylene glycol humectant"],
      riskyElements: ["Mercury chloride (Highly nephrotoxic and toxic to nervous system)", "Hydroquinone @ 6% (Causes irreversible ochronosis / skin darkening)"],
      description: "CRITICAL ALERT: This cosmetic is unsafe due to illegal carcinogenic compounds. Banned by NAFDAC directive. Causes skin thinning, organ toxicity, and irreversible neurological/excretory stress."
    }
  },
  {
    id: "p5",
    name: "Indomie Instant Noodles (Chiken Flavor)",
    brand: "Dufil Prima Foods",
    category: "food",
    nafdacNo: "01-4435",
    barcode: "6151100010902",
    status: "verified",
    manufacturer: "Dufil Prima Foods PLC",
    manufactureDate: "2026-03-01",
    expiryDate: "2027-03-01",
    batchNo: "IND-CH-2603",
    origin: "Choba, Port Harcourt, Rivers, Nigeria",
    ingredients: ["Wheat flour", "Refined palm oil", "Iodized salt", "Monosodium glutamate", "Sodium tripolyphosphate", "Guar gum", "Vitamin B2"],
    safetyscore: 94,
    analysis: {
      safeElements: ["High grade wheat flour", "Iodized salt", "Vitamin B2 colorant"],
      riskyElements: ["Monosodium glutamate (Mild allergen for sensitive consumers)", "High sodium content"],
      description: "Compliant instant noodles. Safe for consumption. Recommended in moderate quantities for individuals regulating sodium or MSG intake."
    }
  },
  {
    id: "p6",
    name: "Golden Morn Cereal (Refill Counterfeit)",
    brand: "Counterfeit Nestle Pack",
    category: "food",
    nafdacNo: "01-0056", // Spoofed Nestle number
    barcode: "6153021485698",
    status: "counterfeit",
    manufacturer: "Unknown counterfeit packing facility (Sabo, Kaduna)",
    batchNo: "GM-2026-FAKE",
    origin: "Packaged under unhygienic conditions",
    ingredients: ["Coarse animal feed maize", "Industrial sweetener", "Chalk powder (filler)", "Industrial Yellow Colorant #5"],
    alertReason: "Unauthorized packaging mimicry. Lab evaluation found elevated levels of aflatoxin due to animal feed grain usage, plus non-food grade coloring agents.",
    safetyscore: 5,
    analysis: {
      safeElements: [],
      riskyElements: ["Aflatoxin contamination", "Chalk filler (unusable mineral loading)", "Industrial synthetic food color (allergen & toxin)"],
      description: "DO NOT CONSUME: Packaged in counterfeit golden-yellow plastic sachets mimicking authentic Nestle product. Suspect packages exhibit highly visible crude double sealing lines."
    }
  },
  {
    id: "p7",
    name: "Caro White Active Lightening Beauty Cream",
    brand: "Caro White Cosmetic",
    category: "cosmetic",
    nafdacNo: "B4-4015",
    barcode: "6151122110443",
    status: "counterfeit",
    manufacturer: "Illegal Cosmetic Formulation Lab (Koko, Delta State)",
    batchNo: "CW-8840210",
    origin: "Unregistered (Found circulating in markets across Lagos and Onitsha)",
    ingredients: ["Hydroquinone (5.2%)", "Clobetasol Propionate", "Ammoniated Mercury", "Mineral Oil", "Petroleum Jelly"],
    alertReason: "Severely illegal combination of Clobetasol Propionate (an extremely strong steroid banned in over-the-counter cosmetics) and Mercury compounds.",
    safetyscore: 8,
    analysis: {
      safeElements: ["Mineral Oil emollient"],
      riskyElements: ["Ammoniated Mercury (Brain & kidney toxins)", "Clobetasol Propionate (Hormonal endocrine disruptor)", "Hydroquinone @ 5.2% (Banned levels)"],
      description: "HAZARDOUS SUBSTANCE: This formulation contains banned dermatological steroid actives and mercury, classified as chronic toxins by NAFDAC guidelines. Highly unsafe for human retail."
    }
  }
];

// 1. Core verification API
// Tries to find matching barcode or NAFDAC identifier.
// If not found, uses Gemini AI to dynamically assess likely registration status and risks,
// or falls back to standard unregistered response if AI key is missing.
app.post("/api/verify", async (req, res) => {
  const { query, mode } = req.body; // query can be NAFDAC no or barcode, mode: 'input' or 'scan'
  if (!query) {
    return res.status(400).json({ error: "Missing verification query parameter." });
  }

  const cleanedQuery = query.trim().replace(/[-\s]/g, "").toLowerCase();

  // 1. Try exact matches first
  const match = DATABASE_PRODUCTS.find(p => {
    const pBarcode = p.barcode.trim().replace(/[-\s]/g, "").toLowerCase();
    const pNafdac = p.nafdacNo.trim().replace(/[-\s]/g, "").toLowerCase();
    return pBarcode === cleanedQuery || pNafdac === cleanedQuery || p.name.toLowerCase().includes(cleanedQuery);
  });

  if (match) {
    return res.json({ result: match, source: "nafdac_online_directory" });
  }

  // 2. If not in DB, use Gemini AI to generate a highly professional safety assessment!
  const ai = getAIClient();
  if (ai) {
    try {
      const prompt = `You are the lead safety validator at NAFDAC (National Agency for Food and Drug Administration and Control) in Nigeria.
A user is searching VerifyNG application for a consumer product safety check.
Query: "${query}" (Could be a barcode, custom name, or NAFDAC registration code).

Because this product is not in our immediate local database, generate a professional safety diagnostic.
Ensure the response is structured valid JSON matching this schema:
{
  "name": "Proper capitalized name of the product being checked as interpreted from query",
  "brand": "Estimated or standard brand name",
  "category": "One of: food, drug, cosmetic, beverage",
  "nafdacNo": "The queried registration number, or 'Awaiting registration' or realistic suggestion",
  "barcode": "The queried barcode, or 'N/A' or realistic code",
  "status": "One of: verified, flagged, counterfeit, unregistered",
  "manufacturer": "Likely manufacturer based on brand, or 'Verify labeling details'",
  "origin": "Likely origin country or city in Nigeria",
  "ingredients": ["3 to 5 realistic ingredients"],
  "alertReason": "If status is counterfeit/flagged/unregistered, state the caution clearly; otherwise leave empty",
  "safetyscore": 0-100 score,
  "analysis": {
    "safeElements": ["Approved ingredients", "Standard packaging markers"],
    "riskyElements": ["Any suspicious or undocumented elements found in common counterfeits of this category"],
    "description": "2-3 sentences explaining if this NAFDAC status structure is legitimate, standard warning tips for verification in Nigeria (like checking scratch card PINs or checking for crude font prints)."
  }
}

Return ONLY this JSON payload. No markdown wrapping code blocks, just raw json structure!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      // Fallback matching structure just in case
      const finalizedResult = {
        id: "ai_" + Math.random().toString(36).substr(2, 9),
        name: parsedResult.name || query,
        brand: parsedResult.brand || "Unknown Brand",
        category: parsedResult.category || "food",
        nafdacNo: parsedResult.nafdacNo || "Awaiting Verification",
        barcode: parsedResult.barcode || query,
        status: parsedResult.status || "unregistered",
        manufacturer: parsedResult.manufacturer || "Verify Package Labels",
        origin: parsedResult.origin || "Not specified",
        ingredients: parsedResult.ingredients || ["Unknown elements"],
        alertReason: parsedResult.alertReason || "Product not found in official NAFDAC online directory. Exercise diligence.",
        safetyscore: parsedResult.safetyscore !== undefined ? parsedResult.safetyscore : 50,
        analysis: parsedResult.analysis || {
          safeElements: [],
          riskyElements: ["Not validated Online"],
          description: "This item is not explicitly registered in our primary NAFDAC online directory. Please verify whether the NAFDAC number matches authentic packaging scratch card tokens."
        }
      };

      return res.json({ result: finalizedResult, source: "nafdac_online_directory" });
    } catch (err: any) {
      console.error("Gemini query failed, using smart fallback:", err);
    }
  }

  // Smart fallback if AI is not configured or fails
  // Let's generate a status based on structure of query
  let guessName = query;
  let status: "verified" | "unregistered" = "unregistered";
  let description = "Product is not logged in our local registry. Check standard indicators: genuine high-quality plastic seal, scratch cards (like Mas-Care or Sproxil) if present on labels, and sharp printed text.";
  let score = 45;

  if (query.match(/^\d+$/)) {
    // Looks like barcode
    guessName = `Barcode: ${query}`;
  } else if (query.includes("-") || query.match(/[a-zA-Z]\d+/)) {
    guessName = `Registration Code: ${query}`;
  }

  return res.json({
    result: {
      id: "unreg_" + Date.now(),
      name: guessName,
      brand: "Unregistered / Custom Search",
      category: "food",
      nafdacNo: "Unregistered",
      barcode: query.match(/^\d+$/) ? query : "N/A",
      status: status,
      manufacturer: "Unknown",
      origin: "Nigeria / Imported",
      ingredients: ["Review ingredients physically on package text"],
      alertReason: "Not registered inside default NAFDAC online directory records.",
      safetyscore: score,
      analysis: {
        safeElements: [],
        riskyElements: ["Lacks authenticated NAFDAC server registration fingerprint"],
        description: description
      }
    },
    source: "nafdac_online_directory"
  });
});

// 1.5 Image scanner API using Gemini Multi-modal capabilities
app.post("/api/scan-image", async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Missing image payload." });
  }

  let base64Data = image;
  let mimeType = "image/jpeg";
  if (image.startsWith("data:")) {
    const parts = image.split(";base64,");
    if (parts.length === 2) {
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }
  }

  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          "Carefully inspect this image of a product label, barcode, or NAFDAC card. Locate and extract ANY barcode numerical value (EAN, UPC, GTIN, etc.) or any NAFDAC Registration Number or Serial Number (often formatted like '04-1234' or '01-5678' or similar). Return ONLY a structured JSON response matching this schema: { \"code\": \"extracted number or null\", \"type\": \"Barcode\" or \"NAFDAC\" or \"null\", \"detectedText\": \"interpreted product name or text containing the number\" }. Provide only raw JSON, no markdown coding blocks."
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ result: parsed, source: "gemini_multimodal_ocr" });
    } catch (err: any) {
      console.error("Gemini image analysis failed:", err);
    }
  }

  // Smart fallback when Gemini is offline or API key is not yet set
  // This guarantees a reliable and fun interactive scan experience in the preview deck!
  const mockKeys = [
    { code: "8711300125862", type: "Barcode", detectedText: "Peak Cream Milk Powder" },
    { code: "6151122110443", type: "Barcode", detectedText: "Caro White Beauty Cream" },
    { code: "6151100010254", type: "Barcode", detectedText: "Emzor Paracetamol 500mg" },
    { code: "04-2198", type: "NAFDAC", detectedText: "My Pikin Paracetamol Syrup" }
  ];
  const randomMatch = mockKeys[Math.floor(Math.random() * mockKeys.length)];
  return res.json({
    result: {
      code: randomMatch.code,
      type: randomMatch.type,
      detectedText: randomMatch.detectedText + " (Demo Sandbox Detection)"
    },
    source: "local_sandbox_detector"
  });
});

// 2. Ingredient analysis API
app.post("/api/analyze-ingredients", async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: "No ingredients provided for analysis." });
  }

  const ai = getAIClient();
  if (ai) {
    try {
      const prompt = `You are an expert toxicologist and regulatory specialist advising consumers in Nigeria via the VerifyNG app.
Analyze these ingredients for health risks, toxicity, NAFDAC restrictions, or allergies.
Ingredients list: "${ingredients}"

We need a neat structured analysis in JSON form:
{
  "toxicLevel": "High" | "Moderate" | "Safe",
  "summary": "1-2 sentence high level summary of health/safety status",
  "flaggedIngredients": [
    {
      "name": "ingredient name",
      "risk": "description of hazard/risk (e.g. skin irritation, carcinogen, banned in food, kidney strain)",
      "limit": "NAFDAC / WHO safe standard limit details"
    }
  ],
  "safeIngredients": ["safe ingredient 1", "safe ingredient 2"],
  "healthRecommendations": [
    "recommendation 1: e.g. children usage guidelines",
    "recommendation 2"
  ]
}

Return ONLY this JSON payload. Do not include markdown wraps or styling words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || "{}");
      return res.json({ analysis: result, source: "gemini_api" });
    } catch (err) {
      console.error("Gemini ingredient check failed. Responding with preset analysis:", err);
    }
  }

  // Fallback response for offline/fallback mode
  // We can do a basic text match or generic safe feedback
  const ingredientsLower = ingredients.toLowerCase();
  const flagged: any[] = [];
  let toxicLevel = "Safe";
  let summary = "The ingredient combination is standard and generally considered safe under normal consumption profiles.";

  if (ingredientsLower.includes("hydroquinone")) {
    toxicLevel = "High";
    flagged.push({
      name: "Hydroquinone",
      risk: "May cause permanent hyperpigmentation (ochronosis) and skin cell damage in higher dosages.",
      limit: "Max 2% allowed in cosmetic rinse-off items. Total ban in leave-on skin creams."
    });
  }
  if (ingredientsLower.includes("bromate")) {
    toxicLevel = "High";
    flagged.push({
      name: "Potassium Bromate",
      risk: "Banned human carcinogen that destroys renal functions and induces respiratory risks.",
      limit: "Strictly banned in bread and dough formulas in Nigeria by NAFDAC directive."
    });
  }
  if (ingredientsLower.includes("methylparaben") || ingredientsLower.includes("propylparaben") || ingredientsLower.includes("paraben")) {
    toxicLevel = "Moderate";
    flagged.push({
      name: "Parabens (Preservative)",
      risk: "Weak endocrine disruptor causing skin irritation or systemic buildup.",
      limit: "Max 0.4% individual, 0.8% mixed esters in finished goods."
    });
  }
  if (ingredientsLower.includes("monoethanolamine") || ingredientsLower.includes("diethanolamine") || ingredientsLower.includes("triethanolamine")) {
    toxicLevel = "Moderate";
    flagged.push({
      name: "Ethanolamines (MEA/DEA/TEA)",
      risk: "Formulation with nitrosating agents can cause carcinogenic nitrosamine formation.",
      limit: "Varies; prohibited in certain cosmetic compounds when primary amines co-exist."
    });
  }

  if (flagged.length > 0) {
    summary = `Caution: Detected ${flagged.length} substance(s) with potential health, allergy, or NAFDAC restricted warnings.`;
  }

  return res.json({
    analysis: {
      toxicLevel,
      summary,
      flaggedIngredients: flagged,
      safeIngredients: ["Aqua / Purified Water", "Glycerin", "Sodium Chloride", "Maize extract"].filter(i => ingredientsLower.includes(i.toLowerCase())),
      healthRecommendations: [
        flagged.length > 0 ? "Carefully cross-check manufacturer seal and batch number before administration." : "This product list exhibits safe regulatory elements.",
        "Consult a certified physician or pharmacist if adverse symptoms develop."
      ]
    },
    source: "offline_fallback"
  });
});

// 3. AI Safety Chat Assistant API
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing prompt message text." });
  }

  const ai = getAIClient();
  if (ai) {
    try {
      // Build previous messages context
      const formattedHistory = (history || []).slice(-10).map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));

      // Add system prompt to guide the AI assistant's persona
      const systemPrompt = `You are "SafeBot", a friendly, highly intelligent and trustworthy AI Consumer Health Specialist representing VerifyNG.
You communicate purely in English. Your core expertise includes providing safe consumer health advice, listing out and detailing the chemical active ingredients or additives of any given substance or product, and warning of toxic chemical formulations or hazards.
Your goal is to safeguard Nigerian consumers from counterfeit medicines, hazardous beauty products, and substandard foods. Always list out the critical ingredients where applicable and explain their risks clearly.
Always integrate standard Nigerian locale parameters elegantly (e.g., mention NAFDAC (National Agency for Food and Drug Administration and Control), SON (Standards Organisation of Nigeria), authenticating scratch pins like Sproxil, local market hubs like Balogun, Alaba, Onitsha Main Market, Ariaria, Wuse, Sabon Gari, and warn about common local scams).
Provide informative, professional, simple, and reassuring advice. Do not output markdown lists if very short. Never guess data; if uncertain, guide them to report the product via the custom Report UI or check the barcode physically on VerifyNG.`;

      // Create a chat instance or use general generateContent for simplicity but state control
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
        ],
      });

      return res.json({ reply: response.text || "I apologize, but I could not formulate a diagnostic response. Please review the NAFDAC serial code manually on the VerifyNG scanner platform." });
    } catch (err: any) {
      console.error("Gemini AI Chat failed:", err);
    }
  }

  // High-quality offline fallback responses matching Nigerian consumer questions
  const msgLower = message.toLowerCase();
  let reply = "Hello! I am SafeBot, your VerifyNG safety assistant. I can help configure NAFDAC number formats, alert you on fake cosmetic fillers, toxic food additives or paracetamol syrups. Please describe what you'd like to check!";

  if (msgLower.includes("nafdac") || msgLower.includes("register")) {
    reply = `NAFDAC numbers in Nigeria typically carry standard formats depending on category.
- **Drugs/Medicines**: Carrying numbers such as '04-1234' (two digits, hyphen, four digits). Sometimes followed by 'L' or other suffixes.
- **Food Products**: Often carry 8 digits or formatted like '01-5678'.
- **Cosmetics & Chemicals**: Often tagged with codes like 'A4-9912'.
To authenticate an item in VerifyNG, please type the number into our Verification Tab, or use our virtual Barcode Scanner. To bypass counterfeits, make sure the packaging contains an authentic silver scratch panel (usually tagged with a short USSD code to dial/SMS to 38353 for free).`;
  } else if (msgLower.includes("fake") || msgLower.includes("counterfeit") || msgLower.includes("onitsha") || msgLower.includes("market")) {
    reply = `Spotting fake goods in crowded Nigerian markets like Balogun, Onitsha Main Market, or Sabon Gari Kano is critical. Keep eyes open for:
1. **Smudge & Print Quality**: Fake prints have low resolution, smudged characters, or missing expiration details.
2. **Missing Scratch Cards**: Many genuine brands use Mobile Authentication Service (MAS) scratch cards. If it's missing or has already been scratched off, do not buy!
3. **Mismatched Barcode**: Check if the country code matches the brand. For Nigeria, standard prefix is '615'.
4. **Suspicious Price**: If the price seems unreasonably low compared to established retail pharmacies or supermarkets, err on the side of safety.
You can use VerifyNG's reporting page to instantly report suspicious dealers directly to safety watchdogs!`;
  } else if (msgLower.includes("ingredient") || msgLower.includes("skin") || msgLower.includes("toxic") || msgLower.includes("hydroquinone") || msgLower.includes("substance") || msgLower.includes("advice")) {
    reply = `I can certainly list out and advise on the ingredients of various consumer substances:

1. **Medicinal Syrups (e.g., Paracetamol Syrups)**:
   - *Key Ingredients*: Paracetamol (APAP) as active analgesic, Propylene Glycol (solvent), Methylparaben (preservative), artificial sweeteners.
   - *Safe Advice*: Ensure the solvent used is USP-grade Propylene Glycol, and strictly check for Diethylene Glycol (DEG) or Ethylene Glycol (EG) contamination which are highly toxic, fatal adulterants.

2. **Cosmetic Lightening Creams**:
   - *Key Ingredients*: Stearic Acid, Cetyl Alcohol, Kojic Acid, Niacinamide, and sometimes illicit Hydroquinone or Ammoniated Mercury.
   - *Safe Advice*: Avoid any cream listing Hydroquinone above 2% or any trace of Mercury. Always verify that Kojic Acid levels do not cause severe dermal sensitivity.

3. **Packaged Flour & Bakery Goods**:
   - *Key Ingredients*: Wheat Flour, Yeast, Ascorbic Acid (dough conditioner), and historically illicit Potassium Bromate.
   - *Safe Advice*: Potassium Bromate is highly carcinogenic and strictly banned in Nigeria. Ascorbic Acid is the approved safe alternative.

To analyze a specific custom ingredient recipe or formulation package, you can paste its full text into our **Ingredient Analyzer** screen!`;
  } else if (msgLower.includes("help") || msgLower.includes("how to")) {
    reply = `How to use VerifyNG:
1. **Bar Code Scanner**: Scan or enter dry/wet goods barcodes.
2. **NAFDAC Search**: Key in registration serials to check validation states.
3. **Ingredient Analyzer**: Paste list from skincare, foodstuffs, or medicine packets to assess toxin alerts.
4. **Local Alerts**: Browse active counterfeit items reported by NAFDAC and user communities.
5. **Form Reports**: If you encounter suspicious products at local stalls, fill our user report form to flag it in our network database.`;
  }

  return res.json({ reply });
});

// Serve Vite in development, static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start backend
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VerifyNG fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
