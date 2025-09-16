import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Schema attendance logs (raw checkin/checkout events)
export const attendanceLogSchema = z.object({
  log_id: z.number(),
  employee_id: z.string().uuid(),
  check_type: z.enum(["checkin", "checkout"]),
  timestamp: z.string().datetime(),
  similarity: z.number().nullable(),
  device_id: z.string().nullable(),
});

export type AttendanceLog = z.infer<typeof attendanceLogSchema>;

// Lấy danh sách log gần đây
export function useAttendanceLogs(limit: number = 20) {
  return useQuery({
    queryKey: ["attendance_logs", "recent", limit],
    queryFn: async () => {
      const res = await fetch(`/api/logs?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch attendance logs");
      return z.array(attendanceLogSchema).parse(await res.json());
    },
  });
}

// Lấy log theo employee
export function useAttendanceLogsByEmployee(
  employee_id: string,
  params?: { from?: string; to?: string }
) {
  return useQuery({
    queryKey: ["attendance_logs", "employee", employee_id, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.from) query.append("from", params.from);
      if (params?.to) query.append("to", params.to);
      const res = await fetch(
        `/api/logs/employee/${employee_id}?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch employee logs");
      return z.array(attendanceLogSchema).parse(await res.json());
    },
    enabled: !!employee_id,
  });
}

// Tạo log thủ công (ví dụ dùng trong test)
export function useCreateAttendanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<AttendanceLog, "log_id" | "timestamp">) => {
      const res = await fetch(`/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create attendance log");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance_logs"] }),
  });
}

// Xóa log
export function useDeleteAttendanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log_id: number) => {
      const res = await fetch(`/api/logs/${log_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete attendance log");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance_logs"] }),
  });
}
