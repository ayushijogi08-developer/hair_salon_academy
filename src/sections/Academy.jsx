import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteData } from '../data/site';
import { WordFillParagraph, SectionEyebrowRow } from '../components/MotionText';


// Phones: ignore the address bar showing/hiding so the pinned section doesn't jump
ScrollTrigger.config({ ignoreMobileResize: true });

export const Academy = () => {
  const data = siteData.academy;
  const academySectionRef = useRef(null);
  const stageRef = useRef(null);
  const pinWrapRef = useRef(null);
  const stepsSvgRef = useRef(null);
  const progressLineRef = useRef(null);

  // 1) ONE SOURCE OF TRUTH (0 to 3)
  const [activeIndex, setActiveIndex] = useState(0);

  // References for step state and animating
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const isScrollingRef = useRef(false);
  const goToRef = useRef(null);
  const scrollTriggerInstanceRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(academySectionRef.current);

    mm.add({
      isDesktop: '(min-width: 861px)',
      isMobile: '(max-width: 860px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion, _isDesktop, isMobile } = context.conditions;

      if (reduceMotion) {
        gsap.set('.academy-step-card, .academy-info-pane', { opacity: 1, y: 0, visibility: 'visible' });
        gsap.set('.step-anim-text, .step-anim-desc, .step-anim-detail, .step-anim-title, .step-anim-phase-num, .step-anim-chip', { opacity: 1, y: 0 });
        gsap.set('.step-anim-accent-line', { scaleY: 1 });
        const allCards = document.querySelectorAll('.academy-step-card');
        allCards.forEach(c => {
          c.classList.add('is-active');
          c.style.opacity = '1';
        });
        return;
      }

      // 5) CLEAN ENTRY INTO THE DARK SECTION: Clip-path wipe over first 60vh
      gsap.fromTo(academySectionRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: academySectionRef.current,
            start: 'top bottom',
            end: 'top 40%',
            scrub: true
          }
        }
      );

      // 6) HEADER OVER DARK SECTION: Toggle .header-dark while Academy is under header
      ScrollTrigger.create({
        trigger: academySectionRef.current,
        start: 'top 72px',
        end: 'bottom 72px',
        toggleClass: {
          targets: '.site-header',
          className: 'header-dark'
        }
      });

      // 3) goTo(i) SEQUENCE (about 1.0s total)
      const cards = gsap.utils.toArray('.academy-step-card');
      const numSteps = data.modules.length;

      let activeTimeline = null;

      // Reset a card and all its child elements to a complete, visible resting state
      const setCardRestingState = (card) => {
        gsap.killTweensOf(card);
        gsap.killTweensOf(card.querySelectorAll('*'));
        gsap.set(card, {
          autoAlpha: 1,
          opacity: 1,
          y: 0,
          visibility: 'visible',
          zIndex: 2,
          pointerEvents: 'auto',
          clearProps: 'transform'
        });

        const pNum = card.querySelector('.step-anim-phase-num');
        const t = card.querySelector('.step-anim-title');
        const d = card.querySelector('.step-anim-desc');
        const dt = card.querySelector('.step-anim-detail');
        const al = card.querySelector('.step-anim-accent-line');
        const ch = card.querySelectorAll('.step-anim-chip');
        const bg = card.querySelector('.step-parallax-num');

        if (pNum) gsap.set(pNum, { yPercent: 0, y: 0, opacity: 1, clearProps: 'transform' });
        if (t) gsap.set(t, { yPercent: 0, y: 0, opacity: 1, clearProps: 'transform' });
        if (d) gsap.set(d, { y: 0, yPercent: 0, opacity: 1, clearProps: 'transform' });
        if (dt) gsap.set(dt, { y: 0, yPercent: 0, opacity: 1, clearProps: 'transform' });
        if (al) gsap.set(al, { scaleY: 1, clearProps: 'transform' });
        if (ch && ch.length) gsap.set(ch, { opacity: 1, y: 0, yPercent: 0, clearProps: 'transform' });
        if (bg) gsap.set(bg, { y: 0, opacity: 0.12, clearProps: 'transform' });
      };

      // Fully hide a card
      const setCardHiddenState = (card) => {
        gsap.killTweensOf(card);
        gsap.killTweensOf(card.querySelectorAll('*'));
        gsap.set(card, {
          autoAlpha: 0,
          opacity: 0,
          y: 0,
          visibility: 'hidden',
          zIndex: 1,
          pointerEvents: 'none'
        });
      };

      // Clean Initial Setup for All Cards
      cards.forEach((card, idx) => {
        if (idx === currentIndexRef.current) {
          setCardRestingState(card);
        } else {
          setCardHiddenState(card);
        }
      });

      // Instant snap to target index for jumps > 1 step or re-entering section
      const snapTo = (targetIndex) => {
        if (activeTimeline) {
          activeTimeline.kill();
          activeTimeline = null;
        }

        cards.forEach((card, idx) => {
          if (idx === targetIndex) {
            setCardRestingState(card);
          } else {
            setCardHiddenState(card);
          }
        });

        currentIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
        isTransitioningRef.current = false;
      };

      const goTo = (targetIndex) => {
        if (targetIndex < 0 || targetIndex >= numSteps) return;
        if (targetIndex === currentIndexRef.current && !activeTimeline) return;

        const fromIndex = currentIndexRef.current;
        const diff = Math.abs(targetIndex - fromIndex);

        // If jump is larger than one step, snap immediately with zero empty frames
        if (diff > 1) {
          snapTo(targetIndex);
          return;
        }

        if (targetIndex === fromIndex) return;

        // If a timeline is already running, complete/kill and reset previous cards cleanly
        if (activeTimeline) {
          activeTimeline.kill();
          activeTimeline = null;
        }

        // Ensure all bystander cards are hidden
        cards.forEach((c, idx) => {
          if (idx !== fromIndex && idx !== targetIndex) {
            setCardHiddenState(c);
          }
        });

        // Ensure fromIndex is fully visible and clean as outgoing baseline
        setCardRestingState(cards[fromIndex]);
        gsap.set(cards[fromIndex], { zIndex: 1 });

        const direction = targetIndex > fromIndex ? 1 : -1;
        currentIndexRef.current = targetIndex;
        setActiveIndex(targetIndex); // Instant update for nav, counter, and rail dot
        isTransitioningRef.current = true;

        const outgoing = cards[fromIndex];
        const incoming = cards[targetIndex];

        const inPhaseNum = incoming.querySelector('.step-anim-phase-num');
        const inTitle = incoming.querySelector('.step-anim-title');
        const inDesc = incoming.querySelector('.step-anim-desc');
        const inDetail = incoming.querySelector('.step-anim-detail');
        const inAccentLine = incoming.querySelector('.step-anim-accent-line');
        const inChips = incoming.querySelectorAll('.step-anim-chip');
        const inBigNum = incoming.querySelector('.step-parallax-num');

        // Incoming card starts transparent on top (zIndex: 2), so outgoing underneath remains visible
        gsap.set(incoming, {
          autoAlpha: 0,
          opacity: 0,
          y: 0,
          visibility: 'visible',
          zIndex: 2,
          pointerEvents: 'auto'
        });

        if (inBigNum) gsap.set(inBigNum, { y: direction === 1 ? 24 : -24, opacity: 0 });
        if (inPhaseNum) gsap.set(inPhaseNum, { yPercent: direction === 1 ? 30 : -30, opacity: 0 });
        if (inTitle) gsap.set(inTitle, { yPercent: direction === 1 ? 25 : -25, opacity: 0 });
        if (inDesc) gsap.set(inDesc, { y: direction === 1 ? 6 : -6, opacity: 0 });
        if (inDetail) gsap.set(inDetail, { y: direction === 1 ? 6 : -6, opacity: 0 });
        if (inAccentLine) gsap.set(inAccentLine, { scaleY: 0, transformOrigin: 'top center' });
        if (inChips && inChips.length) gsap.set(inChips, { opacity: 0, y: direction === 1 ? 8 : -8 });

        const tl = gsap.timeline({
          onComplete: () => {
            setCardHiddenState(outgoing);
            setCardRestingState(incoming);
            isTransitioningRef.current = false;
            activeTimeline = null;
          }
        });

        activeTimeline = tl;

        // Cross-fade: incoming card cross-fades directly over outgoing (0.24s total)
        tl.to(incoming, { autoAlpha: 1, opacity: 1, duration: 0.24, ease: 'power2.out' }, 0);
        if (inPhaseNum) tl.to(inPhaseNum, { yPercent: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, 0);
        if (inTitle) tl.to(inTitle, { yPercent: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, 0.02);
        if (inDesc) tl.to(inDesc, { y: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, 0.03);
        if (inDetail) tl.to(inDetail, { y: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, 0.04);
        if (inAccentLine) tl.to(inAccentLine, { scaleY: 1, duration: 0.24, ease: 'power2.out' }, 0.04);
        if (inChips && inChips.length) tl.to(inChips, { opacity: 1, y: 0, duration: 0.2, stagger: 0.02, ease: 'power2.out' }, 0.05);
        if (inBigNum) tl.to(inBigNum, { y: 0, opacity: 0.12, duration: 0.26, ease: 'power3.out' }, 0);

        // Outgoing card fades underneath once incoming is already taking over
        tl.to(outgoing, { autoAlpha: 0, opacity: 0, duration: 0.22, ease: 'power2.in' }, 0.06);
      };

      goToRef.current = goTo;

      // Pinned stage ScrollTrigger
      if (stageRef.current) {
        // Phones pin heading + stage together; desktop pins only the stage
        const pinEl = isMobile && pinWrapRef.current ? pinWrapRef.current : stageRef.current;
        const st = ScrollTrigger.create({
          trigger: pinEl,
          pin: pinEl,
          anticipatePin: 1,
          // If the group is taller than a short phone screen, keep the card in view
          start: () => (isMobile && pinEl.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
          end: () => '+=' + (numSteps * (isMobile ? 25 : 30)) + '%',
          onEnter: (self) => {
            const targetIdx = Math.min(numSteps - 1, Math.max(0, Math.floor(self.progress * numSteps)));
            snapTo(targetIdx);
          },
          onLeave: () => {
            snapTo(numSteps - 1);
          },
          onEnterBack: (self) => {
            const targetIdx = Math.min(numSteps - 1, Math.max(0, Math.floor(self.progress * numSteps)));
            snapTo(targetIdx);
          },
          onLeaveBack: () => {
            snapTo(0);
          },
          onUpdate: (self) => {
            // Continuous progress line
            if (progressLineRef.current) {
              progressLineRef.current.style.transform = `scaleX(${Math.max(0.04, self.progress)})`;
            }

            if (isScrollingRef.current) return;
            const targetIdx = Math.min(numSteps - 1, Math.max(0, Math.floor(self.progress * numSteps)));
            goTo(targetIdx);
          }
        });

        scrollTriggerInstanceRef.current = st;
      }

      // "How to join": SVG line draws through the three steps as you scroll
      if (stepsSvgRef.current) {
        gsap.fromTo(stepsSvgRef.current,
          { strokeDashoffset: 300 },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '.academy-steps-list',
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: true
            }
          }
        );
      }
    });

    return () => mm.revert();
  }, [data.modules.length]);

  // Click handler for left list items: scrolls with lenis.scrollTo (1.2s easeInOut), then goTo(i)
  const handleStepClick = (targetIdx) => {
    isScrollingRef.current = true;
    const st = scrollTriggerInstanceRef.current;
    if (st) {
      const scrollPos = st.start + ((targetIdx + 0.25) / data.modules.length) * (st.end - st.start);
      if (window.lenis) {
        window.lenis.scrollTo(scrollPos, {
          duration: 1.2,
          easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
          onComplete: () => {
            isScrollingRef.current = false;
          }
        });
      } else {
        window.scrollTo({ top: scrollPos, behavior: 'smooth' });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1200);
      }
    } else {
      isScrollingRef.current = false;
    }
    if (goToRef.current) {
      goToRef.current(targetIdx);
    } else {
      setActiveIndex(targetIdx);
    }
  };

  return (
    <section
      id="academy"
      className="section-dark academy-root-section"
      ref={academySectionRef}
      aria-labelledby="academy-title"
    >
      <div className="academy-pin-wrap" ref={pinWrapRef}>
        <div className="container academy-container-top">
          <SectionEyebrowRow label={data.eyebrow} num={data.num} />

          {/* Section Header */}
          <div className="academy-hero-grid">
            <div className="academy-header-text">
              <h2 id="academy-title" className="academy-main-title">
                {data.headline}
              </h2>
              <WordFillParagraph style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.35rem)', color: 'var(--color-dark-muted)', lineHeight: '1.5' }}>
                {data.intro}
              </WordFillParagraph>
            </div>
          </div>
        </div>

        {/* 4) PINNED STAGE THAT FITS THE VIEWPORT (100svh, padding-top: header, align-content: center) */}
        <div className="academy-stage-wrapper" ref={stageRef}>
          <div className="container academy-stage-inner">
            {/* Header row inside stage: sticky on mobile with counter and progress bar */}
            <div className="academy-mobile-sticky-header">
              <div className="academy-stage-header-row">
                <span className="section-label" style={{ color: 'var(--color-dark-muted)', marginBottom: 0 }}>
                  What you can learn
                </span>
                <span className="academy-step-counter" aria-live="polite">
                  0{activeIndex + 1} / 0{data.modules.length}
                </span>
              </div>

              {/* Continuous progress track line */}
              <div className="academy-progress-bar-wrap" aria-hidden="true">
                <div className="academy-progress-bar-fill" ref={progressLineRef}></div>
              </div>
            </div>

            {/* Main 2-column stage layout */}
            <div className="academy-stage-grid">
              {/* Left list: 4 items with highlight & clickable to scroll */}
              <nav className="academy-stepper-nav" aria-label="Course modules">
                <div className="academy-rail-track" aria-hidden="true">
                  <div
                    className="academy-rail-dot"
                    style={{
                      transform: `translateY(${activeIndex * 100}%)`
                    }}
                  ></div>
                </div>

                {data.modules.map((m, idx) => (
                  <button
                    key={m.num}
                    type="button"
                    id={`academy-step-btn-${idx}`}
                    aria-current={activeIndex === idx ? 'step' : undefined}
                    className={`academy-stepper-btn ${activeIndex === idx ? 'active' : ''}`}
                    onClick={() => handleStepClick(idx)}
                  >
                    <span className="stepper-dot-indicator"></span>
                    <span className="stepper-label">
                      <strong>{m.num}</strong> {m.title}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Right: Pinned card stage with 4 steps stacked in the same grid cell */}
              <div className="academy-card-stage">
                {data.modules.map((m, idx) => (
                  <div
                    key={m.num}
                    id={`academy-panel-${idx}`}
                    className="academy-step-card"
                  >
                    {/* Faint outlined background numeral for parallax */}
                    <span className="step-parallax-num" aria-hidden="true">
                      {m.num}
                    </span>

                    <div className="academy-step-card-inner">
                      {/* Phase number inside overflow-hidden mask */}
                      <div className="step-mask-wrap step-badge-mask">
                        <div className="academy-step-badge-row step-anim-phase-num">
                          <span className="academy-step-giant-num">{m.num}</span>
                          <span className="academy-step-tag">Phase {m.num}</span>
                        </div>
                      </div>

                      {/* Title inside overflow-hidden mask */}
                      <div className="step-mask-wrap step-title-mask">
                        <h3 className="academy-step-card-title step-anim-title">
                          {m.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="academy-step-card-desc step-anim-desc">
                        {m.description}
                      </p>

                      {/* Detail with vertical accent line */}
                      {m.detail && (
                        <div className="step-detail-container">
                          <div className="step-anim-accent-line" aria-hidden="true"></div>
                          <p className="academy-step-card-detail step-anim-detail">
                            {m.detail}
                          </p>
                        </div>
                      )}

                      {/* Small chips */}
                      <div className="academy-step-footer-meta">
                        <span className="step-anim-chip">Hands-on chair training</span>
                        <span className="step-anim-chip">Real salon environment</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>{/* end academy-pin-wrap */}

      {/* Post-Pinned Editorial Details: Who it's for & How to join */}
      <div className="container academy-container-bottom">
        <div className="academy-bottom-grid">
          <div className="academy-info-pane">
            <span className="section-label" style={{ color: 'var(--color-dark-muted)' }}>Who It's For</span>
            <p className="academy-focus-text">{data.whoItsFor}</p>
          </div>

          <div className="academy-info-pane">
            <span className="section-label" style={{ color: 'var(--color-dark-muted)' }}>How To Join</span>
            <div className="academy-steps-list-wrap">
              <svg className="academy-steps-svg-line" viewBox="0 0 4 200" fill="none" preserveAspectRatio="none">
                <path
                  ref={stepsSvgRef}
                  d="M2 0 L2 200"
                  stroke="var(--color-dark-accent, #D9B77E)"
                  strokeWidth="3"
                  strokeDasharray="300"
                  strokeDashoffset="300"
                />
              </svg>

              <div className="academy-steps-list">
                {data.howToJoin.map((s) => (
                  <div key={s.step} className="academy-step-item">
                    <span className="academy-step-num">0{s.step}</span>
                    <span className="academy-step-title">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teaser action footer — links to full Academy page */}
        <div className="academy-action-footer">
          <h3 className="academy-closing-line">{data.closingLine}</h3>

          <Link
            to="/academy"
            className="btn btn-dark"
            aria-label="See the full Hair City Academy page"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span>See full academy</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <style>{`
        /* 5) CLEAN ENTRY INTO DARK SECTION */
        .academy-root-section {
          background-color: var(--color-dark-bg);
          background-image: radial-gradient(ellipse 70% 45% at 50% 10%, rgba(217, 183, 126, 0.07) 0%, transparent 70%);
          color: var(--color-dark-text);
          position: relative;
          z-index: 10;
          overflow: visible;
        }

        .academy-container-top {
          padding-top: clamp(2.75rem, 5vw, 4rem);
          padding-bottom: 0.75rem;
        }

        .academy-container-bottom {
          padding-top: clamp(1.5rem, 3vw, 2.5rem);
          padding-bottom: clamp(3.5rem, 6vw, 5.5rem);
        }

        .academy-hero-grid {
          margin-bottom: 0.75rem;
        }

        .academy-header-text {
          max-width: 820px;
        }

        .academy-main-title {
          font-family: var(--font-serif);
          font-size: clamp(2.25rem, 4.5vw, 4rem);
          line-height: 1.08;
          margin-bottom: 0.85rem;
          color: var(--color-dark-text);
          font-weight: 400;
        }

        /* 4) PINNED STAGE THAT FITS THE VIEWPORT */
        .academy-stage-wrapper {
          height: 100svh;
          max-height: 100vh;
          box-sizing: border-box;
          padding-top: calc(var(--header-height, 72px) + 1.25rem);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
          width: 100%;
        }

        .academy-stage-inner {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          max-height: calc(100svh - var(--header-height, 72px) - 24px);
        }

        .academy-stage-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .academy-step-counter {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-dark-accent, #D9B77E);
          letter-spacing: 0.04em;
        }

        /* Continuous progress line */
        .academy-progress-bar-wrap {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin-bottom: clamp(1.25rem, 2.5vh, 2rem);
          overflow: hidden;
        }

        .academy-progress-bar-fill {
          height: 100%;
          width: 100%;
          background: var(--color-dark-accent, #D9B77E);
          transform-origin: left center;
          transform: scaleX(0.04);
        }

        /* 2-Column Grid Layout */
        .academy-stage-grid {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: clamp(2rem, 4vw, 4rem);
          align-items: center;
        }

        /* Left Stepper List */
        .academy-stepper-nav {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: clamp(0.75rem, 2vh, 1.5rem);
          padding-left: 2rem;
        }

        .academy-rail-track {
          position: absolute;
          left: 6px;
          top: 0.6rem;
          bottom: 0.6rem;
          width: 2px;
          background: rgba(255, 255, 255, 0.12);
        }

        .academy-stepper-btn {
          position: relative;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          padding: 0.5rem 0;
          color: var(--color-dark-muted);
          transition: color 0.25s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .academy-stepper-btn:hover {
          color: var(--color-dark-text);
        }

        .academy-stepper-btn.active {
          color: var(--color-dark-text);
        }

        .stepper-dot-indicator {
          position: absolute;
          left: -2rem;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-dark-bg);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: border-color 0.25s ease, background-color 0.25s ease, transform 0.25s ease;
        }

        .academy-stepper-btn.active .stepper-dot-indicator {
          border-color: var(--color-dark-accent, #D9B77E);
          background: var(--color-dark-accent, #D9B77E);
          transform: translateY(-50%) scale(1.15);
        }

        .stepper-label {
          font-size: clamp(0.95rem, 1.2vw, 1.05rem);
          display: flex;
          gap: 0.65rem;
          align-items: baseline;
          line-height: 1.35;
        }

        .stepper-label strong {
          font-family: var(--font-serif);
          color: var(--color-dark-accent, #D9B77E);
        }

        /* Right Step Cards Stack */
        .academy-card-stage {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          min-height: clamp(340px, 46vh, 440px);
          overflow: hidden;
          background: var(--color-dark-surface);
          border: 1px solid var(--color-dark-border);
        }

        /* 4 steps stacked in the same grid cell */
        .academy-step-card {
          grid-area: 1 / 1;
          padding: clamp(2rem, 3.5vw, 3.25rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          background-color: var(--color-dark-surface);
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Faint outlined background numeral for parallax */
        .step-parallax-num {
          position: absolute;
          right: 2rem;
          bottom: -1rem;
          font-family: var(--font-serif);
          font-size: clamp(9rem, 18vw, 15rem);
          font-weight: 300;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.06);
          pointer-events: none;
          user-select: none;
          z-index: 0;
          opacity: 0.12;
        }

        .academy-step-card-inner {
          position: relative;
          z-index: 1;
          max-width: 600px;
        }

        .step-mask-wrap {
          overflow: hidden;
        }

        .academy-step-badge-row {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .academy-step-giant-num {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 4.5vw, 3.5rem);
          line-height: 1;
          color: var(--color-dark-accent, #D9B77E);
          font-weight: 300;
        }

        .academy-step-tag {
          font-size: var(--size-micro);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--color-dark-muted);
        }

        .academy-step-card-title {
          font-family: var(--font-serif);
          font-size: clamp(1.75rem, 2.8vw, 2.35rem);
          color: var(--color-dark-text);
          margin-bottom: 0.85rem;
          line-height: 1.15;
          font-weight: 400;
        }

        .academy-step-card-desc {
          font-size: clamp(1rem, 1.25vw, 1.125rem);
          line-height: 1.55;
          color: var(--color-dark-muted);
          margin-bottom: 1.25rem;
        }

        .step-detail-container {
          position: relative;
          padding-left: 1.1rem;
          margin-top: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .step-anim-accent-line {
          position: absolute;
          left: 0;
          top: 3px;
          bottom: 3px;
          width: 2.5px;
          border-radius: 1px;
          background: var(--color-dark-accent, #D9B77E);
          transform-origin: top center;
          pointer-events: none;
        }

        .academy-step-card-detail {
          font-size: 0.95rem;
          color: var(--color-dark-muted);
          line-height: 1.5;
          margin: 0;
        }

        .academy-step-footer-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .step-anim-chip {
          font-size: 0.78rem;
          color: var(--color-dark-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.35rem 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Post-pinned grid */
        .academy-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          padding-top: 3rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 3.5rem;
        }

        .academy-focus-text {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: inherit;
          line-height: 1.4;
          max-width: 38ch;
        }

        .academy-steps-list-wrap {
          position: relative;
          padding-left: 1.5rem;
        }

        .academy-steps-svg-line {
          position: absolute;
          left: 0;
          top: 0.5rem;
          bottom: 0.5rem;
          width: 4px;
          height: calc(100% - 1rem);
        }

        .academy-steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .academy-step-item {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .academy-step-num {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--color-dark-accent, #D9B77E);
        }

        .academy-step-title {
          font-size: 1.05rem;
          color: inherit;
        }

        .academy-action-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.75rem;
          padding: 2.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-dark-border);
        }

        .academy-closing-line {
          font-family: var(--font-serif);
          font-size: clamp(1.15rem, 1.8vw, 1.45rem);
          font-weight: 400;
          line-height: 1.35;
          color: var(--color-dark-text);
          margin: 0;
        }

        .academy-details-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem 2.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--color-dark-border);
        }

        .academy-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .academy-detail-label {
          font-size: var(--size-micro);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-dark-accent, #D9B77E);
          font-weight: 600;
        }

        .academy-detail-val {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-dark-text);
        }

        /* MOBILE: same pinned scroll as desktop, perfectly balanced 100svh fit */
        @media (max-width: 860px) {
          /* Remove section-level paddings so pin-wrap handles safe screen offsets */
          .academy-section {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }

          /* Pin wrapper fits exact viewport height with balanced buffers above & below */
          .academy-pin-wrap {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            height: 100svh;
            min-height: 100svh;
            max-height: 100svh;
            padding-top: 1.25rem;
            padding-bottom: calc(var(--mobile-bar-height, 60px) + 1.25rem);
            overflow: hidden;
          }

          .academy-container-top {
            padding-top: 0;
            padding-bottom: 0;
            flex-shrink: 0;
          }
          .academy-container-top .section-eyebrow-row {
            margin-bottom: 1rem;
            padding-bottom: 0.6rem;
          }
          .academy-container-top .section-label {
            font-size: 0.72rem;
            letter-spacing: 0.15em;
          }
          .academy-container-top .section-oversized-num {
            font-size: 2rem;
          }
          .academy-main-title {
            font-size: clamp(1.6rem, 6.4vw, 2rem);
            margin-bottom: 0.65rem;
            line-height: 1.15;
          }
          .academy-header-text p {
            font-size: 0.95rem !important;
            line-height: 1.5 !important;
            margin-bottom: 0 !important;
          }
          .academy-hero-grid {
            margin-bottom: 0.75rem;
          }

          .academy-stage-wrapper {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            height: auto;
            max-height: none;
            padding-top: 0;
            min-height: 0;
          }
          .academy-stage-inner {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            max-height: none;
            min-height: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
          .academy-mobile-sticky-header {
            margin-bottom: 0.9rem;
            flex-shrink: 0;
          }
          .academy-stage-header-row {
            margin-bottom: 0.5rem;
          }
          .academy-stage-header-row .section-label {
            font-size: 0.72rem;
          }
          .academy-step-counter {
            font-size: 0.9rem;
          }
          .academy-progress-bar-wrap {
            margin-bottom: 0;
          }

          .academy-stage-grid {
            flex: 0 0 auto;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            min-height: 0;
            align-items: stretch;
            gap: 0;
          }

          /* Hide stepper nav on phone */
          .academy-stepper-nav,
          .academy-rail-track,
          .stepper-dot-indicator {
            display: none;
          }

          /* Card takes middle space and centers its content */
          .academy-card-stage {
            flex: 0 0 auto;
            min-height: clamp(330px, 44svh, 430px);
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .academy-step-card {
            padding: 1.6rem 1.4rem;
            justify-content: center;
          }
          .academy-step-giant-num {
            font-size: 2.6rem;
          }
          .academy-step-tag {
            font-size: 0.72rem;
          }
          .academy-step-badge-row {
            margin-bottom: 0.6rem;
          }
          .academy-step-card-title {
            font-size: clamp(1.7rem, 6.5vw, 2rem);
            margin-bottom: 0.6rem;
            line-height: 1.15;
          }
          .academy-step-card-desc {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 0.9rem;
          }
          .step-detail-container {
            margin-top: 0.25rem;
            margin-bottom: 1.1rem;
            padding-left: 1rem;
          }
          .academy-step-card-detail {
            font-size: 0.92rem;
            line-height: 1.55;
          }
          .academy-step-footer-meta {
            gap: 0.5rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
          .step-anim-chip {
            font-size: 0.7rem;
            padding: 0.35rem 0.6rem;
          }
          .step-parallax-num {
            font-size: 7rem;
            right: 0.5rem;
            bottom: -0.5rem;
          }

          .academy-bottom-grid {
            grid-template-columns: 1fr;
            padding-top: 1.25rem;
          }
          .academy-container-bottom {
            padding-top: 1.25rem;
          }
          .academy-action-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 860px) and (max-height: 700px) {
          .academy-header-text p {
            display: none !important;
          }
          .academy-card-stage {
            min-height: 0;
          }
          .academy-step-card {
            padding: 1.1rem 1.2rem;
          }
          .academy-step-footer-meta {
            display: none;
          }
          .academy-container-top .section-eyebrow-row {
            margin-bottom: 0.6rem;
          }
          .academy-hero-grid {
            margin-bottom: 1rem;
          }
        }

        /* Reduced motion (any screen): no pinning, show cards as a stacked list */
        @media (prefers-reduced-motion: reduce) {
          .academy-stage-wrapper {
            height: auto;
            max-height: none;
            padding-top: 0;
            display: block;
          }
          .academy-stage-inner {
            max-height: none;
          }
          .academy-stepper-nav {
            display: none;
          }
          .academy-card-stage {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            min-height: auto;
            background: transparent;
            border: none;
          }
          .academy-step-card {
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
        }
      `}</style>
    </section>
  );
};
