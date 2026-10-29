import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteData } from '../data/site';
import { WordFillParagraph, SectionEyebrowRow } from '../components/MotionText';
import { canHover } from '../lib/motion';
import { WorkLightbox } from '../components/WorkLightbox';

export const Work = () => {
  const [activePhoto, setActivePhoto] = useState(null);
  const galleryRef = useRef(null);
  const trackRef = useRef(null);
  const cursorRef = useRef(null);
  const thumbnailRefs = useRef({});
  const triggerElRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Drag-to-scroll tracking
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);

  // Category filtering & scroller state
  const allPhotos = siteData.images.work;
  const [filterCategory, setFilterCategory] = useState('all');

  const photos = useMemo(() => {
    if (filterCategory === 'all') return allPhotos;
    return allPhotos.filter(p => p.category === filterCategory);
  }, [allPhotos, filterCategory]);

  const boyCount = useMemo(() => allPhotos.filter(p => p.category === 'boys').length, [allPhotos]);
  const girlCount = useMemo(() => allPhotos.filter(p => p.category === 'girls').length, [allPhotos]);

  const filterChips = useMemo(() => [
    { id: 'all', label: 'All', count: allPhotos.length },
    { id: 'boys', label: "Men's Cuts", count: boyCount },
    { id: 'girls', label: "Women's Cuts", count: girlCount }
  ], [allPhotos.length, boyCount, girlCount]);

  const isFirstFilterRender = useRef(true);

  // Smooth fade/scale stagger when changing filter
  const handleFilterChange = (category) => {
    if (category === filterCategory) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setFilterCategory(category);
      setActiveIndex(0);
      setScrollProgress(0);
      if (trackRef.current) {
        trackRef.current.scrollTo({ left: 0 });
      }
      return;
    }

    const cards = trackRef.current?.querySelectorAll('.work-gallery-card');
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        scale: 0.94,
        y: 8,
        duration: 0.16,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          setFilterCategory(category);
          setActiveIndex(0);
          setScrollProgress(0);
          if (trackRef.current) {
            trackRef.current.scrollTo({ left: 0 });
          }
        }
      });
    } else {
      setFilterCategory(category);
      setActiveIndex(0);
      setScrollProgress(0);
    }
  };

  // Animate new cards in smoothly after filter change
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = trackRef.current?.querySelectorAll('.work-gallery-card');
    if (!cards || cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.94, y: 14 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity'
      }
    );
  }, [filterCategory]);

  const openLightbox = (item) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return; // Suppress open if user dragged
    }
    triggerElRef.current = document.activeElement;
    setActivePhoto(item);
  };

  const closeLightbox = useCallback(() => {
    const currentId = activePhoto?.id;
    setActivePhoto(null);
    requestAnimationFrame(() => {
      if (currentId && thumbnailRefs.current[currentId]) {
        thumbnailRefs.current[currentId].focus();
      } else if (triggerElRef.current?.focus) {
        triggerElRef.current.focus();
      }
    });
  }, [activePhoto]);

  // Update scroller buttons & continuous progress
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = el.scrollLeft;

    setCanScrollLeft(current > 8);
    setCanScrollRight(current < maxScroll - 8);

    if (maxScroll > 0) {
      const prog = Math.min(1, Math.max(0, current / maxScroll));
      setScrollProgress(prog);
      const idx = Math.min(photos.length - 1, Math.round(prog * (photos.length - 1)));
      setActiveIndex(idx);
    } else {
      setScrollProgress(0);
      setActiveIndex(0);
    }
  }, [photos.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    updateScrollState();

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // Desktop Mouse Drag Scrolling
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      if (!canHover()) return;
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.pageX - el.offsetLeft;
      scrollStartLeftRef.current = el.scrollLeft;
      el.classList.add('is-dragging');
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      if (Math.abs(walk) > 4) {
        hasMovedRef.current = true;
      }
      el.scrollLeft = scrollStartLeftRef.current - walk;
    };

    const onMouseUpOrLeave = () => {
      isDraggingRef.current = false;
      el.classList.remove('is-dragging');
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUpOrLeave);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUpOrLeave);
    };
  }, []);

  // Floating "View" label that follows pointer
  useEffect(() => {
    const galleryEl = galleryRef.current;
    const cursor = cursorRef.current;
    if (!galleryEl || !cursor || !canHover()) return;

    const handleMouseMove = (e) => {
      const rect = galleryEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(cursor, {
        x,
        y,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.2 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2 });
    };

    galleryEl.addEventListener('mousemove', handleMouseMove);
    galleryEl.addEventListener('mouseenter', handleMouseEnter);
    galleryEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      galleryEl.removeEventListener('mousemove', handleMouseMove);
      galleryEl.removeEventListener('mouseenter', handleMouseEnter);
      galleryEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Reveal each image with clip-path as it scrolls into view initially
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(galleryRef.current);

    mm.add({
      isDesktop: '(min-width: 861px)',
      isMobile: '(max-width: 860px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion } = context.conditions;

      if (reduceMotion) {
        gsap.set('.work-gallery-card', { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' });
        return;
      }

      gsap.fromTo('.work-gallery-card',
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top 85%',
            once: true
          },
          onComplete: () => {
            const cards = document.querySelectorAll('.work-photo-img, .work-cursor-badge');
            cards.forEach(c => { c.style.willChange = 'auto'; });
          }
        }
      );

      // One-time mobile swipe hint
      if (!reduceMotion && trackRef.current) {
        ScrollTrigger.create({
          trigger: trackRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            if (canHover()) return;
            gsap.to(trackRef.current, {
              x: -24,
              duration: 0.35,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
              clearProps: 'x'
            });
          }
        });
      }
    });

    return () => mm.revert();
  }, []);

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.work-gallery-card')?.clientWidth || 400;
    el.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.work-gallery-card')?.clientWidth || 400;
    el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
  };

  const handleTrackKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollNext();
    }
  };

  if (!photos || photos.length === 0) return null;

  return (
    <section id="work" className="section" ref={galleryRef} aria-labelledby="work-title">
      {/* Floating View Cursor Follower (Gallery only) */}
      <div className="work-cursor-badge" ref={cursorRef} aria-hidden="true">
        View
      </div>

      <div className="container">
        <SectionEyebrowRow label="Selected Cuts & Colour" />

        {/* Header with Counter, Category Filter and Navigation Controls */}
        <div className="work-header-row">
          <div style={{ maxWidth: '560px' }}>
            <h2 id="work-title" style={{ marginBottom: '0.75rem' }}>
              Salon work
            </h2>
            <WordFillParagraph style={{ fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)', lineHeight: '1.5' }}>
              Real haircut, colour, and styling craft from our chairs and studio.
            </WordFillParagraph>
          </div>

          {/* Action Row: Category Filter Chips + Scroller Controls */}
          <div className="work-header-actions">
            <div className="work-filter-pills" role="tablist" aria-label="Filter salon work by category">
              {filterChips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={filterCategory === chip.id}
                  className={`work-filter-pill ${filterCategory === chip.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange(chip.id)}
                >
                  <span>{chip.label}</span>
                  <span className="work-filter-count">({chip.count})</span>
                </button>
              ))}
            </div>

            {/* Scroller Controls on Desktop */}
            <div className="work-controls-pane">
              <span className="work-counter-text" aria-live="polite">
                0{activeIndex + 1} / 0{photos.length}
              </span>

              <div className="work-nav-arrows">
                <button
                  type="button"
                  className="work-arrow-btn"
                  onClick={scrollPrev}
                  disabled={!canScrollLeft}
                  aria-label="Previous salon work photo"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="work-arrow-btn"
                  onClick={scrollNext}
                  disabled={!canScrollRight}
                  aria-label="Next salon work photo"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thin continuous progress bar */}
        <div className="work-progress-bar-wrap" aria-hidden="true">
          <div
            className="work-progress-bar-fill"
            style={{ transform: `scaleX(${Math.max(0.08, scrollProgress)})` }}
          />
        </div>
      </div>

      {/* Horizontal Scroller Container (unclipped by container padding) */}
      <div className="work-horizontal-viewport">
        <div
          ref={trackRef}
          id="work-track"
          className="work-horizontal-track"
          tabIndex={0}
          onKeyDown={handleTrackKeyDown}
          role="region"
          aria-label="Salon work gallery. Use Left and Right arrow keys to navigate."
        >
          {photos.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => (thumbnailRefs.current[item.id] = el)}
              className="work-gallery-card"
              onClick={() => openLightbox(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(item);
                }
              }}
              aria-label={`${item.title} — ${item.categoryLabel}. Click to view large photo.`}
            >
              <div className="work-photo-frame">
                <img
                  src={item.src}
                  alt={item.alt}
                  width="800"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 639px) 70vw, (max-width: 1023px) 290px, 310px"
                  className="work-photo-img"
                  draggable={false}
                />
                <div className="work-card-overlay">
                  <div className="work-card-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="work-num-label">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="work-category-badge">{item.categoryLabel}</span>
                    </div>
                    <h3 className="work-card-title">{item.title}</h3>
                  </div>
                  <span className="work-zoom-hint" aria-hidden="true">Enlarge ↗</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Instagram CTA Button */}
        <div className="work-instagram-row">
          <a
            href={siteData.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary work-instagram-btn"
            aria-label="Follow Hair City Salon on Instagram (opens in a new tab)"
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
            <span>Follow us on Instagram</span>
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
          <p className="work-instagram-handle">@_hair_city_salon · Studio cuts, colour &amp; academy updates</p>
        </div>
      </div>

      {/* Accessible Full-Screen Lightbox Viewer */}
      {activePhoto && (
        <WorkLightbox
          activePhoto={activePhoto}
          photos={photos}
          onClose={closeLightbox}
          onSelectPhoto={setActivePhoto}
        />
      )}

      <style>{`
        #work.section {
          position: relative;
          padding-top: clamp(36px, 4.5vw, 60px);
          padding-bottom: clamp(36px, 4.5vw, 60px);
        }

        #work .section-eyebrow-row {
          margin-bottom: clamp(1rem, 2vw, 1.5rem);
        }

        .work-cursor-badge {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 50;
          opacity: 0;
          transform: scale(0.8);
          background: var(--color-accent);
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(20, 18, 17, 0.2);
          will-change: transform;
        }

        .work-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .work-header-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .work-filter-pills {
          display: inline-flex;
          gap: 0.35rem;
          background: var(--color-surface);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
        }

        .work-filter-pill {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          padding: 0.35rem 0.85rem;
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          border-radius: 999px;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .work-filter-pill.active {
          background: var(--color-accent);
          color: #FFFFFF;
        }

        .work-filter-pill:hover:not(.active) {
          color: var(--color-text);
        }

        .work-filter-count {
          font-size: 0.75rem;
          opacity: 0.85;
        }

        .work-controls-pane {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .work-counter-text {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-accent);
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .work-nav-arrows {
          display: flex;
          gap: 0.5rem;
        }

        .work-arrow-btn {
          width: 40px;
          height: 40px;
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          border-radius: 2px;
          transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
        }

        .work-arrow-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          background: var(--color-surface);
          color: var(--color-accent);
        }

        .work-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .work-progress-bar-wrap {
          width: 100%;
          height: 2px;
          background: var(--color-border);
          margin-bottom: 1.25rem;
          overflow: hidden;
        }

        .work-progress-bar-fill {
          height: 100%;
          width: 100%;
          background: var(--color-accent);
          transform-origin: left center;
          transition: transform 0.1s linear;
        }

        /* Full-bleed unclipped horizontal track on desktop */
        .work-horizontal-viewport {
          width: 100%;
          overflow: visible;
        }

        .work-horizontal-track {
          display: flex;
          flex-direction: row;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 0 clamp(1.25rem, 4.5vw, 4rem) 1rem;
          cursor: grab;
          user-select: none;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .work-horizontal-track::-webkit-scrollbar {
          display: none;
        }

        .work-horizontal-track.is-dragging {
          cursor: grabbing;
          scroll-snap-type: none;
        }

        .work-gallery-card {
          flex: 0 0 clamp(230px, min(23vw, 36vh), 310px);
          min-width: 210px;
          max-width: 330px;
          scroll-snap-align: start;
          position: relative;
          cursor: pointer;
        }

        .work-photo-frame {
          position: relative;
          overflow: hidden;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          aspect-ratio: 4/5;
          width: 100%;
          border-radius: 4px;
        }

        .work-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 20%;
          display: block;
          transition: transform 0.6s var(--ease-editorial);
          pointer-events: none;
        }

        .work-gallery-card:hover .work-photo-img {
          transform: scale(1.06);
        }

        .work-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(20, 18, 17, 0.8) 0%, rgba(20, 18, 17, 0.25) 35%, transparent 60%);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0.85rem 1rem;
          gap: 0.5rem;
          opacity: 0.95;
          transition: opacity var(--transition-fast);
        }

        .work-gallery-card:hover .work-card-overlay {
          opacity: 1;
        }

        .work-card-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .work-num-label {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          color: #FFFFFF;
          line-height: 1;
        }

        .work-category-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #FFFFFF;
          background: var(--color-accent);
          padding: 0.15rem 0.45rem;
          border-radius: 2px;
          white-space: nowrap;
        }

        .work-card-title {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .work-zoom-hint {
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #FFFFFF;
          font-weight: 500;
          background: rgba(20, 18, 17, 0.6);
          padding: 0.25rem 0.5rem;
          border-radius: 2px;
          backdrop-filter: blur(4px);
          align-self: flex-end;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Instagram CTA Row */
        .work-instagram-row {
          margin-top: clamp(1.75rem, 3.5vw, 2.75rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          text-align: center;
        }

        .work-instagram-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.85rem 1.85rem;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .work-instagram-handle {
          font-size: 0.8125rem;
          color: var(--color-muted);
          margin: 0;
        }

        /* Full-screen Accessible Lightbox */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(14, 12, 11, 0.94);
          backdrop-filter: blur(12px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(0.75rem, 2.5vw, 1.75rem);
          animation: lightboxFadeIn 0.22s ease-out;
        }

        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-content {
          position: relative;
          max-width: 900px;
          width: 100%;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          touch-action: pan-y;
        }

        .lightbox-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.25rem;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
        }

        .lightbox-top-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .lightbox-counter {
          font-family: var(--font-serif);
          font-size: 0.9375rem;
          color: var(--color-accent);
          font-weight: 500;
        }

        .lightbox-close {
          width: 40px;
          height: 40px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text);
          transition: all var(--transition-fast);
        }

        .lightbox-close:hover {
          background: var(--color-surface);
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .lightbox-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0b0a;
          min-height: 260px;
          max-height: calc(80vh - 160px);
          overflow: hidden;
          padding: 0.5rem;
        }

        .lightbox-img-wrapper {
          max-width: 100%;
          max-height: calc(80vh - 160px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: calc(80vh - 160px);
          object-fit: contain;
          display: block;
          border-radius: 4px;
        }

        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.94);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }

        .lightbox-nav-prev {
          left: 1rem;
        }

        .lightbox-nav-next {
          right: 1rem;
        }

        .lightbox-nav-btn:hover {
          background: var(--color-accent);
          color: #FFFFFF;
          border-color: var(--color-accent);
          transform: translateY(-50%) scale(1.05);
        }

        .lightbox-footer {
          padding: 1.15rem 1.35rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.25rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
          flex-wrap: wrap;
        }

        .lightbox-info-pane {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 580px;
        }

        .lightbox-photo-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }

        .lightbox-photo-desc {
          font-size: 0.85rem;
          color: var(--color-muted);
          line-height: 1.45;
          margin: 0;
        }

        .lightbox-actions-pane {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .lightbox-action-btn {
          padding: 0.55rem 1.15rem;
          font-size: 0.8125rem;
        }

        .lightbox-nav-shortcut {
          font-size: 0.75rem;
          color: var(--color-muted);
          white-space: nowrap;
        }

        @media (max-width: 860px) {
          #work.section {
            padding-top: 32px;
            padding-bottom: 36px;
          }
          .work-header-row {
            margin-bottom: 1rem;
            gap: 1rem;
          }
          .work-progress-bar-wrap {
            margin-bottom: 1rem;
          }
          .work-header-actions {
            width: 100%;
            justify-content: space-between;
            align-items: center;
          }
          .work-filter-pills {
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
            mask-image: linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);
            scrollbar-width: none;
          }
          .work-filter-pills::-webkit-scrollbar {
            display: none;
          }
          .work-horizontal-track {
            cursor: default;
            padding: 0 clamp(1.25rem, 4.5vw, 4rem) 0.75rem;
            scroll-snap-type: x mandatory;
            overscroll-behavior-x: contain;
          }
          .work-gallery-card {
            flex: 0 0 clamp(220px, 70vw, 290px);
            min-width: 200px;
            scroll-snap-align: center;
          }
          .work-cursor-badge {
            display: none !important;
          }
          .work-controls-pane {
            display: flex;
            align-items: center;
            margin-top: 0.5rem;
          }
          .work-nav-arrows {
            display: none;
          }
          .lightbox-content {
            max-height: 96vh;
            border-radius: 6px;
          }
          .lightbox-stage {
            max-height: calc(68vh - 120px);
          }
          .lightbox-img {
            max-height: calc(68vh - 120px);
          }
          .lightbox-nav-btn {
            width: 38px;
            height: 38px;
            background: rgba(250, 248, 245, 0.88);
          }
          .lightbox-nav-prev {
            left: 0.5rem;
          }
          .lightbox-nav-next {
            right: 0.5rem;
          }
          .lightbox-footer {
            padding: 0.85rem 1rem;
            gap: 0.75rem;
          }
          .lightbox-actions-pane {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (pointer: coarse) {
          .work-filter-pill {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
          }
          .work-instagram-btn {
            min-height: 48px;
            padding: 0.85rem 1.5rem;
          }
          .lightbox-close,
          .lightbox-nav-btn {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </section>
  );
};
