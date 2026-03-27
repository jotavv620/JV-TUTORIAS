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
