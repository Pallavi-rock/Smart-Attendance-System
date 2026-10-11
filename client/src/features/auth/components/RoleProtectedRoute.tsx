import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

interface Props {
  allowedRole: "student" | "teacher" | "admin";
}

export default function RoleProtectedRoute({
  allowedRole,
}: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || profile.status === "inactive") {
    return <Navigate to="/unauthorized" replace />;
  }

  const role = profile.role;

  if (role !== "student" && role !== "teacher" && role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}