import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  registeredLocally: boolean("registeredLocally").default(false).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["admin", "professor", "bolsista"]).default("bolsista").notNull(),
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
  bolsista: varchar("bolsista", { length: 255 }).notNull(),
  data: varchar("data", { length: 10 }).notNull(),
  horario: varchar("horario", { length: 5 }).notNull(),
  horarioTermino: varchar("horarioTermino", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed"]).default("scheduled").notNull(),
  reminder_sent: boolean("reminder_sent").default(false).notNull(),
  googleCalendarEventId: varchar("googleCalendarEventId", { length: 255 }),
  googleCalendarSynced: boolean("googleCalendarSynced").default(false).notNull(),
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
  email: varchar("email", { length: 320 }),
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

// Bolsistas table
export const bolsistas = mysqlTable("bolsistas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bolsista = typeof bolsistas.$inferSelect;
export type InsertBolsista = typeof bolsistas.$inferInsert;

export type Instituicao = typeof instituicoes.$inferSelect;
export type InsertInstituicao = typeof instituicoes.$inferInsert;

// Gamification - Professor Points
export const professorPoints = mysqlTable("professorPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorName: varchar("professorName", { length: 255 }).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  tutoriasCompleted: int("tutoriasCompleted").default(0).notNull(),
  averageRating: varchar("averageRating", { length: 10 }).default("0.0").notNull(),
  currentMedal: mysqlEnum("currentMedal", ["none", "bronze", "silver", "gold", "platinum"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProfessorPoints = typeof professorPoints.$inferSelect;
export type InsertProfessorPoints = typeof professorPoints.$inferInsert;

// Gamification - Medals
export const medals = mysqlTable("medals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorName: varchar("professorName", { length: 255 }).notNull(),
  medalType: mysqlEnum("medalType", ["bronze", "silver", "gold", "platinum"]).notNull(),
  pointsRequired: int("pointsRequired").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Medal = typeof medals.$inferSelect;
export type InsertMedal = typeof medals.$inferInsert;

// Gamification - Achievements
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorName: varchar("professorName", { length: 255 }).notNull(),
  achievementType: mysqlEnum("achievementType", [
    "first_tutoria",
    "ten_tutorias",
    "fifty_tutorias",
    "perfect_rating",
    "consistency",
    "rising_star",
    "master_teacher",
    "legendary"
  ]).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  pointsReward: int("pointsReward").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// Gamification - Leaderboard (cached for performance)
export const leaderboard = mysqlTable("leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorName: varchar("professorName", { length: 255 }).notNull(),
  rank: int("rank").notNull(),
  totalPoints: int("totalPoints").notNull(),
  tutoriasCompleted: int("tutoriasCompleted").notNull(),
  averageRating: varchar("averageRating", { length: 10 }).notNull(),
  currentMedal: mysqlEnum("currentMedal", ["none", "bronze", "silver", "gold", "platinum"]).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;


// Google OAuth Tokens
export const googleAuthTokens = mysqlTable("googleAuthTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  scope: text("scope"),
  tokenType: varchar("tokenType", { length: 50 }).default("Bearer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleAuthToken = typeof googleAuthTokens.$inferSelect;
export type InsertGoogleAuthToken = typeof googleAuthTokens.$inferInsert;
