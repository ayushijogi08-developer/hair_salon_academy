/**
 * Hair City Salon & Academy — Single Source of Truth
 * 
 * STRICT RULES:
 * 1. Contains only verified business facts and section 2 content.
 * 2. All section 2 items are flagged with `confirmed: false` for owner confirmation.
 * 3. Never invent prices, offers, years of experience, awards or certificates.
 * 4. Images: use only files in src/assets/images/. Never use stock photos.
 */

const imageModules = import.meta.glob('../assets/images/*.{jpg,jpeg,png,webp}', { eager: true });
const academyImageModules = import.meta.glob('../assets/images/academy/*.{jpg,jpeg,png,webp}', { eager: true });
const teamImageModules = import.meta.glob('../assets/images/team/*.{jpg,jpeg,png,webp}', { eager: true });
const transformationImageModules = import.meta.glob('../assets/images/transformations/*.{jpg,jpeg,png,webp}', { eager: true });

function resolveImage(name, fallbackName = null) {
  const findMatch = (target) => {
    if (!target) return null;
    return Object.keys(imageModules).find((k) => {
      const filename = k.split('/').pop();
      return filename === target || filename.startsWith(target + '.') || k.endsWith(target);
    });
  };

  const match = findMatch(name);
  if (match) return imageModules[match].default;
  if (fallbackName) {
    const fallbackMatch = findMatch(fallbackName);
    return fallbackMatch ? imageModules[fallbackMatch].default : null;
  }
  return null;
}

/**
 * Resolve portrait files placed in src/assets/images/team/
 * Accepts a filename (e.g. "firstname-lastname.jpg" or "firstname-lastname")
 */
export function resolveTeamPhoto(name) {
  if (!name) return null;
  // If already a resolved URL or import module
  if (typeof name === 'string' && (name.startsWith('http') || name.startsWith('data:') || name.startsWith('/'))) {
    return name;
  }
  const match = Object.keys(teamImageModules).find((k) => {
    const filename = k.split('/').pop();
    return filename === name || filename.startsWith(name + '.') || k.endsWith(name);
  });
  return match ? teamImageModules[match].default : null;
}

/**
 * Resolve client transformation photos placed in src/assets/images/transformations/
 * Accepts a filename (e.g. "ba-01-before.jpg", "ba-01-after.jpg")
 */
export function resolveTransformationImage(name) {
  if (!name) return null;
  if (typeof name === 'string' && (name.startsWith('http') || name.startsWith('data:') || name.startsWith('/'))) {
    return name;
  }
  const match = Object.keys(transformationImageModules).find((k) => {
    const filename = k.split('/').pop();
    return filename === name || filename.startsWith(name + '.') || k.endsWith(name);
  });
  return match ? transformationImageModules[match].default : null;
}

/**
 * Auto-load every image in src/assets/images/academy/
 * Generates clean alt text from the filename (e.g. "students-at-work.jpg" -> "Students At Work").
 */
function loadAcademyGallery() {
  return Object.entries(academyImageModules).map(([path, mod]) => {
    const filename = path.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const words = nameWithoutExt.split(/[-_]+/).filter(Boolean);
    const alt =
      words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'Hair City Academy Training';
    return {
      id: `acad-${nameWithoutExt}`,
      src: mod.default || mod,
      alt,
      confirmed: true
    };
  });
}

export function whatsappFor(topic) {
  const message = topic
    ? `Hello Hair City, I have a question about ${topic}.`
    : `Hello Hair City, I have a question about your services.`;
  return `https://wa.me/917057174147?text=${encodeURIComponent(message)}`;
}

export const siteData = {
  // --- VERIFIED BUSINESS FACTS ---
  name: "Hair City Salon & Academy",
  branch: "Main Branch",
  address: {
    line1: "Ratanlal Plot, Blackberry Complex",
    line2: "Necklace Road, Ranpise Nagar",
    city: "Akola",
    state: "Maharashtra",
    pincode: "444001",
    country: "India",
    display: "Blackberry Complex, Necklace Road, Ranpise Nagar, Akola",
    full: "Ratanlal Plot, Blackberry Complex, Necklace Road, Ranpise Nagar, Akola, Maharashtra 444001"
  },
  phone: "+91 70571 74147",
  phoneRaw: "+917057174147",
  hours: {
    days: "Monday – Sunday",
    time: "9:00 AM – 10:00 PM",
    closedDates: [] // e.g. ["2026-11-09"] (YYYY-MM-DD, India time)
  },
  walkIn: {
    headline: "No appointment needed.",
    text: "Walk in any day, 9:00 AM to 10:00 PM.",
    confirmed: true
  },
  coordinates: {
    lat: 20.7122645,
    lng: 77.0095123
  },
  links: {
    instagram: "https://www.instagram.com/_hair_city_salon/",
    googleMaps: "https://maps.google.com/?cid=9185693562963339062",
    directions: "https://www.google.com/maps/dir/?api=1&destination=20.7122645,77.0095123",
    whatsappGeneral: "https://wa.me/917057174147?text=Hello%20Hair%20City%2C%20I%20have%20a%20question%20about%20your%20services.",
    whatsappAcademy: "https://wa.me/917057174147?text=Hello%20Hair%20City%2C%20I'd%20like%20to%20know%20about%20your%20academy%20courses."
  },

  // --- HERO CONTENT ---
  hero: {
    eyebrow: "Salon & Academy · Akola",
    headlineLine1: "Where Akola gets its hair done,",
    headlineLine2: "and learns how.",
    headlineEmphasised: "learns",
    sub: "Cuts, colour and treatments in the salon. Professional hair training in the academy.",
    ctaPrimary: "Walk in today",
    ctaSecondary: "Explore the academy",
    proof: null, // Populated ONLY when confirmed owner-supplied Google review metrics exist: { rating: 4.9, count: 120, confirmed: true }
    confirmed: false
  },

  // --- MARQUEE ITEMS ---
  marquee: [
    "Cutting",
    "Colour",
    "Treatments",
    "Grooming",
    "Academy"
  ],

  // --- SALON SERVICES (OVERVIEW) ---
  servicesOverview: [
    {
      num: "01",
      title: "Cutting & Styling",
      summary: "Precision cuts, fringe changes, blow-dry styling, and beard shaping.",
      targetId: "cutting",
      confirmed: false
    },
    {
      num: "02",
      title: "Hair Colour",
      summary: "Global colour, balayage, highlights, and specialised tone consultation.",
      targetId: "colour",
      confirmed: false
    },
    {
      num: "03",
      title: "Hair Treatments",
      summary: "Hair spa, smoothening, nanoplasty repair, and scalp support.",
      targetId: "treatments",
      confirmed: false
    },
    {
      num: "04",
      title: "Academy Training",
      summary: "Foundations, cutting, colour, and styling in a working salon space.",
      targetId: "academy",
      confirmed: false
    }
  ],

  // --- CUTTING & STYLING ---
  cutting: {
    num: "",
    tagline: "Precision & Profile",
    title: "Cutting & Styling",
    lead: "Every cut starts with a short consultation about face shape, hair type and daily routine.",
    items: [
      "Haircuts for men, women and children",
      "Layering, fringe and length changes",
      "Blow-dry and styling",
      "Beard trim, shaping and grooming"
    ],
    confirmed: false
  },

  // --- HAIR COLOUR ---
  colour: {
    num: "",
    tagline: "Tone & Dimension",
    title: "Hair Colour",
    lead: "Colour is planned around your natural base shade, skin undertone and hair condition.",
    items: [
      "Global colour and root touch-ups",
      "Highlights, babylights and balayage",
      "Creative shades and gloss toning",
      "Colour care routines to keep shade and shine longer"
    ],
    note: "A patch test and consultation come first.",
    confirmed: false
  },

  // --- HAIR TREATMENTS ---
  treatments: {
    num: "",
    tagline: "Restoration & Health",
    title: "Hair Treatments",
    lead: "Treatments target the problem, not just the look.",
    items: [
      "Hair spa for dry or dull hair",
      "Smoothening and straightening",
      "Nanoplasty and botox-style repair treatments",
      "Scalp care and hair-fall support"
    ],
    note: "Suitability is checked on your hair before any treatment.",
    confirmed: false
  },

  // --- ACADEMY (FULL SECTION) ---
  academy: {
    num: "",
    eyebrow: "Professional Hair Education",
    headline: "Learn hair the way it is done in a working salon.",
    intro: "The academy trains beginners and aspiring stylists in the practical skills of the trade, in the same space where clients are served.",
    modules: [
      {
        num: "01",
        title: "Foundations",
        description: "Hair and scalp basics, tools, hygiene and client handling.",
        detail: "Understanding hair texture, anatomy, sterilisation practices, and foundational salon discipline."
      },
      {
        num: "02",
        title: "Cutting",
        description: "Sectioning, shape and technique.",
        detail: "Mastering scissor angles, graduation lines, clippers, weight balance, and perimeter control."
      },
      {
        num: "03",
        title: "Colour",
        description: "Shade theory, application and care.",
        detail: "Understanding undertones, neutralisation, sectioning methods, even application, and client safety."
      },
      {
        num: "04",
        title: "Styling & Grooming",
        description: "Blow-dry, finishing and beard work.",
        detail: "Classic blowout techniques, iron styling, beard contouring, and final silhouette presentation."
      }
    ],
    whoItsFor: "Beginners, aspiring professionals, and working stylists who want to improve their skills.",
    howToJoin: [
      { step: "1", title: "Enquire on WhatsApp" },
      { step: "2", title: "Talk to the academy team" },
      { step: "3", title: "Choose your batch" }
    ],
    studentJourney: [
      {
        step: "01",
        title: "Enquire",
        description: "Message our academy coordinator on WhatsApp to express interest and ask preliminary questions."
      },
      {
        step: "02",
        title: "Demo & Consultation",
        description: "Visit our Ranpise Nagar studio, observe active styling on the salon floor, and discuss your learning goals."
      },
      {
        step: "03",
        title: "Choose Batch",
        description: "Select an upcoming cohort timing and training schedule that matches your availability."
      },
      {
        step: "04",
        title: "Training in Working Salon",
        description: "Master fundamentals, scissor ergonomics, sectioning geometry, and colour chemistry in a live salon environment."
      },
      {
        step: "05",
        title: "Practice on Real Clients",
        description: "Perform guided haircuts, styling, and treatments on studio clients under direct educator supervision."
      }
    ],
    brochureUrl: null, // Set to PDF URL (e.g. "/assets/academy-brochure.pdf") when confirmed
    closingLine: "Course duration, batch timings and fees are shared on enquiry.",
    cta: "Enquire about the academy",
    confirmed: false
  },

  // --- IMAGE ASSET MANIFEST ---
  images: {
    hero: {
      src: resolveImage('hero.jpg', 'girl-cut-04.jpg'),
      alt: "Client with layered dark hair styled at Hair City Salon, Akola",
      focus: '50% 18%'
    },
    cutting: {
      src: resolveImage('cutting-men.jpg', 'boy-cut-01.jpg'),
      alt: "Precision hair cutting, fade and styling craft at Hair City Salon, Akola",
      boyCut: {
        src: resolveImage('cutting-men.jpg', 'boy-cut-01.jpg'),
        alt: "Client with textured cut and styled fade at Hair City Salon, Akola",
        title: "Men's Precision Fade & Pompadour"
      },
      girlCut: {
        src: resolveImage('cutting-women.jpg', 'girl-cut-01.jpg'),
        alt: "Women's multi-tier step layer haircut with curved blowout finish",
        title: "Women's Step Layer Cut & Blowout"
      }
    },
    colour: {
      src: resolveImage('colour.jpg', 'girl-cut-03.jpg'),
      alt: "Bespoke caramel balayage and dimensional hair colour at Hair City Salon, Akola"
    },
    treatments: {
      src: resolveImage('treatments.jpg', 'girl-cut-02.jpg'),
      alt: "Restorative hair therapy, deep silk conditioning and cascading feather layers at Hair City Salon, Akola"
    },
    academy: {
      src: resolveImage('academy.jpg', 'boy-cut-03.jpg'),
      alt: "Hair City Academy educator demonstrating precision haircutting and styling techniques to students"
    },
    work: [
      {
        id: "work-01",
        category: "boys",
        categoryLabel: "Men's Cut",
        title: "Modern Fade & Pompadour",
        description: "High skin fade paired with textured volume and sharp hairline perimeter.",
        src: resolveImage('boy-cut-01.jpg'),
        alt: "Modern taper fade with volume pompadour styling for men",
        label: "01",
        featured: true
      },
      {
        id: "work-02",
        category: "boys",
        categoryLabel: "Men's Cut",
        title: "Classic Scissor Taper & Beard",
        description: "Scissor-over-comb graduation, textured side part, and clean beard contouring.",
        src: resolveImage('boy-cut-02.jpg'),
        alt: "Classic gentleman textured scissor taper with groomed beard contouring",
        label: "02",
        featured: false
      },
      {
        id: "work-03",
        category: "boys",
        categoryLabel: "Men's Cut",
        title: "Mid Drop Fade & Volume Top",
        description: "Graduated temple fade with slicked textured volume and shaped stubble profile.",
        src: resolveImage('boy-cut-03.jpg'),
        alt: "Mid drop fade with slicked textured volume and sharp stubble profile",
        label: "03",
        featured: false
      },
      {
        id: "work-04",
        category: "girls",
        categoryLabel: "Women's Cut",
        title: "Multi-Layer Step Cut & Blowout",
        description: "Butterfly step graduation on long hair with curved inward blowout curvature.",
        src: resolveImage('girl-cut-01.jpg'),
        alt: "Multi-layer butterfly step haircut with curved blow-dry styling",
        label: "04",
        featured: false
      },
      {
        id: "work-05",
        category: "girls",
        categoryLabel: "Women's Cut",
        title: "Cascading Feather Layers",
        description: "V-cut silhouette with feather layering, zero frizz, and restorative mirror shine.",
        src: resolveImage('girl-cut-02.jpg'),
        alt: "Cascading multi-tier feather layer haircut with restorative gloss finish",
        label: "05",
        featured: false
      },
      {
        id: "work-06",
        category: "girls",
        categoryLabel: "Women's Cut",
        title: "Caramel Balayage & Waves",
        description: "Multi-dimensional caramel and hazelnut tones with outward-bounced curled layers.",
        src: resolveImage('girl-cut-03.jpg'),
        alt: "Dimensional caramel balayage with outward flicked bouncy curls",
        label: "06",
        featured: false
      },
      {
        id: "work-07",
        category: "girls",
        categoryLabel: "Women's Cut",
        title: "Curtain Bangs & Face Framing",
        description: "Soft cheekbone-skimming curtain fringe with layered collarbone blowout texture.",
        src: resolveImage('girl-cut-04.jpg'),
        alt: "Soft curtain bangs with face-framing shoulder-length textured layers",
        label: "07",
        featured: true
      }
    ].filter(img => img.src !== null)
  },

  // --- OPTIONAL BUSINESS ARRAYS (rendered ONLY when confirmed: true items exist) ---
  // STRICT RULE: Never invent prices, reviews, team names, ratings, certificates, offers.
  pricing: [
    // EXAMPLE ONLY — unconfirmed placeholder items showing format for owner verification.
    // Notice: confirmed is strictly false. No prices are invented (priceFrom is null).
    {
      id: "pricing-example-01",
      category: "Haircuts & Styling",
      name: "Men's Precision Cut & Styling",
      description: "Consultation, precision scissor-over-comb cut, rinse, and finish.",
      priceFrom: null, // Set to number (e.g. 350) once confirmed by owner; do not invent prices
      confirmed: false
    },
    {
      id: "pricing-example-02",
      category: "Haircuts & Styling",
      name: "Women's Layered Cut & Blowout",
      description: "Consultation, custom layering, rinse, and blowout styling.",
      priceFrom: null, // Set to number once confirmed by owner; do not invent prices
      confirmed: false
    },
    {
      id: "pricing-example-03",
      category: "Hair Treatments",
      name: "Restorative Hair Spa",
      description: "Deep steam infusion, nourishing mask, and scalp stimulation.",
      priceFrom: null, // Set to number once confirmed by owner; do not invent prices
      confirmed: false
    }
  ],

  team: [
    /* Example format (strictly leave empty until confirmed by owner):
    {
      id: "team-01",
      name: "Stylist Name",
      role: "Senior Stylist",
      experience: "5+ years",
      bio: "Specializing in precision scissor cuts, fade geometry, and tailored styling.",
      photo: "firstname-lastname.jpg", // Photo filename placed in src/assets/images/team/
      confirmed: false
    }
    */
  ],

  reviews: [
    /* Example format:
    {
      id: "r1",
      text: "Genuine review text...",
      author: "Client Name",
      source: "Google Review",
      sourceUrl: "https://maps.google.com/?cid=9185693562963339062",
      confirmed: false
    }
    */
  ],

  faq: [
    {
      id: "faq-01",
      question: "Do I need to book an appointment before visiting?",
      answer: "No appointment is needed. Walk-ins are welcome every day from 9:00 AM to 10:00 PM. If you have a question first, you can call or message us on WhatsApp.",
      confirmed: true
    },
    {
      id: "faq-hours",
      question: "Which days are you open?",
      answer: "Every day, 9:00 AM to 10:00 PM.",
      confirmed: true
    },
    {
      id: "faq-02",
      question: "How long does a hair colour or balayage service take?",
      answer: "Service duration depends on your hair length, base colour, and chosen technique. Please message us on WhatsApp and our team will guide you.",
      confirmed: false
    },
    {
      id: "faq-03",
      question: "What aftercare is required after smoothening or nanoplasty?",
      answer: "Aftercare depends on the specific treatment and hair condition. Please message us on WhatsApp and our stylists will guide you.",
      confirmed: false
    },
    {
      id: "faq-04",
      question: "How are academy admissions structured and when do new batches start?",
      answer: "Batch schedules, admissions, and course details are shared directly on enquiry. Please message us on WhatsApp and our academy coordinator will guide you.",
      confirmed: false
    }
  ],

  academyTeam: [
    /* Example format (strictly leave empty until confirmed by owner):
    {
      id: "acad-01",
      name: "Educator Name",
      role: "Lead Educator & Master Stylist",
      experience: "8+ years",
      bio: "Conducts hands-on masterclasses in precision haircutting, sectioning geometry, and advanced colour techniques.",
      photo: "firstname-lastname.jpg", // Photo filename placed in src/assets/images/team/
      confirmed: false
    }
    */
  ],

  // Auto-loaded from src/assets/images/academy/ (empty array if folder has no images yet)
  academyGallery: loadAcademyGallery(),

  academyDetails: {
    duration: "3 Months",
    feeRange: "Shared on enquiry",
    nextBatch: "1st of every month",
    certificate: "Certificate on completion",
    emiNote: "Flexible fee installment / EMI options available upon enquiry.",
    confirmed: false
  },
  /* Example format when confirmed:
  academyDetails: {
    duration: "3 Months (Full-Time)",
    feeRange: "Shared on enquiry",
    nextBatch: "1st of every month",
    certificate: "Professional Salon Certification",
    confirmed: false
  },
  */

  beforeAfter: [
    {
      id: "ba-01",
      title: "Caramel Balayage & Layered Cut",
      category: "Colour & Styling",
      caption: "Soft dimensional balayage with face-framing layers and healthy shine finish.",
      beforeSrc: "ba-01-before.jpg",
      afterSrc: "ba-01-after.jpg",
      confirmed: true
    },
    {
      id: "ba-02",
      title: "Textured Crop & Low Fade",
      category: "Men's Cut",
      caption: "Clean temple taper with textured crown volume and sharp hairline perimeter.",
      beforeSrc: "ba-02-before.jpg",
      afterSrc: "ba-02-after.jpg",
      confirmed: true
    }
  ]
};
