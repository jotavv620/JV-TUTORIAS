import { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: any) {
  // Google OAuth callback - handles Google Calendar OAuth
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");

    // Handle user denial
    if (error) {
      console.error('[Google OAuth] User denied access:', error);
      return res.redirect(302, `/app?oauth_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('[Google OAuth] Missing code or state');
      return res.status(400).json({ error: "code and state are required" });
    }

    try {
      // Get user ID from state (state contains user ID)
      const userId = parseInt(state, 10);
      if (isNaN(userId)) {
        console.error('[Google OAuth] Invalid state parameter:', state);
        return res.status(400).json({ error: "Invalid state parameter" });
      }

      console.log('[Google OAuth] Processing callback for user:', userId);

      // Exchange code for tokens using googleOAuthService
      const { exchangeCodeForTokens } = await import("./googleOAuthService");
      const tokens = await exchangeCodeForTokens(code);

      if (!tokens.accessToken) {
        throw new Error('No access token received from Google');
      }

      // Save tokens to database
      const scope = tokens.scope ? String(tokens.scope) : '';
      await db.saveGoogleAuthToken(
        userId,
        tokens.accessToken,
        tokens.refreshToken ?? null,
        tokens.expiresAt ?? null,
        scope
      );
      
      console.log('[Google OAuth] Tokens saved successfully for user:', userId);
      res.redirect(302, "/app?oauth_success=true");
    } catch (error: any) {
      console.error("[Google OAuth] Callback failed:", error.message);
      res.redirect(302, `/app?oauth_error=${encodeURIComponent(error.message || 'OAuth callback failed')}`);
    }
  });

  // Manus OAuth callback - handles Manus platform authentication
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
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

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
