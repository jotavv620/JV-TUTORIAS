import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback'
);

/**
 * Generate Google OAuth authorization URL
 * @param state Optional state parameter for CSRF protection
 * @returns Authorization URL
 */
export function generateAuthorizationUrl(state?: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state || '',
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param code Authorization code from Google
 * @returns Tokens object with access_token, refresh_token, expiry_date
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('[Google OAuth] Tokens obtained successfully');
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope,
      tokenType: tokens.token_type || 'Bearer',
    };
  } catch (error: any) {
    console.error('[Google OAuth] Failed to exchange code for tokens:', error.message);
    throw new Error('Failed to authenticate with Google');
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken Refresh token
 * @returns New access token and expiry date
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    console.log('[Google OAuth] Access token refreshed successfully');
    
    return {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
    };
  } catch (error: any) {
    console.error('[Google OAuth] Failed to refresh access token:', error.message);
    throw new Error('Failed to refresh Google access token');
  }
}

/**
 * Revoke access token
 * @param accessToken Access token to revoke
 * @returns true if successful
 */
export async function revokeAccessToken(accessToken: string): Promise<boolean> {
  try {
    await oauth2Client.revokeCredentials();
    console.log('[Google OAuth] Access token revoked successfully');
    return true;
  } catch (error: any) {
    console.error('[Google OAuth] Failed to revoke access token:', error.message);
    return false;
  }
}

/**
 * Create authenticated OAuth2Client with stored tokens
 * @param accessToken Access token
 * @param refreshToken Optional refresh token
 * @param expiryDate Optional expiry date
 * @returns Configured OAuth2Client
 */
export function createAuthenticatedClient(
  accessToken: string,
  refreshToken?: string | null,
  expiryDate?: Date | null
): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback'
  );

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expiry_date: expiryDate ? expiryDate.getTime() : undefined,
  });

  return client;
}

/**
 * Get user info from Google
 * @param accessToken Access token
 * @returns User info (email, name, picture)
 */
export async function getUserInfo(accessToken: string) {
  try {
    const oauth2 = google.oauth2('v2');
    const response = await oauth2.userinfo.get({
      auth: createAuthenticatedClient(accessToken),
    });

    return response.data;
  } catch (error: any) {
    console.error('[Google OAuth] Failed to get user info:', error.message);
    throw new Error('Failed to get user info from Google');
  }
}
