// api/employees.ts
import { z } from "zod";
import { createApi } from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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


export const employeeImageSchema = z.object({
  image_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  url: z.string(),
  created_at: z.string(),
});

export function useEmployeeImages(employee_id: string) {
  return useQuery({
    queryKey: ["employeeImages", employee_id],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employee_id}/images`);
      if (!res.ok) throw new Error("Failed to fetch images");
      return res.json();
    },
  });
}

export function useUploadEmployeeImage(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: FormData) => {
      const res = await fetch(`/api/employees/${employee_id}/images`, {
        method: "POST",
        body: file,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to upload image");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeImages", employee_id] }),
  });
}

export function useDeleteEmployeeImage(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (image_id: string) => {
      const res = await fetch(
        `/api/employees/${employee_id}/images/${image_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete image");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeImages", employee_id] }),
  });
}