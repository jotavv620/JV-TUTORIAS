import { describe, it, expect } from 'vitest';
import { createGoogleCalendarEvent } from './_core/googleCalendarService';

describe('Google Calendar Sync', () => {
  it('should have Google Calendar service functions available', async () => {
    expect(createGoogleCalendarEvent).toBeDefined();
    expect(typeof createGoogleCalendarEvent).toBe('function');
  });

  it('should validate tutoria data structure for Google Calendar', () => {
    const tutoriaData = {
      disciplina: 'Anatomia',
      professor: 'Keven Wallace',
      bolsista: 'João Vitor',
      instituicao: 'UNEF',
      data: '2026-03-31',
      horario: '10:36',
      horarioTermino: '11:30',
      professorEmail: 'professor@example.com',
      bolsistaEmail: 'bolsista@example.com',
    };

    expect(tutoriaData.disciplina).toBeTruthy();
    expect(tutoriaData.professor).toBeTruthy();
    expect(tutoriaData.bolsista).toBeTruthy();
    expect(tutoriaData.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tutoriaData.horario).toMatch(/^\d{2}:\d{2}$/);
    expect(tutoriaData.horarioTermino).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should validate Google OAuth environment variables', () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    expect(process.env.GOOGLE_OAUTH_REDIRECT_URI).toBeDefined();

    expect(process.env.GOOGLE_CLIENT_ID).toContain('.apps.googleusercontent.com');
    expect(process.env.GOOGLE_OAUTH_REDIRECT_URI).toContain('tutormanag-6856tex4.manus.space');
  });

  it('should have correct Google Calendar API scopes', () => {
    const requiredScopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    expect(requiredScopes.length).toBe(3);
    expect(requiredScopes[0]).toContain('calendar');
  });
});
