import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import { match } from "path-to-regexp";
import { handleDemo } from "./routes/demo";
import userRoutes from "./routes/user.routes";
import employeeRoutes from "./routes/employee.routes";
import timekeepingRoutes from "./routes/timekeeping.routes";
import authRoutes from "./routes/auth.routes";
import { authenticateJWT } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure uploads directory exists
  fs.mkdirSync("public/uploads", { recursive: true });
  app.use("/uploads", express.static("public/uploads"));

  // Routes
  app.use("/api/auth", authRoutes);

  const publicPaths = [
    { path: "/employees/:id", method: "GET" }, //get employee information by id
    { path: "/employees/:id/images", method: "POST" }, //register face image for employee by id
    { path: "/employees/:id/images", method: "GET" }, //get face image for employee by id
    { path: "/employees/images", method: "GET" }, //get all face images for employees
    { path: "/timekeeping/logs", method: "POST" }, //create timekeeping log for employee
  ];

  function isPublicRoute(req) {
    return publicPaths.some(
      (p) => p.method === req.method && match(p.path)(req.path),
    );
  }

  function protectApi(req, res, next) {
    if (isPublicRoute(req)) return next();
    return authenticateJWT(req, res, next);
  }

  app.use("/api", protectApi);
  app.use("/api/users", userRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/timekeeping", timekeepingRoutes);

  app.get("/api/demo", handleDemo);

  app.use(errorHandler);

  return app;
}
