import crypto from 'crypto';
import { getDb } from '../db';
import { users, accessTokens } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Generate a secure random access token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an access token for a user
 */
export async function createAccessToken(
  createdByUserId: number,
  name: string,
  userType: 'admin' | 'professor' | 'bolsista',
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const token = generateSecureToken();

  // Use raw SQL to avoid Drizzle ORM issues with default values
  const expiresAtSql = expiresAt ? sql`${expiresAt}` : sql`NULL`;
  
  const result = await db.execute(
    sql`INSERT INTO accessTokens (token, createdByUserId, name, userType, expiresAt, isActive) 
        VALUES (${token}, ${createdByUserId}, ${name}, ${userType}, ${expiresAtSql}, 1)`
  );

  return {
    token,
    id: (result as any)[0].insertId,
  };
}

/**
 * Validate and use an access token for login
 */
export async function loginWithAccessToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Find the token
  const tokenResult = await db
    .select()
    .from(accessTokens)
    .where(eq(accessTokens.token, token))
    .limit(1);

  if (tokenResult.length === 0) {
    throw new Error('Invalid access token');
  }

  const accessToken = tokenResult[0];

  // Check if token is active
  if (!accessToken.isActive) {
    throw new Error('Access token is inactive');
  }

  // Check if token is expired
  if (accessToken.expiresAt && new Date() > accessToken.expiresAt) {
    throw new Error('Access token has expired');
  }

  // Check if token was already used
  if (accessToken.usedAt) {
    throw new Error('Access token has already been used');
  }

  // If token already has a userId, use existing user
  if (accessToken.userId) {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, accessToken.userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error('User not found');
    }

    // Mark token as used
    await db
      .update(accessTokens)
      .set({ usedAt: new Date() })
      .where(eq(accessTokens.id, accessToken.id));

    return userResult[0];
  }

  // Create new user from token
  const newUserResult = await db.insert(users).values({
    name: accessToken.name,
    email: `user_${accessToken.id}@tutoria-manager.local`,
    openId: `token_${accessToken.id}_${Date.now()}`,
    loginMethod: 'token',
    userType: accessToken.userType,
    registeredLocally: true,
    role: accessToken.userType === 'admin' ? 'admin' : 'user',
  });

  const newUserId = (newUserResult as any).insertId;

  // Link token to user and mark as used
  await db
    .update(accessTokens)
    .set({
      userId: newUserId,
      usedAt: new Date(),
    })
    .where(eq(accessTokens.id, accessToken.id));

  // Get the created user
  const createdUserResult = await db
    .select()
    .from(users)
    .where(eq(users.id, newUserId))
    .limit(1);

  if (createdUserResult.length === 0) {
    throw new Error('Failed to create user');
  }

  return createdUserResult[0];
}

/**
 * Get all access tokens created by an admin
 */
export async function getTokensByAdmin(adminUserId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(accessTokens)
    .where(eq(accessTokens.createdByUserId, adminUserId));
}

/**
 * Deactivate an access token
 */
export async function deactivateToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .update(accessTokens)
    .set({ isActive: false })
    .where(eq(accessTokens.id, tokenId));
}

/**
 * Delete an access token
 */
export async function deleteToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db.delete(accessTokens).where(eq(accessTokens.id, tokenId));
}
