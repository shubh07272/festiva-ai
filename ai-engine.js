/**
 * Festiva AI - Event Intelligence Engine
 * Integrates directly with Google Gemini Generative AI models
 * with a high-fidelity, mathematically consistent heuristic fallback engine.
 */

const AIEngine = {
  // Current active mode tracking
  activeMode: "intelligent-heuristic", // "gemini-live" or "intelligent-heuristic"
  lastError: null,

  getApiKey() {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("festiva_gemini_api_key") || "";
    }
    return process.env.GEMINI_API_KEY || "";
  },

  setApiKey(key) {
    if (typeof localStorage !== "undefined") {
      if (key && key.trim()) {
        localStorage.setItem("festiva_gemini_api_key", key.trim());
      } else {
        localStorage.removeItem("festiva_gemini_api_key");
      }
    }
  },

  /**
   * Main generation method.
   * Attempts Gemini API first (if key provided or backend proxy available),
   * falling back to the intelligent deterministic engine with transparent reporting.
   */
  async generateEventPlan(formData, onProgress) {
    if (onProgress) onProgress("Analyzing celebration parameters and priorities...", 20);

    const apiKey = this.getApiKey();

    // 1. Check if backend proxy or client-side Gemini key is present
    if (apiKey) {
      try {
        if (onProgress) onProgress("Connecting to Google Gemini Generative AI...", 40);
        const liveResult = await this.callGeminiApi(formData, apiKey, onProgress);
        this.activeMode = "gemini-live";
        return liveResult;
      } catch (err) {
        console.warn("Gemini API call failed, activating Intelligent Heuristic Engine:", err);
        this.lastError = err.message || "Gemini API unavailable";
      }
    }

    // Try backend proxy if available on localhost:3000
    try {
      if (onProgress) onProgress("Checking server AI connection...", 50);
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.concepts && data.budgetItems) {
          this.activeMode = "gemini-live";
          return data;
        }
      }
    } catch (e) {
      // Backend not running or not responding to API, continue to fallback
    }

    // 2. Intelligent Heuristic Engine (Deterministic & Hyper-personalized)
    if (onProgress) onProgress("Synthesizing concepts, budget allocations & timeline...", 75);
    await new Promise(r => setTimeout(r, 650)); // smooth visual feedback

    this.activeMode = "intelligent-heuristic";
    const result = this.synthesizeTailoredPlan(formData);
    if (onProgress) onProgress("Polishing vendor checklist and creative ideas...", 100);
    return result;
  },

  /**
   * Direct Google Gemini API caller
   */
  async callGeminiApi(formData, apiKey, onProgress) {
    const prompt = this.buildGeminiPrompt(formData);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty response from Gemini API");

    const parsed = JSON.parse(candidateText);
    return this.normalizeAndValidatePlan(parsed, formData);
  },

  buildGeminiPrompt(data) {
    return `You are Festiva AI, an elite event planner and celebration architect.
Generate a comprehensive, mathematically consistent, tailored event plan JSON based on the following input:

Event Type: ${data.type}
Event Name: ${data.name || 'Grand Celebration'}
Event Description: ${data.description || 'Special celebration'}
Date: ${data.date}
Location: ${data.location || 'Local Venue'}
Guests: ${data.guests}
Total Budget: ${data.budget} ${data.currency}
Style: ${data.style}
Theme/Palette: ${data.theme || 'Natural elegance'}
Venue Preference: ${data.venuePreference}
Catering Preference: ${data.cateringPreference}
Dietary & Accessibility: ${data.dietaryRestrictions || 'None'}
Cultural Traditions: ${data.culturalTraditions || 'None'}
Planning Priorities: ${data.planningPriorities}
Conditional Details: ${JSON.stringify(data.conditionalDetails || {})}

Return a valid JSON object strictly matching this schema:
{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Theme Title",
      "tagline": "Short evocative subtitle",
      "isRecommended": true,
      "description": "Rich 2-3 sentence concept overview",
      "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "paletteNames": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"],
      "decorStyle": "Specific decor recommendations",
      "lighting": "Lighting scheme and ambience",
      "venueStyling": "Layout and spatial architecture",
      "foodAndDrink": "Menu concepts and signature drinks",
      "entertainment": "Music and performance touches",
      "guestExperience": "Memorable touchpoints for attendees"
    }
    // exactly 3 concepts, one marked isRecommended: true matching user priorities
  ],
  "budgetItems": [
    {
      "id": "b1",
      "category": "Venue & Site",
      "allocated": 10000,
      "estimated": 9800,
      "actual": 0,
      "status": "pending",
      "vendor": "Target Venue",
      "notes": "Allocation details"
    }
    // Must include 7-9 categories including Contingency Reserve. The sum of allocated MUST EQUAL ${data.budget}
  ],
  "tasks": [
    {
      "id": "t1",
      "title": "Task title",
      "category": "Category",
      "deadline": "YYYY-MM-DD",
      "status": "pending",
      "priority": "High" | "Medium" | "Low",
      "owner": "Host" | "Planner" | "VIP",
      "notes": "Contextual tip"
    }
    // 12 to 16 chronological tasks relative to the event date ${data.date}
  ],
  "vendors": [
    {
      "id": "v1",
      "name": "Recommended Vendor Role / Placeholder",
      "category": "Service Category",
      "service": "Scope of service",
      "estimatedCost": 2500,
      "actualCost": 0,
      "depositPaid": 0,
      "balanceDue": 2500,
      "status": "Inquiry",
      "contactPerson": "TBD",
      "contactPhone": "",
      "contactEmail": "",
      "isVerified": false,
      "notes": "Target benchmark based on regional rates"
    }
  ],
  "ideas": [
    {
      "id": "i1",
      "category": "Decor" | "Catering" | "Favors" | "Entertainment" | "Photography" | "Guest Experience",
      "title": "Creative concept title",
      "description": "Detailed idea description",
      "whyItFits": "Why this aligns with user style and priorities",
      "tiers": {
        "affordable": "Budget-friendly option description with estimated cost",
        "balanced": "Optimal value mid-range option",
        "premium": "Elevated luxury option"
      },
      "tag": "Signature Touch"
    }
  ],
  "surpriseIdeas": [
    {
      "title": "Unexpected delight",
      "description": "Unique surprise touchpoint",
      "category": "Surprise Twist",
      "estimatedCost": "Approx price"
    }
  ]
}`;
  },

  normalizeAndValidatePlan(parsed, formData) {
    const budget = Number(formData.budget) || 10000;
    const currency = formData.currency || "USD";
    const currencySymbol = this.getCurrencySymbol(currency);

    // Validate budget math
    let budgetItems = parsed.budgetItems || [];
    let allocatedSum = budgetItems.reduce((acc, item) => acc + (Number(item.allocated) || 0), 0);
    
    // Auto-normalize if sum differs from user budget
    if (allocatedSum !== budget && budgetItems.length > 0) {
      const ratio = budget / allocatedSum;
      let newSum = 0;
      budgetItems.forEach((item, idx) => {
        if (idx === budgetItems.length - 1) {
          item.allocated = budget - newSum;
        } else {
          item.allocated = Math.round(item.allocated * ratio);
          newSum += item.allocated;
        }
        item.estimated = item.allocated;
        item.actual = item.actual || 0;
      });
    }

    return {
      id: "event-" + Date.now(),
      name: formData.name || `${formData.type} Celebration`,
      type: formData.type || "Custom Event",
      description: formData.description || "Personalized celebration planned with Festiva AI.",
      date: formData.date,
      location: formData.location || "Private Venue",
      guests: Number(formData.guests) || 50,
      budget: budget,
      currency: currency,
      currencySymbol: currencySymbol,
      style: formData.style || "Elegant",
      colorPalette: parsed.concepts?.[0]?.colorPalette || ["#C5A059", "#2D223B", "#FAF7F2", "#E26D5C", "#8B7355"],
      paletteNames: parsed.concepts?.[0]?.paletteNames || ["Gold", "Plum", "Ivory", "Coral", "Bronze"],
      venuePreference: formData.venuePreference || "Flexible",
      cateringPreference: formData.cateringPreference || "Buffet",
      dietaryRestrictions: formData.dietaryRestrictions || "None reported",
      culturalTraditions: formData.culturalTraditions || "",
      planningPriorities: formData.planningPriorities || "Guest Experience & Budget",
      conditionalDetails: formData.conditionalDetails || {},
      activeConceptId: parsed.concepts?.[0]?.id || "concept-1",
      concepts: parsed.concepts || [],
      budgetItems: budgetItems,
      tasks: parsed.tasks || [],
      vendors: parsed.vendors || [],
      ideas: parsed.ideas || [],
      surpriseIdeas: parsed.surpriseIdeas || [],
      guestsList: []
    };
  },

  /**
   * Deterministic High-Fidelity Synthesis Engine
   * Generates highly personalized, realistic, mathematically solid celebration plans.
   */
  synthesizeTailoredPlan(data) {
    const budget = Number(data.budget) || 20000;
    const guests = Number(data.guests) || 60;
    const eventType = data.type || "Wedding";
    const eventDate = data.date || this.getDefaultFutureDate(6);
    const currency = data.currency || "USD";
    const currencySymbol = this.getCurrencySymbol(currency);
    const style = data.style || "Elegant";
    const priorities = data.planningPriorities || "Guest Experience";
    const location = data.location || "City Venue";

    // 1. Concepts Generation
    const concepts = this.generateTailoredConcepts(eventType, style, priorities, location);

    // 2. Budget Allocations (Exact 100% distribution matching event type)
    const budgetItems = this.generateTailoredBudget(budget, eventType, guests);

    // 3. Execution Timeline (Chronologically anchored to eventDate)
    const tasks = this.generateTailoredTimeline(eventDate, eventType);

    // 4. Vendors Checklist
    const vendors = this.generateTailoredVendors(budgetItems, eventType);

    // 5. Creative Ideas (3 tiers for each)
    const ideas = this.generateTailoredIdeas(eventType, style, priorities, guests);
    const surpriseIdeas = this.generateSurpriseIdeas(eventType, style);

    return {
      id: "event-" + Date.now(),
      name: data.name || `${eventType} at ${location}`,
      type: eventType,
      description: data.description || `A thoughtfully planned ${eventType.toLowerCase()} blending ${style.toLowerCase()} styling with unforgettable guest hospitality.`,
      date: eventDate,
      location: location,
      guests: guests,
      budget: budget,
      currency: currency,
      currencySymbol: currencySymbol,
      style: style,
      colorPalette: concepts[0].colorPalette,
      paletteNames: concepts[0].paletteNames,
      venuePreference: data.venuePreference || "Indoor / Outdoor Blend",
      cateringPreference: data.cateringPreference || "Plated multicourse or signature food stations",
      dietaryRestrictions: data.dietaryRestrictions || "Vegetarian and allergen accommodations noted",
      culturalTraditions: data.culturalTraditions || "",
      planningPriorities: priorities,
      conditionalDetails: data.conditionalDetails || {},
      activeConceptId: concepts[0].id,
      concepts: concepts,
      budgetItems: budgetItems,
      tasks: tasks,
      vendors: vendors,
      ideas: ideas,
      surpriseIdeas: surpriseIdeas,
      guestsList: this.generateInitialGuestList(guests)
    };
  },

  generateTailoredConcepts(type, style, priorities, location) {
    const isPriorityAesthetics = priorities.includes("Aesthetics") || priorities.includes("Luxury");
    const isPriorityBudget = priorities.includes("Budget");
    const isOutdoor = style.includes("Outdoor") || style.includes("Rustic");

    if (type === "Wedding") {
      return [
        {
          id: "concept-1",
          name: "Luminous Botanical Romance",
          tagline: "Organic warmth meets understated fine-dining luxury",
          isRecommended: !isPriorityBudget,
          description: `Infused with garden florals, warm ivory textiles, and soft candlelight tailored for ${location}. Celebrates natural beauty with delicate modern touches.`,
          colorPalette: ["#4A5844", "#C5A059", "#FAF7F2", "#E8B4B8", "#2F2A32"],
          paletteNames: ["Sage Moss", "Champagne Gold", "Warm Ivory", "Dusty Peony", "Midnight Plum"],
          decorStyle: "Loose organic floral runners, tapered beeswax candles, brushed brass accents, and textured linen place settings.",
          lighting: "Warm 2400K hanging bistro festoons, amber tree uplighting, and low floating tea-lights across dining tables.",
          venueStyling: "Open-air banqueting with light wooden crossback chairs, floral welcome arch, and intimate lounge conversation vignettes.",
          foodAndDrink: "Four-course seasonal tasting menu, signature botanical gin spritz, and an interactive artisanal dessert display.",
          entertainment: "Acoustic duo for ceremony, modern swing trio for cocktail hour, and high-energy DJ with live percussion.",
          guestExperience: "Personalized calligraphy escort cards, welcome herb-infused refreshment upon arrival, and an audio guestbook phone."
        },
        {
          id: "concept-2",
          name: "Modern Architectural Elegance",
          tagline: "Striking minimalist forms and high-contrast editorial sophistication",
          isRecommended: isPriorityAesthetics,
          description: "Clean lines, sculptural monochrome floral displays, lucite accents, and sophisticated ambient lighting create a runway-worthy atmosphere.",
          colorPalette: ["#1B1D20", "#C8B29E", "#EAE6DF", "#947E69", "#FAF9F6"],
          paletteNames: ["Obsidian Slate", "Champagne Taupe", "Alabaster White", "Warm Bronze", "Pure Pearl"],
          decorStyle: "Ghost chairs, single-variety architectural floral plinths (anthuriums and calla lilies), polished marble tabletop accessories.",
          lighting: "Linear wash downlights, warm pin-spotting on florals, and a dynamic illuminated custom monogram dance floor.",
          venueStyling: "Monolithic ceremony altar framing the scenic backdrop, geometric bar with backlit frosted panels.",
          foodAndDrink: "Artisan plated gastronomy with modernist plating, craft smoked cocktail station, deconstructed tiered cake.",
          entertainment: "Ambient electric harpist sunset set transitioning into a curated deep house and disco vinyl DJ.",
          guestExperience: "Custom fragrance bar for personalized perfume favors, minimalist photo studio with editorial portrait photographer."
        },
        {
          id: "concept-3",
          name: "Intimate Heritage & Earthy Bohemian",
          tagline: "Soulful warmth, handcrafted textures, and heartfelt community",
          isRecommended: isPriorityBudget,
          description: "A relaxed yet elevated celebration emphasizing artisan ceramics, terracotta accents, natural fiber textures, and authentic cultural hospitality.",
          colorPalette: ["#A35D40", "#DDA77B", "#5C6B52", "#EFE6DD", "#432D28"],
          paletteNames: ["Terracotta", "Warm Ochre", "Olive Branch", "Cream Canvas", "Deep Walnut"],
          decorStyle: "Handmade ceramic bud vases, macramé and woven fiber pendants, rattan seating corners, wild greenery runners.",
          lighting: "Woven basket pendant lights, hurricane glass lanterns along walkways, warm bonfire fire-pit lounge.",
          venueStyling: "U-shaped communal dining, raw wood tables without heavy tablecloths, Moroccan floor pouf conversation lounge.",
          foodAndDrink: "Family-style sharing platters, wood-fired seasonal roasts, craft beer tasting flight, and mini churros / cannoli station.",
          entertainment: "Indie folk acoustic band with violin and acoustic guitar, interactive guest campfire singalong.",
          guestExperience: "Potted succulent favors with handwritten thank-you flags, Polaroid guestbook clothesline."
        }
      ];
    } else if (type === "Corporate Event") {
      return [
        {
          id: "concept-1",
          name: "Forward Horizon Summit",
          tagline: "Sleek, visionary, and hyper-engaging professional forum",
          isRecommended: true,
          description: "A crisp executive aesthetic designed to foster breakthrough ideas, seamless networking, and memorable brand prestige.",
          colorPalette: ["#0F2027", "#203A43", "#2C5364", "#00B4D8", "#F8F9FA"],
          paletteNames: ["Deep Navy", "Midnight Teal", "Steel Blue", "Electric Cyan", "Crisp White"],
          decorStyle: "Branded LED light batons, matte black presentation plinths, modular executive lounge pods.",
          lighting: "Stage lighting with intelligent beam fixtures, branded gobo projections, comfortable warm conference glow.",
          venueStyling: "Keynote theater setup transitioning smoothly to high-top networking cocktail layout.",
          foodAndDrink: "Artisanal bento lunch boxes, barista-served specialty coffee bar, evening craft beer & wine networking reception.",
          entertainment: "Inspiring opening keynote MC, tech-infused digital violinist, ambient networking DJ.",
          guestExperience: "Digital NFC tap badges, interactive live polling screens, curated premium swag tech kit."
        },
        {
          id: "concept-2",
          name: "Collaborative Innovation Greenhouse",
          tagline: "Natural biophilic design inspiring creative human connection",
          isRecommended: false,
          description: "Integrating lush live foliage, natural oak, and sustainable materials to create a stimulating, human-centered retreat environment.",
          colorPalette: ["#2D4A3E", "#E2D9C8", "#87986A", "#533A27", "#FFFFFF"],
          paletteNames: ["Forest Spruce", "Birch Ivory", "Moss Green", "Smoked Walnut", "Pure White"],
          decorStyle: "Living plant wall backdrop, sustainable bamboo furniture, recycled paper stationery.",
          lighting: "Sunlight-mimicking circadian daylight fixtures with warm dusk evening transition.",
          venueStyling: "Open campfire seating circles, mobile whiteboards, quiet reflection pod nooks.",
          foodAndDrink: "Zero-waste organic grain bowls, fresh-pressed wellness juices, farm-fresh evening grazing tables.",
          entertainment: "Facilitated design sprint workshops, acoustic instrumental background soundscape.",
          guestExperience: "Adopt-a-plant desk favor, interactive ideation sticky-note mural wall."
        },
        {
          id: "concept-3",
          name: "Gala Luminance Black Tie",
          tagline: "Prestigious recognition and high-octane celebration",
          isRecommended: false,
          description: "An opulent corporate gala celebrating company milestones, outstanding contributors, and industry leadership with red carpet flair.",
          colorPalette: ["#141414", "#C5A059", "#3A3A3A", "#FAF8F5", "#8C1D40"],
          paletteNames: ["Tuxedo Black", "Gala Gold", "Graphite", "Warm Ivory", "Presidential Crimson"],
          decorStyle: "Gold mirrored tables, dramatic crystal candelabras, velvet stanchions and red carpet entry.",
          lighting: "Chandelier focal points, pinspot lighting on award trophies, dramatic spotlights for winners.",
          venueStyling: "Round banquet tables of 10 with clear sightlines to the main gala stage.",
          foodAndDrink: "Three-course plated filet and sea bass dinner, champagne toasts, dessert parade.",
          entertainment: "Professional celebrity MC, 8-piece big band orchestra, post-awards DJ dance party.",
          guestExperience: "Custom engraved crystal award trophies, step-and-repeat celebrity photo wall with instant prints."
        }
      ];
    } else {
      // Birthday, Anniversary, Festival, Baby Shower, Custom
      return [
        {
          id: "concept-1",
          name: `The Golden Horizon ${type}`,
          tagline: "Joyful celebration, radiant light, and effortless conviviality",
          isRecommended: true,
          description: `A masterfully styled ${type.toLowerCase()} highlighting warmth, personalized touches, and high-energy joy tailored to ${location}.`,
          colorPalette: ["#C5A059", "#E26D5C", "#FAF7F2", "#2B213A", "#88A096"],
          paletteNames: ["Champagne Gold", "Fiesta Coral", "Alabaster", "Royal Indigo", "Soft Sage"],
          decorStyle: "Layered textured linens, organic florals, personalized signage, and chic statement bar.",
          lighting: "Warm festoon canopy, twinkling micro-fairy walls, candlelit tabletops.",
          venueStyling: "Comfortable lounge clusters, central dance/activity floor, cocktail welcome terrace.",
          foodAndDrink: "Curated grazing antipasti boards, interactive food stations, custom signature cocktails.",
          entertainment: "Live musician acoustic set evolving into a dynamic crowd-favorite DJ playlist.",
          guestExperience: "Custom interactive guestbook, personalized takeaway treats, instant polaroid prints."
        },
        {
          id: "concept-2",
          name: `Midnight Velvet & Neon Glam`,
          tagline: "Bold, modern, immersive, and unforgettable",
          isRecommended: false,
          description: `High-vibe night-out energy featuring custom neon typography, moody ambient tones, and immersive experiential corners.`,
          colorPalette: ["#120D1C", "#FF007F", "#3A0CA3", "#4CC9F0", "#F7F7F7"],
          paletteNames: ["Midnight Shadow", "Electric Pink", "Royal Velvet", "Cyan Neon", "Strobe White"],
          decorStyle: "Custom neon quote signs, black velvet drapery, metallic fringe photo backdrops, geometric high-tops.",
          lighting: "Neon glow, blacklight reactive accents, programmable color washes synchronized to music.",
          venueStyling: "Nightclub lounge VIP booth seating with bottle service presentation, illuminated cocktail bar.",
          foodAndDrink: "Passed gourmet sliders and dim sum, nitrogen molecular cocktails, glowing dessert shots.",
          entertainment: "High-octane club DJ, laser lighting show, live LED bongo/percussion performer.",
          guestExperience: "Glitter & tattoo vanity station, 360-degree slow-motion video booth."
        },
        {
          id: "concept-3",
          name: `Sun-Drenched Garden & Meadow Picnic`,
          tagline: "Breezy daytime charm, natural florals, and carefree laughter",
          isRecommended: false,
          description: "Relaxed open-air celebration among flowers, woven picnic blankets, parasols, and farm-fresh refreshing food.",
          colorPalette: ["#556B2F", "#F4A261", "#E76F51", "#2A9D8F", "#FFFDF9"],
          paletteNames: ["Olive Green", "Apricot Peach", "Terracotta Rose", "Deep Teal", "Sunlit Linen"],
          decorStyle: "Low picnic tables with plush cushions, vintage gingham and floral patterns, wild daisy centerpieces.",
          lighting: "Natural dappled golden sunlight, paper lanterns in tree branches for twilight.",
          venueStyling: "Garden lawn games area, shade umbrellas, chilled beverage buckets nestled in wooden carts.",
          foodAndDrink: "Artisanal sandwich boards, chilled seasonal fruit skewers, lemonade and prosecco punch.",
          entertainment: "Acoustic guitarist playing sunshine indie acoustic hits, lawn games tournament.",
          guestExperience: "Custom woven sun hats or fans, flower crown crafting station, seed packet favors."
        }
      ];
    }
  },

  generateTailoredBudget(budget, type, guests) {
    const templates = (typeof window !== "undefined" && window.EVENT_TEMPLATES) 
      ? window.EVENT_TEMPLATES 
      : ((typeof require !== "undefined") ? require("./demo-data.js").EVENT_TEMPLATES : {});

    const template = (templates && templates[type]) 
      ? templates[type].defaultBudgetRatio
      : {
          "Venue & Space": 0.26,
          "Catering & Bar": 0.34,
          "Decor & Styling": 0.12,
          "Photography & Media": 0.10,
          "Music & Entertainment": 0.08,
          "Invitations & Favors": 0.04,
          "Contingency Reserve (6%)": 0.06
        };

    const keys = Object.keys(template);
    let remainingBudget = budget;
    const items = [];

    keys.forEach((cat, index) => {
      let allocated;
      if (index === keys.length - 1) {
        // Guarantee mathematically exact sum matching budget
        allocated = remainingBudget;
      } else {
        allocated = Math.round(budget * template[cat]);
        remainingBudget -= allocated;
      }

      // Sensible estimate slightly lower or equal to give headroom
      const estimated = Math.round(allocated * (cat.includes("Contingency") ? 0.8 : 0.98));

      items.push({
        id: `b-${index + 1}`,
        category: cat,
        allocated: allocated,
        estimated: estimated,
        actual: 0,
        status: "pending",
        vendor: cat.includes("Contingency") ? "Safety Reserve Fund" : `Target ${cat} Specialist`,
        notes: cat.includes("Contingency") 
          ? "Reserved for unexpected changes or price fluctuations" 
          : `Target allocation for ${guests} attendees`
      });
    });

    return items;
  },

  generateTailoredTimeline(eventDateStr, type) {
    const eventDate = new Date(eventDateStr);
    const now = new Date();
    const diffDays = Math.max(14, Math.round((eventDate - now) / (1000 * 60 * 60 * 24)));

    // Standard milestone intervals relative to event date
    const milestoneOffsets = [
      { pct: 0.90, title: "Lock core vision, budget & guest list ceiling", category: "Strategy", priority: "High", owner: "Host" },
      { pct: 0.80, title: "Tour, select & sign anchor venue contract", category: "Venue", priority: "High", owner: "Host" },
      { pct: 0.70, title: "Select & book primary caterer / bar package", category: "Catering", priority: "High", owner: "Host" },
      { pct: 0.60, title: "Book lead photographer / media team", category: "Media", priority: "High", owner: "Host" },
      { pct: 0.50, title: "Send formal invitations & launch digital RSVP", category: "Invitations", priority: "High", owner: "Host" },
      { pct: 0.40, title: "Finalize decor concept, florals & lighting rental", category: "Decor", priority: "Medium", owner: "Planner" },
      { pct: 0.30, title: "Book entertainment, DJ / band & sound system", category: "Entertainment", priority: "Medium", owner: "Host" },
      { pct: 0.20, title: "Order favors, custom signage & guest gifts", category: "Stationery", priority: "Low", owner: "Host" },
      { pct: 0.12, title: "Collect remaining RSVPs & compile dietary counts", category: "Guests", priority: "High", owner: "Host" },
      { pct: 0.07, title: "Submit final headcount to caterer and venue", category: "Catering", priority: "High", owner: "Host" },
      { pct: 0.04, title: "Walkthrough venue with day-of coordinator", category: "Logistics", priority: "High", owner: "Coordinator" },
      { pct: 0.02, title: "Prepare final vendor balance payments & tip envelopes", category: "Budget", priority: "Medium", owner: "Host" },
      { pct: 0.00, title: "CELEBRATION DAY: Setup, execution & unforgettable memories!", category: "Day-Of", priority: "High", owner: "All" },
      { pct: -0.05, title: "Settle remaining bills, return rentals & send thank-yous", category: "Post-Event", priority: "Medium", owner: "Host" }
    ];

    return milestoneOffsets.map((m, idx) => {
      const daysFromNow = Math.round(diffDays * (1 - m.pct));
      const taskDate = new Date(eventDate.getTime() - (daysFromNow * 24 * 60 * 60 * 1000));
      const formattedDate = taskDate.toISOString().split("T")[0];

      return {
        id: `t-${idx + 1}`,
        title: m.title,
        category: m.category,
        deadline: formattedDate,
        status: idx === 0 ? "completed" : (idx === 1 ? "in-progress" : "pending"),
        priority: m.priority,
        owner: m.owner,
        notes: `Milestone scheduled ${Math.abs(daysFromNow)} days ${daysFromNow >= 0 ? "prior to" : "after"} event.`
      };
    });
  },

  generateTailoredVendors(budgetItems, type) {
    const vendorTemplates = [
      { category: "Venue & Site", service: "Primary event hall, lawn, or estate space rental", estRatio: 0.25 },
      { category: "Catering & Bar", service: "Full dining experience, beverage service, and service staff", estRatio: 0.32 },
      { category: "Decor & Florals", service: "Centerpieces, stage backdrop, bouquets, and table styling", estRatio: 0.12 },
      { category: "Photography & Media", service: "Full-day professional photography & video recap", estRatio: 0.10 },
      { category: "Entertainment & DJ", service: "Sound equipment, microphones, master of ceremonies, and DJ", estRatio: 0.08 },
      { category: "Stationery & Invitations", service: "Custom printed suites, menu cards, and digital design", estRatio: 0.03 },
      { category: "Logistics & Rentals", service: "Chairs, specialty linens, lighting, and transport", estRatio: 0.05 }
    ];

    return vendorTemplates.map((v, i) => {
      // Find matching budget item for realistic cost target
      const match = budgetItems.find(b => b.category.toLowerCase().includes(v.category.split(" ")[0].toLowerCase())) || budgetItems[i] || budgetItems[0];
      const cost = match ? match.allocated : 2000;

      return {
        id: `v-${i + 1}`,
        name: `${v.category.split("&")[0].trim()} Specialist (AI Target Benchmark)`,
        category: v.category,
        service: v.service,
        estimatedCost: cost,
        actualCost: 0,
        depositPaid: 0,
        balanceDue: cost,
        status: i === 0 ? "Shortlisted" : "Inquiry",
        contactPerson: "Recommended Inquiry",
        contactPhone: "",
        contactEmail: "",
        isVerified: false,
        notes: "Benchmark estimate based on your allocated budget category."
      };
    });
  },

  generateTailoredIdeas(type, style, priorities, guests) {
    return [
      {
        id: "idea-1",
        category: "Decor & Atmosphere",
        title: "Ambient Micro-Lighting & Overhead Canopy",
        description: "Transform the venue with warm fairy light curtains and suspended bistro bulbs that draw the eye up and create an intimate cocoon effect regardless of ceiling height.",
        whyItFits: `Directly complements your ${style} theme and delivers high photographic impact at any budget.`,
        tiers: {
          affordable: "DIY plug-in LED fairy curtains behind sheer white drapery ($120)",
          balanced: "Professional warm 2400K festoon canopy installed with dimmer switch ($450) (Recommended)",
          premium: "Custom chandelier and suspended greenery floral installation with smart DMX control ($1,800)"
        },
        tag: "Atmosphere Anchor"
      },
      {
        id: "idea-2",
        category: "Catering & Refreshments",
        title: "Signature Welcome Cocktail & Mocktail Pairing",
        description: "Greet each guest at the entrance with a customized glass reflecting your celebration story (e.g. rosemary-grapefruit spritz or blackberry elderflower fizz).",
        whyItFits: "Immediately immerses guests into the celebration spirit the moment they cross the threshold.",
        tiers: {
          affordable: "Pre-batched sangria and sparkling flavored mocktails in glass beverage dispensers ($90)",
          balanced: "Dedicated welcome bar with two curated signature cocktails and crystal glassware ($380) (Recommended)",
          premium: "Live flair mixologist with dry-ice smoke and personalized branded ice spheres ($950)"
        },
        tag: "Welcome Ritual"
      },
      {
        id: "idea-3",
        category: "Favors & Keepsakes",
        title: "Artisanal Consumable Keepsakes",
        description: "Give gifts guests will actually love and use: mini jars of local wildflower honey, custom roasted coffee beans, or infused olive oils labeled with your celebration date.",
        whyItFits: "Eliminates disposable plastic waste while supporting local craft producers.",
        tiers: {
          affordable: "DIY burlap-wrapped wildflower seed packets with thank-you tags ($1.20/guest)",
          balanced: "Locally sourced honey or olive oil bottles with custom vinyl labels ($4.50/guest) (Recommended)",
          premium: "Handmade ceramic pinch pots with artisan truffle salt or bespoke tea blend ($11/guest)"
        },
        tag: "Sustainable Favor"
      },
      {
        id: "idea-4",
        category: "Entertainment & Connection",
        title: "Interactive Storytelling Video / Audio Station",
        description: "Give guests an effortless, creative way to record heartfelt memories and candid wishes throughout the evening.",
        whyItFits: `Celebrates the ${guests} attendees who made the journey to be there with you.`,
        tiers: {
          affordable: "QR code on tables linking to a shared digital photo/video drop folder ($0)",
          balanced: "Vintage rotary phone audio guestbook with automated audio compiler ($250) (Recommended)",
          premium: "Slow-motion 360-degree video booth with on-site attendant and instant AirDrop sharing ($750)"
        },
        tag: "Memory Maker"
      },
      {
        id: "idea-5",
        category: "Photography & Moments",
        title: "Golden Hour Choreographed Group Portrait",
        description: "Schedule a dedicated 10-minute window just before twilight to gather all attendees for an epic group celebration portrait.",
        whyItFits: "Produces the single photo you will frame forever showing everyone united together.",
        tiers: {
          affordable: "Designated friend with tripod and wide-angle lens at 6:30 PM ($0)",
          balanced: "Lead photographer wide-shot from second-floor balcony or elevated ladder ($0 - in package) (Recommended)",
          premium: "Aerial drone cinematic 4K video sweep revealing the venue landscape ($350)"
        },
        tag: "Hero Photograph"
      },
      {
        id: "idea-6",
        category: "Late Night Treat",
        title: "Surprise Midnight Comfort Food Parade",
        description: "Just when dancing reaches its peak, bring out trays of miniature hot comfort bites: gourmet sliders, warm churros, or artisanal pizza slices.",
        whyItFits: "Refuels dancers, keeps the party energy alive, and leaves guests raving on their way out.",
        tiers: {
          affordable: "Ordered boxes of local hot bakery donuts or soft pretzels ($150)",
          balanced: "Caterer-prepared mini gourmet sliders and truffle fry cones ($400) (Recommended)",
          premium: "Mobile gourmet food truck pull-up (taco truck or wood-fired pizza oven) ($1,100)"
        },
        tag: "Crowd Pleaser"
      }
    ];
  },

  generateSurpriseIdeas(type, style) {
    return [
      {
        title: "Champagne Tower Spectacular",
        description: "A glamorous 5-tier coupe glass pyramid poured live during the main toast, illuminated with warm floor spotlights.",
        category: "Toast Highlight",
        estimatedCost: "$180 - $350"
      },
      {
        title: "Surprise Live Flash Saxophone Soloist",
        description: "During the peak dance track, a saxophonist emerges directly onto the center of the dance floor playing along with the DJ.",
        category: "Dancefloor Energy",
        estimatedCost: "$350 - $600"
      },
      {
        title: "Customized Late-Night Snack Brown Paper Bags",
        description: "Warm cookies or hand-held savory pasties packed in custom-stamped brown paper bags for guests as they board shuttles or leave.",
        category: "Farewell Touch",
        estimatedCost: "$120 - $220"
      }
    ];
  },

  generateInitialGuestList(count) {
    const sampleNames = [
      { name: "Sarah & David Miller", group: "Family", count: 2, dietary: "None", notes: "VIP Table" },
      { name: "Michael Chang", group: "VIP", count: 1, dietary: "Vegetarian", notes: "Speaker / Toast" },
      { name: "Emily & James Thornton", group: "Friends", count: 2, dietary: "Gluten-Free", notes: "Table 2" },
      { name: "Robert Harrison", group: "Colleagues", count: 1, dietary: "None", notes: "Table 3" },
      { name: "Priya & Arjun Nair", group: "Friends", count: 2, dietary: "Nut Allergy", notes: "Table 2" }
    ];

    return sampleNames.map((g, idx) => ({
      id: `g-${idx + 1}`,
      name: g.name,
      group: g.group,
      rsvp: idx < 3 ? "attending" : (idx === 3 ? "declined" : "pending"),
      count: g.count,
      dietary: g.dietary,
      notes: g.notes
    }));
  },

  getCurrencySymbol(curr) {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      CAD: "CA$",
      AUD: "AU$",
      SGD: "S$",
      JPY: "¥"
    };
    return symbols[curr] || "$";
  },

  getDefaultFutureDate(monthsAhead) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split("T")[0];
  }
};

if (typeof window !== "undefined") {
  window.AIEngine = AIEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AIEngine };
}
