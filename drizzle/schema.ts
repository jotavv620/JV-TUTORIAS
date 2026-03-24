import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tutorias table
export const tutorias = mysqlTable("tutorias", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  disciplina: varchar("disciplina", { length: 255 }).notNull(),
  professor: varchar("professor", { length: 255 }).notNull(),
  instituicao: varchar("instituicao", { length: 255 }).notNull(),
  tutor: varchar("tutor", { length: 255 }).notNull(),
  data: varchar("data", { length: 10 }).notNull(),
  horario: varchar("horario", { length: 5 }).notNull(),
  horarioTermino: varchar("horarioTermino", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tutoria = typeof tutorias.$inferSelect;
export type InsertTutoria = typeof tutorias.$inferInsert;

// Feedback table
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  tutoriaId: int("tutoriaId").notNull().references(() => tutorias.id, { onDelete: "cascade" }),
  pontualidade: int("pontualidade").notNull(),
  audio: int("audio").notNull(),
  conteudo: int("conteudo").notNull(),
  comentarios: text("comentarios"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

// Check-in table
export const checkins = mysqlTable("checkins", {
  id: int("id").autoincrement().primaryKey(),
  tutoriaId: int("tutoriaId").notNull().references(() => tutorias.id, { onDelete: "cascade" }),
  timestamp: varchar("timestamp", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = typeof checkins.$inferInsert;

// Configurações (Disciplinas, Professores, Instituições)
export const disciplinas = mysqlTable("disciplinas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Disciplina = typeof disciplinas.$inferSelect;
export type InsertDisciplina = typeof disciplinas.$inferInsert;

export const professores = mysqlTable("professores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Professor = typeof professores.$inferSelect;
export type InsertProfessor = typeof professores.$inferInsert;

export const instituicoes = mysqlTable("instituicoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Instituicao = typeof instituicoes.$inferSelect;
export type InsertInstituicao = typeof instituicoes.$inferInsert;