import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApi } from "@/lib/apiClient";
import { apiFetch } from "@/lib/apiClient";

// Schema timekeeping log (log-based)
export const timekeepingSchema = z.object({
  log_id: z.number(),
  employee_id: z.string(),
  work_date: z.string(), // YYYY-MM-DD
  check_type: z.enum(["checkin", "checkout"]),
  timestamp: z.string().datetime(),
  similarity: z.number().nullable(),
  success_image: z.string().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type TimekeepingLog = z.infer<typeof timekeepingSchema>;

// CRUD cơ bản (nếu có generic client)
export const timekeepingApi = createApi("timekeeping", timekeepingSchema);

// Dashboard stats (đã có checkedInToday, checkedOutToday, notCheckedInToday, totalHoursThisWeek)
export const dashboardSchema = z.object({
  checkedInToday: z.number(),
  checkedOutToday: z.number(),
  notCheckedInToday: z.number(),
  totalHoursThisWeek: z.number(),
});

export function useDashboard() {
  return useQuery({
    queryKey: ["timekeeping", "dashboard"],
    queryFn: async () => {
      const data = await apiFetch(`/api/timekeeping/dashboard`);
      return dashboardSchema.parse(data);
    },
  });
}

// Danh sách logs + filter
export function useTimekeepingList(params?: {
  dateFrom?: string;
  dateTo?: string;
  employee_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["timekeeping", "list", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
      if (params?.dateTo) query.append("dateTo", params.dateTo);
      if (params?.employee_id) query.append("employee_id", params.employee_id);
      if (params?.search) query.append("search", params.search);

      const qs = query.toString();
      const data = await apiFetch(qs ? `/api/timekeeping?${qs}` : "/api/timekeeping");
      return z
        .array(
          timekeepingSchema.extend({
            full_name: z.string(),
            email: z.string(),
            position: z.string(),
            role: z.string(),
          })
        )
        .parse(data);
    },
  });
}

// Check-in nhanh
export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee_id: string) => {
      return apiFetch(`/api/timekeeping/checkin/${employee_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timekeeping", "list"] });
      qc.invalidateQueries({ queryKey: ["timekeeping", "dashboard"] });
    },
  });
}

// Check-out nhanh
export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee_id: string) => {
      return apiFetch(`/api/timekeeping/checkout/${employee_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timekeeping", "list"] });
      qc.invalidateQueries({ queryKey: ["timekeeping", "dashboard"] });
    },
  });
}
