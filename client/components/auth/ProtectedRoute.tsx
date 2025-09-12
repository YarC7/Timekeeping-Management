import { isAuthenticated } from "@/lib/auth";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
