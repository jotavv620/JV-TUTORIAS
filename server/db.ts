import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tutorias, feedbacks, checkins, disciplinas, professores, instituicoes, Tutoria, Feedback, Checkin, Disciplina, Professor, Instituicao } from "../drizzle/schema";
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

export async function createTutoria(userId: number, data: Omit<Tutoria, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tutorias).values({ ...data, userId });
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

export async function createProfessor(userId: number, nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(professores).values({ userId, nome });
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
