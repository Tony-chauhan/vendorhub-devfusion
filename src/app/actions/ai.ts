"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;

// Initialize the Gemini API client safely
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("mock")) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

interface PricingSuggestion {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  marketingCopy: string;
  seoTags: string[];
  localMarketInsights: string;
}

/**
 * 1. AI Pricing & Marketing Copy Advisor
 * Suggests optimal competitive pricing structures for sellers based on category, name, and description.
 */
export async function getAIPriceSuggestions(
  productName: string,
  category: string,
  description: string
): Promise<{ success: boolean; data: PricingSuggestion }> {
  try {
    const cacheKey = `ai:price:${productName.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (redis) {
      const cached = await redis.get<PricingSuggestion>(cacheKey);
      if (cached) return { success: true, data: cached };
    }

    const genAI = getGenAIClient();
    
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are a premium Pricing and Marketing Consultant for "VendorHub", a hyperlocal multi-vendor e-commerce platform in India.
        Provide a smart competitive pricing structure and marketing package for a product with the following details:
        - Product Name: "${productName}"
        - Category: "${category}"
        - Description: "${description}"

        Respond ONLY with a valid JSON object matching the following structure (do not include any markdown fences or additional text):
        {
          "minPrice": number (suggested minimum price in USD),
          "maxPrice": number (suggested maximum price in USD),
          "recommendedPrice": number (suggested ideal retail price in USD),
          "marketingCopy": "A catchy, persuasive 2-sentence description highlighting local premium quality",
          "seoTags": ["array", "of", "4-5", "seo", "tags"],
          "localMarketInsights": "A 1-sentence analytical insight on demand patterns in Indian tech/organic hubs (e.g. Bangalore, Delhi, Srinagar, Mumbai)"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean potential JSON markdown wrapping
      const cleanedJson = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson) as PricingSuggestion;
      
      if (redis) await redis.set(cacheKey, parsed, { ex: 60 * 60 * 24 * 30 });

      return { success: true, data: parsed };
    }
  } catch (error) {
    console.error("Gemini Pricing Advisor API Error, falling back to local model:", error);
  }

  // --- Smart Fallback Logic ---
  let min = 15;
  let max = 60;
  let recommended = 35;
  let marketing = `Indulge in our exquisite, premium grade ${productName} sourced straight from artisanal local creators. Handpicked and packed under strict quality standards for your complete satisfaction.`;
  let tags = [category.toLowerCase(), "premium", "authentic", "local-hub"];
  let insights = `Hyperlocal hubs see a surge in demand for quality-tested items in the '${category}' category.`;

  // Tailored mock intelligence based on keywords
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("saffron") || nameLower.includes("kesar")) {
    min = 12;
    max = 28;
    recommended = 18;
    marketing = "Harvested from the scenic valleys of Srinagar, our Grade A++ pure Kashmiri Saffron brings rich aroma, vibrant color, and therapeutic health benefits to your everyday lifestyle.";
    tags = ["saffron", "kesar", "kashmir-organic", "groceries", "pure-spice"];
    insights = "Organic saffron demand remains robust across North India, especially during festive seasons and wedding months.";
  } else if (nameLower.includes("headphones") || nameLower.includes("audio") || nameLower.includes("speaker")) {
    min = 149;
    max = 299;
    recommended = 199;
    marketing = "Immerse yourself in pure studio-grade acoustics. Our Active Noise Cancellation headphones filter out local urban clamor, leaving you with breathtaking audio depth and rich bass.";
    tags = ["anc-headphones", "wireless-audio", "electronics", "gadgets", "work-from-home"];
    insights = "Electronics hubs in Bangalore and Pune report a 25% increase in searches for ergonomic personal audio setups.";
  } else if (nameLower.includes("chair") || nameLower.includes("desk") || nameLower.includes("table") || nameLower.includes("furniture")) {
    min = 180;
    max = 380;
    recommended = 249;
    marketing = "Revolutionize your work-from-home posture. Designed by ergonomic specialists, our solid oak study furniture blends sleek aesthetic craftsmanship with ultimate lumbar support.";
    tags = ["ergonomic-furniture", "wooden-desk", "premium-office", "decor", "home-makeover"];
    insights = "Modern corporate employees in Gurgaon and Mumbai show high purchase intents for workspace wellness items.";
  } else if (nameLower.includes("honey") || nameLower.includes("organic")) {
    min = 8;
    max = 22;
    recommended = 12;
    marketing = "Raw, unpasteurized forest honey extracted directly from the natural beehives of Mahabaleshwar. A spoonful of golden purity containing rich antioxidants.";
    tags = ["raw-honey", "organic-food", "western-ghats", "health", "natural-sweetener"];
    insights = "Health-conscious buyers are actively prioritizing single-origin, traceable organic grocery foods.";
  }

  return {
    success: true,
    data: {
      minPrice: min,
      maxPrice: max,
      recommendedPrice: recommended,
      marketingCopy: marketing,
      seoTags: tags,
      localMarketInsights: insights
    }
  };
}

interface AIRecommendation {
  recommendedProductIds: string[];
  recommendationReason: string;
  complementaryTitle: string;
  luxuryMessage: string;
}

/**
 * 2. AI Product Recommendation Engine
 * Recommends related items and generates dynamic persuasive messaging explaining why they pair well.
 */
export async function getAIRecommendations(
  activeProductId: string,
  activeProductName: string,
  activeCategory: string,
  allAvailableProducts: Array<{ id: string; name: string; category: string; price: number }>
): Promise<{ success: boolean; data: AIRecommendation }> {
  try {
    const cacheKey = `ai:recommendation:${activeProductId}`;
    if (redis) {
      const cached = await redis.get<AIRecommendation>(cacheKey);
      if (cached) return { success: true, data: cached };
    }

    const genAI = getGenAIClient();

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are the Smart AI Concierge for "VendorHub", a premium multi-vendor hyperlocal e-commerce platform.
        The buyer is currently viewing:
        - Product ID: "${activeProductId}"
        - Product Name: "${activeProductName}"
        - Category: "${activeCategory}"

        Available products in our catalog:
        ${JSON.stringify(allAvailableProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })))}

        Select exactly 1 or 2 available product IDs that would make the absolute best complementary purchase.
        For example:
        - If they view saffron/spices, recommend organic honey or pashmina shawl for luxury warmth.
        - If they view headphones/electronics, recommend mechanical keyboard or oak desk for workspace optimization.

        Respond ONLY with a valid JSON object matching the following structure:
        {
          "recommendedProductIds": ["id1", "id2"],
          "recommendationReason": "A 1-sentence explanation of why these products pair beautifully together.",
          "complementaryTitle": "A short, premium curation title (e.g. 'The Kashmiri Royals Set' or 'Tech Workspace Essentials')",
          "luxuryMessage": "A short, highly persuasive, high-end call to action motivating the buyer to add these to their cart."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedJson = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson) as AIRecommendation;

      if (redis) await redis.set(cacheKey, parsed, { ex: 60 * 60 * 24 * 30 });

      return { success: true, data: parsed };
    }
  } catch (error) {
    console.error("Gemini Recommendation Engine API Error, falling back to local:", error);
  }

  // --- Smart Fallback Recommendation Engine ---
  let recIds: string[] = [];
  let reason = "This item pairs beautifully with other premium selections in our hyperlocal catalog.";
  let title = "Completes the Premium Curation";
  let luxury = "Upgrade your collection now. These items represent the highest tier of artisanal craft and modern tech.";

  const nameLower = activeProductName.toLowerCase();

  // If buyer is viewing Kesar/Saffron
  if (nameLower.includes("saffron") || nameLower.includes("kesar")) {
    // Recommend Pashmina Shawl (p5) and Forest Honey (p6)
    recIds = ["p5", "p6"];
    title = "The Kashmiri Royals Set";
    reason = "Kashmiri saffron and organic wild forest honey create an authentic herbal wellness pair, while pashmina wraps you in warmth.";
    luxury = "Indulge in royal comfort. Adding these items crafts a perfect evening of warm saffron tea wrapped in natural cashmere luxury.";
  }
  // If buyer is viewing Pashmina Shawl
  else if (nameLower.includes("pashmina") || nameLower.includes("shawl")) {
    recIds = ["p2", "p6"];
    title = "Valley Wellness Collection";
    reason = "Complement your luxury cashmere shawl with premium grade Srinagar saffron and raw forest honey for complete comfort.";
    luxury = "Embrace the warmth of Kashmir. A premium combination designed to provide exquisite texture and organic luxury.";
  }
  // If buyer is viewing Headphones
  else if (nameLower.includes("headphones") || nameLower.includes("audio")) {
    recIds = ["p7", "p8"];
    title = "Ultimate Focus Workstation";
    reason = "Pair your studio-grade noise-cancelling headphones with an ergonomic oak desk and responsive gaming mechanical keyboard.";
    luxury = "Optimize your desk flow. Block out distractions and maximize typing comfort with this state-of-the-art office upgrade.";
  }
  // If buyer is viewing Keyboard
  else if (nameLower.includes("keyboard")) {
    recIds = ["p3", "p8"];
    title = "Premium Desktop Upgrade";
    reason = "Combine your tactile mechanical keyboard with a solid oak minimalist desk and active noise-cancelling headphones.";
    luxury = "Create your ideal work environment. Enjoy high-performance typing, distraction-free audio, and rich wooden textures.";
  }
  // Else default fallback matching by category
  else {
    const electronics = allAvailableProducts.filter(p => p.category === "Electronics" && p.id !== activeProductId);
    const groceries = allAvailableProducts.filter(p => p.category === "Groceries" && p.id !== activeProductId);
    
    if (activeCategory === "Electronics" && electronics.length > 0) {
      recIds = [electronics[0].id];
      title = "Smart Tech Accessories";
      reason = "Ensure complete compatibility by pairing your current choice with other electronics essentials in your zone.";
    } else if (activeCategory === "Groceries" && groceries.length > 0) {
      recIds = [groceries[0].id];
      title = "Gourmet Essentials Bundle";
      reason = "Enjoy pesticide-free organic wellness by adding companion grocery ingredients to your recipe.";
    } else {
      // General cross-category luxury recommendations
      recIds = ["p2", "p3"];
      title = "Trending Masterpieces";
      reason = "Add highly coveted gems from our local electronic hubs and authentic agricultural farms.";
    }
  }

  // Ensure recommended IDs actually exist in allAvailableProducts
  const validRecIds = recIds.filter(id => allAvailableProducts.some(p => p.id === id));
  
  return {
    success: true,
    data: {
      recommendedProductIds: validRecIds.length > 0 ? validRecIds : ["p2"],
      recommendationReason: reason,
      complementaryTitle: title,
      luxuryMessage: luxury
    }
  };
}

/**
 * 3. AI-Driven Fuzzy Search & Synonym Extender
 * Translates and expands buyer searches into relevant keywords using advanced LLM reasoning.
 */
export async function expandSearchQuery(
  query: string
): Promise<{ success: boolean; synonyms: string[] }> {
  try {
    const cacheKey = `ai:search:${query.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (redis) {
      const cached = await redis.get<string[]>(cacheKey);
      if (cached) return { success: true, synonyms: cached };
    }

    const genAI = getGenAIClient();

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are the Search Intelligence router for "VendorHub", a hyperlocal e-commerce store.
        The buyer searched for: "${query}"

        Expand this query by generating an array of potential synonyms, categories, and spelling variations in Indian context.
        E.g. If query is "kesar", return ["saffron", "kesar", "spices", "valley", "pure", "tea"].
        E.g. If query is "phone", return ["iphone", "mobile", "cell", "device", "pro max", "electronics"].
        E.g. If query is "warm", return ["pashmina", "shawl", "kesar", "saffron", "clothing", "srinagar"].

        Respond ONLY with a valid JSON array of strings (do not include markdown fences or additional details):
        ["synonym1", "synonym2", "synonym3", "synonym4"]
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedJson = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson) as string[];

      if (redis) await redis.set(cacheKey, parsed, { ex: 60 * 60 * 24 * 30 });

      return { success: true, synonyms: parsed };
    }
  } catch (error) {
    console.error("Gemini Search Query Expander Error, falling back to local:", error);
  }

  // --- Smart Local Synonym Map Fallback ---
  const SYNONYM_DICTIONARY: Record<string, string[]> = {
    phone: ["iphone", "mobile", "cell", "device", "smartphone", "handset"],
    iphone: ["phone", "mobile", "cell", "device", "smartphone", "handset"],
    earphone: ["earbuds", "headphones", "wireless", "audio", "sound"],
    earphones: ["earbuds", "headphones", "wireless", "audio", "sound"],
    earbud: ["earbuds", "earphones", "wireless", "audio", "sound"],
    earbuds: ["earbuds", "earphones", "wireless", "audio", "sound"],
    kesar: ["saffron", "spices", "pure", "organic", "srinagar"],
    saffron: ["kesar", "spices", "pure", "organic", "srinagar"],
    spices: ["saffron", "kesar", "organic", "pure"],
    audio: ["headphones", "earbuds", "wireless", "speaker", "noise cancelling", "anc"],
    headphone: ["audio", "wireless", "speaker", "headphones", "anc"],
    headphones: ["headphone", "audio", "wireless", "speaker", "anc"],
    chair: ["office", "furniture", "study", "ergonomic", "seat"],
    desk: ["table", "study", "wooden", "furniture", "oak"],
    table: ["desk", "study", "wooden", "furniture", "oak"],
    kashmir: ["pashmina", "shawl", "saffron", "kesar", "srinagar"],
    shawl: ["pashmina", "wool", "clothing", "wear", "cashmere"],
    pashmina: ["shawl", "wool", "clothing", "wear", "cashmere", "kashmir"],
    wear: ["clothing", "pashmina", "shawl", "apparel"],
    honey: ["organic", "sweet", "groceries", "pure"]
  };

  const queryLower = query.toLowerCase().trim();
  const matchedSynonyms: string[] = [];

  // Match direct keys and key prefixes
  for (const [key, syns] of Object.entries(SYNONYM_DICTIONARY)) {
    // Prevent "phone" key matching if the search term is "earphone" or "headphone"
    if (key === 'phone' && (queryLower.includes('earphone') || queryLower.includes('headphone'))) {
      continue;
    }
    if (key === 'iphone' && (queryLower.includes('earphone') || queryLower.includes('headphone'))) {
      continue;
    }

    if (queryLower.includes(key) || key.includes(queryLower)) {
      matchedSynonyms.push(...syns);
    }
  }

  // Deduplicate and return
  const uniqueSyns = Array.from(new Set(matchedSynonyms));
  return { 
    success: true, 
    synonyms: uniqueSyns.length > 0 ? uniqueSyns : [queryLower] 
  };
}

export interface RichProductDescription {
  highlights: string[];
  keyFeatures: Record<string, string>;
  detailedDescription: string;
  whatsInTheBox: string[];
  whyBuyThis: string;
}

/**
 * 4. AI-Driven Rich Product Descriptions
 * Generates an Amazon/Flipkart style detailed description.
 */
export async function generateRichDescription(
  name: string,
  category: string,
  price: number,
  shortDescription: string
): Promise<{ success: boolean; data: RichProductDescription }> {
  try {
    const cacheKey = `ai:desc:${name.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (redis) {
      const cached = await redis.get<RichProductDescription>(cacheKey);
      if (cached) return { success: true, data: cached };
    }

    const genAI = getGenAIClient();
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert e-commerce copywriter. Generate a rich, premium product description for an item with the following details:
        - Product Name: "${name}"
        - Category: "${category}"
        - Price: $${price}
        - Brief Info: "${shortDescription}"

        Produce a structured description that makes this product sound incredibly appealing, like a top-tier listing on Amazon or Flipkart.

        Respond ONLY with a valid JSON object matching the following structure (no markdown fences, just the JSON):
        {
          "highlights": ["4 to 6 punchy bullet points emphasizing the best features"],
          "keyFeatures": { "Feature 1 Name": "Feature 1 Value", "Feature 2 Name": "Feature 2 Value" },
          "detailedDescription": "A 2 to 3 paragraph persuasive, detailed overview of the product, its use cases, and premium quality (at least 150 words).",
          "whatsInTheBox": ["Item 1", "Item 2"],
          "whyBuyThis": "A strong, persuasive 2-sentence closing statement on why the user should buy this right now."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedJson = text.replace(/^\`\`\`json\\s*/i, "").replace(/\`\`\`$/, "").trim();
      const parsed = JSON.parse(cleanedJson) as RichProductDescription;

      if (redis) await redis.set(cacheKey, parsed, { ex: 60 * 60 * 24 * 30 });

      return { success: true, data: parsed };
    }
  } catch (error) {
    console.error("Gemini Rich Description API Error, falling back to local:", error);
  }

  // --- Fallback if no API key or error ---
  return {
    success: true,
    data: {
      highlights: [
        "Premium quality materials",
        "Expertly crafted for durability",
        "Modern and elegant design",
        "100% satisfaction guaranteed"
      ],
      keyFeatures: {
        "Brand": "VendorHub Originals",
        "Category": category,
        "Condition": "Brand New",
        "Quality": "Premium Grade"
      },
      detailedDescription: `Experience the finest quality with the ${name}. ${shortDescription} Designed to meet the highest standards, this product is the perfect blend of functionality and style. Whether you are using it daily or saving it for special occasions, it promises to deliver outstanding performance and reliability.\n\nOur commitment to excellence means you get a product that not only looks great but is built to last. Upgrade your lifestyle with this exceptional offering from our hyperlocal catalog.`,
      whatsInTheBox: [
        `1x ${name}`,
        "User Manual / Care Instructions",
        "Authenticity Certificate"
      ],
      whyBuyThis: "Don't miss out on this premium, highly-rated item. Add it to your cart now to experience true quality."
    }
  };
}
