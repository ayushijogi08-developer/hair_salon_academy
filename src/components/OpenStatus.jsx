import React, { useState, useEffect } from 'react';
import { getBusinessStatus } from '../lib/hours';

/**
 * OpenStatus
 * Live badge showing salon open/closed status in Asia/Kolkata timezone.
 * Refreshes every 60 seconds. Honours siteData.hours.closedDates.
 * Uses aria-live="polite" and text to convey state.
 */
export const OpenStatus = ({ className = '', dark = false }) => {
  const [status, setStatus] = useState(() => getBusinessStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getBusinessStatus());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={`status-badge ${dark ? 'status-badge--dark' : ''} ${className}`.trim()}
      data-open={status.isOpen}
      aria-live="polite"
      role="status"
    >
      <span className="status-dot" aria-hidden="true" />
      <span>{status.badgeText}</span>
    </span>
  );
};

export default OpenStatus;
