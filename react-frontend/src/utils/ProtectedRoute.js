import { Navigate } from "react-router-dom";
import { getJwtToken, useAuth } from "../context/AuthProvider";

export const ProtectedRoute = ({ children }) => {
  const { value } = useAuth();
  if (!value.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};