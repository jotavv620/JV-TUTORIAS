import { describe, it, expect } from 'vitest';
import {
  createProfessorReminderTemplate,
  createBolsistaReminderTemplate,
  type ReminderEmailData,
} from './_core/reminderService';

describe('Multiple Reminder Intervals', () => {
  const mockReminderData: ReminderEmailData = {
    disciplina: 'Cálculo I',
    professor: 'Prof. João Silva',
    tutor: 'Maria Santos',
    data: '2026-04-02',
    horario: '14:00',
    horarioTermino: '15:30',
    instituicao: 'UNEF - Campus A',
  };

  describe('24h Reminder Templates', () => {
    it('should create 24h professor reminder with correct message', () => {
      const template = createProfessorReminderTemplate(mockReminderData, '24h');
      
      expect(template).toContain('Lembrete: Tutoria Amanhã');
      expect(template).toContain('amanhã');
      expect(template).toContain('Prof. João Silva');
    });

    it('should create 24h bolsista reminder with checklist', () => {
      const template = createBolsistaReminderTemplate(mockReminderData, '24h');
      
      expect(template).toContain('Lembrete: Tutoria Amanhã');
      expect(template).toContain('Checklist');
      expect(template).toContain('material');
    });
  });

  describe('12h Reminder Templates', () => {
    it('should create 12h professor reminder with correct message', () => {
      const template = createProfessorReminderTemplate(mockReminderData, '12h');
      
      expect(template).toContain('Lembrete: Tutoria em 12 Horas');
      expect(template).toContain('hoje à noite');
      expect(template).toContain('Prof. João Silva');
    });

    it('should create 12h bolsista reminder with preparation message', () => {
      const template = createBolsistaReminderTemplate(mockReminderData, '12h');
      
      expect(template).toContain('Lembrete: Tutoria em 12 Horas');
      expect(template).toContain('hoje à noite');
      expect(template).toContain('Verifique');
    });
  });

  describe('1h Reminder Templates', () => {
    it('should create 1h professor reminder with urgent message', () => {
      const template = createProfessorReminderTemplate(mockReminderData, '1h');
      
      expect(template).toContain('Lembrete Urgente: Tutoria em 1 Hora');
      expect(template).toContain('1 hora');
      expect(template).toContain('Prof. João Silva');
    });

    it('should create 1h bolsista reminder with urgent message', () => {
      const template = createBolsistaReminderTemplate(mockReminderData, '1h');
      
      expect(template).toContain('Lembrete Urgente: Tutoria em 1 Hora');
      expect(template).toContain('1 hora');
      expect(template).toContain('Prepare-se agora');
    });

    it('should not have full checklist in 1h reminder', () => {
      const template = createBolsistaReminderTemplate(mockReminderData, '1h');
      
      expect(template).not.toContain('Chegue com 10 minutos');
      expect(template).toContain('Prepare-se agora');
    });
  });

  describe('Template Consistency', () => {
    it('should include all required fields in all reminder types', () => {
      const requiredFields = [
        mockReminderData.disciplina,
        mockReminderData.professor,
        mockReminderData.horario,
        mockReminderData.horarioTermino,
        mockReminderData.instituicao,
      ];

      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      
      reminders.forEach(reminder => {
        const professorTemplate = createProfessorReminderTemplate(mockReminderData, reminder);
        const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData, reminder);
        
        requiredFields.forEach(field => {
          expect(professorTemplate).toContain(field);
          expect(bolsistaTemplate).toContain(field);
        });
      });
    });

    it('should have proper HTML structure in all reminders', () => {
      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      
      reminders.forEach(reminder => {
        const professorTemplate = createProfessorReminderTemplate(mockReminderData, reminder);
        const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData, reminder);
        
        expect(professorTemplate).toContain('<!DOCTYPE html>');
        expect(professorTemplate).toContain('</html>');
        expect(bolsistaTemplate).toContain('<!DOCTYPE html>');
        expect(bolsistaTemplate).toContain('</html>');
      });
    });

    it('should have different color schemes for professor and bolsista', () => {
      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      
      reminders.forEach(reminder => {
        const professorTemplate = createProfessorReminderTemplate(mockReminderData, reminder);
        const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData, reminder);
        
        // Professor should have orange color (#ff8c00)
        expect(professorTemplate).toContain('#ff8c00');
        
        // Bolsista should have green color (#22c55e)
        expect(bolsistaTemplate).toContain('#22c55e');
      });
    });
  });

  describe('Urgency Levels', () => {
    it('should increase urgency as reminder time approaches', () => {
      const professor24h = createProfessorReminderTemplate(mockReminderData, '24h');
      const professor12h = createProfessorReminderTemplate(mockReminderData, '12h');
      const professor1h = createProfessorReminderTemplate(mockReminderData, '1h');
      
      // Check for urgency indicators
      expect(professor24h).toContain('amanhã');
      expect(professor12h).toContain('hoje à noite');
      expect(professor1h).toContain('Urgente');
      expect(professor1h).toContain('1 hora');
    });

    it('should have different subject lines for each interval', () => {
      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      const subjects: { [key in '24h' | '12h' | '1h']: string } = {
        '24h': 'Lembrete: Tutoria Amanhã',
        '12h': 'Lembrete: Tutoria em 12 Horas',
        '1h': 'Lembrete Urgente: Tutoria em 1 Hora',
      };
      
      reminders.forEach(reminder => {
        const template = createProfessorReminderTemplate(mockReminderData, reminder);
        expect(template).toContain(subjects[reminder]);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly in all reminders', () => {
      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      
      reminders.forEach(reminder => {
        const professorTemplate = createProfessorReminderTemplate(mockReminderData, reminder);
        const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData, reminder);
        
        // Should contain formatted date
        expect(professorTemplate).toContain('02/04/2026');
        expect(bolsistaTemplate).toContain('02/04/2026');
      });
    });

    it('should handle different dates correctly', () => {
      const testData: ReminderEmailData = {
        ...mockReminderData,
        data: '2026-12-25',
      };
      
      const reminders: Array<'24h' | '12h' | '1h'> = ['24h', '12h', '1h'];
      
      reminders.forEach(reminder => {
        const template = createProfessorReminderTemplate(testData, reminder);
        expect(template).toContain('25/12/2026');
      });
    });
  });
});
