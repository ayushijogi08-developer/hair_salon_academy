import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';
import { isPreviewMode, getSampleReviews } from '../lib/preview';

export const Reviews = () => {
  const confirmed = siteData.reviews?.filter((item) => item.confirmed) || [];
  const preview = isPreviewMode();
  const displayReviews = confirmed.length > 0 ? confirmed : (preview ? getSampleReviews() : []);
  const proof = siteData.hero?.proof;
  const hasProof = Boolean(proof?.confirmed && proof?.rating && proof?.count);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const total = displayReviews.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay: 6s intervals, pauses on hover / focus, disabled on prefers-reduced-motion
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [total, isHovered, nextSlide]);

  // Keyboard navigation on carousel container (ArrowLeft / ArrowRight)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch / swipe handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  useLayoutEffect(() => {
    if (displayReviews.length === 0) return;

    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.set('.reviews-carousel-stage', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.reviews-carousel-stage',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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
  }, [displayReviews.length]);

  if (displayReviews.length === 0) {
    return null;
  }

  const currentReview = displayReviews[currentIndex] || displayReviews[0];

  return (
    <section id="reviews" className="section" ref={sectionRef} aria-labelledby="reviews-title">
      <div className="container">
        <SectionEyebrowRow label="Word of Mouth" />

        <div className="reviews-header-wrap">
          <div style={{ maxWidth: '640px' }}>
            <h2 id="reviews-title" style={{ marginBottom: '0.75rem' }}>
              Client Words
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Genuine feedback from clients who visit our chairs.
            </p>
          </div>

          {/* Social Proof Line: rendered ONLY when confirmed metrics exist */}
          {hasProof && (
            <a
              href={siteData.links.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="reviews-proof-badge"
              aria-label={`${proof.rating} on Google from ${proof.count} reviews on Google Maps`}
            >
              <span className="reviews-proof-star" aria-hidden="true">★</span>
              <span>{proof.rating} on Google · {proof.count} reviews</span>
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        {/* Editorial Carousel Container */}
        <div
          className="reviews-carousel-stage"
          role="region"
          aria-roledescription="carousel"
          aria-label="Client reviews carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="reviews-card-main">
            {currentReview.isSample && (
              <span className="reviews-sample-badge">SAMPLE</span>
            )}
            <div className="reviews-quote-mark" aria-hidden="true">&ldquo;</div>

            <blockquote className="reviews-quote-text">
              {currentReview.text}
            </blockquote>

            <div className="reviews-card-footer">
              <div className="reviews-author-meta">
                <span className="reviews-author-name">— {currentReview.author}</span>
                {currentReview.sourceUrl ? (
                  <a
                    href={currentReview.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reviews-source-link"
                  >
                    <span>{currentReview.source || 'Verified Google Review'}</span>
                    <span className="btn-arrow" aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="reviews-source-text">{currentReview.source || 'Google Review'}</span>
                )}
              </div>

              {/* Controls: Arrows + Counter */}
              {total > 1 && (
                <div className="reviews-controls" role="group" aria-label="Carousel navigation">
                  <span className="reviews-counter" aria-live="polite">
                    {currentIndex + 1} / {total}
                  </span>
                  <div className="reviews-nav-btns">
                    <button
                      type="button"
                      className="reviews-nav-btn"
                      onClick={prevSlide}
                      aria-label="Previous review"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="reviews-nav-btn"
                      onClick={nextSlide}
                      aria-label="Next review"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dots Indicator */}
          {total > 1 && (
            <div className="reviews-dots" role="tablist" aria-label="Review slides">
              {confirmed.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  className={`reviews-dot ${idx === currentIndex ? 'is-active' : ''}`}
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to review ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reviews-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }

        .reviews-proof-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text);
          text-decoration: none;
          transition: border-color var(--transition-fast), color var(--transition-fast);
        }

        .reviews-proof-badge:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .reviews-proof-star {
          color: var(--color-accent);
          font-size: 1rem;
          line-height: 1;
        }

        .reviews-carousel-stage {
          max-width: 920px;
          margin: 0 auto;
          outline: none;
        }

        .reviews-carousel-stage:focus-visible .reviews-card-main {
          outline: 2px solid var(--color-accent);
          outline-offset: 4px;
        }

        .reviews-card-main {
          padding: clamp(2.5rem, 6vw, 4.5rem) clamp(2rem, 5vw, 4rem);
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          border-radius: 2px;
          min-height: 280px;
        }

        .reviews-sample-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #B34040;
          color: #FAF8F5;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          z-index: 2;
        }

        .reviews-quote-mark {
          font-family: var(--font-serif);
          font-size: clamp(3.5rem, 7vw, 5.5rem);
          line-height: 0.8;
          color: var(--color-surface-elevated);
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          user-select: none;
          pointer-events: none;
        }

        .reviews-quote-text {
          font-family: var(--font-serif);
          font-size: clamp(1.25rem, 2.2vw, 1.85rem);
          line-height: 1.5;
          color: var(--color-text);
          font-style: italic;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .reviews-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .reviews-author-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .reviews-author-name {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .reviews-source-link {
          font-size: var(--size-micro);
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .reviews-source-link:hover {
          color: var(--color-accent-hover);
        }

        .reviews-source-text {
          font-size: var(--size-micro);
          color: var(--color-muted);
        }

        .reviews-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: auto;
        }

        .reviews-counter {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          color: var(--color-muted);
          letter-spacing: 0.05em;
        }

        .reviews-nav-btns {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reviews-nav-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          font-size: 1.1rem;
          cursor: pointer;
          transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
        }

        .reviews-nav-btn:hover {
          background-color: var(--color-accent);
          border-color: var(--color-accent);
          color: #FFFFFF;
        }

        .reviews-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .reviews-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background-color: var(--color-border);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: width 0.25s ease, background-color 0.2s ease;
        }

        .reviews-dot.is-active {
          width: 24px;
          background-color: var(--color-accent);
        }

        @media (pointer: coarse) {
          .reviews-nav-btn {
            width: 44px;
            height: 44px;
          }
          .reviews-source-link {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};
