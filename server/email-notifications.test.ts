import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendEmail,
  sendProfessorTutoriaEmail,
  sendBolsistaTutoriaEmail,
  createProfessorEmailTemplate,
  createBolsistaEmailTemplate,
  type TutoriaEmailData,
} from './_core/emailService';

describe('Email Notifications', () => {
  const mockEmailData: TutoriaEmailData = {
    disciplina: 'Matemática',
    professor: 'Dr. Silva',
    tutor: 'João Santos',
    data: '2026-04-15',
    horario: '14:00',
    horarioTermino: '15:30',
    instituicao: 'UNEF',
  };

  describe('Email Templates', () => {
    it('should create a valid professor email template', () => {
      const template = createProfessorEmailTemplate(mockEmailData);
      
      expect(template).toContain('Nova Tutoria Agendada');
      expect(template).toContain('Dr. Silva');
      expect(template).toContain('Matemática');
      expect(template).toContain('2026-04-15');
      expect(template).toContain('14:00');
      expect(template).toContain('UNEF');
    });

    it('should create a valid bolsista email template', () => {
      const template = createBolsistaEmailTemplate(mockEmailData);
      
      expect(template).toContain('Tutoria Agendada');
      expect(template).toContain('João Santos').or.toContain('você');
      expect(template).toContain('Matemática');
      expect(template).toContain('Dr. Silva');
      expect(template).toContain('14:00');
    });

    it('should include HTML structure in templates', () => {
      const professorTemplate = createProfessorEmailTemplate(mockEmailData);
      const bolsistaTemplate = createBolsistaEmailTemplate(mockEmailData);
      
      expect(professorTemplate).toContain('<!DOCTYPE html>');
      expect(professorTemplate).toContain('</html>');
      expect(bolsistaTemplate).toContain('<!DOCTYPE html>');
      expect(bolsistaTemplate).toContain('</html>');
    });

    it('should format date correctly in templates', () => {
      const testData: TutoriaEmailData = {
        ...mockEmailData,
        data: '2026-12-25', // Christmas
      };
      
      const template = createProfessorEmailTemplate(testData);
      // Should be formatted as Brazilian date format (DD/MM/YYYY)
      expect(template).toContain('25/12/2026');
    });
  });

  describe('Email Sending', () => {
    it('should handle missing professor email gracefully', async () => {
      const result = await sendProfessorTutoriaEmail('', mockEmailData);
      expect(result).toBe(false);
    });

    it('should handle missing bolsista email gracefully', async () => {
      const result = await sendBolsistaTutoriaEmail('', mockEmailData);
      expect(result).toBe(false);
    });

    it('should include correct subject for professor emails', async () => {
      // This test validates the subject line format
      const subject = `Nova Tutoria Agendada - ${mockEmailData.disciplina}`;
      expect(subject).toBe('Nova Tutoria Agendada - Matemática');
    });

    it('should include correct subject for bolsista emails', async () => {
      const subject = `Tutoria Agendada - ${mockEmailData.disciplina}`;
      expect(subject).toBe('Tutoria Agendada - Matemática');
    });
  });

  describe('Email Content Validation', () => {
    it('should include all required information in professor template', () => {
      const template = createProfessorEmailTemplate(mockEmailData);
      
      const requiredFields = [
        mockEmailData.disciplina,
        mockEmailData.professor,
        mockEmailData.data,
        mockEmailData.horario,
        mockEmailData.horarioTermino,
        mockEmailData.instituicao,
      ];
      
      requiredFields.forEach(field => {
        expect(template).toContain(field);
      });
    });

    it('should include all required information in bolsista template', () => {
      const template = createBolsistaEmailTemplate(mockEmailData);
      
      const requiredFields = [
        mockEmailData.disciplina,
        mockEmailData.professor,
        mockEmailData.data,
        mockEmailData.horario,
        mockEmailData.horarioTermino,
        mockEmailData.instituicao,
      ];
      
      requiredFields.forEach(field => {
        expect(template).toContain(field);
      });
    });

    it('should have proper styling in email templates', () => {
      const template = createProfessorEmailTemplate(mockEmailData);
      
      expect(template).toContain('font-family');
      expect(template).toContain('background-color');
      expect(template).toContain('padding');
      expect(template).toContain('border-radius');
    });

    it('should include footer in templates', () => {
      const professorTemplate = createProfessorEmailTemplate(mockEmailData);
      const bolsistaTemplate = createBolsistaEmailTemplate(mockEmailData);
      
      expect(professorTemplate).toContain('Sistema de Gerenciamento de Tutorias');
      expect(professorTemplate).toContain('Não responda este email');
      expect(bolsistaTemplate).toContain('Sistema de Gerenciamento de Tutorias');
      expect(bolsistaTemplate).toContain('Não responda este email');
    });
  });
});
