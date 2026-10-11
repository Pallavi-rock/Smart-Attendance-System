import { useEffect, useState } from "react";

import { getAttendanceErrorMessage } from "../../attendance/services/session.service";
import type { AttendanceSession } from "../../attendance/types/attendance.types";
import { studentService } from "../services/student.service";

export function useActiveSessions(classId: string | undefined) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      return;
    }

    const unsubscribe = studentService.subscribeActiveSessions(
      classId,
      (nextSessions) => {
        setSessions(nextSessions);
        setError(null);
        setIsLoading(false);
      },
      (subscribeError) => {
        setError(getAttendanceErrorMessage(subscribeError));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [classId]);

  if (!classId) {
    return { sessions: [] as AttendanceSession[], isLoading: false, error: null };
  }

  return { sessions, isLoading, error };
}
