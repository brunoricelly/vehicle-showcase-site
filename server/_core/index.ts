import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { storagePut } from "../storage";
import busboy from "busboy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Health check endpoint for Traefik
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      const bb = busboy({ headers: req.headers, limits: { fileSize: 2 * 1024 * 1024 } });
      let fileBuffer: Buffer | null = null;
      let contentType = "application/octet-stream";
      let fileName = "file";

      bb.on("file", (fieldname: string, file: any, info: any) => {
        fileName = info.filename || "file";
        contentType = info.mimeType || "application/octet-stream";
        const chunks: Buffer[] = [];

        file.on("data", (data: Buffer) => {
          chunks.push(data);
        });

        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on("close", async () => {
        try {
          if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(400).json({ error: "No file provided" });
          }

          const { url } = await storagePut(
            `logos/${Date.now()}-${fileName}`,
            fileBuffer,
            contentType
          );

          res.json({ url });
        } catch (error) {
          console.error("Storage upload error:", error);
          res.status(500).json({ error: "Upload failed" });
        }
      });

      bb.on("error", (error: Error) => {
        console.error("Busboy error:", error);
        res.status(400).json({ error: "Invalid file upload" });
      });

      req.pipe(bb);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // FIXED PORT 3010 for Coolify deployment
  const PORT = 3010;
  
  // Use port 3010 strictly
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
  
  server.on("error", (error: any) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
      process.exit(1);
    }
    throw error;
  });
}

startServer().catch(console.error);
