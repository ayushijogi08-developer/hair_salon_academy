import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { siteData } from '../data/site';
import { OpenStatus } from '../components/OpenStatus';
import { track } from '../lib/track';

export const Hero = () => {
  const heroRef = useRef(null);
  const visualRef = useRef(null);
  const heroData = siteData.hero;
  const heroImg = siteData.images.hero;
  const secondaryImg = siteData.images.cutting?.boyCut || {
    src: siteData.images.cutting?.src,
    alt: "Client with textured cut and styled fade at Hair City Salon, Akola"
  };

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(heroRef.current);

    mm.add({
      isDesktop: '(min-width: 1024px)',
      isMobile: '(max-width: 1023px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion, isDesktop } = context.conditions;

      if (reduceMotion) {
        gsap.set(
          '.hero-meta-fade, .hero-arch-frame, .hero-learn-line, .hero-arch-caption, .hero-seal-badge, .hero-info-strip',
          {
            opacity: 1,
            scaleX: 1,
            scale: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)'
          }
        );
        return;
      }

      // Split words sliding up from mask
      const headlineEl = document.querySelector('#hero-title');
      let split = null;
      if (headlineEl) {
        split = new SplitText(headlineEl, { type: 'lines,words', linesClass: 'hero-split-line' });
      }

      // Progressive enhancement initial states
      gsap.set('.hero-meta-fade', { opacity: 0, y: 16 });
      gsap.set('.hero-arch-caption, .hero-seal-badge', { opacity: 0 });
      gsap.set('.hero-info-strip', { opacity: 0, y: 14 });

      const tl = gsap.timeline({ delay: 0.05 });

      if (split && split.words.length) {
        tl.from(split.words, {
          y: '100%',
          opacity: 0,
          duration: 0.5,
          stagger: 0.015,
          ease: 'power3.out'
        });
      }

      // The italic word "learns" arrives with an underline that draws itself
      tl.fromTo('.hero-learn-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.3, ease: 'power3.inOut' },
        '-=0.2'
      );

      // Women's arch reveals with a bottom wipe
      tl.fromTo('.hero-arch-frame-women',
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.55, ease: 'power3.inOut' },
        '-=0.3'
      )
        .fromTo('.hero-arch-img-women',
          { scale: 1.06 },
          { scale: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.55'
        );

      // Men's arch reveals about 0.12s later
      tl.fromTo('.hero-arch-frame-men',
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.55, ease: 'power3.inOut' },
        '<+=0.12'
      )
        .fromTo('.hero-arch-img-men',
          { scale: 1.06 },
          { scale: 1.04, duration: 0.6, ease: 'power3.out' },
          '-=0.55'
        );

      // Arch captions and seal badge fade in
      tl.to('.hero-arch-caption, .hero-seal-badge', {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.25');

      // Supporting paragraph & CTAs fade up
      tl.to('.hero-meta-fade', {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.out'
      }, '-=0.25');

      // The real-time status and info strip fades up last
      tl.to('.hero-info-strip', {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.2');

      // Desktop subtle mouse parallax (max 6px opposite directions, disabled on touch/fine pointer absent)
      const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (isDesktop && hasFinePointer && visualRef.current) {
        const handleMouseMove = (e) => {
          const { clientX, clientY } = e;
          // Normalized -0.5 to +0.5, clamped to max ±6px
          const rawX = (clientX / window.innerWidth - 0.5) * 12;
          const rawY = (clientY / window.innerHeight - 0.5) * 12;
          const x = Math.max(-6, Math.min(6, rawX));
          const y = Math.max(-6, Math.min(6, rawY));

          gsap.to('.hero-arch-women', {
            x: x,
            y: y,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to('.hero-arch-men', {
            x: -x,
            y: -y,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }
    });

    return () => mm.revert();
  }, [heroImg?.src, secondaryImg?.src]);

  return (
    <section id="hero" className="hero-section" ref={heroRef} aria-labelledby="hero-title">
      <div className="container hero-container">
        <div className="hero-grid">
          {/* Top Left: Headline, Sub, and CTAs */}
          <div className="hero-copy-block">
            <div className="hero-eyebrow-container hero-meta-fade">
              <span className="section-label hero-eyebrow">{heroData.eyebrow}</span>
              <div className="hero-open-status-under-eyebrow">
                <OpenStatus />
              </div>
            </div>

            <h1 id="hero-title" className="hero-h1">
              <span className="hero-title-line">Where Akola gets</span>
              <span className="hero-title-line">its hair done,</span>
              <span className="hero-title-line">
                and{' '}
                <span className="hero-learns-wrapper">
                  <span className="italic-serif">{heroData.headlineEmphasised}</span>
                  <span className="hero-learn-line" aria-hidden="true"></span>
                </span>{' '}
                how.
              </span>
            </h1>

            <p className="hero-sub hero-meta-fade">
              {heroData.sub}
            </p>
          </div>

          {/* Right Column (or Middle on Tablet/Mobile): Composed Two Matching Arches */}
          <div className="hero-visual-block" ref={visualRef}>
            <div className="hero-arch-item hero-arch-women">
              <div className="hero-arch-frame hero-arch-frame-women">
                <img
                  src={heroImg.src}
                  alt={heroImg.alt}
                  width="400"
                  height="600"
                  sizes="(max-width: 639px) 180px, (max-width: 1023px) 270px, 320px"
                  className="hero-arch-img hero-arch-img-women"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="hero-arch-caption">
                <span className="hero-caption-rule" aria-hidden="true" />
                <span className="hero-caption-text">Women’s salon</span>
              </div>
            </div>

            <div className="hero-arch-item hero-arch-men">
              <div className="hero-arch-frame hero-arch-frame-men">
                <img
                  src={secondaryImg.src}
                  alt={secondaryImg.alt}
                  width="447"
                  height="447"
                  sizes="(max-width: 639px) 140px, (max-width: 1023px) 220px, 260px"
                  className="hero-arch-img hero-arch-img-men"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="hero-arch-caption">
                <span className="hero-caption-rule" aria-hidden="true" />
                <span className="hero-caption-text">Men’s studio</span>
              </div>
            </div>

            {/* Hair City Circular Seal Logo Badge: rotating outer text ring + stationary center HC monogram */}
            <div className="hero-seal-badge" aria-hidden="true">
              <img
                src="/hair-city-seal-outer.webp"
                alt=""
                className="hero-seal-outer"
                width="108"
                height="108"
                loading="eager"
                decoding="async"
              />
              <img
                src="/hair-city-seal-center.webp"
                alt="Hair City Salon & Academy Logo"
                className="hero-seal-center-img"
                width="64"
                height="64"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>

          {/* CTAs: Primary WhatsApp + Secondary Academy (52px height) - Positioned below images on mobile */}
          <div className="hero-actions-block hero-meta-fade">
            <div className="hero-actions-row">
              <a
                href="#visit"
                className="btn btn-primary hero-btn"
                onClick={() => track.bookingSubmit({ location: 'hero' })}
              >
                <span>{heroData.ctaPrimary}</span>
                <span className="btn-arrow" aria-hidden="true">↓</span>
              </a>

              <a
                href="#academy"
                className="btn btn-secondary hero-btn"
                onClick={() => track.academyEnquirySubmit({ location: 'hero' })}
              >
                <span>{heroData.ctaSecondary}</span>
                <span className="btn-arrow" aria-hidden="true">↓</span>
              </a>
            </div>

            {/* Social Proof Line: rendered ONLY when real confirmed rating and count exist */}
            {heroData.proof?.confirmed && heroData.proof?.rating && heroData.proof?.count && (
              <a
                href={siteData.links.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-proof"
                aria-label={`${heroData.proof.rating} on Google from ${heroData.proof.count} reviews`}
              >
                <span className="hero-proof-stars" aria-hidden="true">★</span>
                <span className="hero-proof-text">
                  {heroData.proof.rating} on Google · {heroData.proof.count} reviews
                </span>
              </a>
            )}
          </div>

          {/* Bottom Left (or Bottom on Tablet/Mobile): Info Strip separated by single hairline */}
          <div className="hero-info-strip">
            <div className="hero-info-col hero-info-col-1">
              <span className="hero-info-label">Today</span>
              <div className="hero-info-value hero-status-row">
                <OpenStatus />
              </div>
            </div>

            <div className="hero-info-col hero-info-col-2">
              <span className="hero-info-label">Find us</span>
              <div className="hero-info-value">
                <span className="hero-location-val">Necklace Road, Akola</span>
              </div>
            </div>

            <div className="hero-info-col hero-info-col-3">
              <span className="hero-info-label">Explore</span>
              <div className="hero-info-value hero-explore-links">
                <a href="#services" className="hero-explore-link">
                  <span>The salon</span>
                  <span className="hero-explore-arrow" aria-hidden="true">→</span>
                </a>
                <a href="#academy" className="hero-explore-link">
                  <span>The academy</span>
                  <span className="hero-explore-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Scroll Cue (desktop and tablet, hidden on mobile & compact heights) */}
        <div className="hero-scroll-cue" aria-hidden="true">
          <span className="hero-scroll-label">Scroll</span>
          <div className="hero-scroll-track">
            <span className="hero-scroll-dot" />
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          min-height: calc(100svh - var(--header-height));
          background-color: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-block: clamp(2rem, 5vh, 4rem);
        }

        .hero-container {
          width: 100%;
        }

        /* Two-column layout on Desktop >= 1024px */
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          grid-template-rows: auto auto auto;
          grid-template-areas:
            "copy   visual"
            "actions visual"
            "strip  visual";
          column-gap: clamp(1.5rem, 3vw, 3rem);
          align-items: center;
        }

        .hero-copy-block {
          grid-area: copy;
          max-width: 660px;
          width: 100%;
        }

        .hero-eyebrow-container {
          margin-bottom: clamp(1rem, 1.8vw, 1.5rem);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .hero-eyebrow {
          margin-bottom: 0;
        }

        .hero-open-status-under-eyebrow {
          display: inline-flex;
        }

        .hero-actions-block {
          grid-area: actions;
          max-width: 660px;
          width: 100%;
        }

        .hero-visual-block {
          grid-area: visual;
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          justify-self: end;
          gap: clamp(12px, 1.5vw, 16px);
          width: 100%;
          max-width: 640px;
          margin-left: auto;
          max-height: calc(100svh - var(--header-height) - 4rem);
        }

        .hero-info-strip {
          grid-area: strip;
          border-top: 1px solid var(--color-border);
          padding-top: clamp(1.25rem, 2.5vh, 1.75rem);
          margin-top: clamp(2rem, 4vh, 3.25rem);
          display: grid;
        grid-template-columns: auto auto auto;
justify-content: space-between;
          align-items: stretch;
          max-width: 660px;
          width: 100%;
        }

        /* Headline: 3 deliberate lines on desktop */
        .hero-h1 {
          font-family: var(--font-serif);
          font-size: clamp(2.75rem, 4.4vw, 4.65rem);
          line-height: 1.05;
          letter-spacing: -0.01em;
          text-wrap: balance;
          color: var(--color-text);
          margin-bottom: clamp(1.4rem, 2.6vh, 2rem);
        }

        .hero-h1:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 6px;
          border-radius: 2px;
        }

        .hero-title-line {
          display: block;
        }

        .hero-split-line {
          overflow: hidden;
        }

        .hero-learns-wrapper {
          position: relative;
          display: inline-block;
        }

        .hero-learn-line {
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent);
          transform-origin: left;
          transform: scaleX(0);
        }

        .hero-sub {
          font-family: var(--font-sans);
          font-size: clamp(1rem, 1.25vw, 1.125rem);
          font-weight: 400;
          color: #38332F;
          line-height: 1.6;
          max-width: 44ch;
          text-wrap: pretty;
          text-wrap: balance;
          margin-bottom: clamp(1.85rem, 3.6vh, 2.75rem);
        }

        .hero-actions-row {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.5vw, 16px);
        }

        .hero-btn {
          height: 52px;
          min-height: 52px;
          padding: 0 1.85rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: var(--size-small);
          box-sizing: border-box;
        }

        /* Optional Quiet Social Proof Line Under CTAs */
        .hero-social-proof {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          min-height: 44px;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--color-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .hero-social-proof:hover,
        .hero-social-proof:focus-visible {
          color: var(--color-text);
        }

        .hero-proof-stars {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          color: var(--color-accent);
        }

        .hero-star-icon {
          width: 14px;
          height: 14px;
        }

        .hero-proof-rating {
          font-weight: 600;
          color: var(--color-text);
        }

        /* Two Matching Arches */
        .hero-arch-item {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .hero-arch-women {
          width: calc(56% - 8px);
          flex: 0 0 calc(56% - 8px);
        }

        .hero-arch-men {
          width: calc(44% - 8px);
          flex: 0 0 calc(44% - 8px);
          margin-top: 12%;
        }

        .hero-arch-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4.15;
          border-radius: 999px 999px 0 0;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          padding: 0;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(25, 22, 20, 0.05);
        }

        .hero-arch-frame-men {
          background-color: #74716e;
        }

        /* Warm tone terracotta/cream gradient overlay across both portraits */
        .hero-arch-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(164, 104, 67, 0.07) 0%,
            rgba(251, 249, 245, 0.03) 50%,
            rgba(164, 104, 67, 0.09) 100%
          );
          mix-blend-mode: normal;
          border-radius: inherit;
          z-index: 2;
        }

        .hero-arch-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          will-change: transform;
          filter: saturate(0.95) contrast(1.02);
        }

        .hero-arch-img-women {
          object-position: 50% 30%;
        }

        .hero-arch-img-men {
        object-position: 50% 8%;
transform: none;
        }

        .hero-arch-caption {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-top: 0.85rem;
          align-self: flex-start;
        }

        .hero-caption-rule {
          width: 24px;
          height: 1px;
          background-color: var(--color-border);
          flex-shrink: 0;
        }

        .hero-caption-text {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-muted);
          white-space: nowrap;
        }

        /* Circular Hair City Seal Logo Badge */
        .hero-seal-badge {
          position: absolute;
          left: calc(56% - 8px);
          top: 65%;
          transform: translate(-50%, -50%);
          width: 108px;
          height: 108px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
          filter: drop-shadow(0 6px 18px rgba(25, 22, 20, 0.14));
          transition: transform 0.3s ease;
        }

        .hero-seal-outer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: heroSealRotate 24s linear infinite;
          transform-origin: center center;
          will-change: transform;
          display: block;
        }

        .hero-seal-center-img {
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

        @keyframes heroSealRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Info Strip Columns (Equal Widths & Full-Height Border Dividers) */
        .hero-info-col {
          display: flex;
          flex-direction: column;
          padding-inline: 1.25rem;
          box-sizing: border-box;
          justify-content: flex-start;
        }

        .hero-info-col-1 {
          padding-left: 0;
          padding-right: 1.25rem;
        }

        .hero-info-col-2 {
          border-left: 1px solid var(--color-border);
          padding-left: 1.25rem;
          padding-right: 1.25rem;
        }

        .hero-info-col-3 {
          border-left: 1px solid var(--color-border);
          padding-left: 1.25rem;
          padding-right: 0;
        }

        .hero-info-label {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-muted);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .hero-info-value {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text);
          line-height: 1.4;
          display: flex;
          align-items: center;
          min-height: 24px;
        }

        .hero-status-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .hero-status-text {
          font-size: 14.5px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.015em;
          white-space: nowrap;
        }

        .hero-location-val {
          white-space: nowrap;
          font-size: 15px;
        }

        .status-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .status-indicator-dot.is-open {
          background-color: #2E7D32;
          box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
          animation: statusDotPulse 2.4s infinite ease-in-out;
        }

        .status-indicator-dot.is-closed {
          background-color: #A46843;
        }

        @keyframes statusDotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.75;
          }
        }

        .hero-explore-links {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
        }

        .hero-explore-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text);
          text-decoration: none;
          transition: color 0.2s ease;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
          min-height: 24px;
        }

        .hero-explore-link:hover,
        .hero-explore-link:focus-visible {
          color: var(--color-accent);
        }

        .hero-explore-arrow {
          display: inline-block;
          font-size: 0.85em;
          transition: transform 0.2s ease;
        }

        .hero-explore-link:hover .hero-explore-arrow,
        .hero-explore-link:focus-visible .hero-explore-arrow {
          transform: translateX(3px);
        }

        /* Compact desktop screen height handling (e.g. 1366x768) */
        @media (max-height: 820px) and (min-width: 1280px) {
          .hero-section {
            padding-block: 1.25rem;
          }
          .hero-h1 {
            font-size: clamp(2.35rem, 4vw, 3.85rem);
            margin-bottom: 0.85rem;
          }
          .hero-sub {
            margin-bottom: 1.15rem;
          }
          .hero-actions-row {
            margin-bottom: 0;
          }
          .hero-visual-block {
            max-width: 480px;
          }
          .hero-seal-badge {
            top: 66%;
            width: 84px;
            height: 84px;
          }
          .hero-info-strip {
            margin-top: 1.25rem;
            padding-top: 0.85rem;
          }
        }

        /* TABLET (640px – 1023px): Single Column Flow */
        @media (min-width: 640px) and (max-width: 1279px) {
          .hero-section {
            min-height: auto;
            padding-block: clamp(2.5rem, 6vh, 4rem);
          }

          .hero-grid {
            display: flex;
            flex-direction: column;
            grid-template-columns: 1fr;
            grid-template-areas: none;
            gap: 0;
          }

          .hero-copy-block {
            order: 1;
            max-width: 100%;
          }

          .hero-h1 {
            font-size: clamp(2.5rem, 6.5vw, 4.25rem);
            margin-bottom: 1.25rem;
          }

          .hero-sub {
            max-width: 52ch;
            margin-bottom: 0;
          }

          .hero-visual-block {
            order: 2;
            max-width: 540px;
            margin: clamp(2rem, 4vh, 3rem) auto clamp(1.5rem, 3vh, 2.5rem);
            align-self: center;
          }

          .hero-arch-men {
            margin-top: 8%;
          }

          .hero-seal-badge {
            top: 64%;
          }

          .hero-actions-block {
            order: 3;
            max-width: 100%;
            margin-bottom: clamp(2rem, 4vh, 3rem);
          }

          .hero-actions-row {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .hero-info-strip {
            order: 4;
            max-width: 100%;
            margin-top: 0;
            padding-top: 1.75rem;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: stretch;
          }
        }

        /* MOBILE (< 640px): Compact, Single Column, Stacked CTAs & Info */
        @media (max-width: 639px) {
          .hero-section {
            min-height: auto;
            padding-block: 2rem 2.5rem;
          }

          .hero-grid {
            display: flex;
            flex-direction: column;
            grid-template-columns: 1fr;
            grid-template-areas: none;
            gap: 0;
          }

          .hero-copy-block {
            order: 1;
            max-width: 100%;
          }

          .hero-h1 {
            font-size: clamp(2.2rem, 9.8vw, 3.1rem);
            line-height: 1.08;
            letter-spacing: -0.015em;
            text-wrap: balance;
            margin-bottom: 1rem;
          }

          .hero-sub {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 0.25rem;
          }

          /* Two-arch visual smaller side-by-side, placed directly under subtitle */
          .hero-visual-block {
            order: 2;
            width: 100%;
            max-width: 360px;
            margin: 1.25rem auto 1.5rem;
            align-self: center;
            gap: 12px;
          }

          .hero-arch-women {
            width: calc(56% - 6px);
            flex: 0 0 calc(56% - 6px);
          }

          .hero-arch-men {
            width: calc(44% - 6px);
            flex: 0 0 calc(44% - 6px);
            margin-top: 8%;
          }

          .hero-seal-badge {
            width: 82px;
            height: 82px;
            left: calc(56% - 6px);
            top: 60%;
          }

          .hero-caption-text {
            font-size: 11px;
          }

          /* Action buttons placed directly below the images */
          .hero-actions-block {
            order: 3;
            width: 100%;
            margin-bottom: 1.75rem;
          }

          .hero-actions-row {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
          }

          .hero-actions-row .hero-btn {
            width: 100%;
            height: 48px;
            min-height: 48px;
            justify-content: center;
          }

          /* Info strip single column with row hairlines */
          .hero-info-strip {
            order: 4;
            max-width: 100%;
            margin-top: 0;
            padding-top: 0;
            border-top: none;
            display: flex;
            flex-direction: column;
            gap: 0;
          }

          .hero-info-col {
            padding: 0.85rem 0;
            padding-inline: 0;
            border-left: none;
            border-top: 1px solid var(--color-border);
            gap: 0.35rem;
          }

          .hero-info-col-1 {
            border-top: 1px solid var(--color-border);
            padding-right: 0;
          }

          .hero-info-col-2,
          .hero-info-col-3 {
            border-left: none;
            padding-left: 0;
            padding-right: 0;
          }

          .hero-explore-links {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-top: 0.2rem;
          }

          .hero-explore-link {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
        }

        /* Decorative Scroll Cue (desktop and tablet, aria-hidden) */
        .hero-scroll-cue {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.45rem;
          z-index: 10;
          pointer-events: none;
          user-select: none;
        }

        .hero-scroll-label {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-muted);
          line-height: 1;
        }

        .hero-scroll-track {
          width: 1px;
          height: 38px;
          background-color: var(--color-border);
          position: relative;
          overflow: hidden;
        }

        .hero-scroll-dot {
          position: absolute;
          top: 0;
          left: -1.5px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--color-accent);
          animation: heroScrollDotAnim 2.4s ease-in-out infinite;
        }

        @keyframes heroScrollDotAnim {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateY(34px);
            opacity: 0;
          }
        }

        @media (min-width: 1280px) {
          .hero-scroll-cue {
            position: absolute;
            bottom: clamp(1rem, 2vh, 1.75rem);
            left: 50%;
            transform: translateX(-50%);
          }
        }

        @media (min-width: 640px) and (max-width: 1279px) {
          .hero-scroll-cue {
            position: relative;
            margin-top: 2rem;
            margin-inline: auto;
          }
        }

        @media (max-width: 639px) {
          .hero-scroll-cue {
            display: none;
          }
        }

        @media (max-height: 760px) {
          .hero-scroll-cue {
            display: none;
          }
        }

        /* Fallback & Reduced Motion: Ensure all elements are fully visible if JS fails, scripting is disabled, or reduced motion is active */
        @media (prefers-reduced-motion: reduce), (scripting: none) {
          .hero-meta-fade,
          .hero-arch-frame,
          .hero-arch-frame-women,
          .hero-arch-frame-men,
          .hero-arch-caption,
          .hero-seal-badge,
          .hero-info-strip,
          .hero-learn-line {
            opacity: 1 !important;
            clip-path: none !important;
            transform: none !important;
          }
          .hero-seal-svg {
            animation: none;
          }
          .status-indicator-dot.is-open {
            animation: none;
          }
          .hero-scroll-dot {
            animation: none;
            transform: translateY(16px);
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  );
};
