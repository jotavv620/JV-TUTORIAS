import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { publicProcedure } from "./trpc";
import { z } from "zod";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "./cookies";
import { getDb } from "../db";

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    userType: z.enum(["admin", "professor", "bolsista"]).default("bolsista"),
  }))
  .mutation(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");
      
      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error("Email já cadastrado");
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      // Create user
      await db.insert(users).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        userType: input.userType,
        registeredLocally: true,
        loginMethod: 'local',
        openId: `local_${input.email}_${Date.now()}`,
      });
      
      // Get the created user
      const newUserResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
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
  });

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Senha é obrigatória"),
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");
      
      // Get user by email
      const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
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
  });
