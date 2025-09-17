import { z } from "zod";

export const createEmployeeSchema = z.object({
  employee_id: z.string().min(3),
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  position: z.string().min(1),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
