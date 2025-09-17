import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import { handleDemo } from "./routes/demo";
import userRoutes from "./routes/user.routes";
import employeeRoutes from "./routes/employee.routes";
import timekeepingRoutes from "./routes/timekeeping.routes";
import authRoutes from "./routes/auth.routes";
import { authenticateJWT } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure uploads directory exists and serve uploaded assets
  try {
    fs.mkdirSync("public/uploads", { recursive: true });
  } catch {}
  app.use("/uploads", express.static("public/uploads"));

  // Core API routes

  app.use("/api/auth", authRoutes);

  // Bảo vệ tất cả các route /api/* trừ /api/auth/*
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) return next();
    return authenticateJWT(req, res, next);
  });
  app.use("/api/users", userRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/timekeeping", timekeepingRoutes);

  app.get("/api/demo", handleDemo);

  app.use(errorHandler);

  return app;
}
