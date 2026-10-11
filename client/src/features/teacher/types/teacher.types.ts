import type { UserProfile } from "../../auth/types/auth.types";
import type { AttendanceSession } from "../../attendance/types/attendance.types";

export interface TeacherDashboardState {
  teacherProfile: UserProfile | null;
  activeSessions: AttendanceSession[];
  recentSessions: AttendanceSession[];
  loading: boolean;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}
