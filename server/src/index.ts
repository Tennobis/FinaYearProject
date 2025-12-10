import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";

const result = dotenv.config({
  quiet: true
});

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Debug endpoint - check env vars
app.get("/debug/env", (req, res) => {
  res.status(200).json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ SET' : '✗ NOT SET',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? '✓ SET' : '✗ NOT SET',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? '✓ SET' : '✗ NOT SET',
    PORT: process.env.PORT || 5001,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
