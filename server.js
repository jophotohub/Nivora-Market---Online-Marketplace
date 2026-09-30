import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import apiRoutes from "./server/routes/index.js";
import { initDatabase } from "./server/db/connection.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
const isProd = process.env.NODE_ENV === "production";
async function startServer() {
  const app = express();
  await initDatabase();

  // CORS Headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/uploads", express.static(path.resolve(__dirname, "public", "uploads")));
  app.use("/images", express.static(path.resolve(__dirname, "public", "images")));
  app.use(express.static(path.resolve(__dirname, "public")));
  app.use("/api", apiRoutes);
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      status: "online",
      message: "Nivora Market API is running",
      app: "Nivora Market",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api")) {
        return res.status(404).json({ success: false, message: "API endpoint not found" });
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ success: false, message: "API endpoint not found" });
      }
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`  NIVORA MARKET SERVER ONLINE`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Mode: ${isProd ? "Production" : "Development"}`);
    console.log(`=========================================`);
  });
  return app;
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});

export default startServer;
