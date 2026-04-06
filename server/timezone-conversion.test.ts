import { describe, it, expect } from 'vitest';
import { brasiliaTimetToUTC, utcToBrasiliaTime, formatTime, formatDate } from './_core/timezoneUtils';

describe('Timezone Conversion Tests', () => {
  describe('brasiliaTimetToUTC', () => {
    it('should convert 09:00 Brasília time to 12:00 UTC', () => {
      // 09:00 in Brasília (GMT-3) = 12:00 UTC
      const result = brasiliaTimetToUTC(2026, 4, 6, 9, 0);
      expect(result).toContain('2026-04-06T12:00:00');
    });

    it('should convert 11:00 Brasília time to 14:00 UTC', () => {
      // 11:00 in Brasília (GMT-3) = 14:00 UTC
      const result = brasiliaTimetToUTC(2026, 4, 6, 11, 0);
      expect(result).toContain('2026-04-06T14:00:00');
    });

    it('should handle midnight correctly', () => {
      // 00:00 in Brasília (GMT-3) = 03:00 UTC
      const result = brasiliaTimetToUTC(2026, 4, 6, 0, 0);
      expect(result).toContain('2026-04-06T03:00:00');
    });

    it('should handle end of day correctly', () => {
      // 23:00 in Brasília (GMT-3) = 02:00 UTC (next day)
      const result = brasiliaTimetToUTC(2026, 4, 6, 23, 0);
      expect(result).toContain('2026-04-07T02:00:00');
    });

    it('should handle minutes correctly', () => {
      // 09:30 in Brasília (GMT-3) = 12:30 UTC
      const result = brasiliaTimetToUTC(2026, 4, 6, 9, 30);
      expect(result).toContain('2026-04-06T12:30:00');
    });
  });

  describe('utcToBrasiliaTime', () => {
    it('should convert 12:00 UTC to 09:00 Brasília time', () => {
      const result = utcToBrasiliaTime('2026-04-06T12:00:00Z');
      expect(result).toEqual({
        year: 2026,
        month: 4,
        day: 6,
        hour: 9,
        minute: 0,
      });
    });

    it('should convert 14:00 UTC to 11:00 Brasília time', () => {
      const result = utcToBrasiliaTime('2026-04-06T14:00:00Z');
      expect(result).toEqual({
        year: 2026,
        month: 4,
        day: 6,
        hour: 11,
        minute: 0,
      });
    });

    it('should handle UTC midnight correctly', () => {
      const result = utcToBrasiliaTime('2026-04-06T03:00:00Z');
      expect(result).toEqual({
        year: 2026,
        month: 4,
        day: 6,
        hour: 0,
        minute: 0,
      });
    });

    it('should handle day boundary correctly', () => {
      // 02:00 UTC = 23:00 previous day in Brasília
      const result = utcToBrasiliaTime('2026-04-07T02:00:00Z');
      expect(result).toEqual({
        year: 2026,
        month: 4,
        day: 6,
        hour: 23,
        minute: 0,
      });
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert Brasília -> UTC -> Brasília correctly', () => {
      // Start with Brasília time: 09:00
      const brasiliaBefore = { year: 2026, month: 4, day: 6, hour: 9, minute: 0 };
      
      // Convert to UTC
      const utcString = brasiliaTimetToUTC(
        brasiliaBefore.year,
        brasiliaBefore.month,
        brasiliaBefore.day,
        brasiliaBefore.hour,
        brasiliaBefore.minute
      );
      
      // Convert back to Brasília
      const brasiliaAfter = utcToBrasiliaTime(utcString);
      
      expect(brasiliaAfter).toEqual(brasiliaBefore);
    });

    it('should handle tutoria example: 09:00-11:00 Brasília', () => {
      // Tutoria: 09:00 - 11:00 Brasília time
      const startBrasilia = brasiliaTimetToUTC(2026, 4, 6, 9, 0);
      const endBrasilia = brasiliaTimetToUTC(2026, 4, 6, 11, 0);
      
      // Should be 12:00 - 14:00 UTC
      expect(startBrasilia).toContain('2026-04-06T12:00:00');
      expect(endBrasilia).toContain('2026-04-06T14:00:00');
      
      // Convert back
      const startBack = utcToBrasiliaTime(startBrasilia);
      const endBack = utcToBrasiliaTime(endBrasilia);
      
      expect(startBack.hour).toBe(9);
      expect(startBack.minute).toBe(0);
      expect(endBack.hour).toBe(11);
      expect(endBack.minute).toBe(0);
    });
  });

  describe('formatTime and formatDate', () => {
    it('should format time correctly', () => {
      expect(formatTime(9, 0)).toBe('09:00');
      expect(formatTime(14, 30)).toBe('14:30');
      expect(formatTime(23, 59)).toBe('23:59');
    });

    it('should format date correctly', () => {
      expect(formatDate(2026, 4, 6)).toBe('2026-04-06');
      expect(formatDate(2026, 1, 1)).toBe('2026-01-01');
      expect(formatDate(2026, 12, 31)).toBe('2026-12-31');
    });
  });
});
