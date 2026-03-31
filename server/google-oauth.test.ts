import { describe, it, expect } from 'vitest';
import { generateAuthorizationUrl } from './_core/googleOAuthService';

describe('Google OAuth Configuration', () => {
  it('should generate authorization URL with valid credentials', () => {
    // Check that environment variables are set
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    expect(process.env.GOOGLE_OAUTH_REDIRECT_URI).toBeDefined();

    // Verify they have expected formats
    expect(process.env.GOOGLE_CLIENT_ID).toContain('.apps.googleusercontent.com');
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeTruthy();
    expect(process.env.GOOGLE_OAUTH_REDIRECT_URI).toContain('tutormanag-6856tex4.manus.space');
  });

  it('should generate valid authorization URL', () => {
    const authUrl = generateAuthorizationUrl('test-state');
    
    expect(authUrl).toBeDefined();
    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('scope=');
    expect(authUrl).toContain('calendar');
    expect(authUrl).toContain('test-state');
  });

  it('should include calendar scope in authorization URL', () => {
    const authUrl = generateAuthorizationUrl();
    
    // The URL is encoded, so check for the encoded version
    expect(authUrl).toContain('scope=');
    expect(authUrl).toContain('calendar');
    expect(authUrl).toContain('access_type=offline');
    expect(authUrl).toContain('prompt=consent');
  });
});
