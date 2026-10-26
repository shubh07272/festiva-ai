/**
 * Festiva AI - Demo Data & Template Presets
 * Provides comprehensive demo data and initial event templates.
 */

const DEMO_EVENT = {
  id: "demo-event-tuscan-wedding",
  name: "Sophia & Liam's Tuscan Vineyard Wedding",
  type: "Wedding",
  description: "An intimate, romantic celebration bathed in golden hour light among rolling olive groves and vineyard rows, blending rustic Italian warmth with modern refined elegance.",
  date: "2027-06-20",
  location: "Villa Bella Vista, Montalcino, Tuscany (or Napa Valley)",
  guests: 110,
  budget: 45000,
  currency: "USD",
  currencySymbol: "$",
  style: "Romantic Rustic & Elegant",
  colorPalette: ["#2C3E2D", "#C5A059", "#FAF7F2", "#D48C70", "#4A2E35"],
  paletteNames: ["Olive Leaf", "Champagne Gold", "Warm Alabaster", "Terracotta Rose", "Deep Chianti"],
  venuePreference: "Outdoor with covered backup",
  cateringPreference: "Farm-to-table Italian banquet with wine pairing and wood-fired artisanal pizza late-night",
  dietaryRestrictions: "Vegetarian (14), Gluten-Free (6), Vegan (3), Nut Allergies (2)",
  culturalTraditions: "Italian Millefoglie live cake assembly, Tuscan wine toast, acoustic string quartet ceremony",
  planningPriorities: "Guest Experience, Aesthetics, Food & Wine",
  conditionalDetails: {
    ceremonyType: "Sunset vineyard vows overlooking valley",
    receptionFormat: "Al fresco long banqueting tables under fairy lights",
    bridalPartySize: 8,
    floralScale: "Abundant olive greenery, terracotta urns, blush garden roses"
  },
  activeConceptId: "concept-1",
  concepts: [
    {
      id: "concept-1",
      name: "Tuscan Sun & Olive Grove Romance",
      tagline: "Rustic authenticity meets timeless editorial elegance",
      isRecommended: true,
      description: "Celebrate among fragrant olive branches, warm travertine stone, and vintage amber glassware. Long communal banquet tables draped in natural linen under canopy string lights bring everyone together for a relaxed feast.",
      colorPalette: ["#2C3E2D", "#C5A059", "#FAF7F2", "#D48C70", "#4A2E35"],
      paletteNames: ["Olive Leaf", "Champagne Gold", "Warm Alabaster", "Terracotta Rose", "Deep Chianti"],
      decorStyle: "Weathered terracotta pots, cascading olive foliage, tapered beeswax candles in brass holders, natural Belgian linen runners.",
      lighting: "Warm 2200K festoon bistro lighting crisscrossing courtyard, clustered pillar candle lanterns on stone steps, golden uplighting on cypress trees.",
      venueStyling: "U-shaped long imperial banqueting layout, custom carved wooden bar with monogrammed copper ice buckets, outdoor lounge with vintage leather sofas.",
      foodAndDrink: "Four-course seasonal antipasti and handmade pasta, local Chianti Classico wine pairings, live show-cooked Millefoglie dessert station with fresh berries.",
      entertainment: "Acoustic cello & violin duo during ceremony, 6-piece jazz-swing ensemble for cocktails, indie-pop DJ with live saxophonist for dancing.",
      guestExperience: "Custom welcome tote with artisanal olive oil vial, rosemary-scented cold towels upon arrival, Polaroid photo wall with custom calligraphy cards."
    },
    {
      id: "concept-2",
      name: "Ethereal Modern Vineyard Minimalist",
      tagline: "Clean architectural lines in harmony with organic nature",
      isRecommended: false,
      description: "A contemporary high-fashion interpretation with lucite chairs, sculptural floral arrangements with zero filler, monolithic limestone plinths, and a sleek monochromatic champagne palette.",
      colorPalette: ["#1F1F1F", "#E6DFD5", "#C8B29E", "#949B96", "#FAF8F5"],
      paletteNames: ["Charcoal Slate", "Chalk White", "Warm Greige", "Muted Sage", "Milk Glass"],
      decorStyle: "Ghost chairs, minimalist single-stem calla lilies and anthuriums, matte ceramic tableware, clean modern sans-serif typography.",
      lighting: "Architectural line illumination, micro-fairy star wash, subtle uplit architectural arches, modern floating glass orb fixtures.",
      venueStyling: "Minimalist mirrored ceremony altar framing the horizon, sleek black steel frame bar, polished concrete lounge tables.",
      foodAndDrink: "Plated contemporary gastronomy, deconstructed Mediterranean classics, craft cocktail bar with smoke-infused bourbon and botanical spritzes.",
      entertainment: "Ambient electronic harpist during sunset aperitivo, curated vinyl DJ spinning deep disco and modern funk.",
      guestExperience: "Interactive mixology scent station, personalized engraved marble coaster favors, audio guestbook inside a sleek vintage rotary phone."
    },
    {
      id: "concept-3",
      name: "Celestial Twilight Renaissance",
      tagline: "Dramatic romance under a star-dappled Tuscan sky",
      isRecommended: false,
      description: "Rich, brooding romantic luxury inspired by old-world Renaissance artistry. Deep plum velvet accents, cascading dark dahlias, gilded antique mirrors, and a late-night candlelit courtyard waltz.",
      colorPalette: ["#2A1828", "#8B263E", "#D4AF37", "#2D4030", "#F5EBE1"],
      paletteNames: ["Midnight Plum", "Barolo Wine", "Aged Leaf Gold", "Forest Cypress", "Parchment"],
      decorStyle: "Heavy textured velvet drapery, ornate gilded candelabras, fruit still-life centerpieces with figs and pomegranates, hand-torn deckle-edge paper menus.",
      lighting: "Over 400 floating glass tea-lights, low dramatic amber spotlights, projected star constellations on ceiling/canopy.",
      venueStyling: "Intimate circular ceremony seating, velvet tufted salon seating vignettes, decadent charcuterie and cheese credenza.",
      foodAndDrink: "Braised osso buco with saffron risotto, decadent dark chocolate tortes, vintage Amaro digestif cart wheeled table to table.",
      entertainment: "Classical chamber quartet performing modern cinematic orchestral arrangements (Bridgerton style), followed by an electric violinist with DJ.",
      guestExperience: "Live watercolor portrait artist painting 5-minute guest mini-portraits, wax-sealed handwritten thank-you notes at each place setting."
    }
  ],
  budgetItems: [
    { id: "b1", category: "Venue & Permits", allocated: 11250, estimated: 11000, actual: 11000, status: "booked", vendor: "Villa Bella Vista", notes: "Includes 2 nights lodging for immediate family" },
    { id: "b2", category: "Catering & Bar", allocated: 14400, estimated: 14500, actual: 14200, status: "booked", vendor: "Tuscan Harvest Caterers", notes: "$110/guest + $20/guest full bar package" },
    { id: "b3", category: "Decor & Floral Design", allocated: 5400, estimated: 5600, actual: 5200, status: "booked", vendor: "Fiori & Foglie Florals", notes: "Olive greenery runners, ceremony arch, bridal bouquet" },
    { id: "b4", category: "Photography & Videography", allocated: 4500, estimated: 4500, actual: 4500, status: "booked", vendor: "Lumiere Fine Art Studios", notes: "8-hr photo + 6-hr video + aerial drone coverage" },
    { id: "b5", category: "Entertainment & Music", allocated: 3150, estimated: 3200, actual: 3000, status: "booked", vendor: "Florence Swing & DJ Collective", notes: "Acoustic duo for ceremony + DJ + sax for reception" },
    { id: "b6", category: "Stationery & Invitations", allocated: 900, estimated: 850, actual: 780, status: "completed", vendor: "Artisan Press Studio", notes: "Handmade paper invites, wax seal, day-of signage" },
    { id: "b7", category: "Attire & Beauty", allocated: 1800, estimated: 2000, actual: 1850, status: "completed", vendor: "Bella Sposa Glam Team", notes: "Hair & makeup for bride + 3 bridesmaids" },
    { id: "b8", category: "Transportation & Shuttles", allocated: 1350, estimated: 1350, actual: 1200, status: "booked", vendor: "Chiantishire Coaches", notes: "2 Mercedes Sprinter shuttles from Florence center" },
    { id: "b9", category: "Contingency & Reserve (5%)", allocated: 2250, estimated: 2000, actual: 400, status: "pending", vendor: "Reserve Fund", notes: "Safe buffer for currency fluctuations & last minute additions" }
  ],
  tasks: [
    { id: "t1", title: "Finalize venue contract & deposit", category: "Venue", deadline: "2026-09-01", status: "completed", priority: "High", owner: "Julian", notes: "50% deposit paid; insurance rider submitted" },
    { id: "t2", title: "Hire photographer & schedule engagement shoot", category: "Photography", deadline: "2026-09-15", status: "completed", priority: "High", owner: "Sophia", notes: "Lumiere Studios confirmed" },
    { id: "t3", title: "Send digital Save the Dates to all 110 guests", category: "Invitations", deadline: "2026-10-01", status: "completed", priority: "Medium", owner: "Sophia", notes: "Sent via email + luxury paper to grandparents" },
    { id: "t4", title: "Tasting session with Tuscan Harvest Caterers", category: "Catering", deadline: "2026-10-15", status: "completed", priority: "High", owner: "Sophia & Julian", notes: "Selected truffle tagliolini and wild sea bass" },
    { id: "t5", title: "Confirm guest transportation shuttles", category: "Logistics", deadline: "2026-11-20", status: "completed", priority: "Medium", owner: "Julian", notes: "2 shuttles booked from central Siena & Florence" },
    { id: "t6", title: "Mail formal physical invitation suites with RSVP link", category: "Invitations", deadline: "2026-12-05", status: "completed", priority: "High", owner: "Sophia", notes: "RSVP deadline set to August 1st" },
    { id: "t7", title: "Select & purchase wedding bands", category: "Attire", deadline: "2027-01-15", status: "completed", priority: "Medium", owner: "Julian", notes: "Hammered rose gold & brushed platinum" },
    { id: "t8", title: "Finalize floral mockup and table runner dimensions", category: "Decor", deadline: "2027-02-10", status: "completed", priority: "High", owner: "Sophia", notes: "Review mock photos with Fiori & Foglie" },
    { id: "t9", title: "Collect all remaining RSVPs and dietary counts", category: "Guests", deadline: "2027-03-01", status: "completed", priority: "High", owner: "Sophia", notes: "92 confirmed attending, 6 declined" },
    { id: "t10", title: "Draft day-of minute-by-minute timeline with DJ & Coordinator", category: "Coordination", deadline: "2027-04-10", status: "completed", priority: "High", owner: "Event Planner / Julian", notes: "Crucial for sunset ceremony lighting window (6:45 PM)" },
    { id: "t11", title: "Submit music playlist & 'Do Not Play' list to DJ", category: "Entertainment", deadline: "2027-05-01", status: "completed", priority: "Medium", owner: "Julian", notes: "First dance: 'La Vie En Rose' acoustic cover" },
    { id: "t12", title: "Finalize table seating chart & escort tile calligraphy", category: "Decor", deadline: "2027-05-20", status: "in-progress", priority: "High", owner: "Sophia", notes: "Hand-painted terracotta tiles as placecards" },
    { id: "t13", title: "Confirm final headcount with caterer & dietary sheet", category: "Catering", deadline: "2027-06-01", status: "pending", priority: "High", owner: "Sophia", notes: "Must submit final count 14 days prior" },
    { id: "t14", title: "Prepare vendor cash tips & final balance envelopes", category: "Budget", deadline: "2027-06-12", status: "pending", priority: "Medium", owner: "Julian", notes: "Cash envelopes labeled by vendor" },
    { id: "t15", title: "Wedding Rehearsal & Welcome Aperitivo Dinner", category: "Ceremony", deadline: "2027-06-19", status: "pending", priority: "High", owner: "Entire Family", notes: "Casual pizza & Spritz welcome at 6:00 PM" },
    { id: "t16", title: "Celebration Day: Setup, Vows, Reception & Dancing!", category: "Day-Of", deadline: "2027-06-20", status: "pending", priority: "High", owner: "All", notes: "The Big Day!" },
    { id: "t17", title: "Post-event brunch & guest farewells", category: "Post-Event", deadline: "2027-06-21", status: "pending", priority: "Low", owner: "Host", notes: "Espresso & pastries by pool" },
    { id: "t18", title: "Send handwritten thank-you cards to all attendees", category: "Post-Event", deadline: "2027-07-15", status: "pending", priority: "Medium", owner: "Sophia & Julian", notes: "Include link to online photo gallery" }
  ],
  vendors: [
    {
      id: "v1",
      name: "Villa Bella Vista",
      category: "Venue & Accommodations",
      service: "Exclusive historic villa estate with panoramic vineyard terrace",
      estimatedCost: 11000,
      actualCost: 11000,
      depositPaid: 5500,
      balanceDue: 5500,
      status: "Booked",
      contactPerson: "Matteo Rossi",
      contactPhone: "+39 0577 848911",
      contactEmail: "events@villabellavista-tuscany.it",
      isVerified: true,
      notes: "Contract signed. Remaining balance due 30 days prior. Includes bridal suite."
    },
    {
      id: "v2",
      name: "Tuscan Harvest Caterers & Sommelier Co.",
      category: "Catering & Bar",
      service: "Full farm-to-table banquet, staff, artisanal pizza oven, wine pairings",
      estimatedCost: 14500,
      actualCost: 14200,
      depositPaid: 5000,
      balanceDue: 9200,
      status: "Booked",
      contactPerson: "Chef Elena Bianchi",
      contactPhone: "+39 055 214589",
      contactEmail: "elena@tuscanharvest.com",
      isVerified: true,
      notes: "Vegetarian & gluten-free courses confirmed. Wine cellar selection locked."
    },
    {
      id: "v3",
      name: "Fiori & Foglie Floral Design",
      category: "Florals & Decor",
      service: "Vineyard ceremony arbor, olive garland runners, bridal bouquets, candles",
      estimatedCost: 5600,
      actualCost: 5200,
      depositPaid: 2000,
      balanceDue: 3200,
      status: "Booked",
      contactPerson: "Lucia Ricci",
      contactPhone: "+39 0577 920144",
      contactEmail: "lucia@fioriefoglie.it",
      isVerified: true,
      notes: "Sourcing locally grown olive branches and antique garden roses."
    },
    {
      id: "v4",
      name: "Lumiere Fine Art Photography & Cinema",
      category: "Photography & Video",
      service: "Full-day coverage, drone aerials, highlight film, 600+ edited gallery",
      estimatedCost: 4500,
      actualCost: 4500,
      depositPaid: 2250,
      balanceDue: 2250,
      status: "Booked",
      contactPerson: "Marco & Chiara",
      contactPhone: "+39 349 1122334",
      contactEmail: "ciao@lumierephoto.it",
      isVerified: true,
      notes: "Golden hour sunset portrait schedule locked for 6:45 PM - 7:30 PM."
    },
    {
      id: "v5",
      name: "Florence Swing & DJ Collective",
      category: "Entertainment & Sound",
      service: "Ceremony acoustic strings, cocktail jazz trio, evening DJ & live sax",
      estimatedCost: 3200,
      actualCost: 3000,
      depositPaid: 1000,
      balanceDue: 2000,
      status: "Booked",
      contactPerson: "Federico Conti",
      contactPhone: "+39 338 5544332",
      contactEmail: "info@florenceswing.it",
      isVerified: true,
      notes: "Wireless microphones provided for outdoor ceremony and toasts."
    },
    {
      id: "v6",
      name: "Artisan Press Studio",
      category: "Stationery & Calligraphy",
      service: "Custom letterpress suites, calligraphy escort tiles, menu scrolls",
      estimatedCost: 850,
      actualCost: 780,
      depositPaid: 780,
      balanceDue: 0,
      status: "Completed",
      contactPerson: "Sarah Jenkins",
      contactPhone: "+1 (415) 890-3412",
      contactEmail: "sarah@artisanpress.design",
      isVerified: false,
      notes: "All stationery delivered and in hand. Terracotta tiles painted."
    },
    {
      id: "v7",
      name: "Bella Sposa Glam Team",
      category: "Attire & Beauty",
      service: "On-site bridal hair & makeup trial + day-of styling for bride & 3 VIPs",
      estimatedCost: 2000,
      actualCost: 1850,
      depositPaid: 900,
      balanceDue: 950,
      status: "Booked",
      contactPerson: "Ginevra Valli",
      contactPhone: "+39 055 838271",
      contactEmail: "ginevra@bellasposa.it",
      isVerified: true,
      notes: "Trial completed successfully in June. Call time is 11:00 AM on wedding day."
    },
    {
      id: "v8",
      name: "Chiantishire Luxury Coach Transfers",
      category: "Transportation",
      service: "Two 24-passenger executive Mercedes Sprinters for guest roundtrips",
      estimatedCost: 1350,
      actualCost: 1200,
      depositPaid: 400,
      balanceDue: 800,
      status: "Booked",
      contactPerson: "Andrea Bellini",
      contactPhone: "+39 0577 449911",
      contactEmail: "bookings@chianticoaches.com",
      isVerified: true,
      notes: "Pickup from Piazza Gramsci at 3:30 PM; return runs at 11:30 PM & 1:30 AM."
    }
  ],
  ideas: [
    {
      id: "i1",
      category: "Decor & Ambience",
      title: "Hand-Painted Terracotta Tile Placecards & Coasters",
      description: "Use individual Tuscan terracotta tiles with guests' names scripted in olive-gold calligraphy. Guests take them home as durable, heat-resistant drink coasters.",
      whyItFits: "Directly celebrates the earthy Tuscan terroir while doubling as a memorable, eco-friendly keepsake.",
      tiers: {
        affordable: "$1.80/tile: DIY raw terracotta hex tiles with gold enamel paint pen",
        balanced: "$4.50/tile: Locally sourced glazed tiles with professional calligrapher (Selected)",
        premium: "$9.00/tile: Custom kiln-fired ceramics with family heraldry and 24k gold leaf"
      },
      tag: "Dual-Purpose Favor"
    },
    {
      id: "i2",
      category: "Catering & Drinks",
      title: "Live Millefoglie Cake Show-Cooking",
      description: "Rather than cutting a pre-made cake, a master pastry chef assembles a giant multi-tiered Italian Millefoglie live in front of guests with fresh puff pastry, mascarpone cream, and wild berries.",
      whyItFits: "Creates high theatrical excitement, unmatched freshness, and honors authentic Italian wedding culinary heritage.",
      tiers: {
        affordable: "Included in standard catering package as the dessert course",
        balanced: "$350 chef fee + seasonal berries topping bar (Selected)",
        premium: "$850 chef show with fireworks sparklers and aged Vin Santo wine pairings"
      },
      tag: "Interactive Dining"
    },
    {
      id: "i3",
      category: "Guest Experience",
      title: "Aperitivo Limoncello & Spritz Bike Cart",
      description: "A vintage restored Piaggio Ape or cargo bicycle outfitted with chilled spritz taps, fresh mint bushes, and iced homemade limoncello bottles greeting guests post-ceremony.",
      whyItFits: "Immediate visual charm for cocktail photos and instantly sets a festive, convivial Italian garden party tone.",
      tiers: {
        affordable: "$250: Self-serve rustic wooden table with beverage dispensers and garnishes",
        balanced: "$650: Rented vintage bicycle bar with dedicated bartender for 2 hours (Selected)",
        premium: "$1,400: Custom motorized Piaggio Ape bar with prosecco on tap and personalized signage"
      },
      tag: "Photo Opportunity"
    },
    {
      id: "i4",
      category: "Entertainment",
      title: "Sunset Golden Hour Acoustic Saxophonist",
      description: "As the sun dips below the Montalcino hills, a solo saxophonist strolls through the vineyard cocktail area playing smooth bossa nova and modern acoustic pop covers.",
      whyItFits: "Elevates the cocktail hour without drowning out conversation, creating a magical transition into dinner.",
      tiers: {
        affordable: "$0: Curated sunset instrumental Spotify playlist over venue speakers",
        balanced: "$450: Solo saxophonist for 75-minute golden hour set (Selected)",
        premium: "$1,100: Acoustic jazz trio (Sax, Double Bass, Gypsy Guitar) with vintage suits"
      },
      tag: "Sensory Atmosphere"
    },
    {
      id: "i5",
      category: "Favors & Gifts",
      title: "Single-Estate Olive Oil Bottles with Personalized Linen Bags",
      description: "100ml dark glass bottles of cold-pressed extra virgin olive oil pressed from the very trees surrounding the venue, wrapped in natural drawstring linen stamped with couple's monogram.",
      whyItFits: "Authentic, high-utility gift that guests genuinely use and cherish, carrying the taste of the celebration home.",
      tiers: {
        affordable: "$3.50/ea: Sourced bulk estate oil bottled at home with custom stickers",
        balanced: "$7.20/ea: Venue-bottled estate EVOO with stamped linen bag and sprig of fresh rosemary (Selected)",
        premium: "$14.00/ea: Ceramic hand-glazed Cruet filled with organic harvest oil and dipping spices"
      },
      tag: "Keepsake"
    },
    {
      id: "i6",
      category: "Photography",
      title: "Golden Hour Cypress Avenue Drone Panorama",
      description: "A choreographed 15-minute sunset capture where all guests gather with prosecco glasses along the iconic winding cypress lane for an epic 360-degree aerial sweep.",
      whyItFits: "Produces an unforgettable cinematic shot of everyone together in the landscape that impossible with ground photography.",
      tiers: {
        affordable: "$0: Photographer steps up on balcony/stepladder for elevated group photo",
        balanced: "$300 drone add-on package with 4K raw aerial video & photo still (Selected)",
        premium: "$800: Cinematic drone pilot with FPV fly-through video reel edited same-evening"
      },
      tag: "Cinematic Memory"
    }
  ],
  surpriseIdeas: [
    {
      title: "Vintage Italian Rotary Telephone Audio Guestbook",
      description: "Guests pick up an ivory 1960s rotary phone, hear your recorded greeting, and leave heartfelt, tipsy, and hilarious audio voicemails that are later compiled into a vinyl record.",
      category: "Surprise Twist",
      estimatedCost: "$280 rental"
    },
    {
      title: "Midnight Wood-Fired Pizza Truck & Gelato Cart",
      description: "Just when the dance party hits its peak at 11:30 PM, a rustic mobile wood-fired pizza oven fires up hot margherita slices paired with artisanal pistachio gelato scoops.",
      category: "Surprise Twist",
      estimatedCost: "$650 package"
    },
    {
      title: "Starlight Silent Disco for Late-Night Noise Curfew",
      description: "When the outdoor venue music curfew strikes at midnight, hand out glowing 3-channel LED wireless headphones so the party continues under the stars without disturbing local regulations.",
      category: "Surprise Twist",
      estimatedCost: "$450 for 50 headsets"
    }
  ],
  guestsList: [
    { id: "g1", name: "Elena & Alessandro Rossi", group: "Family", rsvp: "attending", count: 2, dietary: "None", notes: "Table 1" },
    { id: "g2", name: "Marcus Vance", group: "Wedding Party", rsvp: "attending", count: 1, dietary: "Gluten-Free", notes: "Best Man, Table 2" },
    { id: "g3", name: "Camilla Laurent", group: "Wedding Party", rsvp: "attending", count: 1, dietary: "Vegetarian", notes: "Maid of Honor, Table 2" },
    { id: "g4", name: "David & Sarah Chen", group: "Friends", rsvp: "attending", count: 2, dietary: "Nut Allergy (David)", notes: "Table 4" },
    { id: "g5", name: "Grandmother Beatrice", group: "VIP Family", rsvp: "attending", count: 1, dietary: "Low Sodium / Soft", notes: "Table 1 (Wheelchair access)" },
    { id: "g6", name: "Robert & Lisa Sterling", group: "Colleagues", rsvp: "declined", count: 2, dietary: "None", notes: "Sent generous gift" },
    { id: "g7", name: "Mateo & Inez Gomez", group: "Friends", rsvp: "pending", count: 2, dietary: "Vegan (Inez)", notes: "Followed up via WhatsApp" },
    { id: "g8", name: "Dr. Vikram & Priya Patel", group: "Friends", rsvp: "attending", count: 2, dietary: "Strict Vegetarian", notes: "Table 3" }
  ]
};

// Available event types and default styling templates
const EVENT_TEMPLATES = {
  Wedding: {
    icon: "HeartHandshake",
    defaultBudgetRatio: {
      "Venue & Site": 0.25,
      "Catering & Bar": 0.32,
      "Decor & Florals": 0.12,
      "Photo & Cinema": 0.10,
      "Music & Entertainment": 0.07,
      "Attire & Beauty": 0.04,
      "Stationery & Invites": 0.02,
      "Logistics & Shuttles": 0.03,
      "Contingency Buffer": 0.05
    },
    defaultTimelinePhases: [
      { name: "Early Vision & Booking", offsetMonths: 9 },
      { name: "Design & Vendors", offsetMonths: 6 },
      { name: "Invitations & Tasting", offsetMonths: 3 },
      { name: "Final Confirmations", offsetMonths: 1 },
      { name: "Event Week & Day-Of", offsetMonths: 0 },
      { name: "Post-Celebration", offsetMonths: -1 }
    ]
  },
  Birthday: {
    icon: "Cake",
    defaultBudgetRatio: {
      "Venue & Lounge": 0.22,
      "Food & Open Bar": 0.38,
      "Decor & Photo Moments": 0.14,
      "DJ & Live Entertainment": 0.12,
      "Custom Cake & Desserts": 0.05,
      "Party Favors & Games": 0.04,
      "Contingency Buffer": 0.05
    },
    defaultTimelinePhases: [
      { name: "Concept & Theme", offsetMonths: 2 },
      { name: "Invitations & Venue", offsetMonths: 1 },
      { name: "Supplies & Playlist", offsetMonths: 0.5 },
      { name: "The Big Day", offsetMonths: 0 }
    ]
  },
  Anniversary: {
    icon: "Sparkles",
    defaultBudgetRatio: {
      "Intimate Venue": 0.26,
      "Gourmet Dining & Wine": 0.36,
      "Florals & Mood Lighting": 0.12,
      "Photographer": 0.10,
      "Acoustic Music": 0.08,
      "Keepsakes & Toasts": 0.03,
      "Contingency Reserve": 0.05
    }
  },
  "Corporate Event": {
    icon: "Briefcase",
    defaultBudgetRatio: {
      "Conference Venue / Hall": 0.30,
      "Catering & Refreshments": 0.30,
      "AV, Lighting & Staging": 0.18,
      "Keynote / Entertainment": 0.10,
      "Badges, Branding & Swag": 0.07,
      "Contingency Buffer": 0.05
    }
  },
  "Baby Shower": {
    icon: "Baby",
    defaultBudgetRatio: {
      "Garden or Tea Venue": 0.25,
      "Brunch & Mocktail Bar": 0.35,
      "Balloon Arches & Florals": 0.15,
      "Dessert Table & Custom Cake": 0.10,
      "Photography": 0.08,
      "Games & Favors": 0.04,
      "Contingency": 0.03
    }
  },
  "Community Gathering": {
    icon: "Users",
    defaultBudgetRatio: {
      "Park/Hall Permits & Rentals": 0.25,
      "Buffet / Food Trucks": 0.35,
      "Sound Equipment & MC": 0.15,
      "Activities & Kids Fun": 0.12,
      "Signage & Flyers": 0.05,
      "Contingency & Sanitation": 0.08
    }
  },
  Festival: {
    icon: "Tent",
    defaultBudgetRatio: {
      "Grounds & Staging": 0.30,
      "Artists & Headliners": 0.25,
      "Sound, Lights & Generators": 0.18,
      "Security & Medical": 0.10,
      "Marketing & Ticketing": 0.07,
      "Permits & Contingency": 0.10
    }
  },
  "Custom Event": {
    icon: "PartyPopper",
    defaultBudgetRatio: {
      "Venue": 0.25,
      "Food & Beverage": 0.35,
      "Decor & Theme": 0.15,
      "Entertainment": 0.10,
      "Staffing & Logistics": 0.10,
      "Contingency Reserve": 0.05
    }
  }
};

// Export to window / module
if (typeof window !== "undefined") {
  window.DEMO_EVENT = DEMO_EVENT;
  window.EVENT_TEMPLATES = EVENT_TEMPLATES;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEMO_EVENT, EVENT_TEMPLATES };
}
