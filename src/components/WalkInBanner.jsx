import React from 'react';
import { siteData } from '../data/site';
import { track } from '../lib/track';

export const WalkInBanner = () => {
  const walkIn = siteData.walkIn;
  if (!walkIn?.confirmed) return null;

  return (
    <aside className="walkin-banner" aria-label="Walk-in welcome strip">
      <div className="container walkin-banner-inner">
        <div className="walkin-banner-message">
          <span className="walkin-badge">
            <span className="status-dot" aria-hidden="true" />
            Walk-ins welcome
          </span>
          <span className="walkin-headline">{walkIn.headline}</span>
          <span className="walkin-text">{walkIn.text}</span>
        </div>

        <div className="walkin-banner-actions">
          <a
            href="#visit"
            className="walkin-action-link walkin-action-primary"
            onClick={() => track.bookingSubmit({ location: 'walkin_banner' })}
          >
            <span>Find us &amp; hours</span>
            <span className="btn-arrow" aria-hidden="true">↓</span>
          </a>
          <span className="walkin-divider" aria-hidden="true">/</span>
          <a
            href={siteData.links.whatsappGeneral}
            target="_blank"
            rel="noopener noreferrer"
            className="walkin-action-link"
            onClick={() => track.whatsappClick('walkin_banner')}
          >
            <span>Chat on WhatsApp</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
          <span className="walkin-divider" aria-hidden="true">/</span>
          <a
            href={`tel:${siteData.phoneRaw}`}
            className="walkin-action-link"
            onClick={() => track.callClick('walkin_banner')}
          >
            <span>Call {siteData.phone}</span>
          </a>
        </div>
      </div>

      <style>{`
        .walkin-banner {
          background-color: var(--color-surface);
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          padding: 0.85rem 0;
          position: relative;
          z-index: 2;
        }

        .walkin-banner-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem 1.5rem;
        }

        .walkin-banner-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: var(--size-small);
          line-height: 1.4;
        }

        .walkin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background-color: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          font-size: var(--size-micro);
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text);
        }

        .walkin-headline {
          font-family: var(--font-serif);
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--color-text);
          letter-spacing: -0.01em;
        }

        .walkin-text {
          color: var(--color-muted);
        }

        .walkin-banner-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: var(--size-small);
          margin-left: auto;
          flex-wrap: wrap;
        }

        .walkin-action-link {
          color: var(--color-text);
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color var(--transition-fast);
        }

        .walkin-action-link:hover {
          color: var(--color-accent);
        }

        .walkin-action-primary {
          color: var(--color-accent);
          font-weight: 600;
        }

        .walkin-divider {
          color: var(--color-border);
          user-select: none;
        }

        @media (max-width: 860px) {
          .walkin-banner-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .walkin-banner-actions {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
};

export default WalkInBanner;
