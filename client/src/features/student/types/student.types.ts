import type { AttendanceMethod, AttendanceSession } from "../../attendance/types/attendance.types";

export type StudentAttendanceStatus = "present" | "absent";

export interface StudentAttendanceRecord {
  attendanceId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  subject: string;
  attendanceMethod: AttendanceMethod;
  markedAt: string;
  status: StudentAttendanceStatus;
  sessionDate?: string;
}

export interface MarkAttendanceInput {
  sessionId: string;
  studentName: string;
  subject: string;
  attendanceMethod: AttendanceMethod;
  value?: string;
  location: { latitude: number; longitude: number };
}

export interface StudentAttendanceCodeInput {
  code: string;
}

export interface StudentDashboardData {
  activeSessions: AttendanceSession[];
  selectedSession: AttendanceSession | null;
}

export interface SubjectAttendanceSummary {
  subject: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface StudentAttendanceAnalytics {
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
  subjectSummaries: SubjectAttendanceSummary[];
  history: StudentAttendanceRecord[];
}
