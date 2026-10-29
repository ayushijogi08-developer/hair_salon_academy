import React, { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PageTransitionContext } from '../lib/pageTransitionContext';

export const PageTransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const curtainRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isAnimatingRef = useRef(false);

  const transitionTo = useCallback(
    (targetPath) => {
      // If already on the exact path or animation is in progress, no-op
      if (location.pathname === targetPath || isAnimatingRef.current) {
        return;
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Destination theme color: Academy is neutral charcoal; Salon is ivory
      const isDestAcademy = targetPath === '/academy';
      const destBg = isDestAcademy ? '#0B0C0E' : '#FAF8F5';
      const destAccent = isDestAcademy ? 'rgba(217, 183, 126, 0.4)' : 'rgba(20, 18, 17, 0.2)';

      if (prefersReducedMotion || !curtainRef.current) {
        // Instant switch with zero curtain wipe for reduced motion users
        navigate(targetPath);
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.lenis?.scrollTo(0, { immediate: true });
        ScrollTrigger.getAll().forEach((st) => st.kill());
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
      }

      isAnimatingRef.current = true;
      setIsTransitioning(true);

      const curtain = curtainRef.current;
      curtain.style.backgroundColor = destBg;
      curtain.style.borderRight = `1px solid ${destAccent}`;
      curtain.style.borderLeft = `1px solid ${destAccent}`;
      curtain.style.pointerEvents = 'all';

      // Reset to off-screen left and make visible
      gsap.set(curtain, { x: '-100%', visibility: 'visible' });

      // 600ms total full-screen curtain wipe
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          setIsTransitioning(false);
          curtain.style.pointerEvents = 'none';
          gsap.set(curtain, { x: '-100%', visibility: 'hidden' });
          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
      });

      // 1. Sweep in from left to cover screen (280ms)
      tl.to(curtain, {
        x: '0%',
        duration: 0.28,
        ease: 'power3.inOut',
        onComplete: () => {
          // Route changes cleanly behind the curtain
          navigate(targetPath);
          window.scrollTo({ top: 0, behavior: 'instant' });
          window.lenis?.scrollTo(0, { immediate: true });
          ScrollTrigger.getAll().forEach((st) => st.kill());
          ScrollTrigger.refresh();
        },
      });

      // 2. Micro-hold (40ms) to ensure new route tree mounts
      tl.to({}, { duration: 0.04 });

      // 3. Sweep away off to the right, unveiling new page (280ms)
      tl.to(curtain, {
        x: '100%',
        duration: 0.28,
        ease: 'power3.inOut',
      });
    },
    [location.pathname, navigate]
  );

  return (
    <PageTransitionContext.Provider value={{ transitionTo, isTransitioning }}>
      {children}
      <div
        ref={curtainRef}
        className="page-curtain-overlay"
        aria-hidden="true"
      />
    </PageTransitionContext.Provider>
  );
};

export default PageTransitionProvider;
