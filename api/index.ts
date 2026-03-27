/**
 * Vercel Serverless Function Entry Point
 * 
 * This file is the bridge between Vercel's serverless runtime and the Express app.
 * It creates the Express app on demand and handles incoming HTTP requests.
 * 
 * The actual server configuration is in server/_core/index.ts
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedApp: any = null;

/**
 * Get or create the Express app
 * The app is cached after first creation to avoid reinitializing on every request
 */
async function getApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Import the createApp function from the compiled server
    const { default: createApp } = await import("../dist/index.js");
    
    // Create the Express app with all middleware configured
    cachedApp = await createApp();
    
    console.log("[Vercel] Express app initialized successfully");
    return cachedApp;
  } catch (error) {
    console.error("[Vercel] Failed to initialize Express app:", error);
    throw error;
  }
}

/**
 * Vercel Serverless Handler
 * This function is called by Vercel for every HTTP request
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the Express app
    const app = await getApp();
    
    // Call the Express app with the request and response
    // Express will handle routing, middleware, and response
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Error:", error);
    
    // Return error response
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
