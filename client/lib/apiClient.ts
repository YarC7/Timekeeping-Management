// lib/crudApi.ts
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json();
}

export function createApi<T extends z.ZodTypeAny>(
  resource: string,
  schema: T
) {
  type Entity = z.infer<T>;
  const queryKey = [resource];

  function useList() {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const data = await fetcher<Entity[]>(`/api/${resource}`);
        return schema.array().parse(data);
      },
    });
  }

  function useDetail(id: number | string) {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: async () => {
        const data = await fetcher<Entity>(`/api/${resource}/${id}`);
        return schema.parse(data);
      },
      enabled: !!id,
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: Partial<Entity>) => {
        const data = await fetcher<Entity>(`/api/${resource}`, {
          method: "POST",
          body: JSON.stringify(input),
        });
        return schema.parse(data);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: { id: number | string } & Partial<Entity>) => {
        const { id, ...body } = input;
        const data = await fetcher<Entity>(`/api/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        return schema.parse(data);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  }

  function useDelete() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: number | string) => {
        return fetcher<{ success: boolean }>(`/api/${resource}/${id}`, {
          method: "DELETE",
        });
      },
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete };
}
