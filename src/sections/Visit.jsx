import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { OpenStatus } from '../components/OpenStatus';
import { canHover } from '../lib/motion';
import track from '../lib/track';

export const Visit = () => {
  const [mapActive, setMapActive] = useState(false);
  const [hasClickedMap, setHasClickedMap] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [mapInView, setMapInView] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window)
  );

  const visitRef = useRef(null);
  const mapContainerRef = useRef(null);
  const magneticCtaRef = useRef(null);

  // Lazy-load map when section nears viewport
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '350px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Desktop magnetic button effect on closing banner
  useEffect(() => {
    const btn = magneticCtaRef.current;
    if (!btn || !canHover()) return;

    const handleMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.28,
        y: y * 0.28,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(visitRef.current);

    mm.add(
      {
        isDesktop: '(min-width: 861px)',
        isMobile: '(max-width: 860px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions;

        if (reduceMotion) {
          gsap.set('.visit-pane, .visit-map-container, .visit-closing-banner', { opacity: 1 });
          return;
        }

        // Subtle stagger for cards
        gsap.from('.visit-pane', {
          y: isDesktop ? 30 : 18,
          opacity: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.visit-editorial-grid',
            start: 'top 85%',
            once: true
          }
        });

        // Banner entrance
        gsap.from('.visit-closing-banner', {
          y: 35,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.visit-closing-banner',
            start: 'top 85%',
            once: true
          }
        });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section id="visit" className="section" ref={visitRef} aria-labelledby="visit-title">
      <div className="container">
        {/* Editorial Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <span className="section-label" style={{ marginBottom: 0 }}>
              Visit The Salon
            </span>
          </div>

          <h2 id="visit-title" style={{ marginBottom: '1rem' }}>
            Walk-ins welcome every day.
          </h2>

          <p
            style={{
              fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text)',
              lineHeight: '1.4',
              marginBottom: '0.85rem'
            }}
          >
            Open Monday – Sunday · {siteData.hours.time}
          </p>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)',
              color: 'var(--color-muted)',
              lineHeight: '1.6',
              marginBottom: '1.75rem',
              maxWidth: '640px'
            }}
          >
            No appointment is needed. Walk in any day between 9:00 AM and 10:00 PM. We are located at
            Blackberry Complex on Necklace Road, Ranpise Nagar, Akola.
          </p>

          {/* Quick-action row: exactly two buttons side-by-side, never wraps a single button on desktop */}
          <div className="visit-hero-actions">
            <a
              href={siteData.links.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600 }}
              aria-label="Get Directions to Hair City on Google Maps"
              onClick={() => track.directionsClick('visit_hero')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              <span>Get Directions</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>

            <a
              href={`tel:${siteData.phoneRaw}`}
              className="btn btn-secondary"
              style={{ padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600 }}
              aria-label={`Call Hair City at ${siteData.phone}`}
              onClick={() => track.callClick('visit_hero')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call {siteData.phone}</span>
            </a>
          </div>
        </div>

        {/* 3 Editorial Cards with Equal Heights */}
        <div className="visit-editorial-grid">
          {/* Col 1: Hours card — Hours and OpenStatus only (no buttons) */}
          <div className="visit-pane">
            <div className="visit-pane-top">
              <span className="editorial-label">Hours</span>
              <div className="visit-pane-content">
                <div style={{ marginBottom: '0.75rem' }}>
                  <OpenStatus />
                </div>
                <span className="visit-highlight">{siteData.hours.days}</span>
                <span className="visit-hours">{siteData.hours.time}</span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: '1.5' }}>
                  Open daily, including weekends.
                </p>
              </div>
            </div>
            <div className="visit-hours-footer">
              <span className="visit-hours-note">Walk in anytime · No booking needed</span>
            </div>
          </div>

          {/* Col 2: Studio Address card — Address + "View on Google Maps" text link only */}
          <div className="visit-pane">
            <div className="visit-pane-top">
              <span className="editorial-label">Studio Address</span>
              <div className="visit-pane-content">
                <address
                  style={{
                    fontStyle: 'normal',
                    fontSize: '1.0625rem',
                    lineHeight: '1.6',
                    color: 'var(--color-text)',
                    margin: 0
                  }}
                >
                  <strong>{siteData.name}</strong>
                  <br />
                  {siteData.address.line1}
                  <br />
                  {siteData.address.line2}
                  <br />
                  {siteData.address.city}, {siteData.address.state} — {siteData.address.pincode}
                </address>
              </div>
            </div>
            <div className="visit-address-actions">
              <a
                href={siteData.links.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-maps-link"
                onClick={() => track.directionsClick('visit_maps_link')}
              >
                <span>View on Google Maps</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Col 3: Direct Communication card — "Chat on WhatsApp" and Instagram buttons only */}
          <div className="visit-pane">
            <div className="visit-pane-top">
              <span className="editorial-label">Direct Communication</span>
              <div className="visit-pane-content">
                <p
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: '1.6',
                    color: 'var(--color-text)',
                    margin: 0
                  }}
                >
                  Quick response on WhatsApp for haircuts, hair colour consultations, or academy
                  admissions.
                </p>
              </div>
            </div>
            <div className="visit-actions">
              <a
                href={siteData.links.whatsappGeneral}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => track.whatsappClick('visit_col3')}
              >
                Chat on WhatsApp
              </a>
              <a
                href={siteData.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Instagram @_hair_city_salon
              </a>
            </div>
          </div>
        </div>

        {/* Large Closing Banner ("Come in for a cut. Stay to learn.") — kept as is */}
        <div className="visit-closing-banner">
          <div className="visit-closing-text-wrap">
            <h3 className="visit-closing-h3">
              Come in for a cut. <span className="italic-serif">Stay to learn.</span>
            </h3>
            <p className="visit-closing-sub">
              Experience salon styling or take your first step into professional hair education on
              Necklace Road. Walk-ins welcome daily.
            </p>
          </div>

          <div
            className="visit-closing-action"
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            <a
              ref={magneticCtaRef}
              href={siteData.links.whatsappGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary visit-magnetic-btn"
              aria-label="Chat with our team on WhatsApp"
              onClick={() => track.whatsappClick('visit_banner')}
            >
              <span>Chat on WhatsApp</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a
              href={`tel:${siteData.phoneRaw}`}
              className="btn btn-secondary"
              aria-label={`Call salon at ${siteData.phone}`}
              onClick={() => track.callClick('visit_banner')}
            >
              <span>Call now</span>
            </a>
          </div>
        </div>

        {/* Embedded Interactive Map — 420px desktop / 320px mobile rounded container */}
        <div
          className="visit-map-container"
          ref={mapContainerRef}
          onClick={() => {
            if (!hasClickedMap) setHasClickedMap(true);
            setMapActive(true);
          }}
          onMouseLeave={() => setMapActive(false)}
        >
          {iframeError ? (
            <div className="map-fallback-card">
              <div className="map-fallback-inner">
                <div className="map-placeholder-pin" aria-hidden="true">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <h3 className="map-placeholder-title">{siteData.name}</h3>
                <p className="map-placeholder-address">
                  {siteData.address.line1}, {siteData.address.line2}, {siteData.address.city}
                </p>
                <div style={{ marginTop: '1.25rem' }}>
                  <a
                    href={siteData.links.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    onClick={() => track.directionsClick('visit_map_fallback')}
                  >
                    <span>Open in Google Maps</span>
                    <span className="btn-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {mapInView ? (
                <iframe
                  src="https://www.google.com/maps?q=20.7122645,77.0095123&z=17&output=embed"
                  title="Map showing Hair City Salon & Academy, Akola"
                  loading="lazy"
                  className="visit-map-iframe"
                  style={{
                    pointerEvents: mapActive ? 'auto' : 'none'
                  }}
                  onError={() => setIframeError(true)}
                  allowFullScreen=""
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="map-loading-placeholder">
                  <span className="map-loading-text">Loading map...</span>
                </div>
              )}

              {/* Pill hint at bottom-left, removed permanently after first click */}
              {!hasClickedMap && (
                <div className="map-pill-hint" aria-hidden="true">
                  <span>Click map to interact</span>
                </div>
              )}

              {/* Done button when map is active on mobile / touch */}
              {mapActive && (
                <button
                  type="button"
                  className="map-done-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapActive(false);
                  }}
                  aria-label="Done interacting with map"
                >
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .visit-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (min-width: 640px) {
          .visit-hero-actions {
            flex-wrap: nowrap;
            width: fit-content;
          }
        }

        .visit-editorial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(1.5rem, 3vw, 2.5rem);
          align-items: stretch;
        }

        .visit-pane {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: clamp(1.5rem, 2.5vw, 2.25rem);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 12px rgba(20, 18, 17, 0.02);
        }

        .visit-pane-top {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .visit-hours-footer {
          margin-top: 1.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .visit-hours-note {
          display: inline-block;
          font-size: var(--size-micro);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-muted);
          font-weight: 600;
        }

        .visit-address-actions {
          margin-top: 1.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .visit-maps-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: color var(--transition-fast);
        }

        .visit-maps-link:hover {
          color: var(--color-accent-soft);
        }

        .visit-actions {
          margin-top: 1.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .visit-actions .btn {
          width: 100%;
          min-height: 2.85rem;
          justify-content: center;
        }

        .visit-highlight {
          display: block;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }

        .visit-hours {
          display: block;
          font-size: 1.1rem;
          color: var(--color-accent);
          font-weight: 500;
        }

        /* Large Closing Line Banner */
        .visit-closing-banner {
          margin-top: clamp(3rem, 6vw, 4.5rem);
          padding: clamp(2rem, 4vw, 3.5rem);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .visit-closing-h3 {
          font-family: var(--font-serif);
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          line-height: 1.15;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .visit-closing-sub {
          font-size: 1rem;
          color: var(--color-muted);
          max-width: 48ch;
          line-height: 1.6;
        }

        .visit-magnetic-btn {
          padding: 1.15rem 2.25rem;
          font-size: 0.9375rem;
        }

        /* 420px desktop / 320px mobile rounded container */
        .visit-map-container {
          margin-top: clamp(2.5rem, 5vw, 4rem);
          position: relative;
          width: 100%;
          height: 320px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(20, 18, 17, 0.05);
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .visit-map-container {
            height: 420px;
          }
        }

        .visit-map-iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        .map-loading-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
        }

        .map-loading-text {
          font-size: var(--size-micro);
          color: var(--color-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .map-pill-hint {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          z-index: 5;
          pointer-events: none;
        }

        .map-pill-hint span {
          display: inline-block;
          font-size: var(--size-micro);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--color-text);
          background: rgba(250, 248, 245, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid var(--color-border);
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          box-shadow: 0 2px 8px rgba(20, 18, 17, 0.12);
        }

        .map-done-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          background: var(--color-bg);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          padding: 0.45rem 1rem;
          font-family: var(--font-body);
          font-size: var(--size-small);
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(20, 18, 17, 0.15);
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .map-done-btn:hover {
          background: var(--color-accent);
          color: #FFFFFF;
          border-color: var(--color-accent);
        }

        .map-fallback-card {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          background: var(--color-surface);
          text-align: center;
        }

        .map-fallback-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 440px;
        }

        .map-placeholder-pin {
          color: var(--color-accent);
          margin-bottom: 0.75rem;
        }

        .map-placeholder-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--color-text);
          margin-bottom: 0.35rem;
        }

        .map-placeholder-address {
          font-size: 0.9375rem;
          color: var(--color-muted);
          line-height: 1.5;
          margin: 0;
        }

        @media (pointer: coarse) {
          .visit-maps-link {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
          .map-done-btn {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};
