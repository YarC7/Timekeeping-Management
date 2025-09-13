export type User = { email: string, password: string };

const AUTH_KEY = "app.auth.user";

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getUser();
}

export function login(email: string) {
  const user: User = { email };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
