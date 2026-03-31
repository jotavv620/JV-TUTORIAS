import { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

console.log('[OAuth] Module loaded - GOOGLE_OAUTH_REDIRECT_URI:', process.env.GOOGLE_OAUTH_REDIRECT_URI);
console.log('[OAuth] Module loaded - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing');
console.log('[OAuth] Module loaded - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing');

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: any) {
  console.log('[OAuth] Initializing OAuth routes...');
  // Google OAuth callback - handles Google Calendar OAuth
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    console.log('[Google OAuth] ===== CALLBACK STARTED =====' );
    console.log('[Google OAuth] Query params:', req.query);
    console.log('[Google OAuth] Full URL:', req.originalUrl);
    
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");
    const errorDescription = getQueryParam(req, "error_description");

    console.log('[Google OAuth] Extracted params - code:', code ? 'present' : 'missing', 'state:', state, 'error:', error);

    // Handle user denial or Google errors
    if (error) {
      console.error('[Google OAuth] ❌ Google returned error:', error);
      console.error('[Google OAuth] Error description:', errorDescription);
      return res.redirect(302, `/app?oauth_error=${encodeURIComponent(error)}&error_desc=${encodeURIComponent(errorDescription || '')}`);
    }

    if (!code || !state) {
      console.error('[Google OAuth] ❌ Missing code or state - code:', code ? 'present' : 'missing', 'state:', state ? 'present' : 'missing');
      return res.status(400).json({ error: "code and state are required" });
    }

    try {
      // Get user ID from state (state contains user ID)
      const userId = parseInt(state, 10);
      if (isNaN(userId)) {
        console.error('[Google OAuth] ❌ Invalid state parameter (not a number):', state);
        return res.status(400).json({ error: "Invalid state parameter" });
      }

      console.log('[Google OAuth] ✅ Processing callback for user ID:', userId);
      console.log('[Google OAuth] Authorization code received (length:', code.length, ')');

      // Exchange code for tokens using googleOAuthService
      console.log('[Google OAuth] Exchanging code for tokens...');
      const { exchangeCodeForTokens } = await import("./googleOAuthService");
      const tokens = await exchangeCodeForTokens(code);

      if (!tokens.accessToken) {
        console.error('[Google OAuth] ❌ No access token received from Google');
        throw new Error('No access token received from Google');
      }

      console.log('[Google OAuth] ✅ Tokens received - accessToken length:', tokens.accessToken.length, 'refreshToken:', tokens.refreshToken ? 'present' : 'missing');

      // Save tokens to database
      const scope = tokens.scope ? String(tokens.scope) : '';
      console.log('[Google OAuth] Saving tokens to database for user:', userId);
      await db.saveGoogleAuthToken(
        userId,
        tokens.accessToken,
        tokens.refreshToken ?? null,
        tokens.expiresAt ?? null,
        scope
      );
      
      console.log('[Google OAuth] ✅ Tokens saved successfully for user:', userId);
      console.log('[Google OAuth] ===== CALLBACK COMPLETED SUCCESSFULLY =====');
      res.redirect(302, "/app?oauth_success=true");
    } catch (error: any) {
      console.error("[Google OAuth] ❌ Callback failed with error:", error.message);
      console.error("[Google OAuth] Error stack:", error.stack);
      console.error('[Google OAuth] ===== CALLBACK FAILED =====' );
      res.redirect(302, `/app?oauth_error=${encodeURIComponent(error.message || 'OAuth callback failed')}`);
    }
  });

  // Manus OAuth callback - handles Manus platform authentication
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    console.log('[OAuth] Manus OAuth callback received');
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      console.log('[OAuth] Creating session token for user:', userInfo.openId);
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log('[OAuth] Session token created successfully');

      console.log('[OAuth] Setting session cookie...');
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      console.log('[OAuth] ✅ Manus OAuth callback completed successfully');
      res.redirect(302, "/app");
    } catch (error: any) {
      console.error("[OAuth] ❌ Manus OAuth callback failed:", error.message);
      console.error("[OAuth] Error stack:", error.stack);
      res.status(400).json({ error: "OAuth callback failed" });
    }
  });
}
