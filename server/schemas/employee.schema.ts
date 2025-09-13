import { z } from "zod";

export const createEmployeeSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  position: z.string().min(1),
  face_encoding: z.string().optional(),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
