import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeWebSocket } from "./websocket";
import { startReminderScheduler } from "./reminderService";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Create and configure the Express app
 * This function is used by both the development server and Vercel serverless function
 */
export async function createApp() {
  const app = express();
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Health check endpoint (must be before Vite middleware)
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API (must be before Vite middleware)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  // IMPORTANT: Vite middleware must be registered LAST because it has a catch-all route
  if (process.env.NODE_ENV === "development") {
    const server = createServer(app);
    initializeWebSocket(server);
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  return app;
}

/**
 * Start the development server
 * This is only called when running locally (pnpm dev)
 */
async function startServer() {
  const app = await createApp();
  const server = createServer(app);
  
  // Initialize WebSocket for development
  if (process.env.NODE_ENV === "development") {
    initializeWebSocket(server);
  }
  
  // Start reminder scheduler
  startReminderScheduler();

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Only start the server if running locally (not in Vercel)
if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
  startServer().catch(console.error);
}

export default App;
