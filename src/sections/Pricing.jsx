import React, { useState, useLayoutEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { SectionEyebrowRow } from '../components/MotionText';
import { track } from '../lib/track';

export const Pricing = () => {
  const confirmed = useMemo(
    () => siteData.pricing?.filter((item) => item.confirmed) || [],
    []
  );

  // Extract unique categories from confirmed items
  const categories = useMemo(() => {
    return Array.from(
      new Set(confirmed.map((item) => item.category?.trim()).filter(Boolean))
    );
  }, [confirmed]);

  const [selectedTab, setSelectedTab] = useState('');

  // Active tab falls back cleanly to first category
  const activeTab = useMemo(() => {
    if (categories.length === 0) return '';
    if (selectedTab && categories.includes(selectedTab)) return selectedTab;
    return categories[0];
  }, [categories, selectedTab]);

  const setActiveTab = setSelectedTab;
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);

  // Accessible tab keyboard navigation (Left/Right/Up/Down, Home/End)
  const handleTabKeyDown = (e, index) => {
    let targetIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % categories.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + categories.length) % categories.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = categories.length - 1;
    }

    if (targetIndex !== null) {
      setActiveTab(categories[targetIndex]);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  useLayoutEffect(() => {
    if (confirmed.length === 0) return;

    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.set('.pricing-row', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.pricing-row',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out'
        }
      );
    }, el);

    return () => ctx.revert();
  }, [confirmed.length, activeTab]);

  if (confirmed.length === 0) {
    return null;
  }

  const displayedItems = categories.length > 0
    ? confirmed.filter((item) => (item.category?.trim() || '') === activeTab)
    : confirmed;

  const activeCategoryIdx = categories.indexOf(activeTab);

  return (
    <section id="pricing" className="section" ref={sectionRef} aria-labelledby="pricing-title">
      <div className="container">
        <SectionEyebrowRow label="Menu & Rates" />
        <div style={{ maxWidth: '640px', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <h2 id="pricing-title" style={{ marginBottom: '1rem' }}>
            Service Pricing
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Transparent rates for salon services. All services are performed by skilled stylists with thorough consultation.
          </p>
        </div>

        {/* Tabbed Category Navigation (Only when multiple categories exist) */}
        {categories.length > 0 && (
          <div
            className="pricing-tablist"
            role="tablist"
            aria-label="Service categories"
          >
            {categories.map((cat, idx) => {
              const isSelected = activeTab === cat;
              return (
                <button
                  key={cat}
                  ref={(el) => (tabRefs.current[idx] = el)}
                  id={`pricing-tab-${idx}`}
                  type="button"
                  role="tab"
                  className="pricing-tab"
                  aria-selected={isSelected}
                  aria-controls={`pricing-panel-${idx}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveTab(cat)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Panel */}
        <div
          id={`pricing-panel-${activeCategoryIdx >= 0 ? activeCategoryIdx : 0}`}
          role="tabpanel"
          aria-labelledby={`pricing-tab-${activeCategoryIdx >= 0 ? activeCategoryIdx : 0}`}
          tabIndex={0}
          className="pricing-tabpanel"
        >
          <div className="pricing-table" role="table" aria-label={`Pricing for ${activeTab || 'services'}`}>
            {displayedItems.map((item, idx) => {
              const hasPrice = typeof item.priceFrom === 'number' && !isNaN(item.priceFrom);

              return (
                <div key={item.id || idx} className="pricing-row" role="row">
                  <div className="pricing-row-meta">
                    <span className="pricing-name" role="rowheader">
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="pricing-desc">{item.description}</p>
                    )}
                  </div>

                  {hasPrice && (
                    <div className="pricing-rate-wrap" role="cell">
                      <span className="pricing-rate">
                        from ₹{item.priceFrom}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Footer Disclaimer & Contact Line */}
        <div className="pricing-footer-note">
          <p className="pricing-disclaimer">
            Final price depends on hair length and condition. Our team will confirm it before starting.
          </p>
          <p className="pricing-contact-line">
            Walk in or call us at{' '}
            <a
              href={`tel:${siteData.phoneRaw}`}
              className="pricing-phone-link"
              onClick={() => track.callClick('pricing')}
            >
              {siteData.phone}
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .pricing-tablist {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background-color: var(--color-surface);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
          overflow-x: auto;
          max-width: 100%;
          scrollbar-width: none;
        }

        .pricing-tablist::-webkit-scrollbar {
          display: none;
        }

        .pricing-tab {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          padding: 0.45rem 1.15rem;
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          border-radius: 999px;
          white-space: nowrap;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .pricing-tab:hover:not([aria-selected="true"]) {
          color: var(--color-text);
        }

        .pricing-tab[aria-selected="true"] {
          background-color: var(--color-accent);
          color: #FFFFFF;
          font-weight: 600;
        }

        .pricing-tab:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .pricing-tabpanel:focus-visible {
          outline: none;
        }

        .pricing-table {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--color-border);
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 1.35rem 0;
          border-bottom: 1px solid var(--color-border);
          gap: 1.5rem;
          transition: background-color var(--transition-fast);
        }

        .pricing-row:hover {
          background-color: rgba(243, 239, 233, 0.45);
        }

        .pricing-row-meta {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          max-width: 720px;
        }

        .pricing-name {
          font-family: var(--font-serif);
          font-size: clamp(1.15rem, 1.8vw, 1.35rem);
          font-weight: 600;
          color: var(--color-text);
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .pricing-desc {
          font-size: 0.9rem;
          color: var(--color-muted);
          line-height: 1.5;
        }

        .pricing-rate-wrap {
          display: flex;
          align-items: baseline;
          margin-left: auto;
          flex-shrink: 0;
        }

        .pricing-rate {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
        }

        .pricing-footer-note {
          margin-top: 2rem;
          padding-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .pricing-disclaimer {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          font-style: italic;
          color: var(--color-muted);
          line-height: 1.55;
        }

        .pricing-contact-line {
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .pricing-phone-link {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color var(--transition-fast);
        }

        .pricing-phone-link:hover {
          color: var(--color-accent-hover);
        }

        @media (pointer: coarse) {
          .pricing-tab {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
          .pricing-phone-link {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};
