/**
 * VERCEL SERVERLESS FUNCTION
 * 
 * This handler imports the compiled Express app from dist/index.js
 * and serves it as a Vercel serverless function.
 */

let cachedApp = null;

export default async function handler(req, res) {
  try {
    // Lazy load the compiled app on first request
    if (!cachedApp) {
      // Import the compiled server
      const { default: createApp } = await import("../dist/index.js");
      cachedApp = await createApp();
    }

    // Handle the request
    return cachedApp(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Error:", error);

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
