/**
 * Privacy-friendly event tracking utility (no cookies, zero external dependencies).
 * Safely dispatches events to window.plausible or window.gtag if present,
 * otherwise silently does nothing.
 */

export function trackEvent(eventName, props = {}) {
  try {
    if (typeof window === 'undefined') return;

    // 1. Plausible Analytics (plausible.io)
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props });
    }

    // 2. Google Analytics 4 (gtag.js)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, props);
    }
  } catch {
    // Fail silently so tracking never interferes with user actions
  }
}

/** Pre-configured typed event triggers */
export const track = {
  whatsappClick: (location) => trackEvent('whatsapp_click', { location }),
  callClick: (location) => trackEvent('call_click', { location }),
  bookingSubmit: (details = {}) => trackEvent('booking_submit', details),
  academyEnquirySubmit: (details = {}) => trackEvent('academy_enquiry_submit', details),
  directionsClick: (location) => trackEvent('directions_click', { location }),
};

export default track;
