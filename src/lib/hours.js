/**
 * Salon opening hours helper in Asia/Kolkata timezone
 * Computes business open/closed status from siteData.hours
 */
import { siteData } from '../data/site';

function parseTimeString(str) {
  if (!str) return null;
  const match = str.trim().match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
    formatted: `${match[1]}:${(match[2] || '00').padStart(2, '0')} ${meridiem}`
  };
}

export function getBusinessStatus(hoursConfig = siteData?.hours) {
  try {
    const now = new Date();

    const timeStr = hoursConfig?.time || '9:00 AM – 10:00 PM';
    const [openRaw, closeRaw] = timeStr.split(/[–—-]/);

    const openParsed = parseTimeString(openRaw) || { totalMinutes: 9 * 60, formatted: '9:00 AM' };
    const closeParsed = parseTimeString(closeRaw) || { totalMinutes: 22 * 60, formatted: '10:00 PM' };

    // Manual closure days (festivals etc.) in Asia/Kolkata
    const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    if (hoursConfig?.closedDates?.includes(todayIST)) {
      return { isOpen: false, badgeText: `Closed · opens ${openParsed.formatted}` };
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value;
    const minutePart = parts.find((p) => p.type === 'minute')?.value;

    const currentHours = parseInt(hourPart || '0', 10);
    const currentMinutes = parseInt(minutePart || '0', 10);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const isOpen = currentTotalMinutes >= openParsed.totalMinutes && currentTotalMinutes < closeParsed.totalMinutes;

    return {
      isOpen,
      badgeText: isOpen ? `Open now · closes ${closeParsed.formatted}` : `Closed · opens ${openParsed.formatted}`
    };
  } catch {
    return {
      isOpen: true,
      badgeText: 'Open now · closes 10:00 PM'
    };
  }
}
