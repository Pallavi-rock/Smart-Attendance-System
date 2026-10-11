import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { attendanceSessionService, getAttendanceErrorMessage } from "../../attendance/services/session.service";
import type {
  AttendanceSession,
  CreateAttendanceSessionInput,
} from "../../attendance/types/attendance.types";

const teacherSessionsQueryKey = "teacherSessions";

export function useTeacherDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isTeacher = Boolean(user && profile && profile.role === "teacher");
  const {
    data: sessions = [],
    isLoading: isFetching,
    error: sessionsError,
    refetch,
  } = useQuery({
    queryKey: [teacherSessionsQueryKey, profile?.uid],
    enabled: isTeacher,
    queryFn: async () => {
      if (!profile || profile.role !== "teacher") {
        return [] as AttendanceSession[];
      }

      try {
        return await attendanceSessionService.getTeacherSessions(profile.uid);
      } catch (queryError) {
        throw new Error(getAttendanceErrorMessage(queryError), { cause: queryError });
      }
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (input: CreateAttendanceSessionInput) => {
      if (!profile || profile.role !== "teacher") {
        throw new Error("Only authenticated teachers can create sessions.");
      }

      return attendanceSessionService.createSession(profile.uid, input);
    },
    onSuccess: async (createdSession) => {
      setError(null);
      setSuccessMessage(`Session created successfully. Code: ${createdSession.attendanceCode}`);
      await queryClient.invalidateQueries({ queryKey: [teacherSessionsQueryKey, profile?.uid] });
    },
    onError: (mutationError) => {
      const message = getAttendanceErrorMessage(mutationError);
      setError(message);
      setSuccessMessage(null);
    },
  });

  const handleCreateSession = useCallback(async (input: CreateAttendanceSessionInput) => {
    if (!user || !profile || profile.role !== "teacher") {
      setError("Only authenticated teachers can create sessions.");
      setSuccessMessage(null);
      return;
    }

    await createSessionMutation.mutateAsync(input);
  }, [createSessionMutation, profile, user]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === "active"),
    [sessions],
  );

  const recentSessions = useMemo(
    () => sessions
      .slice()
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5),
    [sessions],
  );

  return {
    teacherProfile: profile,
    activeSessions,
    recentSessions,
    loading: loading || isFetching,
    isCreating: createSessionMutation.isPending,
    error: error ?? (sessionsError ? getAttendanceErrorMessage(sessionsError) : null),
    successMessage,
    handleCreateSession,
    handleLogout,
    refreshSessions: refetch,
  };
}