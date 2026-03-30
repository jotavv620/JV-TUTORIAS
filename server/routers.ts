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
  sendBolsistaAccessCodeEmail,
  TutoriaEmailData,
} from "./_core/emailService";
import { parseCSV, ParseError } from "./_core/csvParser";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users, bolsistas } from "../drizzle/schema";
import { generateAuthorizationUrl, exchangeCodeForTokens, revokeAccessToken } from "./_core/googleOAuthService";
import crypto from 'crypto';
import { accessTokens } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      // Return only primitive fields to avoid Date serialization issues
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        openId: user.openId,
        role: user.role,
        userType: user.userType,
        loginMethod: user.loginMethod,
        registeredLocally: user.registeredLocally,
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        userType: z.enum(["admin", "professor", "bolsista"]).default("bolsista"),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Banco de dados não disponível");
          
          // Check if email already exists
          const existingUser = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
          if (existingUser.length > 0) {
            throw new Error("Email já cadastrado");
          }
          
          // Hash password
          const hashedPassword = await bcrypt.hash(input.password, 10);
          
          // Create user
          await database.insert(users).values({
            name: input.name,
            email: input.email,
            password: hashedPassword,
            userType: input.userType,
            registeredLocally: true,
            loginMethod: 'local',
            openId: `local_${input.email}_${Date.now()}`,
          });
          
          // Get the created user
          const newUserResult = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
          const newUser = newUserResult[0];
          
          return { 
            success: true,
            message: "Usuário cadastrado com sucesso",
            userId: newUser?.id
          };
        } catch (error: any) {
          if (error.message.includes("Email já cadastrado")) {
            throw new Error("Email já cadastrado");
          }
          throw new Error(error.message || "Erro ao cadastrar usuário");
        }
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Banco de dados não disponível");
          
          // Get user by email
          const userResult = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
          const user = userResult[0];
          
          if (!user || !user.password) {
            throw new Error("Email ou senha inválidos");
          }
          
          // Compare password
          const passwordMatch = await bcrypt.compare(input.password, user.password);
          if (!passwordMatch) {
            throw new Error("Email ou senha inválidos");
          }
          
          return { 
            success: true,
            message: "Login realizado com sucesso",
            userId: user.id,
            userType: user.userType,
            name: user.name,
            email: user.email
          };
        } catch (error: any) {
          throw new Error(error.message || "Erro ao fazer login");
        }
      }),
    
    loginWithToken: publicProcedure
      .input(z.object({
        token: z.string().min(1, 'Token é obrigatório'),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          const tokenResult = await database.select().from(accessTokens)
            .where(eq(accessTokens.token, input.token))
            .limit(1);

          if (tokenResult.length === 0) {
            throw new Error('Token inválido');
          }

          const accessToken = tokenResult[0];

          // Token revocation check removed - not in schema
          // if (accessToken.revokedAt) {
          //   throw new Error('Token foi revogado');
          // }

          if (accessToken.expiresAt && new Date(accessToken.expiresAt) < new Date()) {
            throw new Error('Token expirou');
          }

          if (accessToken.usedAt) {
            throw new Error('Token já foi utilizado');
          }

          let user: any;
          if (accessToken.userId) {
            const userResult = await database.select().from(users)
              .where(eq(users.id, accessToken.userId))
              .limit(1);
            
            if (userResult.length === 0) {
              throw new Error('Usuário não encontrado');
            }
            user = userResult[0];
          } else {
            const openId = crypto.randomBytes(16).toString('hex');
            const insertResult = await database.insert(users).values({
              openId,
              name: accessToken.name || 'Usuário',
              userType: accessToken.userType || 'bolsista',
              registeredLocally: true,
              loginMethod: 'token',
              role: accessToken.userType === 'admin' ? 'admin' : 'user',
            });

            const newUserId = (insertResult as any)[0]?.insertId || (insertResult as any).insertId;
            if (!newUserId) {
              throw new Error('Erro ao criar usuário');
            }

            await database.update(accessTokens)
              .set({ userId: newUserId })
              .where(eq(accessTokens.id, accessToken.id));

            const userResult = await database.select().from(users)
              .where(eq(users.id, newUserId))
              .limit(1);
            
            if (userResult.length === 0) {
              throw new Error('Erro ao recuperar usuário criado');
            }
            user = userResult[0];
          }

          await database.update(accessTokens)
            .set({ usedAt: new Date() })
            .where(eq(accessTokens.id, accessToken.id));

          const { sdk } = await import('./_core/sdk');
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || '',
            expiresInMs: 365 * 24 * 60 * 60 * 1000,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { 
            ...cookieOptions, 
            maxAge: 365 * 24 * 60 * 60 * 1000 
          });

          console.log('[Auth] User logged in with token:', { userId: user.id, userType: user.userType });

          return { 
            success: true,
            message: 'Login realizado com sucesso',
            userId: user.id,
            userName: user.name,
            userType: user.userType,
            userRole: user.role,
          };
        } catch (error: any) {
          console.error('[Auth] Error with loginWithToken:', error);
          throw new Error(error.message || 'Erro ao fazer login com token');
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
          
          await db.saveGoogleAuthToken(
            ctx.user.id,
            tokens.accessToken,
            tokens.refreshToken || null,
            tokens.expiresAt,
            tokens.scope || ''
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
      const tutorias = await db.getAllTutorias();
      // Map to remove Date fields
      return tutorias.map(t => ({
        id: t.id,
        userId: t.userId,
        professorId: t.professorId,
        disciplina: t.disciplina,
        instituicao: t.instituicao,
        status: t.status,
        dataHora: t.dataHora ? new Date(t.dataHora).toISOString() : null,
        duracao: t.duracao,
        local: t.local,
        notas: t.notas,
      }));
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
        const feedbacks = await db.getFeedbackByTutoriaId(input.tutoriaId);
        // Map to remove Date fields
        return feedbacks.map(f => ({
          id: f.id,
          tutoriaId: f.tutoriaId,
          rating: f.rating,
          comment: f.comment,
        }));
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
        const checkins = await db.getCheckinByTutoriaId(input.tutoriaId);
        // Map to remove Date fields
        return checkins.map(c => ({
          id: c.id,
          tutoriaId: c.tutoriaId,
          checkInTime: c.checkInTime ? new Date(c.checkInTime).toISOString() : null,
        }));
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
      const bolsistas = await db.getAllBolsistas();
      // Map to remove Date fields
      return bolsistas.map(b => ({
        id: b.id,
        userId: b.userId,
        nome: b.nome,
        email: b.email,
        accessCode: b.accessCode,
        isActive: b.isActive,
      }));
    }),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createBolsista(ctx.user.id, input.nome, input.email);
        
        // Send email with access code
        if (result && result.accessCode) {
          await sendBolsistaAccessCodeEmail(input.email, input.nome, result.accessCode);
        }
        
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


  // Bolsistas router - for managing bolsista access codes
  bolsistas: router({
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(2),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can create bolsistas
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem criar bolsistas');
        }

        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          // Generate unique access code
          const accessCode = `BOLSA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

          // Create bolsista record
          const result = await database.insert(bolsistas).values({
            nome: input.nome,
            email: input.email || null,
            accessCode,
            isActive: true,
          });

          const bolsistaId = (result as any)[0]?.insertId || (result as any).insertId;

          console.log('[Bolsista] Created:', { bolsistaId, nome: input.nome, accessCode });

          return {
            id: bolsistaId,
            nome: input.nome,
            email: input.email || null,
            accessCode,
            isActive: true,
            createdAt: new Date(),
          };
        } catch (error: any) {
          console.error('[Bolsista] Error creating bolsista:', error);
          throw new Error(error.message || 'Erro ao criar bolsista');
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can list bolsistas
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem listar bolsistas');
        }

        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          const result = await database.select().from(bolsistas);
          return result;
        } catch (error: any) {
          console.error('[Bolsista] Error listing bolsistas:', error);
          throw new Error(error.message || 'Erro ao listar bolsistas');
        }
      }),

    deactivate: protectedProcedure
      .input(z.object({
        bolsistaId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can deactivate bolsistas
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem desativar bolsistas');
        }

        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          await database.update(bolsistas)
            .set({ isActive: false })
            .where(eq(bolsistas.id, input.bolsistaId));

          console.log('[Bolsista] Deactivated:', { bolsistaId: input.bolsistaId });

          return { success: true };
        } catch (error: any) {
          console.error('[Bolsista] Error deactivating bolsista:', error);
          throw new Error(error.message || 'Erro ao desativar bolsista');
        }
      }),

    delete: protectedProcedure
      .input(z.object({
        bolsistaId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can delete bolsistas
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem deletar bolsistas');
        }

        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          await database.delete(bolsistas).where(eq(bolsistas.id, input.bolsistaId));

          console.log('[Bolsista] Deleted:', { bolsistaId: input.bolsistaId });

          return { success: true };
        } catch (error: any) {
          console.error('[Bolsista] Error deleting bolsista:', error);
          throw new Error(error.message || 'Erro ao deletar bolsista');
        }
      }),
  }),

  // Login by access code
  login: router({
    byAccessCode: publicProcedure
      .input(z.object({
        accessCode: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error('Banco de dados não disponível');

          // Find bolsista by access code
          const result = await database.select().from(bolsistas)
            .where(eq(bolsistas.accessCode, input.accessCode))
            .limit(1);

          if (result.length === 0) {
            throw new Error('Código de acesso inválido');
          }

          const bolsista = result[0];

          // Check if bolsista is active
          if (!bolsista.isActive) {
            throw new Error('Este código de acesso foi desativado');
          }

          // If bolsista already has a user, use existing user
          if (bolsista.userId) {
            const userResult = await database.select().from(users)
              .where(eq(users.id, bolsista.userId))
              .limit(1);

            if (userResult.length === 0) {
              throw new Error('Usuário não encontrado');
            }

            // Mark as used
            await database.update(bolsistas)
              .set({ usedAt: new Date() })
              .where(eq(bolsistas.id, bolsista.id));

            const user = userResult[0];

            // Create session
            const { sdk } = await import('./_core/sdk');
            const sessionToken = await sdk.createSessionToken(user.openId, {
              name: user.name || '',
              expiresInMs: 365 * 24 * 60 * 60 * 1000,
            });

            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

            console.log('[Login] Bolsista logged in (existing user):', { userId: user.id, bolsistaId: bolsista.id });

            return { success: true, message: 'Acesso concedido' };
          }

          // Create new user for bolsista
          const openId = crypto.randomBytes(16).toString('hex');
          
          const newUserResult = await database.insert(users).values({
            openId,
            name: bolsista.nome,
            userType: 'bolsista',
            registeredLocally: true,
            role: 'user',
          });

          const newUserId = (newUserResult as any)[0]?.insertId || (newUserResult as any).insertId;

          if (!newUserId || typeof newUserId !== 'number') {
            throw new Error('Erro ao criar usuário');
          }

          // Link bolsista to user
          await database.update(bolsistas)
            .set({
              userId: newUserId,
              usedAt: new Date(),
            })
            .where(eq(bolsistas.id, bolsista.id));

          // Get created user
          const createdUserResult = await database.select().from(users)
            .where(eq(users.openId, openId))
            .limit(1);

          if (createdUserResult.length === 0) {
            throw new Error('Erro ao recuperar usuário criado');
          }

          const user = createdUserResult[0];

          // Create session
          const { sdk } = await import('./_core/sdk');
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || '',
            expiresInMs: 365 * 24 * 60 * 60 * 1000,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

          console.log('[Login] Bolsista logged in (new user):', { userId: newUserId, bolsistaId: bolsista.id });

          return { success: true, message: 'Acesso concedido' };
        } catch (error: any) {
          console.error('[Login] Error logging in by access code:', error);
          throw new Error(error.message || 'Erro ao fazer login');
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
