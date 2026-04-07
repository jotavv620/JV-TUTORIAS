/**
 * VERCEL SERVERLESS FUNCTION
 * Serves the Vite frontend from dist/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");

export default function handler(req, res) {
  try {
    // Serve static files from dist
    const filePath = path.join(distDir, req.url === "/" ? "index.html" : req.url);
    
    // Prevent directory traversal
    if (!filePath.startsWith(distDir)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Try to serve the file
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      
      // Set content type based on file extension
      const ext = path.extname(filePath);
      const contentTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
      };
      
      res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
      res.status(200).send(content);
    } else {
      // Serve index.html for SPA routing
      const indexPath = path.join(distDir, "index.html");
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath);
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(content);
      } else {
        res.status(404).json({ error: "Not Found" });
      }
    }
  } catch (error) {
    console.error("[Handler] Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
