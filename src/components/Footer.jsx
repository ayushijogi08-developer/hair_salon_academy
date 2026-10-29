import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteData } from '../data/site';
import { track } from '../lib/track';

export const Footer = () => {
  const footerRef = useRef(null);
  const location = useLocation();
  const isAcademy = location.pathname.startsWith('/academy');

  // Format hours: ensure days on one line, and time on next line with non-breaking spaces for AM/PM
  const hoursDays = siteData.hours?.days || 'Monday – Sunday';
  const hoursTimeRaw = siteData.hours?.time || '9:00 AM – 10:00 PM';
  // Replace space before AM/PM with non-breaking space (\u00A0) so "10:00 PM" never splits
  const formattedHoursTime = hoursTimeRaw.replace(/(\d{1,2}:\d{2})\s+(AM|PM)/gi, '$1\u00A0$2');

  return (
    <footer
      ref={footerRef}
      className={`site-footer ${isAcademy ? 'site-footer-dark' : 'site-footer-ivory'}`}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Brand Col */}
          <div>
            <span
              className="brand-title"
              style={{
                fontSize: '1.35rem',
                marginBottom: '0.25rem',
                display: 'block'
              }}
            >
              {siteData.name}
            </span>
            <span
              className="brand-subtitle"
              style={{
                display: 'block',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              {siteData.branch}
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--footer-text-muted)', lineHeight: '1.6' }}>
              Salon services and academy training under one roof on Necklace Road, Ranpise Nagar, Akola.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="editorial-label" style={{ marginBottom: '1rem', display: 'block' }}>
              Explore
            </span>
            <nav aria-label="Footer navigation">
              {isAcademy ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, margin: 0 }}>
                  <li>
                    <Link to="/" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Salon
                    </Link>
                  </li>
                  <li>
                    <Link to="/academy" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Academy
                    </Link>
                  </li>
                  <li>
                    <Link to="/#visit" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Visit
                    </Link>
                  </li>
                </ul>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, margin: 0 }}>
                  <li>
                    <Link to="/#services" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Salon Services
                    </Link>
                  </li>
                  <li>
                    <Link to="/academy" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Academy
                    </Link>
                  </li>
                  <li>
                    <Link to="/#work" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Our Work
                    </Link>
                  </li>
                  <li>
                    <Link to="/#visit" className="footer-nav-link" style={{ fontSize: '0.875rem' }}>
                      Visit
                    </Link>
                  </li>
                </ul>
              )}
            </nav>
          </div>

          {/* Quick Contact Col */}
          <div>
            <span className="editorial-label" style={{ marginBottom: '1rem', display: 'block' }}>
              Contact
            </span>
            <p className="footer-contact-item" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--footer-text)' }}>
              <strong>Phone:</strong>{' '}
              <a
                href={`tel:${siteData.phoneRaw}`}
                className="footer-contact-link"
                onClick={() => track.callClick('footer')}
              >
                {siteData.phone}
              </a>
            </p>
            <p className="footer-contact-item" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--footer-text)' }}>
              <strong>WhatsApp:</strong>{' '}
              <a
                href={siteData.links.whatsappGeneral}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
                onClick={() => track.whatsappClick('footer')}
              >
                Chat on WhatsApp
              </a>
            </p>
            <p className="footer-contact-item" style={{ fontSize: '0.875rem', color: 'var(--footer-text)' }}>
              <strong>Instagram:</strong>{' '}
              <a
                href={siteData.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                @_hair_city_salon
              </a>
            </p>
          </div>

          {/* Hours & Address Col */}
          <div>
            <span className="editorial-label" style={{ marginBottom: '1rem', display: 'block' }}>
              Hours &amp; Location
            </span>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--footer-text)', lineHeight: '1.5' }}>
              <span style={{ display: 'block', fontWeight: 500 }}>{hoursDays}</span>
              <span style={{ display: 'block' }}>{formattedHoursTime}</span>
            </p>
            <address style={{ fontStyle: 'normal', fontSize: '0.8125rem', color: 'var(--footer-text-muted)', lineHeight: '1.5' }}>
              {siteData.address.line1}, {siteData.address.line2}, {siteData.address.city} {siteData.address.pincode}
            </address>
          </div>
        </div>

        {/* Footer Columns Divider */}
        <div
          className="footer-columns-divider"
          style={{
            borderTop: '1px solid var(--footer-border)',
            width: '100%'
          }}
        />

        {/* Big HAIR CITY watermark in its container: text at ~5% opacity, centred, sized to fit width, NOT cut off at bottom, ~48px band */}
        <div
          className="footer-watermark-container"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <svg
            viewBox="0 0 1000 110"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '48px',
              display: 'block'
            }}
          >
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              textLength="920"
              lengthAdjust="spacing"
              fill={isAcademy ? '#FAF8F5' : '#191614'}
              opacity="0.05"
              fontFamily="var(--font-serif)"
              fontWeight="400"
              letterSpacing="0.06em"
              fontSize="96"
            >
              HAIR CITY
            </text>
          </svg>
        </div>

        {/* Bottom copyright line */}
        <div
          className="footer-copyright-line"
          style={{
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--footer-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--footer-text-muted)'
          }}
        >
          <span>© 2026 {siteData.name}. All rights reserved.</span>
          <span>Akola, Maharashtra, India</span>
        </div>
      </div>

      <style>{`
        .site-footer {
          --footer-bg: var(--color-bg);
          --footer-border: var(--color-border);
          --footer-text: var(--color-text);
          --footer-text-muted: var(--color-muted);
          --footer-label: var(--color-muted);
          --footer-link: var(--color-text);
          --footer-link-hover: var(--color-accent);
          background-color: var(--footer-bg);
          border-top: 1px solid var(--footer-border);
          padding: clamp(2.5rem, 5vw, 4rem) 0 1.75rem;
          position: relative;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        /* Dark charcoal theme for /academy */
        .site-footer.site-footer-dark {
          --footer-bg: #11100F;
          --footer-border: rgba(229, 211, 179, 0.12);
          --footer-text: #FAF8F5;
          --footer-text-muted: #A8A099;
          --footer-label: #E5D3B3;
          --footer-link: #FAF8F5;
          --footer-link-hover: #E5D3B3;
        }

        .site-footer .brand-title {
          color: var(--footer-text);
        }

        .site-footer .brand-subtitle {
          color: var(--footer-label);
        }

        .site-footer .editorial-label {
          color: var(--footer-label);
        }

        .site-footer .footer-nav-link,
        .site-footer .footer-contact-link {
          color: var(--footer-link);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s ease;
        }

        .site-footer .footer-nav-link:hover,
        .site-footer .footer-contact-link:hover {
          color: var(--footer-link-hover) !important;
        }
      `}</style>
    </footer>
  );
};
