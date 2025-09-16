import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import userRoutes from "./routes/user.routes";
import employeeRoutes from "./routes/employee.routes";
import timekeepingRoutes from "./routes/timekeeping.routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Core API routes
  app.use("/api/users", userRoutes);
  app.use("/api/employees", employeeRoutes);

  // Match client expectations
  app.use("/api/timekeeping", timekeepingRoutes);


  app.get("/api/demo", handleDemo);

  app.use(errorHandler);

  return app;
}
