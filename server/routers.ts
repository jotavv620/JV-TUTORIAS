import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTutoriasByUserId(ctx.user.id);
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
        return await db.createTutoria(ctx.user.id, {
          ...input,
          status: 'scheduled',
        });
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
        status: z.enum(['scheduled', 'in_progress', 'completed']),
      }))
      .mutation(async ({ input }) => {
        return await db.updateTutoriaStatus(input.tutoriaId, input.status);
      }),
    
    delete: protectedProcedure
      .input(z.object({ tutoriaId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTutoria(input.tutoriaId);
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
        return await db.createFeedback(input.tutoriaId, {
          pontualidade: input.pontualidade,
          audio: input.audio,
          conteudo: input.conteudo,
          comentarios: input.comentarios || null,
        });
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
        return await db.createCheckin(input.tutoriaId, {
          timestamp: input.timestamp,
          description: input.description || null,
        });
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
    getDisciplinas: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDisciplinasByUserId(ctx.user.id);
    }),
    
    createDisciplina: protectedProcedure
      .input(z.object({ nome: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await db.createDisciplina(ctx.user.id, input.nome);
      }),
    
    deleteDisciplina: protectedProcedure
      .input(z.object({ disciplinaId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteDisciplina(input.disciplinaId);
      }),

    // Professores
    getProfessores: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProfessoresByUserId(ctx.user.id);
    }),
    
    createProfessor: protectedProcedure
      .input(z.object({ nome: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await db.createProfessor(ctx.user.id, input.nome);
      }),
    
    deleteProfessor: protectedProcedure
      .input(z.object({ professorId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProfessor(input.professorId);
      }),

    // Instituicoes
    getInstituicoes: protectedProcedure.query(async ({ ctx }) => {
      return await db.getInstituicoesByUserId(ctx.user.id);
    }),
    
    createInstituicao: protectedProcedure
      .input(z.object({ nome: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await db.createInstituicao(ctx.user.id, input.nome);
      }),
    
    deleteInstituicao: protectedProcedure
      .input(z.object({ instituicaoId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteInstituicao(input.instituicaoId);
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
});

export type AppRouter = typeof appRouter;
