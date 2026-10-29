import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { siteData } from '../data/site';
import { canHover } from '../lib/motion';
import { OpenStatus } from './OpenStatus';
import { track } from '../lib/track';
import { usePageTransition } from '../lib/pageTransitionContext';

// ── Sub-components defined outside Header to avoid re-creating during render ─

/**
 * Segmented Control Switch: Salon | Academy
 * Single sliding thumb glides between the two options with 450ms ease-editorial.
 * Changes theme styling smoothly per mode (Ivory + Espresso thumb vs Dark glass + Champagne thumb).
 * Accessible with role="tablist", aria-selected, aria-current, and arrow-key navigation.
 */
const AudienceSwitch = ({ isAcademy, inDrawer = false, onClose }) => {
  const { transitionTo } = usePageTransition();
  const salonTabRef = useRef(null);
  const academyTabRef = useRef(null);

  const handleSelect = (targetPath) => {
    if (inDrawer && onClose) onClose();
    if ((targetPath === '/academy' && isAcademy) || (targetPath === '/' && !isAcademy)) {
      if (window.scrollY > 0) {
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 0.8 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }
    transitionTo(targetPath);
  };

  const handleKeyDown = (e, currentMode) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentMode === 'salon') {
        academyTabRef.current?.focus();
        handleSelect('/academy');
      } else {
        salonTabRef.current?.focus();
        handleSelect('/');
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentMode === 'academy') {
        salonTabRef.current?.focus();
        handleSelect('/');
      } else {
        academyTabRef.current?.focus();
        handleSelect('/academy');
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      salonTabRef.current?.focus();
      handleSelect('/');
    } else if (e.key === 'End') {
      e.preventDefault();
      academyTabRef.current?.focus();
      handleSelect('/academy');
    }
  };

  return (
    <div
      className={`audience-segmented-control ${inDrawer ? 'audience-segmented-control--drawer' : ''}`}
      data-mode={isAcademy ? 'academy' : 'salon'}
      role="tablist"
      aria-label="Site experience: Salon or Academy"
    >
      {/* Gliding Thumb */}
      <div className="audience-segmented-control__thumb" aria-hidden="true" />

      {/* Salon Tab Option */}
      <button
        ref={salonTabRef}
        type="button"
        role="tab"
        id={inDrawer ? 'drawer-tab-salon' : 'header-tab-salon'}
        aria-selected={!isAcademy}
        aria-current={!isAcademy ? 'page' : undefined}
        tabIndex={!isAcademy ? 0 : -1}
        className={`audience-segmented-control__tab ${!isAcademy ? 'is-active' : ''}`}
        onClick={() => handleSelect('/')}
        onKeyDown={(e) => handleKeyDown(e, 'salon')}
      >
        <svg
          className="audience-tab__icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
        <span className="audience-tab__label">Salon</span>
      </button>

      {/* Academy Tab Option */}
      <button
        ref={academyTabRef}
        type="button"
        role="tab"
        id={inDrawer ? 'drawer-tab-academy' : 'header-tab-academy'}
        aria-selected={isAcademy}
        aria-current={isAcademy ? 'page' : undefined}
        tabIndex={isAcademy ? 0 : -1}
        className={`audience-segmented-control__tab ${isAcademy ? 'is-active' : ''}`}
        onClick={() => handleSelect('/academy')}
        onKeyDown={(e) => handleKeyDown(e, 'academy')}
      >
        <svg
          className="audience-tab__icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="audience-tab__label">Academy</span>
      </button>
    </div>
  );
};

/** CTA button: context-aware */
const CtaButton = ({ isAcademy, ctaBtnRef, onScrollToAnchor }) => {
  if (isAcademy) {
    return (
      <a
        ref={ctaBtnRef}
        href={siteData.links.whatsappAcademy}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-slide-fill header-cta"
        aria-label="Enquire about the academy on WhatsApp"
        onClick={() => track.academyEnquirySubmit({ location: 'header' })}
      >
        <span className="btn-slide-bg" aria-hidden="true" />
        <span className="btn-label-text">Enquire</span>
        <span className="btn-arrow">→</span>
      </a>
    );
  }
  return (
    <a
      ref={ctaBtnRef}
      href="#visit"
      className="btn btn-slide-fill header-cta"
      aria-label="Walk in today — see our visit details"
      onClick={(e) => {
        track.bookingSubmit({ location: 'header' });
        onScrollToAnchor('#visit', e);
      }}
    >
      <span className="btn-slide-bg" aria-hidden="true" />
      <span className="btn-label-text">Walk in today</span>
      <span className="btn-arrow">→</span>
    </a>
  );
};

// ── Main Header ──────────────────────────────────────────────────────────────

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ctaBtnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { transitionTo } = usePageTransition();

  const isAcademy = location.pathname === '/academy';

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set html[data-header] attribute for dependent elements
  useEffect(() => {
    document.documentElement.dataset.header = headerVisible ? 'shown' : 'hidden';
  }, [headerVisible]);

  const toggleBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const prevFocusedRef = useRef(null);

  // Focus trap and Escape handling for mobile drawer
  useEffect(() => {
    if (!menuOpen) {
      if (prevFocusedRef.current) {
        prevFocusedRef.current.focus?.();
        prevFocusedRef.current = null;
      }
      document.body.style.overflow = '';
      window.lenis?.start();
      return;
    }

    prevFocusedRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();

    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.lenis?.start();
    };
  }, [menuOpen]);

  // Magnetic button on desktop for header CTA (re-bind when route changes)
  useEffect(() => {
    const btn = ctaBtnRef.current;
    if (!btn || !canHover()) return;

    const handleMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isAcademy]);

  /** Smooth-scroll to a same-page anchor (salon home) */
  const scrollToAnchor = (hash, e) => {
    if (e) e.preventDefault();
    setMenuOpen(false);
    document.body.style.overflow = '';
    window.lenis?.start();

    if (location.pathname !== '/') {
      navigate('/' + hash);
      return;
    }

    const targetEl = document.querySelector(hash);
    if (!targetEl) return;

    requestAnimationFrame(() => {
      if (window.lenis) {
        window.lenis.scrollTo(targetEl, { offset: -72, duration: 1.2 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      window.history.pushState(null, '', hash);
    });
  };

  const handleCloseDrawer = () => setMenuOpen(false);

  const handleBrandClick = (e) => {
    if (isAcademy) {
      e.preventDefault();
      if (menuOpen) setMenuOpen(false);
      transitionTo('/');
    } else {
      if (window.scrollY > 0) {
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`site-header ${headerVisible ? 'header-shown' : 'header-hidden'} ${isAcademy ? 'header-dark' : ''}`}
    >
      <div className="container header-inner">
        <Link to="/" className="brand-title" onClick={handleBrandClick}>
          <span>Hair City</span>
          <span className="brand-subtitle">Salon &amp; Academy · Akola</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop" aria-label="Main Navigation">
          {!isAcademy ? (
            <>
              <a href="#services" className="nav-link nav-link-sweep" onClick={(e) => scrollToAnchor('#services', e)}>Services</a>
              <a href="#work" className="nav-link nav-link-sweep" onClick={(e) => scrollToAnchor('#work', e)}>Work</a>
              <a href="#visit" className="nav-link nav-link-sweep" onClick={(e) => scrollToAnchor('#visit', e)}>Visit</a>
            </>
          ) : (
            <>
              <a href="#academy-hero" className="nav-link nav-link-sweep" onClick={(e) => scrollToAnchor('#academy-hero', e)}>Overview</a>
              <a href={siteData.links.googleMaps} target="_blank" rel="noopener noreferrer" className="nav-link nav-link-sweep">Directions</a>
            </>
          )}
        </nav>

        {/* Segmented Control Switch (desktop) */}
        <AudienceSwitch isAcademy={isAcademy} />

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CtaButton isAcademy={isAcademy} ctaBtnRef={ctaBtnRef} onScrollToAnchor={scrollToAnchor} />

          <button
            ref={toggleBtnRef}
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open navigation menu'}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Drawer */}
      {menuOpen && typeof document !== 'undefined' && createPortal(
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div
            ref={drawerRef}
            id="mobile-navigation"
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="mobile-drawer-header">
                <Link
                  to="/"
                  className="brand-title"
                  onClick={(e) => {
                    handleCloseDrawer();
                    if (isAcademy) {
                      e.preventDefault();
                      transitionTo('/');
                    }
                  }}
                  aria-label="Hair City Home"
                >
                  <span>Hair City</span>
                  <span className="brand-subtitle">Salon &amp; Academy · Akola</span>
                </Link>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="mobile-nav-toggle mobile-drawer-close"
                  onClick={handleCloseDrawer}
                  aria-label="Close menu"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Segmented control switch in drawer */}
              <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                <AudienceSwitch isAcademy={isAcademy} inDrawer onClose={handleCloseDrawer} />
              </div>

              <nav className="mobile-drawer-nav" aria-label="Mobile main navigation">
                {!isAcademy ? (
                  <>
                    <a href="#services" className="mobile-drawer-link" onClick={(e) => scrollToAnchor('#services', e)}>Services</a>
                    <a href="#work" className="mobile-drawer-link" onClick={(e) => scrollToAnchor('#work', e)}>Work</a>
                    <a href="#visit" className="mobile-drawer-link" onClick={(e) => scrollToAnchor('#visit', e)}>Visit</a>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="mobile-drawer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCloseDrawer();
                        transitionTo('/');
                      }}
                    >
                      Salon home
                    </Link>
                    <a
                      href={siteData.links.directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-drawer-link"
                      onClick={() => {
                        track.directionsClick('header_drawer');
                        handleCloseDrawer();
                      }}
                    >
                      Directions
                    </a>
                  </>
                )}
              </nav>
            </div>

            <div className="mobile-drawer-footer">
              <div style={{ marginBottom: '0.75rem' }}>
                <OpenStatus />
              </div>
              <p style={{ fontSize: '0.8125rem', marginBottom: '1rem', color: 'var(--color-muted)' }}>
                {siteData.hours.days}: {siteData.hours.time}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={`tel:${siteData.phoneRaw}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => track.callClick('header_drawer')}
                >
                  Call {siteData.phone}
                </a>
                <a
                  href={isAcademy ? siteData.links.whatsappAcademy : siteData.links.whatsappGeneral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    if (isAcademy) {
                      track.academyEnquirySubmit({ location: 'header_drawer' });
                    } else {
                      track.whatsappClick('header_drawer');
                    }
                  }}
                >
                  {isAcademy ? 'Enquire about Academy' : 'Enquire on WhatsApp'}
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
