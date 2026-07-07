import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load Environment Variables
dotenv.config();

// Connect to Database
import { connectDB } from "./server/config/db";
connectDB();

// Route Imports
import authRoutes from "./server/routes/authRoutes";
import resumeRoutes from "./server/routes/resumeRoutes";
import analysisRoutes from "./server/routes/analysisRoutes";

// Error Middleware Imports
import { errorHandler, notFoundHandler } from "./server/middleware/errorMiddleware";
import { checkDbConnection } from "./server/middleware/dbCheckMiddleware";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for express-rate-limit when running behind reverse proxy / ingress
  app.set("trust proxy", 1);

  // --- SECURITY MIDDLEWARES ---

  // Configure Helmet with Vite and AI Studio-friendly security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:*"],
          connectSrc: ["'self'", "ws:", "wss:", "https://generativelanguage.googleapis.com"],
          fontSrc: ["'self'", "https:", "data:"],
          // Allow framing in AI Studio preview environments
          frameAncestors: ["'self'", "https://*.google.com", "https://ai.studio", "https://*.ai.studio", "https://*.run.app"],
        },
      },
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Disable X-Frame-Options to allow rendering inside the AI Studio iframe
    })
  );

  // Configure CORS
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  app.use(
    cors({
      origin: [clientUrl, "https://ai.studio/build"],
      credentials: true,
    })
  );

  // Sanitize data against MongoDB Query Injection
  app.use(mongoSanitize());

  // JSON and URL-encoded Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // --- RATE LIMITERS ---

  // General rate limiter: 60 requests per 15 minutes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI-specific rate limiter: 10 requests per minute
  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: {
      success: false,
      message: "AI analysis is highly intensive. Limit is 10 requests per minute. Please wait.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // --- REGISTER ROUTES ---

  // Apply general rate limit to standard endpoints
  app.use("/api/auth", generalLimiter, checkDbConnection, authRoutes);
  app.use("/api/resume", generalLimiter, checkDbConnection, resumeRoutes);

  // Apply AI-specific rate limit to Gemini analyzer routes
  app.use("/api/analysis", aiLimiter, checkDbConnection, analysisRoutes);

  // Simple api health-check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
  });

  // --- VITE DEV MIDDLEWARE OR PRODUCTION ASSET SERVING ---

  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Starting server in PRODUCTION mode with static build assets...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from the built frontend
    app.use(express.static(distPath));
    
    // SPA Fallback for client router paths
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // --- GLOBAL ERROR HANDLING ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 ApplyMate server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start ApplyMate full-stack server:", err);
});
