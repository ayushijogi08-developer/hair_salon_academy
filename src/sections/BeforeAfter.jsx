import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { siteData, resolveTransformationImage } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';
import { isPreviewMode, getSampleBeforeAfter } from '../lib/preview';

export const BeforeAfter = () => {
  const confirmed = siteData.beforeAfter?.filter((item) => item.confirmed) || [];
  const preview = isPreviewMode();
  const displayItems = confirmed.length > 0 ? confirmed : (preview ? getSampleBeforeAfter() : []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0, time: 0 });
  const hasInteractedRef = useRef(false);
  const sweepTweenRef = useRef(null);

  const containerRef = useRef(null);
  const handleRef = useRef(null);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  // Intro hint sweep animation on scroll into view
  useLayoutEffect(() => {
    if (displayItems.length === 0) return;

    const mm = gsap.matchMedia(sectionRef.current);
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { reduceMotion } = context.conditions;
        if (reduceMotion) {
          if (cardRef.current) gsap.set(cardRef.current, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
              onEnter: () => {
                // If user hasn't already interacted, sweep handle once to introduce interactivity
                if (!hasInteractedRef.current) {
                  const proxy = { val: 50 };
                  sweepTweenRef.current = gsap
                    .timeline({
                      delay: 0.4,
                      onComplete: () => {
                        sweepTweenRef.current = null;
                      }
                    })
                    .to(proxy, {
                      val: 32,
                      duration: 0.65,
                      ease: 'power2.inOut',
                      onUpdate: () => {
                        if (!hasInteractedRef.current) {
                          setSliderPos(Math.round(proxy.val));
                        }
                      }
                    })
                    .to(proxy, {
                      val: 68,
                      duration: 0.95,
                      ease: 'power2.inOut',
                      onUpdate: () => {
                        if (!hasInteractedRef.current) {
                          setSliderPos(Math.round(proxy.val));
                        }
                      }
                    })
                    .to(proxy, {
                      val: 50,
                      duration: 0.65,
                      ease: 'power2.out',
                      onUpdate: () => {
                        if (!hasInteractedRef.current) {
                          setSliderPos(Math.round(proxy.val));
                        }
                      }
                    });
                }
              }
            }
          }
        );
      }
    );

    return () => {
      mm.revert();
      if (sweepTweenRef.current) sweepTweenRef.current.kill();
    };
  }, [displayItems.length]);

  // Update slider position from clientX coordinate
  const updateSlider = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  // Smooth easing when clicking or tapping to jump to a position
  const animateSliderTo = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const targetPercent = Math.round((x / rect.width) * 100);

      if (sweepTweenRef.current) sweepTweenRef.current.kill();

      const proxy = { val: sliderPos };
      sweepTweenRef.current = gsap.to(proxy, {
        val: targetPercent,
        duration: 0.38,
        ease: 'power2.out',
        onUpdate: () => {
          setSliderPos(Math.round(proxy.val));
        },
        onComplete: () => {
          sweepTweenRef.current = null;
        }
      });
    },
    [sliderPos]
  );

  // Pointer drag and touch interactions
  const handlePointerDown = (e) => {
    hasInteractedRef.current = true;
    if (sweepTweenRef.current) sweepTweenRef.current.kill();

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    if (dx > 3) {
      hasMovedRef.current = true;
    }
    updateSlider(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    // If pointer didn't move significantly, treat as click-to-jump with smooth easing
    if (!hasMovedRef.current) {
      animateSliderTo(e.clientX);
    }
  };

  const handlePointerCancel = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Keyboard navigation on handle
  const handleKeyDown = (e) => {
    let handled = false;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      setSliderPos((p) => Math.max(0, p - 2));
      handled = true;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      setSliderPos((p) => Math.min(100, p + 2));
      handled = true;
    } else if (e.key === 'Home') {
      setSliderPos(0);
      handled = true;
    } else if (e.key === 'End') {
      setSliderPos(100);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      hasInteractedRef.current = true;
      if (sweepTweenRef.current) sweepTweenRef.current.kill();
    }
  };

  // Clean hide when no confirmed items and not in preview mode
  if (displayItems.length === 0) {
    return null;
  }

  const safeIndex = selectedIndex < displayItems.length ? selectedIndex : 0;
  const activeItem = displayItems[safeIndex];

  // Resolve image assets
  const resolvedBefore = resolveTransformationImage(activeItem.beforeSrc) || activeItem.beforeSrc;
  const resolvedAfter = resolveTransformationImage(activeItem.afterSrc) || activeItem.afterSrc;

  return (
    <section id="transformations" className="section" ref={sectionRef} aria-labelledby="ba-title">
      <div className="container">
        <SectionEyebrowRow label="Transformations" />
        <div style={{ maxWidth: '640px', marginBottom: 'clamp(2rem, 4vw, 3.25rem)' }}>
          <h2 id="ba-title" style={{ marginBottom: '0.85rem' }}>
            Before & After
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Real chair transformations. Drag the handle or use arrow keys to reveal the cut, colour, and finish.
          </p>
        </div>

        {/* Thumbnail tabs if more than one transformation */}
        {displayItems.length > 1 && (
          <div
            className="ba-thumb-tabs"
            role="tablist"
            aria-label="Select transformation to compare"
          >
            {displayItems.map((item, idx) => {
              const isSelected = idx === safeIndex;
              const thumbSrc =
                resolveTransformationImage(item.afterSrc) ||
                item.afterSrc ||
                resolveTransformationImage(item.beforeSrc) ||
                item.beforeSrc;
              return (
                <button
                  key={item.id || idx}
                  role="tab"
                  id={`ba-tab-${idx}`}
                  aria-selected={isSelected}
                  aria-controls="ba-stage-panel"
                  className={`ba-thumb-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    if (idx !== safeIndex) {
                      setSelectedIndex(idx);
                      setSliderPos(50);
                      hasInteractedRef.current = true;
                      if (sweepTweenRef.current) sweepTweenRef.current.kill();
                    }
                  }}
                >
                  <div className="ba-thumb-media">
                    <img
                      src={thumbSrc}
                      alt=""
                      width="56"
                      height="42"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="ba-thumb-meta">
                    <span className="ba-thumb-title">{item.title}</span>
                    {item.category && <span className="ba-thumb-cat">{item.category}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Featured Slider Card */}
        <div className="ba-comparison-card" ref={cardRef}>
          {activeItem.isSample && (
            <span
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                zIndex: 12,
                background: '#B34040',
                color: '#FAF8F5',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                padding: '0.22rem 0.6rem',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none'
              }}
            >
              SAMPLE
            </span>
          )}

          {/* Interactive Comparison Stage */}
          <div
            id="ba-stage-panel"
            role="region"
            aria-label={`Transformation comparison for ${activeItem.title}`}
            ref={containerRef}
            className="ba-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {/* Base Layer: AFTER image sitting underneath */}
            <img
              src={resolvedAfter}
              alt={`After: ${activeItem.title}`}
              width="1200"
              height="900"
              loading="lazy"
              decoding="async"
              className="ba-img ba-img-after"
            />
            <span className="ba-tag ba-tag-after">After</span>

            {/* Top Layer: BEFORE image clipped to reveal the after image underneath */}
            <div
              className="ba-before-clip"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={resolvedBefore}
                alt={`Before: ${activeItem.title}`}
                width="1200"
                height="900"
                loading="lazy"
                decoding="async"
                className="ba-img ba-img-before"
              />
              <span className="ba-tag ba-tag-before">Before</span>
            </div>

            {/* Vertical Divider Hairline */}
            <div
              className="ba-handle-line"
              style={{ left: `${sliderPos}%` }}
              aria-hidden="true"
            />

            {/* Draggable & Accessible Slider Handle */}
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPos)}
              aria-label={`Comparison slider for ${activeItem.title}. Drag left or right to compare before and after.`}
              aria-orientation="horizontal"
              className="ba-handle-knob"
              style={{ left: `${sliderPos}%` }}
              onKeyDown={handleKeyDown}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="ba-handle-arrows"
              >
                <polyline points="8 6 2 12 8 18" />
                <polyline points="16 6 22 12 16 18" />
              </svg>
            </div>
          </div>

          {/* Caption & Category Footer */}
          <div className="ba-caption-bar">
            <div className="ba-caption-main">
              <div className="ba-title-row">
                <h3 className="ba-title">{activeItem.title}</h3>
                {activeItem.category && (
                  <span className="work-category-badge">{activeItem.category}</span>
                )}
              </div>
              {activeItem.caption && (
                <p className="ba-caption-text">{activeItem.caption}</p>
              )}
            </div>
            <div className="ba-hint-row" aria-hidden="true">
              <span className="ba-hint-text">Drag or use arrow keys</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ba-comparison-card {
          position: relative;
          max-width: 960px;
          margin: 0 auto;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 24px rgba(20, 18, 16, 0.04);
          overflow: hidden;
        }

        .ba-thumb-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          max-width: 960px;
          margin: 0 auto 1.5rem auto;
        }

        .ba-thumb-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.45rem 0.85rem 0.45rem 0.45rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          text-align: left;
        }

        .ba-thumb-btn:hover {
          border-color: var(--color-accent-soft);
          background-color: var(--color-surface-soft);
        }

        .ba-thumb-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .ba-thumb-btn.active {
          border-color: var(--color-accent);
          background-color: var(--color-surface-soft);
          box-shadow: 0 2px 8px rgba(158, 91, 50, 0.12);
        }

        .ba-thumb-media {
          width: 52px;
          height: 39px;
          border-radius: 2px;
          overflow: hidden;
          background-color: var(--color-border);
          flex-shrink: 0;
        }

        .ba-thumb-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ba-thumb-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .ba-thumb-title {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text);
          line-height: 1.25;
        }

        .ba-thumb-cat {
          font-size: var(--size-micro);
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ba-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          user-select: none;
          touch-action: pan-y;
          cursor: ew-resize;
          overflow: hidden;
          background-color: var(--color-surface);
        }

        @media (min-width: 768px) {
          .ba-stage {
            aspect-ratio: 16 / 10;
          }
        }

        .ba-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        .ba-before-clip {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .ba-tag {
          position: absolute;
          bottom: 1.25rem;
          padding: 0.3rem 0.75rem;
          font-size: var(--size-micro);
          font-family: var(--font-body);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background-color: rgba(20, 18, 16, 0.78);
          color: #FAF8F5;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          font-weight: 600;
          border-radius: 2px;
          border: 1px solid rgba(250, 248, 245, 0.15);
          pointer-events: none;
          z-index: 5;
        }

        .ba-tag-before {
          left: 1.25rem;
        }

        .ba-tag-after {
          right: 1.25rem;
        }

        .ba-handle-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #FAF8F5;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.45);
          transform: translateX(-50%);
          z-index: 6;
          pointer-events: none;
        }

        .ba-handle-knob {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #FAF8F5;
          color: #141211;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08);
          cursor: ew-resize;
          z-index: 7;
          touch-action: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }

        .ba-handle-knob:hover {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .ba-handle-knob:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 3px;
        }

        .ba-handle-knob:active {
          transform: translate(-50%, -50%) scale(0.96);
        }

        .ba-handle-arrows {
          pointer-events: none;
        }

        .ba-caption-bar {
          padding: 1.25rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid var(--color-border);
          background-color: var(--color-surface);
        }

        @media (min-width: 640px) {
          .ba-caption-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .ba-caption-main {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .ba-title-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .ba-title {
          font-family: var(--font-serif);
          font-size: clamp(1.2rem, 2vw, 1.45rem);
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.25;
        }

        .ba-caption-text {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-muted);
          line-height: 1.5;
          margin: 0;
          max-width: 620px;
        }

        .ba-hint-row {
          flex-shrink: 0;
        }

        .ba-hint-text {
          font-size: var(--size-micro);
          color: var(--color-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @media (prefers-reduced-motion: reduce) {
          .ba-thumb-btn,
          .ba-handle-knob {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
