import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import Timekeeping from "@/pages/Timekeeping";
import Exports from "@/pages/Exports";
import AttendanceIndex from "@/pages/Attendance";
import EmployeeAttendanceDetail from "@/pages/EmployeeAttendanceDetail";

const queryClient = new QueryClient();

const App = () => {
  // Initial token hydration is handled inside AuthProvider; remove duplicate refresh here
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timekeeping"
              element={
                <ProtectedRoute>
                  <Timekeeping />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/:id"
              element={
                <ProtectedRoute>
                  <EmployeeAttendanceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exports"
              element={
                <ProtectedRoute>
                  <Exports />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
