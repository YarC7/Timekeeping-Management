import { z } from "zod";
import { createApi } from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const employeeSchema = z.object({
  employee_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string(),
  role: z.enum(["employee", "manager", "hr"]).default("employee"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const employeesApi = createApi("employees", employeeSchema);

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
      const res = await fetch(`/api/employees/${employee_id}/images`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch faces");
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
      const res = await fetch(`/api/employees/${employee_id}/images`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error("Failed to upload face");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeFaces", employee_id] }),
  });
}

// 📌 Update face embedding metadata
export function useUpdateEmployeeFace(employee_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      vector_id: string;
      image_url?: string;
    }) => {
      const res = await fetch(
        `/api/employees/${employee_id}/images/${data.vector_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error("Failed to update face embedding");
      return res.json();
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
      const res = await fetch(
        `/api/employees/${employee_id}/images/${vector_id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete face");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employeeFaces", employee_id] }),
  });
}
