/**
 * Timezone utilities for converting between Brasília (GMT-3) and UTC
 * Used for Google Calendar synchronization
 */

const BRASILIA_TIMEZONE = 'America/Sao_Paulo';
const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000; // GMT-3 in milliseconds

/**
 * Convert a local Brasília time to UTC ISO string for Google Calendar
 * @param year Year (YYYY)
 * @param month Month (1-12)
 * @param day Day (1-31)
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @returns ISO string in UTC format
 */
export function brasiliaTimetToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  // Create date in Brasília timezone
  // We need to account for the fact that JavaScript Date is always in the browser's local timezone
  // So we create a UTC date and then adjust it
  
  // Create the date as if it were in UTC first
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  
  // Adjust for Brasília timezone offset (GMT-3)
  // If the time is 09:00 in Brasília, we need to add 3 hours to get UTC time (12:00 UTC)
  const utcAdjusted = new Date(utcDate.getTime() - BRASILIA_OFFSET_MS);
  
  return utcAdjusted.toISOString();
}

/**
 * Convert UTC ISO string from Google Calendar to Brasília local time
 * @param isoString ISO string in UTC format from Google Calendar
 * @returns Object with year, month, day, hour, minute in Brasília timezone
 */
export function utcToBrasiliaTime(isoString: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const utcDate = new Date(isoString);
  
  // Adjust for Brasília timezone offset (GMT-3)
  // If UTC time is 12:00, Brasília time is 09:00 (subtract 3 hours)
  const brasiliDate = new Date(utcDate.getTime() + BRASILIA_OFFSET_MS);
  
  return {
    year: brasiliDate.getUTCFullYear(),
    month: brasiliDate.getUTCMonth() + 1,
    day: brasiliDate.getUTCDate(),
    hour: brasiliDate.getUTCHours(),
    minute: brasiliDate.getUTCMinutes(),
  };
}

/**
 * Format time as HH:mm string
 */
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Format date as YYYY-MM-DD string
 */
export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
