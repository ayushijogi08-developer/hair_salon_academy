import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData, whatsappFor } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';
import { track } from '../lib/track';

export const ColourSection = () => {
  const data = siteData.colour;
  const colourImg = siteData.images.colour?.src;
  const colourSectionRef = useRef(null);
  const imgFrameRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(colourSectionRef.current);

    mm.add({
      isDesktop: '(min-width: 901px)',
      isMobile: '(max-width: 900px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { reduceMotion, isDesktop } = context.conditions;

      if (reduceMotion) {
        gsap.set('.colour-photo-frame', { opacity: 1 });
        return;
      }

      // Stagger process steps
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.colour-process-list',
          start: 'top 85%',
          once: true
        }
      });

      tl.from('.colour-process-step', {
        x: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Mask reveal with inner parallax
      if (colourImg && imgFrameRef.current) {
        gsap.fromTo('.colour-photo-frame',
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
              const img = document.querySelector('.colour-inner-img');
              if (img) img.style.willChange = 'auto';
            }
          }
        );

        gsap.to('.colour-inner-img', {
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
  }, [colourImg]);

  return (
    <section id="colour" className="section" ref={colourSectionRef} aria-labelledby="colour-title">
      <div className="container">
        <SectionEyebrowRow label={data.tagline} num={data.num} />

        {/* Alternating Layout: Photo on Left, Content on Right */}
        <div className="colour-alternating-grid">
          {colourImg && (
            <div className="colour-photo-col" ref={imgFrameRef}>
              <div className="colour-photo-frame">
                <img
                  src={colourImg}
                  alt={siteData.images.colour.alt}
                  width="800"
                  height="1000"
                  className="colour-photo-img colour-inner-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}

          <div className="colour-content-col">
            <h2 id="colour-title" style={{ marginBottom: '1.25rem' }}>
              {data.title}
            </h2>

            <div className="colour-process-header">
              <span className="colour-process-badge">Consultation First</span>
              <p className="colour-process-intro">
                Our colour process, step by step:
              </p>
            </div>

            {/* Consultation-First 3-Step Process using strictly site.js copy */}
            <div className="colour-process-list">
              <div className="colour-process-step">
                <span className="colour-step-num">01</span>
                <div className="colour-step-body">
                  <h3 className="colour-step-title">Patch Test & Consultation</h3>
                  <p className="colour-step-text">{data.note}</p>
                </div>
              </div>

              <div className="colour-process-step">
                <span className="colour-step-num">02</span>
                <div className="colour-step-body">
                  <h3 className="colour-step-title">Base & Undertone Planning</h3>
                  <p className="colour-step-text">{data.lead}</p>
                </div>
              </div>

              <div className="colour-process-step">
                <span className="colour-step-num">03</span>
                <div className="colour-step-body">
                  <h3 className="colour-step-title">Custom Application & Aftercare</h3>
                  <p className="colour-step-text">{data.items[3]}</p>
                </div>
              </div>
            </div>

            {/* Service spectrum chips */}
            <div className="colour-disciplines-strip" aria-label="Colour service options">
              <span className="colour-service-chip">{data.items[0]}</span>
              <span className="colour-service-chip">{data.items[1]}</span>
              <span className="colour-service-chip">{data.items[2]}</span>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <a
                href={whatsappFor("hair colour")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                onClick={() => track.whatsappClick('colour_section')}
              >
                <span>Ask about colour</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .colour-alternating-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: clamp(2.5rem, 5vw, 5rem);
          align-items: center;
        }

        .colour-photo-col {
          width: 100%;
        }

        .colour-photo-frame {
          width: 100%;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          position: relative;
        }

        .colour-photo-img {
          width: 100%;
          height: 110%;
          object-fit: cover;
          display: block;
          will-change: transform;
        }

        .colour-inner-img {
          object-position: 50% 30%;
        }

        .colour-process-header {
          margin-bottom: 1.5rem;
        }

        .colour-process-badge {
          display: inline-block;
          font-size: var(--size-micro);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--color-accent);
          font-weight: 600;
          margin-bottom: 0.35rem;
        }

        .colour-process-intro {
          font-size: 0.95rem;
          color: var(--color-muted);
          margin: 0;
          line-height: 1.5;
        }

        .colour-process-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .colour-process-step {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.25rem;
          align-items: start;
          padding: 1.15rem 1.35rem;
          background: var(--color-surface);
          border-left: 3px solid var(--color-accent);
          transition: transform 0.25s ease;
        }

        .colour-process-step:hover {
          transform: translateX(4px);
        }

        .colour-step-num {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--color-accent);
          line-height: 1;
          font-weight: 400;
        }

        .colour-step-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .colour-step-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .colour-step-text {
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.5;
          margin: 0;
        }

        .colour-disciplines-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 0.5rem;
        }

        .colour-service-chip {
          font-size: 0.8125rem;
          color: var(--color-text);
          background: var(--color-surface-elevated, #EAE3DA);
          padding: 0.35rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 2px;
          letter-spacing: 0.02em;
        }

        @media (max-width: 900px) {
          .colour-alternating-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .colour-photo-col {
            order: 2;
          }
          .colour-photo-frame {
            aspect-ratio: 4/5;
            max-height: 70svh;
          }
          .colour-inner-img {
            object-position: 50% 30%;
          }
        }
      `}</style>
    </section>
  );
};
