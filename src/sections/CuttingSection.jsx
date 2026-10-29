import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData, whatsappFor } from '../data/site';
import { WordFillParagraph, SectionEyebrowRow } from '../components/MotionText';
import { track } from '../lib/track';

export const CuttingSection = () => {
  const data = siteData.cutting;
  const boyCut = siteData.images.cutting?.boyCut;
  const girlCut = siteData.images.cutting?.girlCut;
  const [activeTab, setActiveTab] = useState('boys');
  const sectionRef = useRef(null);
  const imgFrameRef = useRef(null);
  const innerImgRef = useRef(null);
  const isFirstRender = useRef(true);

  const currentCut = activeTab === 'boys' ? boyCut : girlCut;
  const inactiveCut = activeTab === 'boys' ? girlCut : boyCut;

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (innerImgRef.current) {
      gsap.fromTo(innerImgRef.current,
        { opacity: 0.4, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(sectionRef.current);

    mm.add({
      isDesktop: '(min-width: 901px)',
      isMobile: '(max-width: 900px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion, isDesktop } = context.conditions;

      if (reduceMotion) {
        gsap.set('.cutting-item-row, .cutting-photo-frame, .cutting-item-line', { opacity: 1, scaleX: 1 });
        return;
      }

      // Stagger items with line drawing across
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.cutting-items-list',
          start: 'top 85%',
          once: true
        }
      });

      tl.from('.cutting-item-row', {
        x: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out'
      })
        .fromTo('.cutting-item-line',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
          '-=0.5'
        );

      // Mask reveal with inner parallax
      if (imgFrameRef.current) {
        gsap.fromTo('.cutting-photo-frame',
          { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imgFrameRef.current,
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              const img = document.querySelector('.cutting-inner-img');
              if (img) img.style.willChange = 'auto';
            }
          }
        );

        gsap.to('.cutting-photo-frame', {
          yPercent: isDesktop ? -8 : -4,
          ease: 'none',
          scrollTrigger: {
            trigger: imgFrameRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="cutting" className="section" ref={sectionRef} aria-labelledby="cutting-title">
      <div className="container">
        <SectionEyebrowRow label={data.tagline} num={data.num} />

        <div className="discipline-grid-with-photo">
          {/* Left: Text & Services List */}
          <div className="discipline-content-pane">
            <h2 id="cutting-title" style={{ marginBottom: '1.25rem' }}>
              {data.title}
            </h2>

            <WordFillParagraph style={{ marginBottom: '2rem', fontSize: 'clamp(1.15rem, 1.6vw, 1.4rem)', lineHeight: '1.45' }}>
              {data.lead}
            </WordFillParagraph>

            <ul className="discipline-items-list cutting-items-list" aria-label="Cutting and styling options">
              {data.items.map((item, idx) => (
                <li key={idx} className="discipline-item-row cutting-item-row">
                  <div className="discipline-item-content">
                    <span className="discipline-item-bullet">—</span>
                    <span className="discipline-item-text">{item}</span>
                  </div>
                  <div className="cutting-item-line" aria-hidden="true"></div>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <a
                href="#visit"
                className="btn btn-primary"
                onClick={() => track.bookingSubmit({ location: 'cutting_section' })}
              >
                <span>Walk in today</span>
                <span className="btn-arrow" aria-hidden="true">↓</span>
              </a>
              <a
                href={whatsappFor("hair cutting and styling")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                onClick={() => track.whatsappClick('cutting_section')}
              >
                <span>Chat on WhatsApp</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Right: Large Photo with Mask Reveal, Tabbed Showcase and Inner Parallax */}
          {currentCut?.src && (
            <div className="discipline-photo-pane" ref={imgFrameRef}>
              <div className="cutting-tab-bar" role="group" aria-label="Select men's or women's haircuts">
                <button
                  type="button"
                  aria-pressed={activeTab === 'boys'}
                  className={`cutting-tab-pill ${activeTab === 'boys' ? 'active' : ''}`}
                  onClick={() => handleTabChange('boys')}
                >
                  Men's Cut
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'girls'}
                  className={`cutting-tab-pill ${activeTab === 'girls' ? 'active' : ''}`}
                  onClick={() => handleTabChange('girls')}
                >
                  Women's Cut
                </button>
              </div>

              <div className="cutting-photo-frame">
                <img
                  key={activeTab}
                  ref={innerImgRef}
                  src={currentCut.src}
                  alt={currentCut.alt}
                  width="800"
                  height="1000"
                  className="discipline-photo-img cutting-inner-img"
                  loading="lazy"
                  decoding="async"
                />
                {inactiveCut?.src && (
                  <img
                    src={inactiveCut.src}
                    alt=""
                    aria-hidden="true"
                    style={{ display: 'none' }}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="cutting-photo-caption">
                  <span>{currentCut.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .discipline-grid-with-photo {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(2.5rem, 5vw, 5rem);
          align-items: center;
        }

        .discipline-items-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--color-border);
        }

        .discipline-item-row {
          position: relative;
          padding: 1.15rem 0;
        }

        .discipline-item-content {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
        }

        .cutting-item-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--color-border-light);
          transform-origin: left;
          transform: scaleX(1);
        }

        .discipline-item-bullet {
          color: var(--color-accent);
          font-family: var(--font-serif);
        }

        .discipline-item-text {
          font-size: 1.05rem;
          color: var(--color-text);
          font-weight: 400;
        }

        .discipline-photo-pane {
          width: 100%;
        }

        .cutting-photo-frame {
          width: 100%;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          position: relative;
        }

        .discipline-photo-img {
          width: 100%;
          height: 110%;
          object-fit: cover;
          display: block;
          will-change: transform;
        }

        .cutting-tab-bar {
          display: inline-flex;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
          background: var(--color-surface);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
        }

        .cutting-tab-pill {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 0.4rem 1rem;
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          border-radius: 999px;
          transition: all var(--transition-fast);
        }

        .cutting-tab-pill.active {
          background: var(--color-accent);
          color: #FFFFFF;
        }

        .cutting-tab-pill:hover:not(.active) {
          color: var(--color-text);
        }

        .cutting-photo-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(20, 18, 17, 0.75) 0%, rgba(20, 18, 17, 0) 100%);
          color: #FFFFFF;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 1.5rem 1.25rem 0.85rem;
          letter-spacing: 0.02em;
          z-index: 2;
        }

        .cutting-inner-img {
          object-position: 50% 15%;
        }

        @media (max-width: 900px) {
          .discipline-grid-with-photo {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .cutting-photo-frame {
            aspect-ratio: 4/5;
            max-height: 70svh;
          }
          .cutting-inner-img {
            object-position: 50% 15%;
          }
        }

        @media (pointer: coarse) {
          .cutting-tab-pill {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1.25rem;
          }
        }
      `}</style>
    </section>
  );
};
