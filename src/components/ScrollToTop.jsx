import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * On every route change:
 * 1. Kill all ScrollTriggers from the previous page (prevents pin leaks).
 * 2. Scroll to hash target if present, otherwise to the top.
 * 3. Call ScrollTrigger.refresh() so the new page triggers recalculate.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Kill all active ScrollTriggers from the previous page
    ScrollTrigger.getAll().forEach((st) => st.kill());

    if (hash) {
      // Give the new page a frame to render before trying to find the element
      const frame = requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) {
          const offset = el.getBoundingClientRect().top + window.scrollY - 72;
          if (window.lenis) {
            window.lenis.scrollTo(el, { offset: -72, duration: 0 });
          } else {
            window.scrollTo({ top: offset, behavior: 'instant' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
          if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
        }
        // Refresh after the scroll settles
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      return () => cancelAnimationFrame(frame);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [pathname, hash]);

  return null;
};
