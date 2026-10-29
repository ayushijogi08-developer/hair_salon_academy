# Hair City Salon & Academy — Content Needed Checklist

> **Integrity Rule**: Hair City Salon & Academy never publishes fabricated facts, fake ratings, simulated reviews, or placeholder prices.  
> The sections listed below are fully coded, styled, and wired to render automatically the moment verified business data is provided with `"confirmed": true` in [`src/data/site.js`](./src/data/site.js).  
> While data arrays remain empty or unconfirmed, these sections safely render nothing—guaranteeing no empty headings, broken layouts, or blank spaces.

---

## Quick Preview Mode (Development Only)

You can preview what every section looks like with sample data before adding real photos or content:

- **Salon Home Page Preview**: Open `http://localhost:5173/?preview=1`  
  *Previews: Team cards, Before & After comparison slider, and Client Reviews carousel.*
- **Academy Page Preview**: Open `http://localhost:5173/academy?preview=1`  
  *Previews: Academy Educators cards and Academy Photo Gallery with Lightbox.*

> **Security & Production Safety**:  
> Preview mode only works in local development (`import.meta.env.DEV`). It is stripped out of production builds and never touches confirmed data flags. Every sample item is prominently tagged with a red `SAMPLE` badge.

---

## 1. Academy Photos (`src/assets/images/academy/`)

Drop verified academy images directly into the [`src/assets/images/academy/`](./src/assets/images/academy/) folder.

### What happens automatically:
- Every image placed in this folder is **auto-loaded** into the website gallery using Vite's `import.meta.glob`.
- Alt text is **auto-generated** from the filename (e.g., `students-scissor-practice.jpg` becomes `"Students Scissor Practice"`).
- The Academy Gallery section and its interactive Lightbox will automatically mount on `/academy` as soon as images are detected.

### What photos to provide:
- [ ] **Academy Hero Image**: Replace academy hero with a real photo of the Hair City academy (file: `src/assets/images/academy/hero.jpg`, portrait, at least 1200px wide).
- [ ] Students and trainers at work during chair sessions
- [ ] Classroom theory and head-block sectioning practice
- [ ] Live salon haircuts and blowout demonstrations
- [ ] Student graduation and certificate handover moments

### Naming convention:
Use lowercase words separated by hyphens:
- `trainer-cutting-demo.jpg`
- `students-colour-theory.jpg`
- `live-client-haircut.jpg`
- `batch-certificate-ceremony.jpg`

### Photo specs:
- **Format**: `.jpg`, `.jpeg`, `.png`, or `.webp`
- **Orientation**: 4:5 or 3:4 portrait preferred; 16:9 landscape supported
- **Resolution**: 1200px+ width, under 800KB for fast loading

---

## 2. Stylist & Educator Portraits (`src/assets/images/team/`)

Drop individual headshot portraits directly into [`src/assets/images/team/`](./src/assets/images/team/).

### Naming convention:
Name each portrait using the stylist's or educator's first and last name in lowercase with a hyphen:
- `rahul-sharma.jpg`
- `priya-patil.jpg`
- `mohit-deshmukh.jpg`

### Photo specs:
- **Format**: `.jpg`, `.jpeg`, `.png`, or `.webp`
- **Orientation**: Vertical portrait (4:5 or 3:4 aspect ratio)
- **Background**: Neutral studio or warm salon background with natural lighting
- **Resolution**: 800x1000px, under 400KB
- **Fallback**: If no portrait is provided, the card automatically displays an initials monogram avatar (e.g., `"RS"`).

---

## 3. Salon Team Members (`siteData.team` in `src/data/site.js`)

Add confirmed salon stylists to `siteData.team`. When items are added with `confirmed: true`, the **Our Team** section automatically renders on the salon home page.

### Required per stylist:
- [ ] **Full Name**: Stylist's verified name
- [ ] **Role / Title**: (e.g., `"Senior Stylist"`, `"Master Colourist"`, `"Creative Director"`)
- [ ] **Experience**: Verified years of craft experience (e.g., `"8+ years"`, `"5+ years"`)
- [ ] **Photo**: Filename matching an image in `src/assets/images/team/` (e.g., `"rahul-sharma.jpg"`) or `null` for initials avatar
- [ ] **Bio**: 1–2 sentences on signature techniques or craft specialization
- [ ] **Confirmation**: Set `confirmed: true`

### Fill-in Template:
```javascript
// In src/data/site.js:
team: [
  {
    id: "team-01",
    name: "Rahul Sharma",
    role: "Senior Stylist & Creative Director",
    experience: "8+ years",
    photo: "rahul-sharma.jpg", // in src/assets/images/team/
    bio: "Specializing in precision scissor-over-comb cuts, textured fades, and bespoke client consultations.",
    confirmed: true
  },
  {
    id: "team-02",
    name: "Priya Patil",
    role: "Master Colourist",
    experience: "6+ years",
    photo: "priya-patil.jpg", // in src/assets/images/team/
    bio: "Specializing in dimensional balayage, babylights, and custom tone neutralisation.",
    confirmed: true
  }
]
```

---

## 4. Academy Educators (`siteData.academyTeam` in `src/data/site.js`)

Add confirmed trainers and faculty to `siteData.academyTeam`. When items are added with `confirmed: true`, the **Academy Educators** block automatically renders on the `/academy` page with duotone-to-colour hover transitions.

### Required per educator:
- [ ] **Full Name**: Educator's verified name
- [ ] **Role / Title**: (e.g., `"Lead Academy Educator"`, `"Technical Colour Mentor"`)
- [ ] **Experience**: Verified salon and teaching experience (e.g., `"10+ years salon & training"`)
- [ ] **Photo**: Filename matching an image in `src/assets/images/team/` (e.g., `"rahul-sharma.jpg"`) or `null` for initials avatar
- [ ] **Bio**: 1–2 sentences on masterclass topics and teaching methodology
- [ ] **Confirmation**: Set `confirmed: true`

### Fill-in Template:
```javascript
// In src/data/site.js:
academyTeam: [
  {
    id: "acad-01",
    name: "Rahul Sharma",
    role: "Lead Academy Educator",
    experience: "10+ years salon & teaching experience",
    photo: "rahul-sharma.jpg", // in src/assets/images/team/
    bio: "Conducts hands-on masterclasses in scissor ergonomics, sectioning geometry, and commercial salon floor readiness.",
    confirmed: true
  }
]
```

---

## 5. Service Pricing (`siteData.pricing` in `src/data/site.js`)

Add verified service menu rates to `src/data/site.js`.

### Required per item:
- [ ] **Category**: (e.g., `"Haircuts & Styling"`, `"Hair Colour"`, `"Hair Treatments"`, `"Grooming"`)
- [ ] **Service Name**: (e.g., `"Men's Precision Cut & Styling"`, `"Global Colour"`)
- [ ] **From Price (₹)**: Starting rate in INR (e.g., `350`, `2500`)
- [ ] **Description**: Brief note on what the service includes
- [ ] **Confirmation**: Set `confirmed: true`

### Fill-in Template:
```javascript
pricing: [
  {
    id: "p-01",
    category: "Haircuts & Styling",
    name: "Men's Precision Cut & Finish",
    priceFrom: 350,
    description: "Detailed consultation, scissor-over-comb cut, rinse, and blow-dry finish.",
    confirmed: true
  },
  {
    id: "p-02",
    category: "Haircuts & Styling",
    name: "Women's Multi-Layer Cut & Styling",
    priceFrom: 650,
    description: "Face-framing layers, split-end removal, and volume blowout.",
    confirmed: true
  },
  {
    id: "p-03",
    category: "Hair Treatments",
    name: "Intensive Restorative Hair Spa",
    priceFrom: 1200,
    description: "Scalp stimulation, deep steam infusion, and hydration mask.",
    confirmed: true
  }
]
```

---

## 6. Real Client Reviews (`siteData.reviews` in `src/data/site.js`)

Display genuine reviews from clients who have visited the salon chairs.

### Required per review:
- [ ] **Review Text**: Exact, unedited quote from client
- [ ] **Author Name**: Client's verified name or Google reviewer display name
- [ ] **Source**: (e.g., `"Google Review"`)
- [ ] **Source URL**: Direct link to the review or salon Google Business Profile
- [ ] **Confirmation**: Set `confirmed: true`

### Fill-in Template:
```javascript
reviews: [
  {
    id: "r-01",
    text: "Review text copied verbatim from Google Maps...",
    author: "Client Name",
    source: "Google Review",
    sourceUrl: "https://maps.google.com/?cid=9185693562963339062",
    confirmed: true
  }
]
```

---

## 7. Frequently Asked Questions (`siteData.faq` in `src/data/site.js`)

The 3 FAQ items below have neutral placeholder answers and are set to `confirmed: false` until salon management confirms the exact operational details.

### Items requiring owner verification:
- [ ] **`faq-02` Hair Colour Duration**: Typical duration for global colour vs. balayage/highlights
- [ ] **`faq-03` Treatment Aftercare**: Official aftercare advice and washing window
- [ ] **`faq-04` Academy Batch Schedule**: Batch timings, cohort sizes, and admission dates

---

## 8. Before & After Transformations (`siteData.beforeAfter`)

Showcase genuine client transformations with comparison slider capability.

### Required per transformation:
- [ ] **Title**: Short description of the transformation (e.g., `"Caramel Balayage Transformation"`)
- [ ] **Category**: (e.g., `"Colour"`, `"Restoration"`, `"Styling"`)
- [ ] **Before Photo**: High-resolution image of hair before treatment
- [ ] **After Photo**: High-resolution image of final finished look
- [ ] **Client Consent**: Permission to feature transformation on website
- [ ] **Confirmation**: Set `confirmed: true`

---

## 9. Academy Course Brochure PDF (`siteData.academy.brochureUrl`)

- [ ] Place the brochure PDF in `public/assets/academy-brochure.pdf`.
- [ ] In `src/data/site.js`, set `brochureUrl: "/assets/academy-brochure.pdf"`.
- [ ] The "Download brochure (PDF)" button will automatically become visible.

---

## Step-by-Step Instructions for Applying Content

1. Drop academy photos into `src/assets/images/academy/`.
2. Drop stylist & educator portraits into `src/assets/images/team/`.
3. Open [`src/data/site.js`](./src/data/site.js) and fill in the details with `"confirmed": true`.
4. Run `npm run lint` and `npm run build` to verify correctness.
5. Deploy or reload. The sections mount with full animations, duotone hovers, accessibility, and responsive layouts.
