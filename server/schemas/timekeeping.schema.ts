import { z } from "zod";

export const timekeepingSchema = z.object({
  log_id: z.number().optional(),
  employee_id: z.string().uuid(),
  work_date: z.string(), // YYYY-MM-DD
  check_type: z.enum(["checkin", "checkout"]),
  timestamp: z.string().datetime(),
  similarity: z.number().nullable().optional(),
  success_image: z.string().url().nullable().optional(),
});

export type TimekeepingLog = z.infer<typeof timekeepingSchema>;
