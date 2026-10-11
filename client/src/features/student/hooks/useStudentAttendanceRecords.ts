import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getAttendanceErrorMessage } from "../../attendance/services/session.service";
import type { AttendanceSession } from "../../attendance/types/attendance.types";
import { studentService } from "../services/student.service";
import type { StudentAttendanceAnalytics, StudentAttendanceRecord } from "../types/student.types";

export function useStudentAttendanceRecords(studentId: string | undefined, classId: string | undefined) {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const unsubscribe = studentService.subscribeAttendanceRecords(
      studentId,
      (nextRecords) => {
        setRecords(nextRecords);
        setRecordsError(null);
        setRecordsLoading(false);
      },
      (error) => {
        setRecordsError(getAttendanceErrorMessage(error));
        setRecordsLoading(false);
      },
    );

    return unsubscribe;
  }, [studentId]);

  const classSessionsQuery = useQuery({
    queryKey: ["studentClassSessions", classId],
    enabled: Boolean(classId),
    queryFn: async () => {
      try {
        return await studentService.getClassSessions(classId ?? "");
      } catch (error) {
        throw new Error(getAttendanceErrorMessage(error), { cause: error });
      }
    },
  });

  const analytics: StudentAttendanceAnalytics = useMemo(
    () => studentService.buildAnalytics(records, classSessionsQuery.data ?? [] as AttendanceSession[]),
    [classSessionsQuery.data, records],
  );

  if (!studentId) {
    return {
      records: [] as StudentAttendanceRecord[],
      analytics: studentService.buildAnalytics([], []),
      classSessions: [] as AttendanceSession[],
      isLoading: false,
      error: null,
    };
  }

  return {
    records,
    analytics,
    classSessions: classSessionsQuery.data ?? [],
    isLoading: recordsLoading || classSessionsQuery.isLoading,
    error: recordsError ?? (classSessionsQuery.error ? getAttendanceErrorMessage(classSessionsQuery.error) : null),
  };
}
