import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApi } from "@/lib/apiClient";

// Schema face embedding
export const faceEmbeddingSchema = z.object({
  vector_id: z.string().uuid(),
  employee_id: z.string(), // ví dụ HP001
  embedding: z.any(), // JSON array (512 chiều)
  image_url: z.string().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type FaceEmbedding = z.infer<typeof faceEmbeddingSchema>;

// Base API (nếu bạn dùng createApi pattern)
export const faceApi = createApi("faces", faceEmbeddingSchema);

// 📌 Query: lấy embeddings theo employee
export function useFaceEmbeddings(employee_id: string) {
  return useQuery({
    queryKey: ["faces", employee_id],
    queryFn: async () => {
      const res = await fetch(`/api/faces/${employee_id}`);
      if (!res.ok) throw new Error("Failed to fetch face embeddings");
      return z.array(faceEmbeddingSchema).parse(await res.json());
    },
    enabled: !!employee_id,
  });
}

// 📌 Mutation: đăng ký embedding mới
export function useRegisterFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      file?: File; // ảnh/video upload
      image_url?: string;
    }) => {
      const formData = new FormData();
      formData.append("employee_id", data.employee_id);
      if (data.file) formData.append("file", data.file);
      if (data.image_url) formData.append("image_url", data.image_url);

      const res = await fetch(`/api/faces/register`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to register face");
      return res.json();
    },
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["faces", variables.employee_id] }),
  });
}

// 📌 Mutation: update embedding (chỉ update metadata, không regenerate vector)
export function useUpdateFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      vector_id: string;
      image_url?: string;
    }) => {
      const res = await fetch(`/api/faces/${data.vector_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update face embedding");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      // invalidate cache cho toàn bộ faces của employee
      qc.invalidateQueries({ queryKey: ["faces"] });
    },
  });
}

// 📌 Mutation: delete embedding
export function useDeleteFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vector_id: string) => {
      const res = await fetch(`/api/faces/${vector_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete face embedding");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faces"] });
    },
  });
}
