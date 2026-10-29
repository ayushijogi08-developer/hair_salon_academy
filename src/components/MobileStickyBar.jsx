import React, { useState, useEffect } from 'react';
import { siteData } from '../data/site';
import { track } from '../lib/track';

export const MobileStickyBar = () => {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide bar if footer enters viewport to avoid obscuring footer content
      const footerElement = document.querySelector('footer');
      if (footerElement) {
        const footerRect = footerElement.getBoundingClientRect();
        if (footerRect.top < window.innerHeight) {
          setShowBar(false);
          return;
        }
      }

      // Appear after the hero section (approx 450px or when hero scrolls past)
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        setShowBar(rect.bottom < 150);
      } else {
        setShowBar(window.scrollY > 350);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside
      className={`mobile-bottom-bar ${showBar ? 'visible' : ''}`}
      aria-label="Quick Actions"
    >
      <div className="mobile-bottom-bar-inner">
        <a
          href={`tel:${siteData.phoneRaw}`}
          className="mobile-bar-btn btn-secondary"
          aria-label={`Call Hair City at ${siteData.phone}`}
          onClick={() => track.callClick('mobile_sticky_bar')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Call</span>
        </a>

        <a
          href={siteData.links.whatsappGeneral}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-bar-btn btn-primary"
          aria-label="Chat on WhatsApp"
          onClick={() => track.whatsappClick('mobile_sticky_bar')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        <a
          href={siteData.links.directions}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-bar-btn btn-secondary"
          aria-label="Get directions to Hair City on Google Maps"
          onClick={() => track.directionsClick('mobile_sticky_bar')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Directions</span>
        </a>
      </div>
    </aside>
  );
};

