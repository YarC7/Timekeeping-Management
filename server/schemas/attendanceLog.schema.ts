import { z } from "zod";

export const attendanceLogSchema = z.object({
  log_id: z.number().optional(), // auto increment
  employee_id: z.string().uuid(),
  check_type: z.enum(["checkin", "checkout"]),
  timestamp: z.string().datetime().optional(),
  similarity: z.number().nullable().optional(),
  device_id: z.string().nullable().optional(),
});

export type AttendanceLog = z.infer<typeof attendanceLogSchema>;
