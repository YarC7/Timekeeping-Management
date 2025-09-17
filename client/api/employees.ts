import { z } from "zod";
import { createApi } from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchRaw } from "@/lib/apiClient";

export const employeeSchema = z.object({
  employee_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string(),
  is_active: z.boolean(),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const employeesApi = createApi("employees", employeeSchema);
export function useToggleEmployeeActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (employee_id: string) => {
      return apiFetch(`/api/employees/${employee_id}/toggle`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export const faceSchema = z.object({
  vector_id: z.string().uuid(),
  employee_id: z.string(),
  embedding: z.any(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 📌 Get faces by employee
export function useEmployeeFaces(employee_id: string) {
  return useQuery({
    queryKey: ["employeeFaces", employee_id],
    queryFn: async () => {
      const res = await apiFetchRaw(`/api/employees/${employee_id}/images`, {
        cache: "no-store",
      });
      const text = await res.text();
      if (!text) return [];
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON from faces API:", text);
        throw new Error("Invalid JSON from faces API");
      }
      try {
        return z.array(faceSchema).parse(data);
      } catch (e) {
        console.error("Zod validation error for faces API:", e, data);
        throw new Error("Invalid faces data structure");
      }
    },
    enabled: !!employee_id,
  });
}

// 📌 Upload new face (register embedding)
export function useUploadEmployeeFace(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: FormData) => {
      return apiFetch(`/api/employees/${employee_id}/images`, {
        method: "POST",
        body: file,
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeFaces", employee_id] }),
  });
}

// 📌 Update face embedding metadata
export function useUpdateEmployeeFace(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { vector_id: string; image_url?: string }) => {
      return apiFetch(
        `/api/employees/${employee_id}/images/${data.vector_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeFaces", employee_id] }),
  });
}

// 📌 Delete face
export function useDeleteEmployeeFace(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vector_id: string) => {
      return apiFetch(
        `/api/employees/${employee_id}/images/${vector_id}`,
        {
          method: "DELETE",
        },
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeFaces", employee_id] }),
  });
}
