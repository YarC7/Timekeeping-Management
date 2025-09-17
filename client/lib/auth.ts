import { decodeJWT } from "./jwt";
export function getUser(): { email: string } | null {
  if (!accessToken) return null;
  const payload = decodeJWT(accessToken);
  if (payload?.email) return { email: payload.email };
  return null;
}
let accessToken: string | null = null;
export function setAccessToken(token: string) {
  accessToken = token;
}
const REFRESH_KEY = "app.auth.refreshToken";

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function isAuthenticated() {
  return !!accessToken;
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Login failed");
  }
  const data = await res.json();
  accessToken = data.accessToken;
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  return data.user;
}

export function logout() {
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
}
