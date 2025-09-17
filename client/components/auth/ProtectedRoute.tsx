import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const shown = useRef(false);
  useEffect(() => {
    if (!loading && !isAuthenticated && !shown.current) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      shown.current = true;
    }
  }, [loading, isAuthenticated]);
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
