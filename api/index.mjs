/**
 * VERCEL SERVERLESS FUNCTION - ALTERNATIVE APPROACH
 * 
 * This file runs the server directly without relying on esbuild compilation.
 * It imports from the source files directly, which Vercel can handle.
 */

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth.js";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";
import { serveStatic } from "../server/_core/vite.js";
import { initializeWebSocket } from "../server/_core/websocket.js";

let cachedApp = null;

async function createApp() {
  const app = express();

  // Configure body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // OAuth routes
  registerOAuthRoutes(app);

  // tRPC routes
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static files in production
  if (process.env.NODE_ENV !== "development") {
    serveStatic(app);
  }

  return app;
}

export default async function handler(req, res) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }

    return cachedApp(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
