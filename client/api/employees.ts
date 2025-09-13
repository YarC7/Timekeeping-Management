// api/employees.ts
import { z } from "zod";
import { createApi } from "@/lib/apiClient";

// Employee schema khớp với migration employees
export const employeeSchema = z.object({
  employee_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string(),
  face_encoding: z.string().nullable(),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const employeesApi = createApi("employees", employeeSchema);
