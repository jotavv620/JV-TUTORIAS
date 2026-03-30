import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import {
  sendBolsistaAccessCodeEmail,
} from "./_core/emailService";
import { eq } from "drizzle-orm";
import { users, bolsistas } from "../drizzle/schema";
import crypto from 'crypto';
import { getSessionCookieOptions } from "./_core/cookies";

export const appRouter = router({
  system: systemRouter,
  
  // Authentication router
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
  }),

  // Bolsista management router
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
        
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({
        bolsistaId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.deleteBolsista(input.bolsistaId);
        return result;
      }),
  }),

  // Login router
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
