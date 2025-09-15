import { z } from "zod";
import { createApi } from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Schema attendances
export const attendanceSchema = z.object({
  attendance_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  check_in: z.string().nullable(),
  check_out: z.string().nullable(),
  total_hours: z.number().nullable(),
  status: z.enum(["Present", "Absent", "Late", "Leave", "Not-checked-out", "Checked-out"]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Attendance = z.infer<typeof attendanceSchema>;

// CRUD cơ bản
export const attendancesApi = createApi("attendances", attendanceSchema);

// Dashboard stats
export const dashboardSchema = z.object({
  checkedInToday: z.number(),
  notCheckedInToday: z.number(),
  totalHoursThisWeek: z.number(),
});

export function useDashboard() {
  return useQuery({
    queryKey: ["attendances", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/attendances/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return dashboardSchema.parse(await res.json());
    },
  });
}

// Danh sách hôm nay + filter
export function useAttendancesList(params?: {
  date?: string; // single day (legacy)
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["attendances", "", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.dateFrom) query.append("date_from", params.dateFrom);
      if (params?.dateTo) query.append("date_to", params.dateTo);
      if (!params?.dateFrom && !params?.dateTo && params?.date)
        query.append("date", params.date);
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      const res = await fetch(`/api/attendances?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendances");
      return z
        .array(
          attendanceSchema.extend({
            full_name: z.string(),
            email: z.string(),
            position: z.string(),
            role: z.string(),
          }),
        )
        .parse(await res.json());
    },
  });
}

// Check-in / Check-out nhanh
export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee_id: string) => {
      const res = await fetch(`/api/attendances/checkin/${employee_id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to check in");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attendances", "list"] }),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee_id: string) => {
      const res = await fetch(`/api/attendances/checkout/${employee_id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to check out");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attendances", "list"] }),
  });
}
