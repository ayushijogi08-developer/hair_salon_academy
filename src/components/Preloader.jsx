import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export const Preloader = ({ onComplete }) => {
  const preloaderRef = useRef(null);
  const counterRef = useRef(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const isMobile = window.innerWidth <= 860;
    const durationTotal = isMobile ? 0.55 : 1.1;
    const curtainDuration = isMobile ? 0.35 : 0.75;
    const curtainDelay = isMobile ? 0.58 : 1.15;

    const ctx = gsap.context(() => {
      const counterObj = { val: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      // 0 to 100 counter and line by line text reveal (under 1s on mobile)
      tl.to(counterObj, {
        val: 100,
        duration: durationTotal,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.floor(counterObj.val)).padStart(2, '0');
          }
        }
      })
      .to('.preloader-line', {
        y: '0%',
        opacity: 1,
        duration: isMobile ? 0.4 : 0.7,
        stagger: isMobile ? 0.06 : 0.12,
        ease: 'power3.out'
      }, 0.08)
      // Curtain wipes upward to reveal the hero
      .to(preloaderRef.current, {
        yPercent: -100,
        duration: curtainDuration,
        ease: 'power3.inOut'
      }, curtainDelay);
    }, preloaderRef.current);

    // Safety timeout: 1.3s on mobile, 2.2s on desktop
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, isMobile ? 1300 : 2200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="site-preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading Hair City Salon & Academy"
    >
      <div className="preloader-content">
        <div className="preloader-counter-row">
          <span className="preloader-counter" ref={counterRef}>00</span>
          <span className="preloader-percent">%</span>
        </div>

        <div className="preloader-line-wrap">
          <div className="preloader-line serif">Hair City</div>
        </div>
        <div className="preloader-line-wrap">
          <div className="preloader-line subtitle">Salon & Academy · Akola</div>
        </div>
      </div>

      <button
        type="button"
        className="preloader-skip-btn"
        onClick={() => {
          if (onComplete) onComplete();
          if (preloaderRef.current) preloaderRef.current.style.display = 'none';
        }}
        aria-label="Skip preloader"
      >
        Skip ↗
      </button>

      <style>{`
        .site-preloader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background-color: var(--color-dark-bg);
          color: var(--color-dark-text);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preloader-content {
          text-align: center;
        }

        .preloader-counter-row {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--color-accent);
          margin-bottom: 1rem;
          line-height: 1;
        }

        .preloader-percent {
          font-size: 1rem;
          margin-left: 2px;
          color: #9E968F;
        }

        .preloader-line-wrap {
          overflow: hidden;
          margin-bottom: 0.35rem;
        }

        .preloader-line {
          transform: translateY(115%);
          opacity: 0;
        }

        .preloader-line.serif {
          font-family: var(--font-serif);
          font-size: clamp(2.25rem, 5.5vw, 4rem);
          font-weight: 400;
          letter-spacing: -0.02em;
        }

        .preloader-line.subtitle {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #9E968F;
        }

        .preloader-skip-btn {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          background: transparent;
          border: 1px solid #3A3531;
          color: #9E968F;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.75rem 1.15rem;
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .preloader-skip-btn:hover {
          color: #FAF8F5;
          border-color: var(--color-accent);
        }
      `}</style>
    </div>
  );
};
