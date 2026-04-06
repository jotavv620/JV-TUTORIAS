/**
 * Timezone utilities for converting between Brasília (GMT-3) and UTC
 * Used for Google Calendar synchronization
 */

const BRASILIA_TIMEZONE = 'America/Sao_Paulo';
const BRASILIA_OFFSET_HOURS = 3; // GMT-3, so UTC is +3 hours ahead

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
  // Create the date as if it were in UTC first
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  
  // Brasília is GMT-3, meaning it's 3 hours BEHIND UTC
  // So to convert FROM Brasília TO UTC, we ADD 3 hours
  // Example: 09:00 Brasília = 12:00 UTC
  const utcAdjusted = new Date(utcDate.getTime() + BRASILIA_OFFSET_HOURS * 60 * 60 * 1000);
  
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
  
  // Brasília is GMT-3, meaning it's 3 hours BEHIND UTC
  // So to convert FROM UTC TO Brasília, we SUBTRACT 3 hours
  // Example: 12:00 UTC = 09:00 Brasília
  const brasiliDate = new Date(utcDate.getTime() - BRASILIA_OFFSET_HOURS * 60 * 60 * 1000);
  
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
