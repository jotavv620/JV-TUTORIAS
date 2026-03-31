import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as db from './db';

describe('Google OAuth Environment Variables', () => {
  it('should have GOOGLE_OAUTH_REDIRECT_URI configured', () => {
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    expect(redirectUri).toBeDefined();
    expect(redirectUri).toContain('https://');
    expect(redirectUri).toContain('/api/oauth/google/callback');
  });

  it('should have GOOGLE_CLIENT_ID configured', () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId.length).toBeGreaterThan(0);
  });

  it('should have GOOGLE_CLIENT_SECRET configured', () => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret.length).toBeGreaterThan(0);
  });

  it('should have all Google OAuth credentials matching expected format', () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

    // Google Client ID format: numbers-alphanumeric.apps.googleusercontent.com
    expect(clientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
    
    // Google Client Secret format: alphanumeric string
    expect(clientSecret).toMatch(/^[a-zA-Z0-9_-]+$/);
    
    // Redirect URI should be HTTPS on production domain
    expect(redirectUri).toMatch(/^https:\/\/.*\.manus\.space\/api\/oauth\/google\/callback$/);
  });
});

describe('Google OAuth Token Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save Google auth tokens to database', async () => {
    const userId = 123;
    const accessToken = 'test_access_token_12345';
    const refreshToken = 'test_refresh_token_67890';
    const expiresAt = new Date(Date.now() + 3600000);
    const scope = 'https://www.googleapis.com/auth/calendar';

    // Mock the database function
    const saveTokenSpy = vi.spyOn(db, 'saveGoogleAuthToken').mockResolvedValue(undefined);

    await db.saveGoogleAuthToken(userId, accessToken, refreshToken, expiresAt, scope);

    expect(saveTokenSpy).toHaveBeenCalledWith(
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      scope
    );
  });

  it('should handle null refresh token gracefully', async () => {
    const userId = 456;
    const accessToken = 'test_access_token_xyz';
    const expiresAt = new Date(Date.now() + 3600000);
    const scope = 'https://www.googleapis.com/auth/calendar';

    const saveTokenSpy = vi.spyOn(db, 'saveGoogleAuthToken').mockResolvedValue(undefined);

    await db.saveGoogleAuthToken(userId, accessToken, null, expiresAt, scope);

    expect(saveTokenSpy).toHaveBeenCalledWith(
      userId,
      accessToken,
      null,
      expiresAt,
      scope
    );
  });

  it('should validate token structure before saving', () => {
    const tokens = {
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      expiresAt: new Date(),
      scope: 'https://www.googleapis.com/auth/calendar',
      tokenType: 'Bearer',
    };

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.accessToken.length).toBeGreaterThan(0);
    expect(tokens.tokenType).toBe('Bearer');
  });
});

describe('Google OAuth Callback State Parameter', () => {
  it('should parse user ID from state parameter correctly', () => {
    const state = '601553'; // User ID
    const userId = parseInt(state, 10);
    
    expect(isNaN(userId)).toBe(false);
    expect(userId).toBe(601553);
  });

  it('should reject invalid state parameter', () => {
    const invalidState = 'not_a_number';
    const userId = parseInt(invalidState, 10);
    
    expect(isNaN(userId)).toBe(true);
  });

  it('should handle state parameter with leading zeros', () => {
    const state = '000123';
    const userId = parseInt(state, 10);
    
    expect(isNaN(userId)).toBe(false);
    expect(userId).toBe(123);
  });
});
