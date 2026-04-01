import { describe, it, expect } from 'vitest';
import {
  createProfessorReminderTemplate,
  createBolsistaReminderTemplate,
  type ReminderEmailData,
} from './_core/reminderService';

describe('Reminder Scheduler', () => {
  const mockReminderData: ReminderEmailData = {
    disciplina: 'Cálculo I',
    professor: 'Prof. João Silva',
    tutor: 'Maria Santos',
    data: '2026-04-02',
    horario: '14:00',
    horarioTermino: '15:30',
    instituicao: 'UNEF - Campus A',
  };

  describe('Reminder Email Templates', () => {
    it('should create a valid professor reminder template', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      
      expect(template).toContain('Lembrete: Tutoria Amanhã');
      expect(template).toContain('Prof. João Silva');
      expect(template).toContain('Cálculo I');
      expect(template).toContain('confirme sua presença');
    });

    it('should create a valid bolsista reminder template', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      
      expect(template).toContain('Lembrete: Tutoria Amanhã');
      expect(template).toContain('Cálculo I');
      expect(template).toContain('Prepare-se');
      expect(template).toContain('Checklist');
    });

    it('should include formatted date in professor template', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      expect(template).toContain('02/04/2026');
    });

    it('should include formatted date in bolsista template', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      expect(template).toContain('02/04/2026');
    });

    it('should include all required information in professor template', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      
      const requiredFields = [
        mockReminderData.disciplina,
        mockReminderData.professor,
        mockReminderData.horario,
        mockReminderData.horarioTermino,
        mockReminderData.instituicao,
      ];
      
      requiredFields.forEach(field => {
        expect(template).toContain(field);
      });
    });

    it('should include all required information in bolsista template', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      
      const requiredFields = [
        mockReminderData.disciplina,
        mockReminderData.professor,
        mockReminderData.horario,
        mockReminderData.horarioTermino,
        mockReminderData.instituicao,
      ];
      
      requiredFields.forEach(field => {
        expect(template).toContain(field);
      });
    });

    it('should have proper HTML structure in professor template', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('</html>');
      expect(template).toContain('<style>');
      expect(template).toContain('</style>');
    });

    it('should have proper HTML structure in bolsista template', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('</html>');
      expect(template).toContain('<style>');
      expect(template).toContain('</style>');
    });

    it('should include alert box in professor template', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      expect(template).toContain('alert');
      expect(template).toContain('Importante');
    });

    it('should include checklist in bolsista template', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      expect(template).toContain('Checklist');
      expect(template).toContain('check-in');
    });

    it('should include footer in both templates', () => {
      const professorTemplate = createProfessorReminderTemplate(mockReminderData);
      const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData);
      
      expect(professorTemplate).toContain('Sistema de Gerenciamento de Tutorias');
      expect(bolsistaTemplate).toContain('Sistema de Gerenciamento de Tutorias');
    });

    it('should have different color schemes for professor and bolsista', () => {
      const professorTemplate = createProfessorReminderTemplate(mockReminderData);
      const bolsistaTemplate = createBolsistaReminderTemplate(mockReminderData);
      
      // Professor should have orange color (#ff8c00)
      expect(professorTemplate).toContain('#ff8c00');
      
      // Bolsista should have green color (#22c55e)
      expect(bolsistaTemplate).toContain('#22c55e');
    });

    it('should format different dates correctly', () => {
      const testData: ReminderEmailData = {
        ...mockReminderData,
        data: '2026-12-25',
      };
      
      const template = createProfessorReminderTemplate(testData);
      expect(template).toContain('25/12/2026');
    });
  });

  describe('Reminder Content Validation', () => {
    it('should have clear call-to-action for professor', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      expect(template).toContain('confirme');
      expect(template).toContain('respondendo');
    });

    it('should have preparation instructions for bolsista', () => {
      const template = createBolsistaReminderTemplate(mockReminderData);
      expect(template).toContain('material');
      expect(template).toContain('antecedência');
    });

    it('should include time information clearly', () => {
      const template = createProfessorReminderTemplate(mockReminderData);
      expect(template).toContain('14:00');
      expect(template).toContain('15:30');
    });
  });
});
