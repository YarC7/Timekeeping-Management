import { z } from "zod";

export const timekeepingSchema = z.object({
  timekeeping_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  work_date: z.string(), // YYYY-MM-DD
  check_in: z.string().nullable(),
  check_out: z.string().nullable(),
  total_hours: z.number().nullable(),
  status: z.enum(["Present", "Absent", "Late", "Leave", "Not-checked-out"]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Timekeeping = z.infer<typeof timekeepingSchema>;
