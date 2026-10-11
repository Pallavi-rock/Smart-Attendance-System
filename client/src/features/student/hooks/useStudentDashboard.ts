import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { useActiveSessions } from "./useActiveSessions";
import { useStudentAttendanceRecords } from "./useStudentAttendanceRecords";

export function useStudentDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const isStudent = Boolean(user && profile && profile.role === "student");
  const classId = isStudent ? profile?.classId : undefined;
  const studentId = isStudent ? profile?.uid : undefined;

  const {
    sessions: activeSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useActiveSessions(classId);

  const {
    records,
    analytics,
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useStudentAttendanceRecords(studentId, classId);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return {
    studentProfile: profile,
    activeSessions,
    records,
    analytics,
    isLoading: loading || isLoadingSessions || isLoadingRecords,
    sessionsError,
    recordsError,
    handleLogout,
  };
}
