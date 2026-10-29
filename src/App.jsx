import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import academyImg from './assets/images/academy.jpg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { PageTransitionProvider } from './components/PageTransition';
import { ScrollToTop } from './components/ScrollToTop';
import { WalkInBanner } from './components/WalkInBanner';
import { Hero } from './sections/Hero';
import { Marquee } from './components/Marquee';
import { WhyHairCity } from './sections/WhyHairCity';
import { ServicesOverview } from './sections/ServicesOverview';
import { CuttingSection } from './sections/CuttingSection';
import { ColourSection } from './sections/ColourSection';
import { TreatmentsSection } from './sections/TreatmentsSection';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { initMagnetic } from './lib/magnetic';
import { siteData } from './data/site';

// Heavy below-the-fold sections and route pages split via React.lazy
const Pricing = lazy(() => import('./sections/Pricing').then((m) => ({ default: m.Pricing })));
const Academy = lazy(() => import('./sections/Academy').then((m) => ({ default: m.Academy })));
const Work = lazy(() => import('./sections/Work').then((m) => ({ default: m.Work })));
const BeforeAfter = lazy(() => import('./sections/BeforeAfter').then((m) => ({ default: m.BeforeAfter })));
const Team = lazy(() => import('./sections/Team').then((m) => ({ default: m.Team })));
const Reviews = lazy(() => import('./sections/Reviews').then((m) => ({ default: m.Reviews })));
const InstagramStrip = lazy(() => import('./sections/InstagramStrip').then((m) => ({ default: m.InstagramStrip })));
const FAQ = lazy(() => import('./sections/FAQ').then((m) => ({ default: m.FAQ })));
const Visit = lazy(() => import('./sections/Visit').then((m) => ({ default: m.Visit })));
const AcademyPage = lazy(() => import('./pages/AcademyPage').then((m) => ({ default: m.AcademyPage })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

// ─── Helpers for DOM metadata & schemas ──────────────────────────────────────
function setMetaTag(selector, attrName, attrValue, content) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

const ACADEMY_SCHEMA_ID = 'schema-educational-org';
function updateSchemas(isAcademy) {
  let script = document.getElementById(ACADEMY_SCHEMA_ID);
  if (isAcademy) {
    if (!script) {
      script = document.createElement('script');
      script.id = ACADEMY_SCHEMA_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Hair City Academy',
      url: 'https://haircityakola.in/academy',
      image: 'https://haircityakola.in/og-image.jpg',
      telephone: '+91 70571 74147',
      description: 'Professional haircutting, colour, treatments and styling training at Hair City Academy, Akola.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ratanlal Plot, Blackberry Complex, Necklace Road, Ranpise Nagar',
        addressLocality: 'Akola',
        addressRegion: 'Maharashtra',
        postalCode: '444001',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 20.7122645,
        longitude: 77.0095123
      },
      sameAs: [
        'https://www.instagram.com/_hair_city_salon/',
        'https://maps.google.com/?cid=9185693562963339062'
      ]
    });
  } else if (script) {
    script.remove();
  }
}

const HERO_PRELOAD_ID = 'preload-hero-image';
function updateHeroPreload(isHome) {
  let link = document.getElementById(HERO_PRELOAD_ID);
  if (isHome && siteData.images?.hero?.src) {
    if (!link) {
      link = document.createElement('link');
      link.id = HERO_PRELOAD_ID;
      link.rel = 'preload';
      link.as = 'image';
      link.href = siteData.images.hero.src;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  } else if (link && !isHome) {
    link.remove();
  }
}

// ─── Per-route <title>, canonical, open graph, twitter & JSON-LD ────────────
function RouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    const isAcademy = location.pathname === '/academy';
    const isHome = location.pathname === '/';

    if (isAcademy) {
      const title = 'Hair City Academy — Professional Hair Training in Akola';
      const desc =
        'Learn professional haircutting, colour, treatments and styling at Hair City Academy, Akola. Practical training in a live salon space. Enquire on WhatsApp.';
      const url = 'https://haircityakola.in/academy';
      const ogImage = 'https://haircityakola.in/og-image.jpg';

      document.title = title;
      setMetaTag('meta[name="description"]', 'name', 'description', desc);
      setCanonical(url);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', desc);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
      setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

      updateSchemas(true);
      updateHeroPreload(false);
    } else if (isHome) {
      const title = 'Hair City Salon & Academy — Akola';
      const desc =
        'Hair City Salon & Academy, Akola. Walk-in haircuts, colour, treatments and professional academy training. Open every day, 9 AM–10 PM. No appointment needed.';
      const url = 'https://haircityakola.in/';
      const ogImage = 'https://haircityakola.in/og-image.jpg';

      document.title = title;
      setMetaTag('meta[name="description"]', 'name', 'description', desc);
      setCanonical(url);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', desc);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
      setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

      updateSchemas(false);
      updateHeroPreload(true);
    } else {
      document.title = 'Page Not Found — Hair City Salon & Academy';
      setMetaTag(
        'meta[name="description"]',
        'name',
        'description',
        'The requested page could not be found. Return to Hair City Salon & Academy homepage.'
      );
      updateSchemas(false);
      updateHeroPreload(false);
    }
  }, [location.pathname]);

  return null;
}

// ─── Trigger ScrollTrigger recalculation when a lazy section mounts ─────────
function SectionMountTrigger({ children }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return children;
}

function LazySection({ children, minHeight = 400 }) {
  return (
    <Suspense fallback={<div style={{ minHeight: `${minHeight}px` }} aria-hidden="true" />}>
      <SectionMountTrigger>{children}</SectionMountTrigger>
    </Suspense>
  );
}

// ─── Home page ───────────────────────────────────────────────────────────────
function AcademyBridgeSection() {
  const academyPhotoSrc = siteData.images.academy?.src || academyImg;
  const academyPhotoAlt = siteData.images.academy?.alt || "Hair City Academy training on working salon floor, Akola";

  return (
    <section
      id="academy-bridge"
      aria-label="Salon & Academy"
      className="academy-bridge-section"
    >
      <div className="container">
        <div className="academy-bridge-grid">
          {/* Left Column: Clean Editorial Block */}
          <div className="academy-bridge-content">
            <span className="section-label academy-bridge-label">
              Salon &amp; Academy
            </span>
            <h2 className="academy-bridge-heading">
              Learn where real clients are served.
            </h2>
            <p className="academy-bridge-body">
              Practical hair craft, foundational cutting, and live client styling taught directly on our working salon floor.
            </p>
            <Link
              to="/academy"
              className="btn btn-secondary academy-bridge-btn"
              onClick={() => window.scrollTo(0, 0)}
            >
              <span>See the academy</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Right Column: Arch-shaped mask with Hair City seal overlapping corner */}
          <div className="academy-bridge-visual">
            <div className="academy-bridge-arch-wrap">
              <div className="academy-bridge-arch-frame">
                <img
                  src={academyPhotoSrc}
                  alt={academyPhotoAlt}
                  width="440"
                  height="587"
                  className="academy-bridge-arch-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Hair City Circular Seal Logo Badge: rotating outer ring + stationary center HC monogram */}
              <div className="academy-bridge-seal-badge" aria-hidden="true">
                <img
                  src="/hair-city-seal-outer.webp"
                  alt=""
                  className="academy-bridge-seal-outer"
                  width="104"
                  height="104"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/hair-city-seal-center.webp"
                  alt="Hair City Salon & Academy Seal"
                  className="academy-bridge-seal-center-img"
                  width="62"
                  height="62"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .academy-bridge-section {
          padding: clamp(3.5rem, 6.5vw, 6rem) 0;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
          position: relative;
          overflow: hidden;
        }

        .academy-bridge-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: clamp(2rem, 5vw, 4.5rem);
        }

        .academy-bridge-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 580px;
        }

        .academy-bridge-label {
          display: inline-block;
          margin-bottom: 0.85rem;
        }

        .academy-bridge-heading {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 3.8vw, 3.25rem);
          line-height: 1.12;
          color: var(--color-text);
          font-weight: 400;
          letter-spacing: -0.015em;
          margin: 0 0 1.25rem 0;
          font-style: normal;
        }

        .academy-bridge-body {
          font-family: var(--font-body);
          font-size: clamp(1rem, 1.25vw, 1.125rem);
          line-height: 1.6;
          color: var(--color-muted);
          margin: 0 0 2rem 0;
          font-style: normal;
          max-width: 520px;
        }

        .academy-bridge-btn {
          margin-top: 0.25rem;
        }

        .academy-bridge-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .academy-bridge-arch-wrap {
          position: relative;
          width: 100%;
          max-width: 360px;
        }

        /* Same arch-shaped mask used in the salon hero */
        .academy-bridge-arch-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4.15;
          border-radius: 999px 999px 0 0;
          border: 1px solid var(--color-border);
          background-color: var(--color-bg);
          overflow: hidden;
          box-shadow: 0 18px 48px rgba(25, 22, 20, 0.08);
        }

        .academy-bridge-arch-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(164, 104, 67, 0.06) 0%,
            rgba(251, 249, 245, 0.02) 50%,
            rgba(164, 104, 67, 0.08) 100%
          );
          border-radius: inherit;
          z-index: 2;
        }

        .academy-bridge-arch-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 20%;
          display: block;
          filter: saturate(0.96) contrast(1.02);
        }

        /* Hair City Seal Badge overlapping corner */
        .academy-bridge-seal-badge {
          position: absolute;
          bottom: -18px;
          right: -18px;
          width: 104px;
          height: 104px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
          filter: drop-shadow(0 8px 22px rgba(25, 22, 20, 0.16));
        }

        .academy-bridge-seal-outer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: bridgeSealSpin 24s linear infinite;
          transform-origin: center center;
          will-change: transform;
          display: block;
        }

        .academy-bridge-seal-center-img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 59%;
          height: 59%;
          border-radius: 50%;
          object-fit: contain;
          display: block;
        }

        @keyframes bridgeSealSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .academy-bridge-grid {
            grid-template-columns: 1fr;
            gap: 2.75rem;
          }

          .academy-bridge-content {
            max-width: 100%;
          }

          .academy-bridge-arch-wrap {
            max-width: 310px;
            margin: 0 auto;
          }

          .academy-bridge-seal-badge {
            bottom: -14px;
            right: -14px;
            width: 90px;
            height: 90px;
          }
        }
      `}</style>
    </section>
  );
}

function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <WalkInBanner />
      <Marquee />
      <WhyHairCity />
      <ServicesOverview />
      <CuttingSection />
      <ColourSection />
      <TreatmentsSection />
      <LazySection minHeight={500}>
        <Pricing />
      </LazySection>
      <LazySection minHeight={600}>
        <Academy />
      </LazySection>
      <AcademyBridgeSection />
      <LazySection minHeight={550}>
        <Work />
      </LazySection>
      <LazySection minHeight={500}>
        <BeforeAfter />
      </LazySection>
      <LazySection minHeight={240}>
        <InstagramStrip />
      </LazySection>
      <LazySection minHeight={450}>
        <Team />
      </LazySection>
      <LazySection minHeight={450}>
        <Reviews />
      </LazySection>
      <LazySection minHeight={450}>
        <FAQ />
      </LazySection>
      <LazySection minHeight={600}>
        <Visit />
      </LazySection>
    </main>
  );
}

// ─── Root app shell (shared across routes) ───────────────────────────────────
function AppShell() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Lenis smooth scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });

    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const progressLine = document.getElementById('scroll-progress-indicator');
    lenis.on('scroll', (e) => {
      if (progressLine) {
        const progress = e.progress || 0;
        progressLine.style.transform = `scaleX(${progress})`;
      }
    });

    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Anchor links smooth scroll with header offset
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -72, duration: 1.2 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  useEffect(() => initMagnetic('.btn-primary'), []);

  useEffect(() => {
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div id="scroll-progress-indicator" aria-hidden="true" />
      {!preloaderDone && (
        <Preloader
          onComplete={() => {
            setPreloaderDone(true);
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }}
        />
      )}
      <ScrollToTop />
      <RouteMetadata />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/academy"
          element={
            <main id="main-content" tabIndex={-1}>
              <Suspense
                fallback={
                  <div
                    style={{
                      minHeight: '80vh',
                      background: 'var(--color-dark-bg)',
                    }}
                    aria-hidden="true"
                  />
                }
              >
                <SectionMountTrigger>
                  <AcademyPage />
                </SectionMountTrigger>
              </Suspense>
            </main>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<div style={{ minHeight: '80vh' }} aria-hidden="true" />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
      <Footer />
      <MobileStickyBar />
    </>
  );
}

// ─── Root with router ─────────────────────────────────────────────────────────
export function App() {
  return (
    <BrowserRouter>
      <PageTransitionProvider>
        <AppShell />
      </PageTransitionProvider>
    </BrowserRouter>
  );
}

export default App;
