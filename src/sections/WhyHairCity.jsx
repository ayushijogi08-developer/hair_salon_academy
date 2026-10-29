import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';

export const WhyHairCity = () => {
  const sectionRef = useRef(null);

  const pillars = [
    {
      id: "pillar-hours",
      title: "Open 7 Days a Week",
      desc: `${siteData.hours.days}, ${siteData.hours.time}. No appointment needed — walk-ins are welcomed every day.`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: "pillar-consultation",
      title: "Consultation Before Every Service",
      desc: "Every cut and treatment starts with a consultation regarding face shape, hair texture, and daily routine.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      )
    },
    {
      id: "pillar-patch-test",
      title: "Patch Test Before Colour",
      desc: "Client safety comes first. A patch test and hair condition check always precede any colour or lightening work.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    },
    {
      id: "pillar-academy",
      title: "Salon & Academy Under One Roof",
      desc: "Professional client services and hands-on hair education operate in the same live, working salon space.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    }
  ];

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.set('.why-card', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.why-card',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
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
  }, []);

  return (
    <section id="why-hair-city" className="section" ref={sectionRef} aria-labelledby="why-heading">
      <div className="container">
        <SectionEyebrowRow label="Studio Standard" />

        <div style={{ maxWidth: '640px', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <h2 id="why-heading" style={{ marginBottom: '1rem' }}>
            Why Hair City
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Built on verified salon discipline, client safety, and honest craftsmanship in Akola.
          </p>
        </div>

        <div className="why-grid">
          {pillars.map((item) => (
            <div key={item.id} className="why-card">
              <div className="why-icon-bubble" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .why-card {
          padding: 2.25rem 2rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }

        .why-card:hover {
          border-color: var(--color-accent);
        }

        .why-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .why-card-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .why-card-desc {
          font-size: 0.925rem;
          color: var(--color-muted);
          line-height: 1.6;
        }
      `}</style>
    </section>
  );
};

export default WhyHairCity;
