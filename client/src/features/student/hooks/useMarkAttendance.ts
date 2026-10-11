import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/hooks/useAuth";
import { getAttendanceErrorMessage } from "../../attendance/services/session.service";
import { getCurrentLocation } from "../../attendance/services/location.service";
import type { AttendanceMethod, AttendanceSession } from "../../attendance/types/attendance.types";
import { studentService } from "../services/student.service";

export function useMarkAttendance() {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const markAttendance = useCallback(async (
    session: AttendanceSession,
    attendanceMethod: AttendanceMethod,
    value: string,
  ) => {
    if (!profile || profile.role !== "student") {
      throw new Error("Only authenticated students can mark attendance.");
    }

    if (attendanceMethod === "both") {
      throw new Error("Choose QR or code attendance.");
    }

    setIsSubmitting(true);
    try {
      const location = await getCurrentLocation();
      await studentService.markAttendance({
        sessionId: session.sessionId,
        studentName: profile.name,
        subject: session.subject,
        attendanceMethod,
        value,
        location,
      });
      toast.success(`Attendance marked successfully for ${session.subject}.`);
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [profile]);

  return { markAttendance, isSubmitting };
}
