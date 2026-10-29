import { siteData } from '../data/site';

/**
 * Preview Mode Helper
 * 
 * STRICT RULES:
 * 1. Only activates in development (import.meta.env.DEV). Never appears in production build.
 * 2. Only activates when URL contains ?preview=1.
 * 3. Does NOT mutate confirmed flags in siteData.
 * 4. All sample items are tagged with isSample: true to display prominent "SAMPLE" badges.
 * 5. Uses neutral text ("Stylist Name", "Role", etc.) and existing image assets.
 */

export function isPreviewMode() {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('preview') === '1';
  } catch {
    return false;
  }
}

/** Sample Academy Gallery items using existing images */
export function getSampleAcademyGallery() {
  const existingImages = [
    { src: siteData.images.academy?.src, alt: 'Sample Masterclass Cutting Technique' },
    { src: siteData.images.cutting?.boyCut?.src || siteData.images.hero?.src, alt: 'Sample Student Sectioning Practice' },
    { src: siteData.images.colour?.src, alt: 'Sample Hair Colour Theory Session' },
    { src: siteData.images.treatments?.src, alt: 'Sample Client Treatment Demo' },
    { src: siteData.images.cutting?.girlCut?.src, alt: 'Sample Step Layer Finishing Session' },
    { src: siteData.images.cutting?.src, alt: 'Sample Scissor-Over-Comb Graduation' }
  ].filter((img) => Boolean(img.src));

  return existingImages.map((img, idx) => ({
    id: `sample-acad-gal-${idx + 1}`,
    src: img.src,
    alt: `${img.alt} (Sample Preview)`,
    isSample: true,
    confirmed: false
  }));
}

/** Sample Team members for Salon Home page */
export function getSampleTeam() {
  return [
    {
      id: 'sample-team-01',
      name: 'Stylist Name',
      role: 'Senior Stylist & Director',
      experience: '8+ years',
      bio: 'Sample bio demonstrating layout: precision scissor-over-comb cuts, textured taper fades, and bespoke consultation.',
      photo: siteData.images.cutting?.boyCut?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-team-02',
      name: 'Stylist Name',
      role: 'Master Colourist',
      experience: '6+ years',
      bio: 'Sample bio demonstrating layout: multi-dimensional balayage, babylights, undertone neutralisation, and hair health care.',
      photo: siteData.images.colour?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-team-03',
      name: 'Stylist Name',
      role: 'Creative Stylist & Therapist',
      experience: '5+ years',
      bio: 'Sample bio demonstrating layout: restorative hair spa therapies, smoothing treatments, and volume blowout finishing.',
      photo: siteData.images.treatments?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    }
  ];
}

/** Sample Academy Educators for /academy page */
export function getSampleAcademyTeam() {
  return [
    {
      id: 'sample-acad-edu-01',
      name: 'Educator Name',
      role: 'Lead Academy Educator',
      experience: '10+ years salon & teaching experience',
      bio: 'Sample educator bio: masterclasses in precision haircutting geometry, scissor ergonomics, and live salon client instruction.',
      photo: siteData.images.academy?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-acad-edu-02',
      name: 'Educator Name',
      role: 'Technical Colour Educator',
      experience: '7+ years technical colour craft',
      bio: 'Sample educator bio: fundamental shade formulation, developer ratios, sectioning precision, and toning consultations.',
      photo: siteData.images.cutting?.girlCut?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    }
  ];
}

/** Sample Before / After comparisons for Salon Home page */
export function getSampleBeforeAfter() {
  return [
    {
      id: 'sample-ba-01',
      title: 'Sample Balayage & Cut Transformation',
      category: 'Colour & Styling',
      caption: 'Soft dimensional balayage with face-framing layers and healthy shine finish.',
      beforeSrc: siteData.images.cutting?.girlCut?.src || siteData.images.hero?.src,
      afterSrc: siteData.images.colour?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-ba-02',
      title: 'Sample Textured Crop & Fade',
      category: "Men's Grooming",
      caption: 'Low skin fade paired with textured crown volume and sharp hairline contour.',
      beforeSrc: siteData.images.cutting?.boyCut?.src || siteData.images.hero?.src,
      afterSrc: siteData.images.cutting?.src || siteData.images.hero?.src,
      isSample: true,
      confirmed: false
    }
  ];
}

/** Sample Reviews for Salon Home page */
export function getSampleReviews() {
  return [
    {
      id: 'sample-rev-01',
      text: 'Sample verified client testimonial demonstrating card typography, line spacing, and editorial quote marks across all screen widths.',
      author: 'Client Name',
      source: 'Google Review',
      sourceUrl: siteData.links.googleMaps,
      rating: 5,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-rev-02',
      text: 'Sample client review highlighting salon consultation and service quality for preview verification purposes.',
      author: 'Client Name',
      source: 'Google Review',
      sourceUrl: siteData.links.googleMaps,
      rating: 5,
      isSample: true,
      confirmed: false
    },
    {
      id: 'sample-rev-03',
      text: 'Sample review displaying author attribution, star indicators, and external verified Google Maps source link.',
      author: 'Client Name',
      source: 'Google Review',
      sourceUrl: siteData.links.googleMaps,
      rating: 5,
      isSample: true,
      confirmed: false
    }
  ];
}
