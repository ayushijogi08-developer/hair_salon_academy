import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { whatsappFor } from '../data/site';
import { track } from '../lib/track';

export const WorkLightbox = ({ activePhoto, photos, onClose, onSelectPhoto }) => {
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

  // Lock page scroll (Lenis + native) while open
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

  // Preload neighbouring images
  useEffect(() => {
    if (photos.length <= 1 || currentIndex === -1) return;

    const nextIdx = (currentIndex + 1) % photos.length;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;

    if (photos[nextIdx]?.src) {
      const nextImg = new Image();
      nextImg.src = photos[nextIdx].src;
    }
    if (photos[prevIdx]?.src) {
      const prevImg = new Image();
      prevImg.src = photos[prevIdx].src;
    }
  }, [currentIndex, photos]);

  // Touch swipe gesture handlers
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const duration = Date.now() - touchStartRef.current.time;

    // Swipe down to close (> 60px and predominantly vertical)
    if (dy > 60 && absY > absX * 1.3 && duration < 500) {
      onClose();
      return;
    }

    // Horizontal swipe (> 40px)
    if (absX > 40 && absX > absY && duration < 600) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activePhoto.title || activePhoto.alt}
    >
      <div
        ref={lightboxRef}
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Bar with Category, Counter & Close */}
        <div className="lightbox-top-bar">
          <div className="lightbox-top-meta">
            <span className="work-category-badge">{activePhoto.categoryLabel}</span>
            <span className="lightbox-counter" aria-live="polite">
              {(currentIndex === -1 ? 0 : currentIndex) + 1} / {photos.length}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="lightbox-close"
            onClick={onClose}
            aria-label="Close image viewer (Escape)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stage: Previous / Image / Next */}
        <div className="lightbox-stage">
          <button
            type="button"
            className="lightbox-nav-btn lightbox-nav-prev"
            onClick={handlePrev}
            aria-label="Previous image (Left arrow)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="lightbox-img-wrapper">
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              width="800"
              height="1000"
              decoding="async"
              className="lightbox-img"
              draggable={false}
            />
          </div>

          <button
            type="button"
            className="lightbox-nav-btn lightbox-nav-next"
            onClick={handleNext}
            aria-label="Next image (Right arrow)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Footer with Title, Description, WhatsApp CTA and Shortcuts */}
        <div className="lightbox-footer">
          <div className="lightbox-info-pane">
            <h3 className="lightbox-photo-title">{activePhoto.title}</h3>
            <p className="lightbox-photo-desc">
              {activePhoto.description || activePhoto.alt}
            </p>
          </div>

          <div className="lightbox-actions-pane">
            <a
              href={whatsappFor(`this look: ${activePhoto.title}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary lightbox-action-btn"
              aria-label={`Ask about ${activePhoto.title} on WhatsApp`}
              onClick={() => track.whatsappClick('work_lightbox')}
            >
              <span>Ask about this look</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <span className="lightbox-nav-shortcut">
              ← / → arrows · Esc to close · Swipe on mobile
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkLightbox;
