import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

const calendar = google.calendar('v3');

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName: string;
  }>;
}

/**
 * Create a Google Calendar event for a tutoria
 * @param auth OAuth2Client with valid credentials
 * @param tutoriaData Data about the tutoria to create event for
 * @returns Event ID from Google Calendar
 */
export async function createGoogleCalendarEvent(
  auth: OAuth2Client,
  tutoriaData: {
    disciplina: string;
    professor: string;
    bolsista: string;
    instituicao: string;
    data: string; // YYYY-MM-DD
    horario: string; // HH:mm
    horarioTermino: string; // HH:mm
    professorEmail?: string;
    bolsistaEmail?: string;
  }
): Promise<string | null> {
  try {
    // Parse date and time
    const [year, month, day] = tutoriaData.data.split('-').map(Number);
    const [startHour, startMin] = tutoriaData.horario.split(':').map(Number);
    const [endHour, endMin] = tutoriaData.horarioTermino.split(':').map(Number);

    // Create ISO datetime strings (assuming UTC-3 timezone for Brazil)
    const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
    const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);

    const event: CalendarEvent = {
      summary: `Tutoria - ${tutoriaData.disciplina}`,
      description: `
Disciplina: ${tutoriaData.disciplina}
Professor: ${tutoriaData.professor}
Bolsista: ${tutoriaData.bolsista}
Local: ${tutoriaData.instituicao}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [],
    };

    // Add attendees if emails are provided
    if (tutoriaData.professorEmail) {
      event.attendees!.push({
        email: tutoriaData.professorEmail,
        displayName: tutoriaData.professor,
      });
    }

    if (tutoriaData.bolsistaEmail) {
      event.attendees!.push({
        email: tutoriaData.bolsistaEmail,
        displayName: tutoriaData.bolsista,
      });
    }

    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('[Google Calendar] Event created:', response.data.id);
    return response.data.id || null;
  } catch (error: any) {
    console.error('[Google Calendar] Failed to create event:', error.message);
    return null;
  }
}

/**
 * Update an existing Google Calendar event
 * @param auth OAuth2Client with valid credentials
 * @param eventId Event ID to update
 * @param tutoriaData Updated tutoria data
 * @returns true if successful, false otherwise
 */
export async function updateGoogleCalendarEvent(
  auth: OAuth2Client,
  eventId: string,
  tutoriaData: {
    disciplina: string;
    professor: string;
    bolsista: string;
    instituicao: string;
    data: string;
    horario: string;
    horarioTermino: string;
    professorEmail?: string;
    bolsistaEmail?: string;
  }
): Promise<boolean> {
  try {
    const [year, month, day] = tutoriaData.data.split('-').map(Number);
    const [startHour, startMin] = tutoriaData.horario.split(':').map(Number);
    const [endHour, endMin] = tutoriaData.horarioTermino.split(':').map(Number);

    const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
    const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);

    const event: CalendarEvent = {
      summary: `Tutoria - ${tutoriaData.disciplina}`,
      description: `
Disciplina: ${tutoriaData.disciplina}
Professor: ${tutoriaData.professor}
Bolsista: ${tutoriaData.bolsista}
Local: ${tutoriaData.instituicao}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [],
    };

    if (tutoriaData.professorEmail) {
      event.attendees!.push({
        email: tutoriaData.professorEmail,
        displayName: tutoriaData.professor,
      });
    }

    if (tutoriaData.bolsistaEmail) {
      event.attendees!.push({
        email: tutoriaData.bolsistaEmail,
        displayName: tutoriaData.bolsista,
      });
    }

    await calendar.events.update({
      auth,
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });

    console.log('[Google Calendar] Event updated:', eventId);
    return true;
  } catch (error: any) {
    console.error('[Google Calendar] Failed to update event:', error.message);
    return false;
  }
}

/**
 * Delete a Google Calendar event
 * @param auth OAuth2Client with valid credentials
 * @param eventId Event ID to delete
 * @returns true if successful, false otherwise
 */
export async function deleteGoogleCalendarEvent(
  auth: OAuth2Client,
  eventId: string
): Promise<boolean> {
  try {
    await calendar.events.delete({
      auth,
      calendarId: 'primary',
      eventId,
    });

    console.log('[Google Calendar] Event deleted:', eventId);
    return true;
  } catch (error: any) {
    console.error('[Google Calendar] Failed to delete event:', error.message);
    return false;
  }
}

/**
 * Get Google OAuth2 client from user's stored credentials
 * This is a placeholder - in production, you would retrieve stored tokens from database
 * @param userEmail User's email
 * @returns OAuth2Client or null if credentials not available
 */
export async function getGoogleAuthClient(userEmail: string): Promise<OAuth2Client | null> {
  try {
    // This is a placeholder implementation
    // In production, you would:
    // 1. Retrieve stored refresh token from database for this user
    // 2. Create OAuth2Client and set credentials
    // 3. Return the authenticated client

    console.log('[Google Calendar] Would retrieve credentials for:', userEmail);
    return null; // Placeholder
  } catch (error: any) {
    console.error('[Google Calendar] Failed to get auth client:', error.message);
    return null;
  }
}
