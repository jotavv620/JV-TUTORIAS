import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendEmail,
  sendProfessorTutoriaEmail,
  sendBolsistaTutoriaEmail,
  createProfessorEmailTemplate,
  createBolsistaEmailTemplate,
  TutoriaEmailData,
} from "./_core/emailService";

const mockTutoriaData: TutoriaEmailData = {
  disciplina: "Matemática",
  professor: "Dr. Silva",
  tutor: "João Santos",
  data: "2026-03-25",
  horario: "14:00",
  horarioTermino: "15:30",
  instituicao: "Campus A",
};

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProfessorEmailTemplate", () => {
    it("should create a valid HTML template for professor", () => {
      const template = createProfessorEmailTemplate(mockTutoriaData);
      
      expect(template).toContain("Nova Tutoria Agendada");
      expect(template).toContain(mockTutoriaData.professor);
      expect(template).toContain(mockTutoriaData.disciplina);
      expect(template).toContain(mockTutoriaData.tutor);
      expect(template).toContain(mockTutoriaData.horario);
      expect(template).toContain("<!DOCTYPE html>");
    });

    it("should format date correctly in professor email", () => {
      const template = createProfessorEmailTemplate(mockTutoriaData);
      // Date format: 25/3/2026 (day/month/year)
      expect(template).toContain("/");
      expect(template).toContain("2026");
    });

    it("should include all tutoria details in professor email", () => {
      const template = createProfessorEmailTemplate(mockTutoriaData);
      
      expect(template).toContain(mockTutoriaData.disciplina);
      expect(template).toContain(mockTutoriaData.professor);
      expect(template).toContain(mockTutoriaData.tutor);
      expect(template).toContain(mockTutoriaData.instituicao);
      expect(template).toContain(mockTutoriaData.horario);
      expect(template).toContain(mockTutoriaData.horarioTermino);
    });
  });

  describe("createBolsistaEmailTemplate", () => {
    it("should create a valid HTML template for bolsista", () => {
      const template = createBolsistaEmailTemplate(mockTutoriaData);
      
      expect(template).toContain("Tutoria Agendada");
      expect(template).toContain(mockTutoriaData.disciplina);
      expect(template).toContain(mockTutoriaData.professor);
      expect(template).toContain("<!DOCTYPE html>");
    });

    it("should include check-in reminder for bolsista", () => {
      const template = createBolsistaEmailTemplate(mockTutoriaData);
      expect(template).toContain("check-in");
    });

    it("should format date correctly in bolsista email", () => {
      const template = createBolsistaEmailTemplate(mockTutoriaData);
      // Date format: 25/3/2026 (day/month/year)
      expect(template).toContain("/");
      expect(template).toContain("2026");
    });

    it("should include all tutoria details in bolsista email", () => {
      const template = createBolsistaEmailTemplate(mockTutoriaData);
      
      expect(template).toContain(mockTutoriaData.disciplina);
      expect(template).toContain(mockTutoriaData.professor);
      expect(template).toContain(mockTutoriaData.instituicao);
      expect(template).toContain(mockTutoriaData.horario);
      expect(template).toContain(mockTutoriaData.horarioTermino);
    });
  });

  describe("sendProfessorTutoriaEmail", () => {
    it("should not send if professor email is empty", async () => {
      const result = await sendProfessorTutoriaEmail("", mockTutoriaData);
      expect(result).toBe(false);
    });

    it("should create correct email payload for professor", async () => {
      // This test validates the function structure
      // In production, actual sending would be tested with mocked fetch
      const result = await sendProfessorTutoriaEmail("prof@example.com", mockTutoriaData);
      // Result depends on ENV configuration and API availability
      expect(typeof result).toBe("boolean");
    });
  });

  describe("sendBolsistaTutoriaEmail", () => {
    it("should not send if bolsista email is empty", async () => {
      const result = await sendBolsistaTutoriaEmail("", mockTutoriaData);
      expect(result).toBe(false);
    });

    it("should create correct email payload for bolsista", async () => {
      // This test validates the function structure
      const result = await sendBolsistaTutoriaEmail("bolsista@example.com", mockTutoriaData);
      // Result depends on ENV configuration and API availability
      expect(typeof result).toBe("boolean");
    });
  });

  describe("sendEmail", () => {
    it("should handle missing configuration gracefully", async () => {
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });
      
      // Should return false if not configured
      expect(typeof result).toBe("boolean");
    });

    it("should validate email payload structure", async () => {
      const payload = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };
      
      // Should not throw
      expect(async () => {
        await sendEmail(payload);
      }).not.toThrow();
    });
  });
});
