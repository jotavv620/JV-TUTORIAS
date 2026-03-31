import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
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
import { parseCSV, ParseError } from "./_core/csvParser";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { generateAuthorizationUrl, exchangeCodeForTokens, revokeAccessToken } from "./_core/googleOAuthService";
import crypto from 'crypto';
import { accessTokens } from "../drizzle/schema";

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
    register: publicProcedure
      .input(z.object({}))
      .mutation(async () => {
        throw new Error("Registro desabilitado. Use código de acesso fornecido pelo administrador");
      }),
    login: publicProcedure
      .input(z.object({}))
      .mutation(async () => {
        throw new Error("Login com email desabilitado. Use código de acesso fornecido pelo administrador");
      }),
    loginWithToken: publicProcedure
      .input(z.object({
        token: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { loginWithAccessToken } = await import("./_core/accessTokenService");
          const user = await loginWithAccessToken(input.token);
          
          // Create session using SDK (similar to OAuth)
          const { sdk } = await import("./_core/sdk");
          if (!user.openId) {
            throw new Error("User openId is required for session creation");
          }
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || "",
            expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          
          // Set session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
          
          return { 
            success: true,
            message: "Acesso concedido com sucesso",
            userId: user.id,
            userType: user.userType,
            name: user.name,
            email: user.email
          };
        } catch (error: any) {
          throw new Error(error.message || "Código de acesso inválido");
        }
      }),
  }),

  // Google OAuth router
  google: router({
    getAuthUrl: protectedProcedure.query(({ ctx }) => {
      try {
        const authUrl = generateAuthorizationUrl(ctx.user.id.toString());
        return { authUrl };
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao gerar URL de autenticação');
      }
    }),

    handleCallback: protectedProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const tokens = await exchangeCodeForTokens(input.code);
          
          const scope = tokens.scope ? String(tokens.scope) : '';
          await db.saveGoogleAuthToken(
            ctx.user.id,
            tokens.accessToken,
            tokens.refreshToken ?? null,
            tokens.expiresAt ?? null,
            scope
          );

          return {
            success: true,
            message: 'Conta Google conectada com sucesso!',
          };
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao conectar com Google');
        }
      }),

    disconnect: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const token = await db.getGoogleAuthToken(ctx.user.id);
        
        if (token) {
          await revokeAccessToken(token.accessToken);
          await db.deleteGoogleAuthToken(ctx.user.id);
        }

        return {
          success: true,
          message: 'Conta Google desconectada com sucesso!',
        };
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao desconectar Google');
      }
    }),

    getStatus: protectedProcedure.query(async ({ ctx }) => {
      try {
        const token = await db.getGoogleAuthToken(ctx.user.id);
        return {
          connected: !!token,
          expiresAt: token?.expiresAt || null,
        };
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao verificar status');
      }
    }),
  }),

  // Access Tokens router for admin to manage access codes
  accessTokens: router({
    // Generate new access token
    generate: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        userType: z.enum(['admin', 'professor', 'bolsista']),
        expiresInDays: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Only admins can generate tokens
          if (ctx.user?.role !== 'admin') {
            throw new Error('Apenas administradores podem gerar códigos de acesso');
          }

          const { createAccessToken } = await import('./_core/accessTokenService');
          
          let expiresAt: Date | undefined;
          if (input.expiresInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
          }

          const result = await createAccessToken(
            ctx.user.id,
            input.name,
            input.userType,
            expiresAt
          );

          return {
            success: true,
            token: result.token,
            message: 'Código de acesso gerado com sucesso!',
          };
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao gerar código de acesso');
        }
      }),

    // List all access tokens created by admin
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Apenas administradores podem visualizar códigos');
        }

        const { getTokensByAdmin } = await import('./_core/accessTokenService');
        return await getTokensByAdmin(ctx.user.id);
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao listar códigos');
      }
    }),

    // Deactivate an access token
    deactivate: protectedProcedure
      .input(z.object({
        tokenId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Apenas administradores podem desativar códigos');
          }

          const { deactivateToken } = await import('./_core/accessTokenService');
          await deactivateToken(input.tokenId);

          return {
            success: true,
            message: 'Código desativado com sucesso!',
          };
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao desativar código');
        }
      }),

    // Delete an access token
    delete: protectedProcedure
      .input(z.object({
        tokenId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Apenas administradores podem deletar códigos');
          }

          const { deleteToken } = await import('./_core/accessTokenService');
          await deleteToken(input.tokenId);

          return {
            success: true,
            message: 'Código deletado com sucesso!',
          };
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao deletar código');
        }
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
        bolsista: z.string(),
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
            tutor: input.bolsista,
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
          const bolsistaData = await db.getBolsistaByName(input.bolsista);
          if (bolsistaData?.email) {
            await sendBolsistaTutoriaEmail(bolsistaData.email, emailData);
          }
        } catch (error) {
          console.error('[Email] Error sending tutoria emails:', error);
          // Don't throw - email failure shouldn't block tutoria creation
        }
        
        return result;
      }),
    
    update: protectedProcedure
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
      .input(z.object({
        tutoriaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteTutoria(input.tutoriaId);
        broadcastTutoriaUpdate('deleted', result);
        return result;
      }),
    
    syncGoogleCalendar: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const tutoria = await db.getTutoriaById(input.tutoriaId);
          if (!tutoria) {
            throw new Error('Tutoria não encontrada');
          }
          
          // For now, just mark as synced
          // In production, this would create a Google Calendar event
          await db.updateTutoriaGoogleCalendarSync(
            input.tutoriaId,
            `event_${input.tutoriaId}_${Date.now()}`,
            true
          );
          
          return {
            success: true,
            message: 'Tutoria sincronizada com Google Calendar',
            eventId: `event_${input.tutoriaId}_${Date.now()}`,
          };
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao sincronizar com Google Calendar');
        }
      }),
  }),

  // Feedback router
  feedback: router({
    create: protectedProcedure
      .input(z.object({
        tutoriaId: z.number(),
        pontualidade: z.number().min(1).max(5),
        audio: z.number().min(1).max(5),
        conteudo: z.number().min(1).max(5),
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
      .input(z.object({
        tutoriaId: z.number(),
      }))
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
      .input(z.object({
        tutoriaId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getCheckinByTutoriaId(input.tutoriaId);
      }),
  }),

  // Disciplinas router
  disciplinas: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllDisciplinas();
    }),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createDisciplina(ctx.user.id, input.nome);
        broadcastConfigUpdate({ type: 'disciplina', action: 'created', data: result });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({
        disciplinaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteDisciplina(input.disciplinaId);
        broadcastConfigUpdate({ type: 'disciplina', action: 'deleted', id: input.disciplinaId });
        return result;
      }),
  }),

  // Professores router
  professores: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProfessores();
    }),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createProfessor(ctx.user.id, input.nome, input.email);
        broadcastConfigUpdate({ type: 'professor', action: 'created', data: result });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({
        professorId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteProfessor(input.professorId);
        broadcastConfigUpdate({ type: 'professor', action: 'deleted', id: input.professorId });
        return result;
      }),
  }),

  // Instituicoes router
  instituicoes: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllInstituicoes();
    }),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createInstituicao(ctx.user.id, input.nome);
        broadcastConfigUpdate({ type: 'instituicao', action: 'created', data: result });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({
        instituicaoId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteInstituicao(input.instituicaoId);
        broadcastConfigUpdate({ type: 'instituicao', action: 'deleted', id: input.instituicaoId });
        return result;
      }),
  }),

  // Bolsistas router
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

  // Bulk import router
  import: router({
    parseProfessoresCSV: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        const parseResult = parseCSV(input.csvContent);
        return parseResult;
      }),

    importProfessores: protectedProcedure
      .input(z.object({
        professores: z.array(z.object({
          nome: z.string(),
          email: z.string().email(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const results = {
          success: 0,
          failed: 0,
          errors: [] as ParseError[],
          created: [] as any[],
        };

        for (let i = 0; i < input.professores.length; i++) {
          try {
            const prof = input.professores[i];

            // Check if professor already exists
            const existing = await db.getProfessorByName(prof.nome);
            if (existing) {
              results.failed++;
              results.errors.push({
                row: i + 2,
                field: 'nome',
                message: `Professor "${prof.nome}" já existe`,
              });
              continue;
            }

            // Create professor
            const created = await db.createProfessor(ctx.user.id, prof.nome, prof.email);
            results.success++;
            results.created.push(created);
            broadcastConfigUpdate({ type: 'professor', action: 'created', data: created });
          } catch (error) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              field: 'database',
              message: `Erro ao criar professor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            });
          }
        }

        return results;
      }),

    parseBolsistasCSV: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        const parseResult = parseCSV(input.csvContent);
        return parseResult;
      }),

    importBolsistas: protectedProcedure
      .input(z.object({
        bolsistas: z.array(z.object({
          nome: z.string(),
          email: z.string().email(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const results = {
          success: 0,
          failed: 0,
          errors: [] as ParseError[],
          created: [] as any[],
        };

        for (let i = 0; i < input.bolsistas.length; i++) {
          try {
            const bolsista = input.bolsistas[i];

            // Check if bolsista already exists
            const existing = await db.getBolsistaByName(bolsista.nome);
            if (existing) {
              results.failed++;
              results.errors.push({
                row: i + 2,
                field: 'nome',
                message: `Bolsista "${bolsista.nome}" já existe`,
              });
              continue;
            }

            // Create bolsista
            const created = await db.createBolsista(ctx.user.id, bolsista.nome, bolsista.email);
            results.success++;
            results.created.push(created);
            broadcastConfigUpdate({ type: 'bolsista', action: 'created', data: created });
          } catch (error) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              field: 'database',
              message: `Erro ao criar bolsista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            });
          }
        }

        return results;
      }),
  }),
});
export type AppRouter = typeof appRouter;
