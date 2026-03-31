import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loginWithAccessToken, createAccessToken, deleteToken } from './_core/accessTokenService';
import { getDb } from './db';
import { users, eq } from '../drizzle/schema';

describe('Access Token Authentication', () => {
  let testTokenId: number;
  let testToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test access token
    const result = await createAccessToken(
      480115, // Admin user ID
      'Test User for Login',
      'bolsista',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    );
    testToken = result.token;
    testTokenId = result.id;
  });

  afterAll(async () => {
    // Clean up: delete the test token
    if (testTokenId) {
      try {
        await deleteToken(testTokenId);
      } catch (error) {
        console.error('Failed to clean up test token:', error);
      }
    }
    // Clean up: delete the test user if created
    if (testUserId) {
      try {
        const drizzleDb = await getDb();
        if (drizzleDb) {
          await drizzleDb.delete(users).where(eq(users.id, testUserId));
        }
      } catch (error) {
        console.error('Failed to clean up test user:', error);
      }
    }
  });

  it('should create a valid access token', async () => {
    expect(testToken).toBeDefined();
    expect(testToken.length).toBeGreaterThan(0);
    expect(testTokenId).toBeGreaterThan(0);
  });

  it('should login with a valid access token', async () => {
    const user = await loginWithAccessToken(testToken);
    
    expect(user).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
    expect(user.name).toBe('Test User for Login');
    expect(user.userType).toBe('bolsista');
    expect(user.email).toContain('@tutoria-manager.local');
    expect(user.openId).toBeDefined();
    expect(user.registeredLocally).toBe(true);
    expect(user.role).toBe('user'); // bolsista should have 'user' role
    
    testUserId = user.id;
  });

  it('should reject an invalid access token', async () => {
    try {
      await loginWithAccessToken('invalid_token_12345');
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid access token');
    }
  });

  it('should create a user with unique openId', async () => {
    // Create another token and login
    const result2 = await createAccessToken(
      480115,
      'Another Test User',
      'professor',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    const user2 = await loginWithAccessToken(result2.token);
    
    expect(user2.openId).not.toBe(testUserId); // Different users should have different openIds
    expect(user2.userType).toBe('professor');
    expect(user2.role).toBe('user'); // professor should also have 'user' role
    
    // Clean up
    await deleteToken(result2.id);
  });

  it('should create admin user with admin role', async () => {
    const result3 = await createAccessToken(
      480115,
      'Admin Test User',
      'admin',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    const adminUser = await loginWithAccessToken(result3.token);
    
    expect(adminUser.userType).toBe('admin');
    expect(adminUser.role).toBe('admin'); // admin should have 'admin' role
    
    // Clean up
    await deleteToken(result3.id);
  });

  it('should mark token as used after login', async () => {
    const result4 = await createAccessToken(
      480115,
      'Test User for Used Token',
      'bolsista',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    const user4 = await loginWithAccessToken(result4.token);
    expect(user4).toBeDefined();
    
    // Token should still be usable (we removed the "already used" check)
    const user4Again = await loginWithAccessToken(result4.token);
    expect(user4Again).toBeDefined();
    expect(user4Again.id).toBe(user4.id); // Should return the same user
    
    // Clean up
    await deleteToken(result4.id);
  });
});
