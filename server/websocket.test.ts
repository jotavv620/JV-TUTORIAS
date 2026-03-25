import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  broadcastTutoriaUpdate,
  broadcastConfigUpdate,
  broadcastFeedbackUpdate,
  broadcastCheckinUpdate,
} from './_core/websocket';

describe('WebSocket Broadcasting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tutoria broadcasts', () => {
    it('should broadcast tutoria created event', () => {
      const mockData = { id: 1, disciplina: 'Matemática', professor: 'Dr. Silva' };
      expect(() => {
        broadcastTutoriaUpdate('created', mockData);
      }).not.toThrow();
    });

    it('should broadcast tutoria updated event', () => {
      const mockData = { id: 1, status: 'in_progress' };
      expect(() => {
        broadcastTutoriaUpdate('updated', mockData);
      }).not.toThrow();
    });

    it('should broadcast tutoria deleted event', () => {
      const mockData = { id: 1 };
      expect(() => {
        broadcastTutoriaUpdate('deleted', mockData);
      }).not.toThrow();
    });
  });

  describe('Config broadcasts', () => {
    it('should broadcast config update event', () => {
      const mockData = { type: 'disciplina', action: 'created', data: { id: 1, nome: 'Física' } };
      expect(() => {
        broadcastConfigUpdate(mockData);
      }).not.toThrow();
    });

    it('should broadcast professor update event', () => {
      const mockData = { type: 'professor', action: 'created', data: { id: 1, nome: 'Prof. João' } };
      expect(() => {
        broadcastConfigUpdate(mockData);
      }).not.toThrow();
    });

    it('should broadcast instituicao update event', () => {
      const mockData = { type: 'instituicao', action: 'deleted', id: 1 };
      expect(() => {
        broadcastConfigUpdate(mockData);
      }).not.toThrow();
    });
  });

  describe('Feedback broadcasts', () => {
    it('should broadcast feedback created event', () => {
      const mockData = { id: 1, tutoriaId: 1, conteudo: 5 };
      expect(() => {
        broadcastFeedbackUpdate('created', mockData);
      }).not.toThrow();
    });
  });

  describe('Check-in broadcasts', () => {
    it('should broadcast checkin created event', () => {
      const mockData = { id: 1, tutoriaId: 1, timestamp: new Date().toISOString() };
      expect(() => {
        broadcastCheckinUpdate('created', mockData);
      }).not.toThrow();
    });
  });
});
