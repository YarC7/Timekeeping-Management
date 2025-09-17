import { createContext, useContext, useEffect, useState } from "react";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  logout,
  getUser,
} from "@/lib/auth";

interface AuthContextProps {
  loading: boolean;
  isAuthenticated: boolean;
  user: { email: string } | null;
  setAuthToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  loading: true,
  isAuthenticated: false,
  user: null,
  setAuthToken: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    async function init() {
      if (!getAccessToken() && getRefreshToken()) {
        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: getRefreshToken() }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.accessToken) {
              setAccessToken(data.accessToken);
              setIsAuthenticated(true);
              setUser(getUser());
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch {
          logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else if (getAccessToken()) {
        setIsAuthenticated(true);
        setUser(getUser());
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    }
    init();
  }, []);

  const setAuthToken = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    setUser(getUser());
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated,
        user,
        setAuthToken,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
