import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export const AcademyLightbox = ({ activePhoto, photos, onClose, onSelectPhoto }) => {
  const lightboxRef = useRef(null);
  const closeBtnRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const currentIndex = photos.findIndex((p) => p.id === activePhoto.id);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx]);
  }, [photos, currentIndex, onSelectPhoto]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIdx]);
  }, [photos, currentIndex, onSelectPhoto]);

  // Lock page scroll and stop Lenis while open
  useEffect(() => {
    window.lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Keyboard navigation & focus trap
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 40);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === 'Tab' && lightboxRef.current) {
        const focusables = lightboxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

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
    };
  }, [onClose, handleNext, handlePrev]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Horizontal swipe threshold: > 45px and more horizontal than vertical within 450ms
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 450) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return createPortal(
    <div
      className="acad-lightbox-backdrop"
      ref={lightboxRef}
      role="dialog"
      aria-modal="true"
      aria-label="Academy photo lightbox"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="acad-lightbox-modal">
        {/* Top Header Row */}
        <div className="acad-lightbox-topbar">
          <div className="acad-lightbox-counter">
            <span className="acad-counter-current">{currentIndex + 1}</span>
            <span className="acad-counter-sep">/</span>
            <span className="acad-counter-total">{photos.length}</span>
            {activePhoto.isSample && (
              <span className="acad-sample-pill">SAMPLE</span>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="acad-lightbox-close-btn"
            onClick={onClose}
            aria-label="Close lightbox (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Center Image Container */}
        <div className="acad-lightbox-stage">
          {photos.length > 1 && (
            <button
              type="button"
              className="acad-lightbox-nav-btn acad-nav-prev"
              onClick={handlePrev}
              aria-label="Previous photo (ArrowLeft)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="acad-lightbox-frame">
            <img
              src={activePhoto.src}
              alt={activePhoto.alt || 'Hair City Academy Photo'}
              className="acad-lightbox-img"
            />
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              className="acad-lightbox-nav-btn acad-nav-next"
              onClick={handleNext}
              aria-label="Next photo (ArrowRight)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Bottom Caption */}
        {activePhoto.alt && (
          <div className="acad-lightbox-caption">
            <p className="acad-caption-text">{activePhoto.alt}</p>
          </div>
        )}
      </div>

      <style>{`
        .acad-lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(14, 13, 12, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: acadLbFade 0.25s ease-out;
        }

        @keyframes acadLbFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .acad-lightbox-modal {
          position: relative;
          width: 100%;
          max-width: 1100px;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
        }

        .acad-lightbox-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
        }

        .acad-lightbox-counter {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--acad-champagne, #E5D3B3);
        }

        .acad-sample-pill {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: #B34040;
          color: #FAF8F5;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          margin-left: 0.65rem;
        }

        .acad-lightbox-close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(229, 211, 179, 0.2);
          color: #FAF8F5;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .acad-lightbox-close-btn:hover {
          background: rgba(229, 211, 179, 0.2);
          transform: scale(1.05);
        }

        .acad-lightbox-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-height: 75vh;
        }

        .acad-lightbox-frame {
          position: relative;
          max-width: 100%;
          max-height: 75vh;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(229, 211, 179, 0.18);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
        }

        .acad-lightbox-img {
          max-width: 100%;
          max-height: 75vh;
          object-fit: contain;
          display: block;
        }

        .acad-lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(20, 18, 17, 0.75);
          border: 1px solid rgba(229, 211, 179, 0.25);
          color: #FAF8F5;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .acad-nav-prev {
          left: 1rem;
        }

        .acad-nav-next {
          right: 1rem;
        }

        .acad-lightbox-nav-btn:hover {
          background: rgba(229, 211, 179, 0.25);
          transform: translateY(-50%) scale(1.08);
        }

        .acad-lightbox-caption {
          padding-top: 1rem;
          text-align: center;
        }

        .acad-caption-text {
          font-size: 0.95rem;
          color: #A8A099;
          font-family: var(--font-sans);
        }

        @media (max-width: 767px) {
          .acad-lightbox-nav-btn {
            display: none;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default AcademyLightbox;
