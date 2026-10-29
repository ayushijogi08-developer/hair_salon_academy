import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';

export const InstagramStrip = () => {
  const sectionRef = useRef(null);
  const photos = siteData.images?.work?.slice(0, 5) || [];
  const instagramUrl = siteData.links.instagram;

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el || photos.length === 0) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.set('.insta-tile', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.insta-tile',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [photos.length]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <section id="instagram" className="section" ref={sectionRef} aria-labelledby="instagram-heading">
      <div className="container">
        <SectionEyebrowRow label="Social Dispatch" />

        <div className="instagram-header-wrap">
          <div style={{ maxWidth: '640px' }}>
            <h2 id="instagram-heading" style={{ marginBottom: '0.75rem' }}>
              On Instagram
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Real cuts, colour work and salon craft shared daily from our Akola chairs.
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary instagram-cta-btn"
            aria-label="Follow Hair City Salon on Instagram @_hair_city_salon (opens in new tab)"
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
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>Follow @_hair_city_salon</span>
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        {/* Decorative Grid of Authentic Salon Gallery Photos */}
        <div className="instagram-photo-grid" role="list" aria-label="Recent salon work gallery">
          {photos.map((item, idx) => (
            <a
              key={item.id || idx}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-tile"
              role="listitem"
              aria-label={`View ${item.title || 'salon work'} on Instagram`}
            >
              <div className="insta-tile-frame">
                <img
                  src={item.src}
                  alt={item.alt || item.title || "Hair City Salon work"}
                  width="400"
                  height="500"
                  className="insta-tile-img discipline-photo-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="insta-tile-overlay" aria-hidden="true">
                  <span className="insta-tile-glyph">↗</span>
                  <span className="insta-tile-title">{item.title}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .instagram-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2rem, 4vw, 3rem);
        }

        .instagram-cta-btn {
          padding: 0.95rem 1.85rem;
          font-weight: 600;
        }

        .instagram-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .insta-tile {
          display: block;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          border-radius: 2px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          position: relative;
        }

        .insta-tile-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          overflow: hidden;
          background-color: var(--color-surface-elevated);
        }

        .insta-tile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s var(--ease-editorial);
        }

        .insta-tile:hover .insta-tile-img {
          transform: scale(1.05);
        }

        .insta-tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20, 18, 17, 0) 50%, rgba(20, 18, 17, 0.82) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .insta-tile:hover .insta-tile-overlay,
        .insta-tile:focus-visible .insta-tile-overlay {
          opacity: 1;
        }

        .insta-tile:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 3px;
        }

        .insta-tile-glyph {
          align-self: flex-end;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.9);
          color: #141211;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .insta-tile-title {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          color: #FAF8F5;
          font-weight: 500;
          line-height: 1.3;
        }

        @media (max-width: 640px) {
          .instagram-photo-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramStrip;
