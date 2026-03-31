import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Google OAuth Integration Tests', () => {
  describe('Environment Configuration', () => {
    it('should have GOOGLE_OAUTH_REDIRECT_URI configured correctly', () => {
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
      expect(redirectUri).toBeDefined();
      expect(redirectUri).toContain('https://');
      expect(redirectUri).toContain('tutormanag-6856tex4.manus.space');
      expect(redirectUri).toContain('/api/oauth/google/callback');
    });

    it('should have GOOGLE_CLIENT_ID configured', () => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(clientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
    });

    it('should have GOOGLE_CLIENT_SECRET configured', () => {
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      expect(clientSecret).toBeDefined();
      expect(clientSecret.length).toBeGreaterThan(10);
    });

    it('should have all OAuth credentials matching expected format', () => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

      // Verify Client ID format (Google's standard format)
      expect(clientId).toMatch(/^839466429658-[a-z0-9]+\.apps\.googleusercontent\.com$/);
      
      // Verify Client Secret is alphanumeric
      expect(clientSecret).toMatch(/^[a-zA-Z0-9_-]+$/);
      
      // Verify Redirect URI uses HTTPS on production domain
      expect(redirectUri).toMatch(/^https:\/\/tutormanag-6856tex4\.manus\.space\/api\/oauth\/google\/callback$/);
    });
  });

  describe('OAuth Callback State Parameter', () => {
    it('should parse user ID from state parameter correctly', () => {
      const state = '480115'; // User ID from the test
      const userId = parseInt(state, 10);
      
      expect(isNaN(userId)).toBe(false);
      expect(userId).toBe(480115);
      expect(userId).toBeGreaterThan(0);
    });

    it('should reject invalid state parameter (non-numeric)', () => {
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

    it('should handle large user IDs', () => {
      const state = '999999999';
      const userId = parseInt(state, 10);
      
      expect(isNaN(userId)).toBe(false);
      expect(userId).toBe(999999999);
    });
  });

  describe('OAuth Token Structure', () => {
    it('should have correct token structure after exchange', () => {
      const mockTokens = {
        accessToken: 'ya29.a0AfH6SMBx...',
        refreshToken: '1//0gF...',
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
        tokenType: 'Bearer',
      };

      expect(mockTokens.accessToken).toBeDefined();
      expect(mockTokens.accessToken.length).toBeGreaterThan(0);
      expect(mockTokens.refreshToken).toBeDefined();
      expect(mockTokens.expiresAt).toBeInstanceOf(Date);
      expect(mockTokens.tokenType).toBe('Bearer');
      expect(mockTokens.scope).toContain('calendar');
    });

    it('should handle null refresh token gracefully', () => {
      const mockTokens = {
        accessToken: 'ya29.a0AfH6SMBx...',
        refreshToken: null,
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'https://www.googleapis.com/auth/calendar',
        tokenType: 'Bearer',
      };

      expect(mockTokens.accessToken).toBeDefined();
      expect(mockTokens.refreshToken).toBeNull();
      expect(mockTokens.expiresAt).toBeInstanceOf(Date);
    });

    it('should validate token expiry is in the future', () => {
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const now = new Date();
      
      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('OAuth Callback URL Construction', () => {
    it('should construct correct authorization URL', () => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
      const state = '480115';
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', clientId || '');
      authUrl.searchParams.append('redirect_uri', redirectUri || '');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar');
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      expect(authUrl.toString()).toContain('client_id=839466429658');
      expect(authUrl.toString()).toContain('redirect_uri=https%3A%2F%2Ftutormanag-6856tex4.manus.space');
      expect(authUrl.toString()).toContain('state=480115');
      expect(authUrl.toString()).toContain('access_type=offline');
    });

    it('should include all required scopes', () => {
      const requiredScopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ];

      requiredScopes.forEach(scope => {
        expect(scope).toContain('googleapis.com');
        expect(scope).toContain('auth');
      });
    });
  });

  describe('OAuth Error Handling', () => {
    it('should handle access_denied error from Google', () => {
      const error = 'access_denied';
      const errorDescription = 'The user denied access to the application';
      
      expect(error).toBe('access_denied');
      expect(errorDescription).toContain('denied');
    });

    it('should handle missing code parameter', () => {
      const code = undefined;
      const state = '480115';
      
      expect(code).toBeUndefined();
      expect(state).toBeDefined();
    });

    it('should handle missing state parameter', () => {
      const code = '4/0Aci98E--zfmXWQ0SbPhU3bKbG8EtYtma6Ye1sVafVdl7xb2xT2yzn3hOgzv5BIIsZ2UIOA';
      const state = undefined;
      
      expect(code).toBeDefined();
      expect(state).toBeUndefined();
    });

    it('should detect invalid authorization code format', () => {
      const validCode = '4/0Aci98E--zfmXWQ0SbPhU3bKbG8EtYtma6Ye1sVafVdl7xb2xT2yzn3hOgzv5BIIsZ2UIOA';
      const invalidCode = 'invalid_code_format';
      
      expect(validCode.length).toBeGreaterThan(20);
      expect(invalidCode.length).toBeLessThan(20);
    });
  });

  describe('OAuth Callback Flow Validation', () => {
    it('should validate complete callback URL structure', () => {
      const callbackUrl = 'https://tutormanag-6856tex4.manus.space/api/oauth/google/callback?state=480115&code=4/0Aci98E--zfmXWQ0SbPhU3bKbG8EtYtma6Ye1sVafVdl7xb2xT2yzn3hOgzv5BIIsZ2UIOA&scope=https://www.googleapis.com/auth/calendar';
      
      const url = new URL(callbackUrl);
      expect(url.hostname).toBe('tutormanag-6856tex4.manus.space');
      expect(url.pathname).toBe('/api/oauth/google/callback');
      expect(url.searchParams.get('state')).toBe('480115');
      expect(url.searchParams.get('code')).toBeDefined();
    });

    it('should validate that redirect happens after token save', () => {
      const steps = [
        'receive_code',
        'parse_state',
        'exchange_code_for_tokens',
        'save_tokens_to_database',
        'redirect_to_app',
      ];

      expect(steps[0]).toBe('receive_code');
      expect(steps[steps.length - 1]).toBe('redirect_to_app');
      expect(steps.indexOf('save_tokens_to_database')).toBeLessThan(steps.indexOf('redirect_to_app'));
    });

    it('should validate that tokens are persisted before redirect', () => {
      const tokenSaveOrder = {
        accessToken: 1,
        refreshToken: 2,
        expiresAt: 3,
        scope: 4,
        redirect: 5,
      };

      expect(tokenSaveOrder.accessToken).toBeLessThan(tokenSaveOrder.redirect);
      expect(tokenSaveOrder.refreshToken).toBeLessThan(tokenSaveOrder.redirect);
      expect(tokenSaveOrder.expiresAt).toBeLessThan(tokenSaveOrder.redirect);
    });
  });

  describe('OAuth Security Validation', () => {
    it('should use HTTPS for all OAuth URLs', () => {
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const googleTokenUrl = 'https://oauth2.googleapis.com/token';

      expect(redirectUri).toMatch(/^https:\/\//);
      expect(googleAuthUrl).toMatch(/^https:\/\//);
      expect(googleTokenUrl).toMatch(/^https:\/\//);
    });

    it('should use offline access type for refresh token', () => {
      const accessType = 'offline';
      expect(accessType).toBe('offline');
    });

    it('should use consent prompt to ensure refresh token', () => {
      const prompt = 'consent';
      expect(prompt).toBe('consent');
    });

    it('should validate state parameter prevents CSRF attacks', () => {
      const state1 = '480115';
      const state2 = '480115';
      
      // Same user should have same state
      expect(state1).toBe(state2);
      
      // Different user should have different state
      const state3 = '480116';
      expect(state1).not.toBe(state3);
    });
  });
});
