import { createContext, useContext } from 'react';

export const PageTransitionContext = createContext({
  transitionTo: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);
