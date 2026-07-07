import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
