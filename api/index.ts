/**
 * VERCEL SERVERLESS FUNCTION ENTRY POINT
 * 
 * This file is the bridge between Vercel's serverless runtime and the Express app.
 * 
 * How it works:
 * 1. Vercel calls this handler for every HTTP request
 * 2. We import the compiled Express app from ../dist/index.js
 * 3. The app handles routing, middleware, and responses
 * 
 * Key points:
 * - The app is cached after first creation to avoid reinitializing
 * - All module imports are resolved at build time by esbuild
 * - No TypeScript imports needed - we use dynamic import of compiled JS
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Global cache for the Express app
let cachedApp: any = null;
let initPromise: Promise<any> | null = null;

/**
 * Initialize the Express app
 * Returns the same instance on subsequent calls (cached)
 */
async function initializeApp() {
  // If already initialized, return cached version
  if (cachedApp) {
    return cachedApp;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log("[Vercel] Initializing Express app...");

      // Import the compiled server module
      // This imports from dist/index.js which contains the compiled server code
      const serverModule = await import("../dist/index.js");

      // Get the createApp function (default export)
      const createApp = serverModule.default || serverModule.createApp;

      if (!createApp) {
        throw new Error(
          "Cannot find createApp function in compiled server module"
        );
      }

      // Create the Express app with all middleware configured
      cachedApp = await createApp();

      console.log("[Vercel] Express app initialized successfully");
      return cachedApp;
    } catch (error) {
      console.error("[Vercel] Failed to initialize app:", error);
      initPromise = null; // Reset so we can retry
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Vercel Serverless Handler
 * This is the main entry point called by Vercel for every HTTP request
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the Express app (cached after first call)
    const app = await initializeApp();

    // Call the Express app with the request and response
    // Express will handle routing, middleware, and response
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Error:", error);

    // Send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
