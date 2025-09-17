// lib/crudApi.ts
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken, getRefreshToken, logout, setAccessToken } from "./auth";

export async function apiFetchRaw(
  url: string,
  options?: RequestInit,
  retry = true,
): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Only set JSON content type when the body is not FormData and caller did not set it
  const isFormData = options && options.body instanceof FormData;
  const mergedHeaders = {
    ...headers,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options?.headers || {}),
  } as Record<string, string>;

  const res = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
  if (res.status === 401 && retry && getRefreshToken()) {
    const ok = await tryRefreshToken();
    if (ok) return apiFetchRaw(url, options, false);
    logout();
    throw new Error("Session expired. Please login again.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res;
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
  retry = true,
): Promise<T> {
  const res = await apiFetchRaw(url, options, retry);
  return res.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    return true;
  }
  return false;
}

export function createApi<T extends z.ZodTypeAny>(resource: string, schema: T) {
  type Entity = z.infer<T>;
  const queryKey = [resource];

  function useList() {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const data = await apiFetch<Entity[]>(`/api/${resource}`);
        return schema.array().parse(data);
      },
    });
  }

  function useDetail(id: number | string) {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: async () => {
        const data = await apiFetch<Entity>(`/api/${resource}/${id}`);
        return schema.parse(data);
      },
      enabled: !!id,
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: Partial<Entity>) => {
        const data = await apiFetch<Entity>(`/api/${resource}`, {
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
        const data = await apiFetch<Entity>(`/api/${resource}/${id}`, {
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
        return apiFetch<{ success: boolean }>(`/api/${resource}/${id}`, {
          method: "DELETE",
        });
      },
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete };
}
