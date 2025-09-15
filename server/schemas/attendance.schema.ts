import { z } from "zod";

export const attendanceSchema = z.object({
  attendance_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  check_in: z.string().nullable(),
  check_out: z.string().nullable(),
  total_hours: z.number().nullable(),
  status: z.enum(["Present", "Absent", "Late", "Leave", "Not-checked-out"]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Attendance = z.infer<typeof attendanceSchema>;
