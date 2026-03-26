import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import {
  broadcastTutoriaUpdate,
  broadcastConfigUpdate,
  broadcastFeedbackUpdate,
  broadcastCheckinUpdate,
} from "./_core/websocket";
import {
  sendProfessorTutoriaEmail,
  sendBolsistaTutoriaEmail,
  TutoriaEmailData,
} from "./_core/emailService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Tutorias router
  tutorias: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllTutorias();
    }),
    
    create: protectedProcedure
      .input(z.object({
        disciplina: z.string(),
        professor: z.string(),
        instituicao: z.string(),
        tutor: z.string(),
        data: z.string(),
        horario: z.string(),
        horarioTermino: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createTutoria(ctx.user.id, {
          ...input,
          status: 'scheduled',
          reminder_sent: false,
        } as any);
        broadcastTutoriaUpdate('created', result);
        
        // Send emails to professor and bolsista
        try {
          const emailData: TutoriaEmailData = {
            disciplina: input.disciplina,
            professor: input.professor,
            tutor: input.tutor,
            data: input.data,
            horario: input.horario,
            horarioTermino: input.horarioTermino,
            instituicao: input.instituicao,
          };
          
          // Get professor email
          const professorData = await db.getProfessorByName(input.professor);
          if (professorData?.email) {
            await sendProfessorTutoriaEmail(professorData.email, emailData);
          }
          
          // Get bolsista email
          const bolsistaData = await db.getBolsistaByName(input.tutor);
          if (bolsistaData?.email) {
            await sendBolsistaTutoriaEmail(bolsistaData.email, emailData);
          }
        } catch (error) {
          console.error('[Email] Error sending tutoria emails:', error);
          // Don't throw - email failure shouldn't block tutoria creation
        }
        
        return result;
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
        status: z.enum(['scheduled', 'in_progress', 'completed']),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateTutoriaStatus(input.tutoriaId, input.status);
        broadcastTutoriaUpdate('updated', result);
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({ tutoriaId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await db.deleteTutoria(input.tutoriaId);
        broadcastTutoriaUpdate('deleted', { id: input.tutoriaId });
        return result;
      }),
  }),

  // Feedback router
  feedback: router({
    create: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
        pontualidade: z.number(),
        audio: z.number(),
        conteudo: z.number(),
        comentarios: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createFeedback(input.tutoriaId, {
          pontualidade: input.pontualidade,
          audio: input.audio,
          conteudo: input.conteudo,
          comentarios: input.comentarios || null,
        });
        broadcastFeedbackUpdate('created', result);
        return result;
      }),
    
    getByTutoriaId: protectedProcedure
      .input(z.object({ tutoriaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFeedbackByTutoriaId(input.tutoriaId);
      }),
  }),

  // Check-in router
  checkin: router({
    create: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
        timestamp: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createCheckin(input.tutoriaId, {
          timestamp: input.timestamp,
          description: input.description || null,
        });
        broadcastCheckinUpdate('created', result);
        return result;
      }),
    
    getByTutoriaId: protectedProcedure
      .input(z.object({ tutoriaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCheckinByTutoriaId(input.tutoriaId);
      }),
  }),

  // Configuracoes router
  config: router({
    // Disciplinas
    getDisciplinas: protectedProcedure.query(async () => {
      return await db.getAllDisciplinas();
    }),
    
    createDisciplina: protectedProcedure
      .input(z.object({ nome: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createDisciplina(ctx.user.id, input.nome);
        broadcastConfigUpdate({ type: 'disciplina', action: 'created', data: result });
        return result;
      }),
    
    deleteDisciplina: protectedProcedure
      .input(z.object({ disciplinaId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await db.deleteDisciplina(input.disciplinaId);
        broadcastConfigUpdate({ type: 'disciplina', action: 'deleted', id: input.disciplinaId });
        return result;
      }),

    // Professores
    getProfessores: protectedProcedure.query(async () => {
      return await db.getAllProfessores();
    }),
    
    createProfessor: protectedProcedure
      .input(z.object({ nome: z.string(), email: z.string().email().optional() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createProfessor(ctx.user.id, input.nome, input.email);
        broadcastConfigUpdate({ type: 'professor', action: 'created', data: result });
        return result;
      }),
    
    deleteProfessor: protectedProcedure
      .input(z.object({ professorId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await db.deleteProfessor(input.professorId);
        broadcastConfigUpdate({ type: 'professor', action: 'deleted', id: input.professorId });
        return result;
      }),

    // Instituicoes
    getInstituicoes: protectedProcedure.query(async () => {
      return await db.getAllInstituicoes();
    }),
    
    createInstituicao: protectedProcedure
      .input(z.object({ nome: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createInstituicao(ctx.user.id, input.nome);
        broadcastConfigUpdate({ type: 'instituicao', action: 'created', data: result });
        return result;
      }),
    
    deleteInstituicao: protectedProcedure
      .input(z.object({ instituicaoId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await db.deleteInstituicao(input.instituicaoId);
        broadcastConfigUpdate({ type: 'instituicao', action: 'deleted', id: input.instituicaoId });
        return result;
      }),
  }),

  // Relatorios router
  relatorios: router({
    getRanking: protectedProcedure.query(async ({ ctx }) => {
      const tutorias = await db.getTutoriasByUserId(ctx.user.id);
      const profMap: Record<string, { count: number; total: number }> = {};
      
      for (const tutoria of tutorias) {
        if (!profMap[tutoria.professor]) {
          profMap[tutoria.professor] = { count: 0, total: 0 };
        }
        profMap[tutoria.professor].count++;
        
        const feedback = await db.getFeedbackByTutoriaId(tutoria.id);
        if (feedback?.conteudo) {
          profMap[tutoria.professor].total += feedback.conteudo;
        }
      }

      return Object.entries(profMap).map(([name, data]) => {
        const avg = data.count > 0 ? data.total / data.count : 0;
        return {
          name,
          count: data.count,
          avg: avg.toFixed(1),
          status: avg >= 4.5 ? 'Excelente' : avg >= 3.5 ? 'Bom' : 'Regular'
        };
      }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
    }),

    exportPDF: protectedProcedure.query(async ({ ctx }) => {
      const tutorias = await db.getTutoriasByUserId(ctx.user.id);
      const profMap: Record<string, { count: number; total: number }> = {};
      
      for (const tutoria of tutorias) {
        if (!profMap[tutoria.professor]) {
          profMap[tutoria.professor] = { count: 0, total: 0 };
        }
        profMap[tutoria.professor].count++;
        
        const feedback = await db.getFeedbackByTutoriaId(tutoria.id);
        if (feedback?.conteudo) {
          profMap[tutoria.professor].total += feedback.conteudo;
        }
      }

      const ranking = Object.entries(profMap).map(([name, data]) => {
        const avg = data.count > 0 ? data.total / data.count : 0;
        return {
          name,
          count: data.count,
          avg: avg.toFixed(1),
          status: avg >= 4.5 ? 'Excelente' : avg >= 3.5 ? 'Bom' : 'Regular'
        };
      }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

       return {
        data: ranking,
        timestamp: new Date().toISOString(),
      };
    }),
  }),

  // Bolsista router
  bolsista: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBolsistas();
    }),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createBolsista(ctx.user.id, input.nome, input.email);
        broadcastConfigUpdate({ type: 'bolsista', action: 'created', data: result });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({
        bolsistaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteBolsista(input.bolsistaId);
        broadcastConfigUpdate({ type: 'bolsista', action: 'deleted', id: input.bolsistaId });
        return result;
      }),
  }),

  // Professor email router
  professor: router({
    updateEmail: protectedProcedure
      .input(z.object({
        professorId: z.number(),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateProfessorEmail(input.professorId, input.email);
        broadcastConfigUpdate({ type: 'professor', action: 'updated', data: result });
        return result;
      }),
  }),
});
export type AppRouter = typeof appRouter;
