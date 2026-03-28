/**
 * VERCEL SERVERLESS FUNCTION - FINAL SOLUTION
 * 
 * This handler properly imports and serves the Express app
 * with comprehensive error handling and logging.
 */

let cachedApp = null;

export default async function handler(req, res) {
  try {
    // Lazy load the compiled app on first request
    if (!cachedApp) {
      console.log("[Handler] Loading app from dist/index.js...");
      
      try {
        const module = await import("../dist/index.js");
        const createApp = module.default || module.createApp;
        
        if (!createApp || typeof createApp !== "function") {
          throw new Error(`Invalid export: expected function, got ${typeof createApp}`);
        }
        
        console.log("[Handler] Creating app instance...");
        cachedApp = await createApp();
        
        if (!cachedApp || typeof cachedApp !== "function") {
          throw new Error(`createApp did not return a function, got ${typeof cachedApp}`);
        }
        
        console.log("[Handler] App loaded successfully");
      } catch (importError) {
        console.error("[Handler] Import error:", importError);
        throw new Error(`Failed to load app: ${importError.message}`);
      }
    }

    // Handle the request
    console.log(`[Handler] ${req.method} ${req.url}`);
    
    // Call the Express app
    return cachedApp(req, res);
  } catch (error) {
    console.error("[Handler] Fatal error:", error);

    // Return error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
