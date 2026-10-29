import React, { useState, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteData, resolveTeamPhoto } from '../data/site';
import { OpenStatus } from '../components/OpenStatus';
import { AcademyLightbox } from '../components/AcademyLightbox';
import { isPreviewMode, getSampleAcademyGallery, getSampleAcademyTeam } from '../lib/preview';
import track from '../lib/track';
import academyImgFallback from '../assets/images/academy.jpg';

gsap.registerPlugin(ScrollTrigger);

// Check if src/assets/images/academy/hero.jpg exists, otherwise fall back to current academy image
const academyHeroModules = import.meta.glob('../assets/images/academy/hero.{jpg,jpeg,png,webp}', { eager: true });
const resolvedHeroMatch = Object.keys(academyHeroModules)[0];
const resolvedHeroImg = resolvedHeroMatch
  ? (academyHeroModules[resolvedHeroMatch].default || academyHeroModules[resolvedHeroMatch])
  : null;

const getInitials = (name) => {
  if (!name) return 'HC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EducatorCard = ({ edu }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(edu.name);
  const photoSrc = resolveTeamPhoto(edu.photo) || (typeof edu.photo === 'string' && (edu.photo.startsWith('http') || edu.photo.startsWith('data:') || edu.photo.startsWith('/')) ? edu.photo : null);
  const showPhoto = Boolean(photoSrc && !imgFailed);

  return (
    <article className="acad-educator-card">
      <div className="acad-educator-photo-frame">
        {edu.isSample && (
          <span className="acad-sample-badge" aria-label="Sample educator profile">SAMPLE</span>
        )}
        {showPhoto ? (
          <img
            src={photoSrc}
            alt={edu.name}
            className="acad-educator-img"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="acad-educator-initials" aria-label={`Initials for ${edu.name}`}>
            <span className="acad-educator-initials-text">{initials}</span>
          </div>
        )}
      </div>
      <div className="acad-educator-body">
        <span className="acad-educator-role">{edu.role}</span>
        <h3 className="acad-educator-name">{edu.name}</h3>
        {edu.experience && <span className="acad-educator-exp">{edu.experience}</span>}
        {edu.bio && <p className="acad-educator-bio">{edu.bio}</p>}
      </div>
    </article>
  );
};

export const AcademyPage = () => {
  const data = siteData.academy;
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const archWrapRef = useRef(null);
  const timelineRef = useRef(null);

  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState(null);

  // Hero image source: use hero.jpg in academy/ if it exists, otherwise academy.jpg
  const heroPhotoSrc = resolvedHeroImg || siteData.images.academy?.src || academyImgFallback;
  const heroPhotoAlt = siteData.images.academy?.alt || "Hair City Academy educator demonstrating precision haircutting and styling techniques to students";

  // 1. Educators data: render confirmed items from siteData.academyTeam or siteData.team, or dev preview
  const confirmedEducators = [
    ...(siteData.academyTeam?.filter((m) => m && m.confirmed === true) || []),
    ...(siteData.team?.filter((m) => m && m.confirmed === true && m.role?.toLowerCase().includes('educator')) || [])
  ];
  const preview = isPreviewMode();
  const displayEducators = confirmedEducators.length > 0 ? confirmedEducators : (preview ? getSampleAcademyTeam() : []);

  // 2. Gallery data: auto-loaded from siteData.academyGallery or dev preview
  const confirmedGallery = siteData.academyGallery?.filter((img) => img && img.confirmed && img.src) || [];
  const displayGallery = confirmedGallery.length > 0 ? confirmedGallery : (preview ? getSampleAcademyGallery() : []);

  // 3. How to join steps from siteData
  const joinSteps = data.howToJoin || [
    { step: '1', title: 'Enquire on WhatsApp' },
    { step: '2', title: 'Talk to the academy team' },
    { step: '3', title: 'Choose your batch' }
  ];

  // 4. Marquee items
  const marqueeItems = ['Foundations', 'Cutting', 'Colour', 'Styling & Grooming'];

  // 5. Audience cards from confirmed facts
  const audienceCards = [
    {
      num: '01',
      title: 'Beginners',
      summary: 'Start with hair and scalp basics, tools, hygiene and client handling.'
    },
    {
      num: '02',
      title: 'Aspiring Professionals',
      summary: 'Build your sectioning, cutting and colour skills in a working salon.'
    },
    {
      num: '03',
      title: 'Working Stylists',
      summary: 'Sharpen your existing skills with hands-on practice.'
    }
  ];

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(pageRef.current);

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions;

        if (reduceMotion) {
          gsap.set(
            '.acad-hero-arch-frame, .acad-hero-emphasis-line, .acad-seal-badge, .acad-bento-card, .acad-audience-card, .acad-step-card, .acad-timeline-line-fill, .acad-educator-card, .acad-gallery-card',
            {
              opacity: 1,
              scaleX: 1,
              scale: 1,
              y: 0,
              clipPath: 'none',
              visibility: 'visible'
            }
          );
          return;
        }

        // Hero Stagger Reveal
        const heroTl = gsap.timeline({ delay: 0.1 });

        heroTl
          .fromTo(
            '.acad-hero-stagger',
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: 'power3.out'
            }
          )
          .fromTo(
            '.acad-hero-emphasis-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.45, ease: 'power3.inOut' },
            '-=0.35'
          )
          .fromTo(
            '.acad-hero-arch-frame',
            { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.8, ease: 'power3.inOut' },
            '-=0.6'
          )
          .fromTo(
            '.acad-seal-badge',
            { opacity: 0, scale: 0.82 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' },
            '-=0.3'
          );

        // Slow subtle parallax on arch image
        gsap.fromTo(
          '.acad-arch-img',
          { yPercent: -4 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );

        // Desktop subtle pointer parallax on hero arch
        const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop && hasFinePointer && archWrapRef.current) {
          const handleMouseMove = (e) => {
            const rawX = (e.clientX / window.innerWidth - 0.5) * 8;
            const rawY = (e.clientY / window.innerHeight - 0.5) * 8;
            gsap.to('.acad-hero-arch-frame', {
              x: rawX,
              y: rawY,
              duration: 0.9,
              ease: 'power2.out',
              overwrite: 'auto'
            });
            gsap.to('.acad-seal-badge', {
              x: rawX * 1.3,
              y: rawY * 1.3,
              duration: 0.9,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          };

          window.addEventListener('mousemove', handleMouseMove);
          context.add(() => window.removeEventListener('mousemove', handleMouseMove));
        }

        // Bento Grid cards stagger reveal
        gsap.fromTo(
          '.acad-bento-card',
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.acad-bento-grid',
              start: 'top 82%'
            }
          }
        );

        // Audience cards stagger reveal
        gsap.fromTo(
          '.acad-audience-card',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.acad-audience-grid',
              start: 'top 82%'
            }
          }
        );

        // Horizontal Timeline scrub line fill
        if (timelineRef.current) {
          gsap.fromTo(
            '.acad-timeline-line-fill',
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: timelineRef.current,
                start: 'top 75%',
                end: 'center 55%',
                scrub: 0.8
              }
            }
          );

          gsap.fromTo(
            '.acad-step-card',
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.14,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: timelineRef.current,
                start: 'top 75%'
              }
            }
          );
        }

        // Educators stagger reveal (if rendered)
        if (displayEducators.length > 0) {
          gsap.fromTo(
            '.acad-educator-card',
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.acad-educators-grid',
                start: 'top 82%'
              }
            }
          );
        }

        // Gallery bento stagger reveal (if rendered)
        if (displayGallery.length > 0) {
          gsap.fromTo(
            '.acad-gallery-card-btn',
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.acad-gallery-grid',
                start: 'top 82%'
              }
            }
          );
        }

        // Closing CTA reveal
        gsap.fromTo(
          '.acad-closing-card',
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.acad-closing-section',
              start: 'top 82%'
            }
          }
        );

        // Location & Hours reveal
        gsap.fromTo(
          '.acad-location-inner',
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.acad-location-section',
              start: 'top 85%'
            }
          }
        );
      }
    );

    return () => mm.revert();
  }, [displayEducators.length, displayGallery.length]);

  const handleScrollToLearn = (e) => {
    e.preventDefault();
    const target = document.getElementById('what-youll-learn');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="acad-root" ref={pageRef}>
      {/* ── 1. HERO SECTION ── */}
      <section
        id="academy-hero"
        className="acad-hero"
        ref={heroRef}
        aria-labelledby="acad-hero-title"
      >
        <div className="container acad-hero-container">
          <div className="acad-hero-split">
            {/* Left Column: Eyebrow, OpenStatus, Newsreader headline, Sub, Actions */}
            <div className="acad-hero-copy">
              <div className="acad-hero-eyebrow-row acad-hero-stagger">
                <span className="acad-eyebrow-text">{data.eyebrow}</span>
                <OpenStatus dark className="acad-hero-open-status" />
              </div>

              <h1 id="acad-hero-title" className="acad-hero-h1 acad-hero-stagger">
                Learn hair the way it is done in a{' '}
                <span className="acad-emphasis-wrapper">
                  <span className="italic-serif">working</span>
                  <span className="acad-hero-emphasis-line" aria-hidden="true" />
                </span>{' '}
                salon.
              </h1>

              {/* The confirmed sentence appears ONLY here in the hero */}
              <p className="acad-hero-intro acad-hero-stagger">{data.intro}</p>

              <div className="acad-hero-actions acad-hero-stagger">
                <a
                  href={siteData.links.whatsappAcademy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn acad-btn-primary"
                  aria-label="Enquire about the academy on WhatsApp"
                  onClick={() => track.academyEnquirySubmit({ location: 'academy_hero' })}
                >
                  <span>Enquire on WhatsApp</span>
                  <span className="acad-btn-arrow" aria-hidden="true">→</span>
                </a>

                <a
                  href="#what-youll-learn"
                  className="btn acad-btn-secondary"
                  onClick={handleScrollToLearn}
                >
                  <span>See what you&apos;ll learn</span>
                  <span className="acad-btn-arrow-down" aria-hidden="true">↓</span>
                </a>
              </div>
            </div>

            {/* Right Column: Clean Arch-shaped mask + overlapping circular seal (no outer rectangle border) */}
            <div className="acad-hero-visual" ref={archWrapRef}>
              <div className="acad-arch-container">
                <div className="acad-hero-arch-frame">
                  <img
                    src={heroPhotoSrc}
                    alt={heroPhotoAlt}
                    width="520"
                    height="693"
                    className="acad-arch-img"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="acad-arch-overlay" aria-hidden="true" />
                </div>

                {/* Hair City Circular Seal Logo Badge overlapping corner */}
                <div className="acad-seal-badge" aria-hidden="true">
                  <img
                    src="/hair-city-seal-outer.webp"
                    alt=""
                    className="acad-seal-outer"
                    width="104"
                    height="104"
                    loading="eager"
                    decoding="async"
                  />
                  <img
                    src="/hair-city-seal-center.webp"
                    alt="Hair City Salon & Academy Seal"
                    className="acad-seal-center-img"
                    width="60"
                    height="60"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SCROLLING MARQUEE STRIP ── */}
      <section className="acad-marquee-strip" aria-hidden="true">
        <div className="acad-marquee-track">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map(
            (item, index) => (
              <span key={index} className="acad-marquee-item">
                <span className="acad-marquee-label">{item}</span>
                <span className="acad-marquee-diamond">✦</span>
              </span>
            )
          )}
        </div>
      </section>

      {/* ── 3. "WHAT YOU'LL LEARN" BENTO GRID ── */}
      <section
        id="what-youll-learn"
        className="acad-learn-section"
        aria-labelledby="acad-learn-title"
      >
        <div className="container">
          <div className="acad-section-header">
            <span className="acad-section-eyebrow">CURRICULUM</span>
            <h2 id="acad-learn-title" className="acad-section-title">
              What you&apos;ll learn
            </h2>
            {/* Replaced repeated intro with short heading subtitle */}
            <p className="acad-section-lead">
              Four areas, taught hands-on in a working salon.
            </p>

            {/* Small badge row under section heading */}
            <div className="acad-heading-badges">
              <span className="acad-champagne-badge">
                <span className="acad-badge-dot" aria-hidden="true" />
                Hands-on training
              </span>
              <span className="acad-champagne-badge">
                <span className="acad-badge-dot" aria-hidden="true" />
                Real salon
              </span>
            </div>
          </div>

          {/* 2x2 Bento Grid on desktop, 1-col on mobile */}
          <div className="acad-bento-grid">
            {data.modules.map((m) => (
              <article
                key={m.num}
                className="acad-bento-card"
                aria-label={`Module ${m.num}: ${m.title}`}
              >
                <div className="acad-bento-header">
                  {/* Kept only the big number, removed Phase pills */}
                  <span className="acad-bento-num">{m.num}</span>
                </div>
                <h3 className="acad-bento-title">{m.title}</h3>
                <p className="acad-bento-desc">{m.description}</p>
                {m.detail && (
                  <div className="acad-bento-detail-wrap">
                    <span className="acad-bento-line" aria-hidden="true" />
                    <p className="acad-bento-detail">{m.detail}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. "WHO IT'S FOR" AUDIENCE CARDS ── */}
      <section className="acad-audience-section" aria-labelledby="acad-audience-title">
        <div className="container">
          <div className="acad-section-header">
            <span className="acad-section-eyebrow">STUDENT PROFILES</span>
            <h2 id="acad-audience-title" className="acad-section-title">
              Who it&apos;s for
            </h2>
            {/* Confirmed sentence as a normal subtitle without quotes or italics */}
            <p className="acad-section-lead">
              Beginners, aspiring professionals, and working stylists who want to improve their skills.
            </p>
          </div>

          <div className="acad-audience-grid">
            {audienceCards.map((card) => (
              <article key={card.num} className="acad-audience-card">
                <div className="acad-audience-card-top">
                  {/* Kept only the large italic numbers, removed Profile pills */}
                  <span className="acad-audience-num">{card.num}</span>
                </div>
                <h3 className="acad-audience-title">{card.title}</h3>
                <p className="acad-audience-desc">{card.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. "HOW TO JOIN" HORIZONTAL TIMELINE ── */}
      <section
        id="how-to-join"
        className="acad-timeline-section"
        aria-labelledby="acad-join-title"
      >
        <div className="container">
          <div className="acad-section-header">
            <span className="acad-section-eyebrow">ADMISSIONS</span>
            <h2 id="acad-join-title" className="acad-section-title">
              How to join
            </h2>
            <p className="acad-section-lead">
              Three simple steps, starting with a WhatsApp message.
            </p>
          </div>

          <div className="acad-timeline-wrap" ref={timelineRef}>
            {/* Connecting line across step nodes */}
            <div className="acad-timeline-line-base" aria-hidden="true" />
            <div className="acad-timeline-line-fill" aria-hidden="true" />

            <div className="acad-timeline-steps">
              {joinSteps.map((s) => (
                <div key={s.step} className="acad-step-card">
                  <div className="acad-step-node">
                    <span className="acad-step-num">{s.step}</span>
                  </div>
                  <div className="acad-step-content">
                    <span className="acad-step-eyebrow">Step 0{s.step}</span>
                    <h3 className="acad-step-title">{s.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Single primary button centered under the timeline */}
            <div className="acad-timeline-action">
              <a
                href={siteData.links.whatsappAcademy}
                target="_blank"
                rel="noopener noreferrer"
                className="btn acad-btn-primary"
                onClick={() => track.academyEnquirySubmit({ location: 'academy_join_timeline' })}
              >
                <span>Enquire on WhatsApp</span>
                <span className="acad-btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. EDUCATORS & GALLERY (Hide completely when empty) ── */}
      {displayEducators.length > 0 && (
        <section className="acad-educators-section" aria-labelledby="acad-educators-title">
          <div className="container">
            <div className="acad-section-header">
              <span className="acad-section-eyebrow">FACULTY &amp; MENTORS</span>
              <h2 id="acad-educators-title" className="acad-section-title">
                Academy educators
              </h2>
              <p className="acad-section-lead">
                Working salon stylists sharing live chair craft, scissor ergonomics, and modern client styling.
              </p>
            </div>
            <div className="acad-educators-grid">
              {displayEducators.map((edu, idx) => (
                <EducatorCard key={edu.id || idx} edu={edu} />
              ))}
            </div>
          </div>
        </section>
      )}

      {displayGallery.length > 0 && (
        <section className="acad-gallery-section" aria-labelledby="acad-gallery-title">
          <div className="container">
            <div className="acad-section-header">
              <span className="acad-section-eyebrow">GALLERY</span>
              <h2 id="acad-gallery-title" className="acad-section-title">
                Academy in practice
              </h2>
              <p className="acad-section-lead">
                Snapshots from hands-on training sessions, haircutting demonstrations, and live salon chair practice.
              </p>
            </div>
            <div className="acad-gallery-grid">
              {displayGallery.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  className="acad-gallery-card-btn"
                  onClick={() => setActiveGalleryPhoto(item)}
                  aria-label={`View photo: ${item.alt || 'Academy photo'}`}
                >
                  <div className="acad-gallery-card">
                    {item.isSample && (
                      <span className="acad-sample-badge" aria-label="Sample gallery photo">SAMPLE</span>
                    )}
                    <img
                      src={item.src}
                      alt={item.alt || 'Hair City Academy training session'}
                      className="acad-gallery-img"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="acad-gallery-card-hover" aria-hidden="true">
                      <span className="acad-gallery-zoom-icon">⊕</span>
                      <span className="acad-gallery-zoom-label">View photo</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox for Academy Gallery */}
      {activeGalleryPhoto && (
        <AcademyLightbox
          activePhoto={activeGalleryPhoto}
          photos={displayGallery}
          onClose={() => setActiveGalleryPhoto(null)}
          onSelectPhoto={setActiveGalleryPhoto}
        />
      )}

      {/* ── 7. CLOSING CTA BAND ── */}
      <section className="acad-closing-section" aria-labelledby="acad-closing-title">
        <div className="container">
          <div className="acad-closing-card">
            <div className="acad-closing-content">
              <span className="acad-closing-badge">ENROLMENT &amp; TIMINGS</span>
              <h2 id="acad-closing-title" className="acad-closing-heading">
                {data.closingLine}
              </h2>
              <p className="acad-closing-sub">
                Message or call our academy team for start dates, syllabus details and fees.
              </p>
            </div>

            <div className="acad-closing-actions">
              <a
                href={siteData.links.whatsappAcademy}
                target="_blank"
                rel="noopener noreferrer"
                className="btn acad-btn-primary acad-btn-closing"
                onClick={() => track.academyEnquirySubmit({ location: 'academy_closing' })}
              >
                <span>Enquire on WhatsApp</span>
                <span className="acad-btn-arrow" aria-hidden="true">→</span>
              </a>

              <a
                href={`tel:${siteData.phoneRaw}`}
                className="btn acad-btn-secondary acad-btn-closing"
                onClick={() => track.callClick('academy_closing')}
              >
                <span>Call {siteData.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. LOCATION AND HOURS BLOCK ── */}
      <section className="acad-location-section" aria-labelledby="acad-location-title">
        <div className="container">
          <div className="acad-location-inner">
            <div className="acad-location-info">
              <span className="acad-section-eyebrow">ACADEMY &amp; SALON FLOOR</span>
              <h2 id="acad-location-title" className="acad-location-heading">
                Where training happens
              </h2>
              <address className="acad-location-address">
                {siteData.address.full}
              </address>
              <div className="acad-location-hours-row">
                <span className="acad-hours-pill">
                  <span className="acad-badge-dot" aria-hidden="true" />
                  {siteData.hours.days}
                </span>
                <span className="acad-hours-time">{siteData.hours.time}</span>
              </div>
            </div>

            <div className="acad-location-actions">
              <a
                href={siteData.links.directions}
                target="_blank"
                rel="noopener noreferrer"
                className="btn acad-btn-primary"
                onClick={() => track.directionsClick('academy_location')}
              >
                <span>Get directions</span>
                <span className="acad-btn-arrow" aria-hidden="true">→</span>
              </a>

              <a
                href={`tel:${siteData.phoneRaw}`}
                className="btn acad-btn-secondary"
                onClick={() => track.callClick('academy_location')}
              >
                <span>Call {siteData.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCOPED CHARCOAL & CHAMPAGNE STYLES (WITH ~30% REDUCED SPACING) ── */}
      <style>{`
        .acad-root {
          --acad-bg: #11100F;
          --acad-surface: #181615;
          --acad-surface-elevated: #221F1C;
          --acad-surface-hover: #262320;
          --acad-border: rgba(229, 211, 179, 0.12);
          --acad-border-hover: rgba(229, 211, 179, 0.42);
          --acad-champagne: #E5D3B3;
          --acad-champagne-light: #F4ECE1;
          --acad-champagne-dark: #C5A880;
          --acad-text: #FAF8F5;
          --acad-text-muted: #A8A099;
          --acad-text-subtle: #736C65;

          background-color: var(--acad-bg);
          color: var(--acad-text);
          min-height: 100vh;
          overflow-x: hidden;
          font-family: var(--font-sans);
        }

        /* 30% reduced header margin */
        .acad-section-header {
          margin-bottom: clamp(1.75rem, 3.5vw, 2.75rem);
        }

        .acad-section-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--acad-champagne);
          margin-bottom: 0.75rem;
        }

        .acad-section-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 3.8vw, 3.25rem);
          font-weight: 400;
          line-height: 1.15;
          color: var(--acad-text);
          margin-bottom: 0.75rem;
        }

        .acad-section-lead {
          font-size: clamp(1rem, 1.2vw, 1.125rem);
          line-height: 1.6;
          color: var(--acad-text-muted);
          max-width: 60ch;
        }

        .acad-heading-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .acad-champagne-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          background: rgba(229, 211, 179, 0.08);
          border: 1px solid var(--acad-border);
          color: var(--acad-champagne);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .acad-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--acad-champagne);
        }

        .acad-sample-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
          background: #B34040;
          color: #FAF8F5;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        /* Buttons */
        .acad-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.95rem 1.85rem;
          background-color: var(--acad-champagne);
          color: #11100F;
          border: 1px solid var(--acad-champagne);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: background-color 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }

        .acad-btn-primary:hover {
          background-color: var(--acad-champagne-light);
          border-color: var(--acad-champagne-light);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(229, 211, 179, 0.2);
        }

        .acad-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.95rem 1.85rem;
          background: transparent;
          color: var(--acad-text);
          border: 1px solid var(--acad-border);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease, transform 0.25s ease;
          cursor: pointer;
        }

        .acad-btn-secondary:hover {
          border-color: var(--acad-border-hover);
          color: var(--acad-champagne);
          background: rgba(229, 211, 179, 0.06);
          transform: translateY(-2px);
        }

        .acad-btn-arrow {
          transition: transform 0.25s ease;
        }

        .acad-btn-primary:hover .acad-btn-arrow {
          transform: translateX(3px);
        }

        .acad-btn-arrow-down {
          transition: transform 0.25s ease;
        }

        .acad-btn-secondary:hover .acad-btn-arrow-down {
          transform: translateY(2px);
        }

        /* Hero */
        .acad-hero {
          position: relative;
          padding-top: clamp(5.5rem, 10vh, 7.5rem);
          padding-bottom: clamp(2.5rem, 5vw, 4rem);
          background: linear-gradient(180deg, #141211 0%, #11100F 100%);
        }

        .acad-hero-container {
          position: relative;
          z-index: 2;
        }

        .acad-hero-split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(2.5rem, 5vw, 5rem);
          align-items: center;
        }

        .acad-hero-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .acad-hero-eyebrow-row {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .acad-eyebrow-text {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--acad-champagne);
        }

        .acad-hero-open-status {
          background-color: rgba(229, 211, 179, 0.08) !important;
          border-color: var(--acad-border) !important;
          color: var(--acad-champagne) !important;
        }

        .acad-hero-h1 {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 4.6vw, 4.3rem);
          line-height: 1.1;
          font-weight: 400;
          color: var(--acad-text);
          margin-bottom: 1.25rem;
        }

        .acad-emphasis-wrapper {
          position: relative;
          display: inline-block;
          color: var(--acad-champagne);
        }

        .acad-hero-emphasis-line {
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 100%;
          height: 2px;
          background-color: var(--acad-champagne);
          transform-origin: left center;
        }

        .acad-hero-intro {
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          line-height: 1.65;
          color: var(--acad-text-muted);
          max-width: 48ch;
          margin-bottom: 2rem;
        }

        .acad-hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Clean Arch Mask & Round Seal: cleanly clipped, no outer border box */
        .acad-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .acad-arch-container {
          position: relative;
          width: 100%;
          max-width: 380px;
        }

        .acad-hero-arch-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4.15;
          border-radius: 999px 999px 0 0;
          border: none;
          background: transparent;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          will-change: transform, clip-path;
        }

        .acad-arch-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 18%;
          display: block;
          filter: saturate(0.96) contrast(1.02);
          will-change: transform;
        }

        .acad-arch-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(229, 211, 179, 0.05) 0%,
            rgba(17, 16, 15, 0) 50%,
            rgba(17, 16, 15, 0.45) 100%
          );
          border-radius: inherit;
          z-index: 2;
        }

        .acad-seal-badge {
          position: absolute;
          bottom: -16px;
          right: -16px;
          width: 104px;
          height: 104px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
          filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.6));
        }

        .acad-seal-outer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: acadSealSpin 24s linear infinite;
          transform-origin: center center;
          will-change: transform;
          display: block;
        }

        @keyframes acadSealSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .acad-seal-center-img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 58%;
          height: 58%;
          border-radius: 50%;
          object-fit: contain;
          display: block;
        }

        /* Marquee */
        .acad-marquee-strip {
          position: relative;
          overflow: hidden;
          background: #151312;
          border-top: 1px solid var(--acad-border);
          border-bottom: 1px solid var(--acad-border);
          padding: 0.95rem 0;
          user-select: none;
        }

        .acad-marquee-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          width: max-content;
          animation: acadMarqueeScroll 38s linear infinite;
        }

        @keyframes acadMarqueeScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .acad-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 1.75rem;
          padding-right: 1.75rem;
        }

        .acad-marquee-label {
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--acad-champagne);
        }

        .acad-marquee-diamond {
          font-size: 0.65rem;
          color: var(--acad-champagne-dark);
          opacity: 0.6;
        }

        /* Bento Grid: Learn (~30% reduced vertical padding) */
        .acad-learn-section {
          padding-top: clamp(3rem, 6vw, 5.25rem);
          padding-bottom: clamp(3rem, 6vw, 5.25rem);
          position: relative;
        }

        .acad-bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(1.25rem, 2.5vw, 2rem);
        }

        .acad-bento-card {
          position: relative;
          background-color: var(--acad-surface);
          border: 1px solid var(--acad-border);
          border-radius: 12px;
          padding: clamp(1.5rem, 3vw, 2.25rem);
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }

        .acad-bento-card:hover {
          border-color: var(--acad-border-hover);
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
        }

        .acad-bento-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .acad-bento-num {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 4vw, 3.25rem);
          font-style: italic;
          line-height: 1;
          color: var(--acad-champagne);
          opacity: 0.85;
        }

        .acad-bento-title {
          font-family: var(--font-serif);
          font-size: clamp(1.35rem, 2vw, 1.8rem);
          font-weight: 400;
          color: var(--acad-text);
          margin-bottom: 0.75rem;
        }

        .acad-bento-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--acad-champagne-light);
          margin-bottom: 1.25rem;
        }

        .acad-bento-detail-wrap {
          margin-top: auto;
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
          padding-top: 1.1rem;
          border-top: 1px solid rgba(229, 211, 179, 0.07);
        }

        .acad-bento-line {
          width: 2px;
          height: 18px;
          background-color: var(--acad-champagne-dark);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .acad-bento-detail {
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--acad-text-muted);
        }

        /* "Who It's For" Audience Cards (~30% reduced vertical padding) */
        .acad-audience-section {
          padding-top: clamp(3rem, 5.5vw, 4.75rem);
          padding-bottom: clamp(3rem, 5.5vw, 4.75rem);
          background: #141211;
          border-top: 1px solid var(--acad-border);
          border-bottom: 1px solid var(--acad-border);
        }

        .acad-audience-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.25rem, 2.5vw, 2rem);
        }

        .acad-audience-card {
          background-color: var(--acad-surface);
          border: 1px solid var(--acad-border);
          border-radius: 12px;
          padding: clamp(1.5rem, 2.75vw, 2.25rem);
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }

        .acad-audience-card:hover {
          border-color: var(--acad-border-hover);
          transform: translateY(-3px);
        }

        .acad-audience-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .acad-audience-num {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-style: italic;
          color: var(--acad-champagne);
          line-height: 1;
        }

        .acad-audience-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 400;
          color: var(--acad-text);
          margin-bottom: 0.75rem;
        }

        .acad-audience-desc {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--acad-text-muted);
        }

        /* "How To Join" Timeline (~30% reduced vertical padding) */
        .acad-timeline-section {
          padding-top: clamp(3rem, 6vw, 5.25rem);
          padding-bottom: clamp(3rem, 6vw, 5.25rem);
          position: relative;
        }

        .acad-timeline-wrap {
          position: relative;
          margin-top: clamp(1.5rem, 3vw, 2.25rem);
        }

        .acad-timeline-line-base {
          position: absolute;
          top: 28px;
          left: 14%;
          right: 14%;
          height: 2px;
          background: rgba(229, 211, 179, 0.14);
          z-index: 1;
        }

        .acad-timeline-line-fill {
          position: absolute;
          top: 28px;
          left: 14%;
          right: 14%;
          height: 2px;
          background: var(--acad-champagne);
          transform-origin: left center;
          transform: scaleX(0);
          z-index: 2;
        }

        .acad-timeline-steps {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.5rem, 3vw, 2.5rem);
        }

        .acad-step-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .acad-step-node {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--acad-bg);
          border: 2px solid var(--acad-champagne);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 0 0 6px rgba(17, 16, 15, 0.9);
          transition: transform 0.25s ease, background-color 0.25s ease;
        }

        .acad-step-card:hover .acad-step-node {
          transform: scale(1.08);
          background-color: var(--acad-surface);
        }

        .acad-step-num {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-style: italic;
          color: var(--acad-champagne);
        }

        .acad-step-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 28ch;
        }

        .acad-step-eyebrow {
          font-size: 0.725rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--acad-champagne-dark);
          margin-bottom: 0.4rem;
        }

        .acad-step-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 400;
          color: var(--acad-text);
          line-height: 1.35;
          margin: 0;
        }

        .acad-timeline-action {
          margin-top: clamp(2.25rem, 4vw, 3.25rem);
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 4;
        }

        /* Educators Section (~30% reduced vertical padding) */
        .acad-educators-section {
          padding-top: clamp(3rem, 5.5vw, 4.75rem);
          padding-bottom: clamp(3rem, 5.5vw, 4.75rem);
          border-top: 1px solid var(--acad-border);
        }

        .acad-educators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .acad-educator-card {
          background-color: var(--acad-surface);
          border: 1px solid var(--acad-border);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        .acad-educator-card:hover {
          border-color: var(--acad-border-hover);
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
        }

        .acad-educator-photo-frame {
          aspect-ratio: 4 / 4.75;
          width: 100%;
          overflow: hidden;
          position: relative;
          background: #1D1A18;
        }

        /* Editorial Duotone-to-Colour hover transition */
        .acad-educator-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(85%) sepia(20%) brightness(0.92) contrast(1.05);
          transition: filter 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .acad-educator-card:hover .acad-educator-img {
          filter: grayscale(0%) sepia(0%) brightness(1) contrast(1.02);
          transform: scale(1.04);
        }

        .acad-educator-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #25221F 0%, #181615 100%);
        }

        .acad-educator-initials-text {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 500;
          color: var(--acad-champagne);
          letter-spacing: 0.05em;
          user-select: none;
        }

        .acad-educator-body {
          padding: 1.5rem;
        }

        .acad-educator-role {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--acad-champagne);
          margin-bottom: 0.4rem;
        }

        .acad-educator-name {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--acad-text);
          margin-bottom: 0.5rem;
        }

        .acad-educator-exp {
          display: block;
          font-size: 0.8125rem;
          color: var(--acad-text-subtle);
          margin-bottom: 0.75rem;
        }

        .acad-educator-bio {
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--acad-text-muted);
        }

        /* Academy Gallery Section (~30% reduced vertical padding) */
        .acad-gallery-section {
          padding-top: clamp(3rem, 5.5vw, 4.75rem);
          padding-bottom: clamp(3rem, 5.5vw, 4.75rem);
          border-top: 1px solid var(--acad-border);
          background: #141211;
        }

        .acad-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .acad-gallery-card-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          text-align: left;
          width: 100%;
          border-radius: 8px;
          display: block;
        }

        .acad-gallery-card {
          position: relative;
          aspect-ratio: 4 / 3.4;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--acad-border);
          background-color: var(--acad-surface);
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        .acad-gallery-card-btn:hover .acad-gallery-card {
          border-color: var(--acad-border-hover);
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }

        .acad-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.94) contrast(1.02);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
        }

        .acad-gallery-card-btn:hover .acad-gallery-img {
          transform: scale(1.05);
          filter: saturate(1.02) contrast(1.04);
        }

        .acad-gallery-card-hover {
          position: absolute;
          inset: 0;
          background: rgba(17, 16, 15, 0.45);
          backdrop-filter: blur(2px);
          opacity: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: #FAF8F5;
          transition: opacity 0.25s ease;
        }

        .acad-gallery-card-btn:hover .acad-gallery-card-hover {
          opacity: 1;
        }

        .acad-gallery-zoom-icon {
          font-size: 1.5rem;
          color: var(--acad-champagne);
        }

        .acad-gallery-zoom-label {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--acad-champagne-light);
        }

        /* Closing CTA (~30% reduced vertical padding) */
        .acad-closing-section {
          padding-top: clamp(2.75rem, 5.5vw, 4.75rem);
          padding-bottom: clamp(2.75rem, 5.5vw, 4.75rem);
        }

        .acad-closing-card {
          background: linear-gradient(135deg, #1A1715 0%, #151312 100%);
          border: 1px solid var(--acad-border);
          border-radius: 16px;
          padding: clamp(2.25rem, 5vw, 3.75rem) clamp(1.75rem, 4.5vw, 3.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .acad-closing-content {
          max-width: 58ch;
        }

        .acad-closing-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--acad-champagne);
          margin-bottom: 0.75rem;
        }

        .acad-closing-heading {
          font-family: var(--font-serif);
          font-size: clamp(1.75rem, 3.2vw, 2.5rem);
          line-height: 1.2;
          font-weight: 400;
          color: var(--acad-text);
          margin-bottom: 0.85rem;
        }

        .acad-closing-sub {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--acad-text-muted);
          margin: 0;
        }

        .acad-closing-actions {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          flex-shrink: 0;
          min-width: 240px;
        }

        .acad-btn-closing {
          width: 100%;
          text-align: center;
        }

        /* Location Block (balanced padding matching rest of page) */
        .acad-location-section {
          padding-top: clamp(2.5rem, 5vw, 3.75rem);
          padding-bottom: clamp(2.5rem, 5vw, 3.75rem);
          border-top: 1px solid var(--acad-border);
        }

        .acad-location-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem;
          flex-wrap: wrap;
          padding: clamp(1.75rem, 3.5vw, 2.5rem);
          background-color: var(--acad-surface);
          border: 1px solid var(--acad-border);
          border-radius: 12px;
        }

        .acad-location-info {
          max-width: 52ch;
        }

        .acad-location-heading {
          font-family: var(--font-serif);
          font-size: clamp(1.65rem, 2.8vw, 2.2rem);
          font-weight: 400;
          color: var(--acad-text);
          margin-bottom: 0.65rem;
        }

        .acad-location-address {
          font-style: normal;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--acad-champagne-light);
          margin-bottom: 1rem;
        }

        .acad-location-hours-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .acad-hours-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          background: rgba(229, 211, 179, 0.08);
          border: 1px solid var(--acad-border);
          color: var(--acad-champagne);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .acad-hours-time {
          font-size: 0.875rem;
          color: var(--acad-text-muted);
        }

        .acad-location-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Responsive */
        @media (max-width: 1023px) {
          .acad-hero-split {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .acad-hero-visual {
            order: -1;
            margin-bottom: 0.75rem;
          }

          .acad-arch-container {
            max-width: 310px;
          }

          .acad-audience-grid {
            grid-template-columns: 1fr;
          }

          .acad-closing-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .acad-closing-actions {
            width: 100%;
          }

          .acad-location-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .acad-location-actions {
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .acad-bento-grid {
            grid-template-columns: 1fr;
          }

          .acad-timeline-line-base,
          .acad-timeline-line-fill {
            display: none;
          }

          .acad-timeline-steps {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }

          .acad-step-card {
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
            gap: 1.25rem;
          }

          .acad-step-node {
            margin-bottom: 0;
            flex-shrink: 0;
          }

          .acad-step-content {
            align-items: flex-start;
            text-align: left;
          }

          .acad-hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .acad-btn-primary,
          .acad-btn-secondary {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .acad-arch-container {
            max-width: 270px;
          }

          .acad-seal-badge {
            width: 82px;
            height: 82px;
            bottom: -12px;
            right: -12px;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .acad-marquee-track {
            animation: none !important;
            transform: none !important;
          }

          .acad-seal-outer {
            animation: none !important;
          }

          .acad-hero-arch-frame,
          .acad-bento-card,
          .acad-audience-card,
          .acad-educator-img,
          .acad-gallery-img {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AcademyPage;
