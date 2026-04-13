import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Feedback History Feature', () => {
  describe('getAllFeedbacksWithFilters', () => {
    it('should return feedbacks with pagination', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('feedbacks');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(Array.isArray(result.feedbacks)).toBe(true);
    });

    it('should filter feedbacks by professor', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        professor: 'Keven Wallace',
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('feedbacks');
      if (result.feedbacks.length > 0) {
        result.feedbacks.forEach((f: any) => {
          expect(f.professor).toBe('Keven Wallace');
        });
      }
    });

    it('should filter feedbacks by disciplina', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        disciplina: 'Anatomia',
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('feedbacks');
      if (result.feedbacks.length > 0) {
        result.feedbacks.forEach((f: any) => {
          expect(f.disciplina).toBe('Anatomia');
        });
      }
    });

    it('should filter feedbacks by minimum rating', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        minRating: 4,
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('feedbacks');
      if (result.feedbacks.length > 0) {
        result.feedbacks.forEach((f: any) => {
          const avg = (f.pontualidade + f.audio + f.conteudo) / 3;
          expect(avg).toBeGreaterThanOrEqual(4);
        });
      }
    });

    it('should handle date range filtering', async () => {
      const startDate = '2026-04-01';
      const endDate = '2026-04-30';

      const result = await db.getAllFeedbacksWithFilters({
        startDate,
        endDate,
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('feedbacks');
      if (result.feedbacks.length > 0) {
        result.feedbacks.forEach((f: any) => {
          const feedbackDate = new Date(f.data);
          const start = new Date(startDate);
          const end = new Date(endDate);
          expect(feedbackDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
          expect(feedbackDate.getTime()).toBeLessThanOrEqual(end.getTime());
        });
      }
    });
  });

  describe('getFeedbackStatistics', () => {
    it('should return feedback statistics', async () => {
      const stats = await db.getFeedbackStatistics();

      expect(stats).toHaveProperty('totalFeedbacks');
      expect(stats).toHaveProperty('averagePontualidade');
      expect(stats).toHaveProperty('averageAudio');
      expect(stats).toHaveProperty('averageConteudo');
      expect(stats).toHaveProperty('averageOverall');
      expect(stats).toHaveProperty('topProfessors');
      expect(Array.isArray(stats.topProfessors)).toBe(true);
    });

    it('should have valid average ratings', async () => {
      const stats = await db.getFeedbackStatistics();

      const pontualidade = parseFloat(stats.averagePontualidade);
      const audio = parseFloat(stats.averageAudio);
      const conteudo = parseFloat(stats.averageConteudo);
      const overall = parseFloat(stats.averageOverall);

      expect(pontualidade).toBeGreaterThanOrEqual(0);
      expect(pontualidade).toBeLessThanOrEqual(5);
      expect(audio).toBeGreaterThanOrEqual(0);
      expect(audio).toBeLessThanOrEqual(5);
      expect(conteudo).toBeGreaterThanOrEqual(0);
      expect(conteudo).toBeLessThanOrEqual(5);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(5);
    });

    it('should have valid top professors data', async () => {
      const stats = await db.getFeedbackStatistics();

      if (stats.topProfessors.length > 0) {
        stats.topProfessors.forEach((prof: any) => {
          expect(prof).toHaveProperty('professor');
          expect(prof).toHaveProperty('feedbackCount');
          expect(prof).toHaveProperty('averageRating');
          expect(prof.feedbackCount).toBeGreaterThan(0);
          const rating = parseFloat(prof.averageRating);
          expect(rating).toBeGreaterThanOrEqual(0);
          expect(rating).toBeLessThanOrEqual(5);
        });
      }
    });
  });

  describe('Feedback data structure', () => {
    it('should have correct feedback fields', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        page: 1,
        limit: 1,
      });

      if (result.feedbacks.length > 0) {
        const feedback = result.feedbacks[0];
        expect(feedback).toHaveProperty('id');
        expect(feedback).toHaveProperty('tutoriaId');
        expect(feedback).toHaveProperty('pontualidade');
        expect(feedback).toHaveProperty('audio');
        expect(feedback).toHaveProperty('conteudo');
        expect(feedback).toHaveProperty('comentarios');
        expect(feedback).toHaveProperty('createdAt');
        expect(feedback).toHaveProperty('professor');
        expect(feedback).toHaveProperty('disciplina');
        expect(feedback).toHaveProperty('bolsista');
      }
    });

    it('should have valid rating values', async () => {
      const result = await db.getAllFeedbacksWithFilters({
        page: 1,
        limit: 1,
      });

      if (result.feedbacks.length > 0) {
        const feedback = result.feedbacks[0];
        expect(feedback.pontualidade).toBeGreaterThanOrEqual(1);
        expect(feedback.pontualidade).toBeLessThanOrEqual(5);
        expect(feedback.audio).toBeGreaterThanOrEqual(1);
        expect(feedback.audio).toBeLessThanOrEqual(5);
        expect(feedback.conteudo).toBeGreaterThanOrEqual(1);
        expect(feedback.conteudo).toBeLessThanOrEqual(5);
      }
    });
  });
});
