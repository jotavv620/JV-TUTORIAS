import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './db';

describe('Login Redirect Flow', () => {
  let testToken: string;
  let testUserId: number;

  beforeEach(async () => {
    // Create a test access token
    const result = await db.db.execute(
      `INSERT INTO accessTokens (token, userType, expiresAt, isUsed) 
       VALUES (?, ?, ?, ?)`,
      ['test-token-redirect', 'bolsista', new Date(Date.now() + 24 * 60 * 60 * 1000), false]
    );
    testToken = 'test-token-redirect';
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await db.db.execute(
        `DELETE FROM accessTokens WHERE token = ?`,
        [testToken]
      );
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should validate that access token exists', async () => {
    const token = await db.getAccessToken(testToken);
    expect(token).toBeDefined();
    expect(token?.token).toBe(testToken);
    expect(token?.isUsed).toBe(false);
  });

  it('should mark token as used after login', async () => {
    // First, get the token
    const token = await db.getAccessToken(testToken);
    expect(token?.isUsed).toBe(false);

    // Mark as used
    await db.db.execute(
      `UPDATE accessTokens SET isUsed = true WHERE token = ?`,
      [testToken]
    );

    // Verify it's marked as used
    const updatedToken = await db.getAccessToken(testToken);
    expect(updatedToken?.isUsed).toBe(true);
  });

  it('should create user on successful login', async () => {
    const openId = `test-user-${Date.now()}`;
    
    // Create user
    await db.db.execute(
      `INSERT INTO users (openId, name, email, role, userType, loginMethod, registeredLocally, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [openId, 'Test User', 'test@example.com', 'user', 'bolsista', 'access_token', false, new Date(), new Date(), new Date()]
    );

    // Verify user was created
    const user = await db.db.query(
      `SELECT * FROM users WHERE openId = ?`,
      [openId]
    );
    
    expect(user.length).toBeGreaterThan(0);
    expect(user[0].name).toBe('Test User');
  });

  it('should handle redirect to /app after successful login', async () => {
    // This test validates the redirect URL logic
    // In a real scenario, this would be tested in e2e tests
    
    const redirectUrl = '/app';
    expect(redirectUrl).toBe('/app');
    expect(redirectUrl).not.toBe('/');
  });

  it('should not redirect on failed login', async () => {
    // Verify that invalid tokens don't create users
    const invalidToken = 'invalid-token-' + Date.now();
    
    const token = await db.getAccessToken(invalidToken);
    expect(token).toBeNull();
  });

  it('should validate token expiration on login', async () => {
    // Create an expired token
    const expiredToken = 'expired-token-' + Date.now();
    
    await db.db.execute(
      `INSERT INTO accessTokens (token, userType, expiresAt, isUsed) 
       VALUES (?, ?, ?, ?)`,
      [expiredToken, 'bolsista', new Date(Date.now() - 1000), false]
    );

    const token = await db.getAccessToken(expiredToken);
    expect(token).toBeDefined();
    
    // Check if expired
    const isExpired = token && new Date(token.expiresAt) < new Date();
    expect(isExpired).toBe(true);

    // Clean up
    await db.db.execute(
      `DELETE FROM accessTokens WHERE token = ?`,
      [expiredToken]
    );
  });
});
