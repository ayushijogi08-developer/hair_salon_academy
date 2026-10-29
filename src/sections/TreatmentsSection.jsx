import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData, whatsappFor } from '../data/site';
import { WordFillParagraph, SectionEyebrowRow } from '../components/MotionText';
import { track } from '../lib/track';

export const TreatmentsSection = () => {
  const data = siteData.treatments;
  const treatmentsImg = siteData.images.treatments?.src;
  const sectionRef = useRef(null);
  const imgFrameRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(sectionRef.current);

    mm.add({
      isDesktop: '(min-width: 901px)',
      isMobile: '(max-width: 900px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion, isDesktop } = context.conditions;

      if (reduceMotion) {
        gsap.set('.treatment-compact-row, .treatment-photo-frame, .treatment-compact-line, .treatment-before-care-card', { opacity: 1, scaleX: 1 });
        return;
      }

      // Stagger items with line drawing across
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.treatment-compact-list',
          start: 'top 85%',
          once: true
        }
      });

      tl.from('.treatment-compact-row', {
        x: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out'
      })
      .fromTo('.treatment-compact-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
        '-=0.5'
      );

      gsap.from('.treatment-before-care-card', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.treatment-before-care-card',
          start: 'top 90%',
          once: true
        }
      });

      // Mask reveal with inner parallax
      if (treatmentsImg && imgFrameRef.current) {
        gsap.fromTo('.treatment-photo-frame',
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
              const img = document.querySelector('.treatment-inner-img');
              if (img) img.style.willChange = 'auto';
            }
          }
        );

        gsap.to('.treatment-inner-img', {
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
  }, [treatmentsImg]);

  return (
    <section id="treatments" className="section" ref={sectionRef} aria-labelledby="treatments-title">
      <div className="container">
        <SectionEyebrowRow label={data.tagline} num={data.num} />

        {/* Content on Left, Large Photo on Right */}
        <div className="discipline-grid-with-photo">
          <div className="discipline-content-pane">
            <h2 id="treatments-title" style={{ marginBottom: '1.25rem' }}>
              {data.title}
            </h2>

            <WordFillParagraph style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.15rem, 1.6vw, 1.4rem)', lineHeight: '1.45' }}>
              {data.lead}
            </WordFillParagraph>

            <div className="treatment-before-care-card">
              <span className="treatment-before-care-label">Before-Care Note</span>
              <p className="treatment-before-care-text">{data.note}</p>
            </div>

            <ol className="treatment-compact-list" aria-label="Hair treatment therapies">
              {data.items.map((item, idx) => (
                <li key={idx} className="treatment-compact-row">
                  <span className="treatment-compact-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="treatment-compact-text">{item}</span>
                  <div className="treatment-compact-line" aria-hidden="true"></div>
                </li>
              ))}
            </ol>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <a
                href={whatsappFor("hair treatments")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                onClick={() => track.whatsappClick('treatments_section')}
              >
                <span>Consult on treatments</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Right: Large Photo with Mask Reveal and Inner Parallax */}
          {treatmentsImg && (
            <div className="discipline-photo-pane" ref={imgFrameRef}>
              <div className="treatment-photo-frame">
                <img
                  src={treatmentsImg}
                  alt={siteData.images.treatments.alt}
                  width="800"
                  height="1000"
                  className="discipline-photo-img treatment-inner-img"
                  loading="lazy"
                  decoding="async"
                />
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

        .treatment-before-care-card {
          margin-bottom: 2rem;
          padding: 1.25rem 1.5rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 3px solid var(--color-accent);
          border-radius: 2px;
          max-width: 46ch;
        }

        .treatment-before-care-label {
          display: block;
          font-size: var(--size-micro);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--color-accent);
          margin-bottom: 0.35rem;
          font-weight: 600;
        }

        .treatment-before-care-text {
          font-size: 0.9375rem;
          color: var(--color-text);
          margin: 0;
          font-weight: 500;
          line-height: 1.5;
        }

        .treatment-compact-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--color-border);
        }

        .treatment-compact-row {
          position: relative;
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          padding: 1.1rem 0;
        }

        .treatment-compact-num {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-accent);
          font-weight: 500;
          min-width: 2ch;
          line-height: 1;
        }

        .treatment-compact-text {
          font-size: 1.05rem;
          color: var(--color-text);
          font-weight: 400;
          line-height: 1.4;
        }

        .treatment-compact-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--color-border-light);
          transform-origin: left;
          transform: scaleX(1);
        }

        .discipline-photo-pane {
          width: 100%;
        }

        .treatment-photo-frame {
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

        .treatment-inner-img {
          object-position: 50% 35%;
        }

        @media (max-width: 900px) {
          .discipline-grid-with-photo {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .treatment-photo-frame {
            aspect-ratio: 4/5;
            max-height: 70svh;
          }
          .treatment-inner-img {
            object-position: 50% 35%;
          }
        }
      `}</style>
    </section>
  );
};
