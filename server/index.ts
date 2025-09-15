import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import userRoutes from "./routes/user.routes";
import employeeRoutes from "./routes/employee.routes";
import employeeImageRoutes from "./routes/employeeImage.routes";
import attendanceRoutes from "./routes/attendance.routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.json());

  app.use("/api/users", userRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/images", employeeImageRoutes);
  app.use("/api/attendances", attendanceRoutes);

  app.get("/api/demo", handleDemo);

  app.use(errorHandler);

  return app;
}
