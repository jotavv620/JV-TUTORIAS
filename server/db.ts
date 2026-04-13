import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tutorias, feedbacks, checkins, disciplinas, professores, instituicoes, professorPoints, medals, achievements, leaderboard, bolsistas, googleAuthTokens, accessTokens, syncHistory, emailLog, Tutoria, Feedback, Checkin, Disciplina, Professor, Instituicao, ProfessorPoints, Medal, Achievement, Leaderboard, Bolsista, GoogleAuthToken, AccessToken, InsertAccessToken, SyncHistory, InsertSyncHistory, EmailLog, InsertEmailLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Tutorias queries
export async function getTutoriasByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tutorias).where(eq(tutorias.userId, userId));
}

export async function getAllTutorias() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tutorias);
}

export async function createTutoria(userId: number, data: Omit<Tutoria, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tutorias).values({ ...data, userId, reminder_sent: false });
  return result;
}

export async function updateTutoriaStatus(tutoriaId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tutorias).set({ status: status as any }).where(eq(tutorias.id, tutoriaId));
}

export async function deleteTutoria(tutoriaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tutorias).where(eq(tutorias.id, tutoriaId));
}

// Feedback queries
export async function createFeedback(tutoriaId: number, data: Omit<Feedback, 'id' | 'tutoriaId' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(feedbacks).values({ ...data, tutoriaId });
}

export async function getFeedbackByTutoriaId(tutoriaId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(feedbacks).where(eq(feedbacks.tutoriaId, tutoriaId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Check-in queries
export async function createCheckin(tutoriaId: number, data: Omit<Checkin, 'id' | 'tutoriaId' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(checkins).values({ ...data, tutoriaId });
}

export async function getCheckinByTutoriaId(tutoriaId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(checkins).where(eq(checkins.tutoriaId, tutoriaId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Configuracoes queries
export async function getDisciplinasByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(disciplinas).where(eq(disciplinas.userId, userId));
}

export async function getAllDisciplinas() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(disciplinas);
}

export async function createDisciplina(userId: number, nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(disciplinas).values({ userId, nome });
}

export async function deleteDisciplina(disciplinaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(disciplinas).where(eq(disciplinas.id, disciplinaId));
}

export async function getProfessoresByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(professores).where(eq(professores.userId, userId));
}

export async function getAllProfessores() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(professores);
}

export async function createProfessor(userId: number, nome: string, email?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(professores).values({ userId, nome, email: email || null });
}

export async function deleteProfessor(professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(professores).where(eq(professores.id, professorId));
}

export async function getInstituicoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(instituicoes).where(eq(instituicoes.userId, userId));
}

export async function getAllInstituicoes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(instituicoes);
}

export async function createInstituicao(userId: number, nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(instituicoes).values({ userId, nome });
}

export async function deleteInstituicao(instituicaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(instituicoes).where(eq(instituicoes.id, instituicaoId));
}


// Gamification queries

// Get or create professor points
export async function getProfessorPoints(userId: number, professorName: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(professorPoints).where(
    eq(professorPoints.userId, userId) && eq(professorPoints.professorName, professorName)
  ).limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Update professor points
export async function updateProfessorPoints(userId: number, professorName: string, points: number, tutoriasCompleted: number, averageRating: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getProfessorPoints(userId, professorName);
  
  if (existing) {
    return await db.update(professorPoints).set({
      totalPoints: existing.totalPoints + points,
      tutoriasCompleted: tutoriasCompleted,
      averageRating: averageRating,
      updatedAt: new Date(),
    }).where(eq(professorPoints.id, existing.id));
  } else {
    return await db.insert(professorPoints).values({
      userId,
      professorName,
      totalPoints: points,
      tutoriasCompleted,
      averageRating,
    });
  }
}

// Get medals for professor
export async function getMedalsByProfessor(userId: number, professorName: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(medals).where(
    eq(medals.userId, userId) && eq(medals.professorName, professorName)
  );
}

// Award medal
export async function awardMedal(userId: number, professorName: string, medalType: 'bronze' | 'silver' | 'gold' | 'platinum', pointsRequired: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already has this medal
  const existing = await db.select().from(medals).where(
    eq(medals.userId, userId) && eq(medals.professorName, professorName) && eq(medals.medalType, medalType)
  ).limit(1);
  
  if (existing.length > 0) return null; // Already has this medal
  
  return await db.insert(medals).values({
    userId,
    professorName,
    medalType,
    pointsRequired,
  });
}

// Get achievements for professor
export async function getAchievementsByProfessor(userId: number, professorName: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(achievements).where(
    eq(achievements.userId, userId) && eq(achievements.professorName, professorName)
  );
}

// Award achievement
export async function awardAchievement(userId: number, professorName: string, achievementType: string, description: string, icon: string, pointsReward: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already has this achievement
  const existing = await db.select().from(achievements).where(
    eq(achievements.userId, userId) && eq(achievements.professorName, professorName) && eq(achievements.achievementType, achievementType as any)
  ).limit(1);
  
  if (existing.length > 0) return null; // Already has this achievement
  
  return await db.insert(achievements).values({
    userId,
    professorName,
    achievementType: achievementType as any,
    description,
    icon,
    pointsReward,
  });
}

// Get leaderboard for user
export async function getLeaderboardByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(leaderboard).where(eq(leaderboard.userId, userId));
}

// Update leaderboard
export async function updateLeaderboard(userId: number, professorName: string, rank: number, totalPoints: number, tutoriasCompleted: number, averageRating: string, currentMedal: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(leaderboard).where(
    eq(leaderboard.userId, userId) && eq(leaderboard.professorName, professorName)
  ).limit(1);
  
  if (existing.length > 0) {
    return await db.update(leaderboard).set({
      rank,
      totalPoints,
      tutoriasCompleted,
      averageRating,
      currentMedal: currentMedal as any,
      updatedAt: new Date(),
    }).where(eq(leaderboard.id, existing[0].id));
  } else {
    return await db.insert(leaderboard).values({
      userId,
      professorName,
      rank,
      totalPoints,
      tutoriasCompleted,
      averageRating,
      currentMedal: currentMedal as any,
    });
  }
}

// Calculate points from tutoria
export function calculateTutoriaPoints(status: string, feedback: any): number {
  let points = 0;
  
  // Base points for completing tutoria
  if (status === 'completed') {
    points += 10;
  } else if (status === 'in_progress') {
    points += 5;
  }
  
  // Bonus points for feedback
  if (feedback) {
    const avgRating = (feedback.pontualidade + feedback.audio + feedback.conteudo) / 3;
    if (avgRating >= 4.5) {
      points += 15; // Excellent
    } else if (avgRating >= 3.5) {
      points += 10; // Good
    } else {
      points += 5; // Regular
    }
  }
  
  return points;
}

// Determine medal based on points
export function determineMedal(points: number): 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (points >= 500) return 'platinum';
  if (points >= 300) return 'gold';
  if (points >= 150) return 'silver';
  if (points >= 50) return 'bronze';
  return 'none';
}

// Bolsista functions
export async function createBolsista(userId: number, nome: string, email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(bolsistas).values({
    userId,
    nome,
    email,
  });
}

export async function getBolsistasByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bolsistas).where(eq(bolsistas.userId, userId));
}

export async function getAllBolsistas() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bolsistas);
}

export async function deleteBolsista(bolsistaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(bolsistas).where(eq(bolsistas.id, bolsistaId));
}

export async function updateProfessorEmail(professorId: number, email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(professores).set({ email }).where(eq(professores.id, professorId));
}

export async function updateBolsistaEmail(bolsistaId: number, email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(bolsistas).set({ email }).where(eq(bolsistas.id, bolsistaId));
}

export async function getProfessorByName(nome: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(professores).where(eq(professores.nome, nome)).limit(1);
  return result[0] || null;
}

export async function getBolsistaByName(nome: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bolsistas).where(eq(bolsistas.nome, nome)).limit(1);
  return result[0] || null;
}


// Local authentication functions
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function createLocalUser(data: {
  name: string;
  email: string;
  password: string;
  userType: 'admin' | 'professor' | 'bolsista';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if email already exists
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error("Email já cadastrado");
  }
  
  return await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: data.password,
    userType: data.userType,
    registeredLocally: true,
    loginMethod: 'local',
    openId: `local_${data.email}_${Date.now()}`,
  });
}

export async function verifyLocalUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }
  
  // In production, compare hashed password
  // For now, just return user if password matches
  if (user.password === password) {
    return user;
  }
  
  return null;
}

// Google Calendar sync functions
export async function updateTutoriaGoogleCalendarSync(
  tutoriaId: number,
  googleCalendarEventId: string,
  googleCalendarSynced: boolean = true
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(tutorias).set({
    googleCalendarEventId,
    googleCalendarSynced,
  }).where(eq(tutorias.id, tutoriaId));
}

export async function getTutoriaById(tutoriaId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tutorias).where(eq(tutorias.id, tutoriaId)).limit(1);
  return result[0] || null;
}

// Google OAuth Token functions
export async function saveGoogleAuthToken(
  userId: number,
  accessToken: string | null | undefined,
  refreshToken: string | null | undefined,
  expiresAt: Date | null | undefined,
  scope: string | null | undefined
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Ensure accessToken is provided (required field)
  if (!accessToken) {
    throw new Error("accessToken is required for saveGoogleAuthToken");
  }
  
  return await db.insert(googleAuthTokens).values({
    userId,
    accessToken,
    refreshToken: refreshToken || null,
    expiresAt: expiresAt || null,
    scope: scope || null,
    tokenType: 'Bearer',
  }).onDuplicateKeyUpdate({
    set: {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: expiresAt || null,
      scope: scope || null,
      updatedAt: new Date(),
    },
  });
}

export async function getGoogleAuthToken(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(googleAuthTokens).where(eq(googleAuthTokens.userId, userId)).limit(1);
  return result[0] || null;
}

export async function deleteGoogleAuthToken(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(googleAuthTokens).where(eq(googleAuthTokens.userId, userId));
}

export async function updateGoogleAuthTokenExpiry(userId: number, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(googleAuthTokens).set({
    expiresAt,
    updatedAt: new Date(),
  }).where(eq(googleAuthTokens.userId, userId));
}


// Access token functions
export async function generateAccessToken(createdByUserId: number, name: string, userType: 'admin' | 'professor' | 'bolsista', expiresAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate random token (32 bytes hex)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return await db.insert(accessTokens).values({
    token,
    createdByUserId,
    name,
    userType,
    expiresAt: expiresAt || null,
    isActive: true,
  });
}

export async function validateAccessToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(accessTokens).where(
    eq(accessTokens.token, token)
  ).limit(1);
  
  if (result.length === 0) return null;
  
  const accessToken = result[0];
  
  // Check if token is active
  if (!accessToken.isActive) return null;
  
  // Check if token is expired
  if (accessToken.expiresAt && new Date() > accessToken.expiresAt) return null;
  
  // Check if token was already used
  if (accessToken.usedAt) return null;
  
  return accessToken;
}

export async function useAccessToken(tokenId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(accessTokens).set({
    userId,
    usedAt: new Date(),
  }).where(eq(accessTokens.id, tokenId));
}

export async function getAccessTokensByAdmin(createdByUserId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(accessTokens).where(
    eq(accessTokens.createdByUserId, createdByUserId)
  );
}

export async function deactivateAccessToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(accessTokens).set({
    isActive: false,
  }).where(eq(accessTokens.id, tokenId));
}


// Access Token functions
export async function createAccessToken(data: {
  token: string;
  name: string;
  userType: 'admin' | 'professor' | 'bolsista';
  createdByUserId: number;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(accessTokens).values({
    token: data.token,
    name: data.name,
    userType: data.userType,
    createdByUserId: data.createdByUserId,
    expiresAt: data.expiresAt,
    isActive: true,
  });
}

export async function getAccessTokensByCreatedBy(createdByUserId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(accessTokens).where(eq(accessTokens.createdByUserId, createdByUserId));
}

export async function getAccessTokenByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(accessTokens).where(eq(accessTokens.token, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function revokeAccessToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(accessTokens).set({ isActive: false }).where(eq(accessTokens.id, tokenId));
}

export async function markAccessTokenAsUsed(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(accessTokens).set({ usedAt: new Date() }).where(eq(accessTokens.id, tokenId));
}

export async function getAllAccessTokens() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(accessTokens);
}

export async function deleteAccessToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(accessTokens).where(eq(accessTokens.id, tokenId));
}


// Sync history functions
export async function recordSyncHistory(data: InsertSyncHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(syncHistory).values(data);
}

export async function getSyncHistoryByTutoriaId(tutoriaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(syncHistory).where(eq(syncHistory.tutoriaId, tutoriaId));
}

export async function getAllSyncHistory(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(syncHistory).orderBy((t) => t.createdAt).limit(limit).offset(offset);
}

export async function updateSyncHistoryStatus(syncId: number, status: 'success' | 'error' | 'pending', message?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (message) updateData.message = message;
  
  return await db.update(syncHistory).set(updateData).where(eq(syncHistory.id, syncId));
}

// Email log functions
export async function recordEmailLog(data: InsertEmailLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(emailLog).values(data);
}

export async function getEmailLogByTutoriaId(tutoriaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(emailLog).where(eq(emailLog.tutoriaId, tutoriaId));
}

export async function getAllEmailLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(emailLog).orderBy((t) => t.createdAt).limit(limit).offset(offset);
}

export async function updateEmailLogStatus(emailId: number, status: 'sent' | 'failed' | 'pending', errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (errorMessage) updateData.errorMessage = errorMessage;
  if (status === 'sent') updateData.sentAt = new Date();
  
  return await db.update(emailLog).set(updateData).where(eq(emailLog.id, emailId));
}


/**
 * Get all tutorias that need reminders (24h before and reminder not sent yet)
 */
export async function getTutoriasNeedingReminder() {
  const db = await getDb();
  if (!db) return [];
  
  // Calculate the time window: 23h to 25h from now
  const now = new Date();
  const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  
  // Get today's date in YYYY-MM-DD format
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Get tutorias scheduled for tomorrow that haven't had reminders sent
  const result = await db
    .select()
    .from(tutorias)
    .where((t) => {
      const conditions = [];
      // Get tutorias for tomorrow
      conditions.push(eq(t.data, tomorrow));
      // That haven't had reminders sent yet
      conditions.push(eq(t.reminder_sent, false));
      // And are still scheduled (not completed)
      conditions.push(eq(t.status, 'scheduled'));
      
      return conditions.reduce((a, b) => and(a, b) as any);
    });
  
  return result || [];
}

/**
 * Mark a tutoria reminder as sent
 */
export async function markReminderSent(tutoriaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .update(tutorias)
    .set({ reminder_sent: true })
    .where(eq(tutorias.id, tutoriaId));
}


// Get all feedbacks with tutoria details (admin-only)
export async function getAllFeedbacksWithFilters(filters: {
  professor?: string;
  disciplina?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { and, gte, lte } = await import('drizzle-orm');
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Get all feedbacks with tutoria info
  const allFeedbacks = await db
    .select({
      id: feedbacks.id,
      tutoriaId: feedbacks.tutoriaId,
      pontualidade: feedbacks.pontualidade,
      audio: feedbacks.audio,
      conteudo: feedbacks.conteudo,
      comentarios: feedbacks.comentarios,
      createdAt: feedbacks.createdAt,
      professor: tutorias.professor,
      disciplina: tutorias.disciplina,
      instituicao: tutorias.instituicao,
      bolsista: tutorias.bolsista,
      data: tutorias.data,
      horario: tutorias.horario,
    })
    .from(feedbacks)
    .innerJoin(tutorias, eq(feedbacks.tutoriaId, tutorias.id));

  // Apply filters
  let filtered = allFeedbacks;

  if (filters.professor) {
    filtered = filtered.filter(f => f.professor === filters.professor);
  }

  if (filters.disciplina) {
    filtered = filtered.filter(f => f.disciplina === filters.disciplina);
  }

  if (filters.startDate) {
    filtered = filtered.filter(f => f.data >= filters.startDate!);
  }

  if (filters.endDate) {
    filtered = filtered.filter(f => f.data <= filters.endDate!);
  }

  if (filters.minRating || filters.maxRating) {
    filtered = filtered.filter(f => {
      const avg = (f.pontualidade + f.audio + f.conteudo) / 3;
      if (filters.minRating && avg < filters.minRating) return false;
      if (filters.maxRating && avg > filters.maxRating) return false;
      return true;
    });
  }

  // Sort by date descending
  filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const paginatedResults = filtered.slice(offset, offset + limit);

  return { feedbacks: paginatedResults, total, page, limit };
}

// Get feedback statistics (admin-only)
export async function getFeedbackStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allFeedbacks = await db.select().from(feedbacks);
  
  if (allFeedbacks.length === 0) {
    return {
      totalFeedbacks: 0,
      averagePontualidade: "0.00",
      averageAudio: "0.00",
      averageConteudo: "0.00",
      averageOverall: "0.00",
      topProfessors: [],
    };
  }

  const avgPontualidade = (allFeedbacks.reduce((sum, f) => sum + f.pontualidade, 0) / allFeedbacks.length).toFixed(2);
  const avgAudio = (allFeedbacks.reduce((sum, f) => sum + f.audio, 0) / allFeedbacks.length).toFixed(2);
  const avgConteudo = (allFeedbacks.reduce((sum, f) => sum + f.conteudo, 0) / allFeedbacks.length).toFixed(2);
  const avgOverall = (((parseFloat(avgPontualidade) + parseFloat(avgAudio) + parseFloat(avgConteudo)) / 3)).toFixed(2);

  // Get top professors
  const feedbacksWithTutorias = await db
    .select({
      professor: tutorias.professor,
      pontualidade: feedbacks.pontualidade,
      audio: feedbacks.audio,
      conteudo: feedbacks.conteudo,
    })
    .from(feedbacks)
    .innerJoin(tutorias, eq(feedbacks.tutoriaId, tutorias.id));

  const professorStats: Record<string, any> = {};
  feedbacksWithTutorias.forEach((f) => {
    if (!professorStats[f.professor]) {
      professorStats[f.professor] = { count: 0, totalRating: 0 };
    }
    professorStats[f.professor].count++;
    professorStats[f.professor].totalRating += (f.pontualidade + f.audio + f.conteudo) / 3;
  });

  const topProfessors = Object.entries(professorStats)
    .map(([name, stats]) => ({
      professor: name,
      feedbackCount: stats.count,
      averageRating: (stats.totalRating / stats.count).toFixed(2),
    }))
    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
    .slice(0, 10);

  return {
    totalFeedbacks: allFeedbacks.length,
    averagePontualidade: avgPontualidade,
    averageAudio: avgAudio,
    averageConteudo: avgConteudo,
    averageOverall: avgOverall,
    topProfessors,
  };
}
