export type AttendanceSessionStatus = "created" | "active" | "ended" | "expired";
export type AttendanceMethod = "qr" | "code" | "both";

export interface AttendanceSession {
  sessionId: string;
  teacherId: string;
  subject: string;
  classId: string;
  attendanceCode: string;
  attendanceMethod: AttendanceMethod;
  qrSessionToken?: string;
  status: AttendanceSessionStatus;
  sessionDate: string;
  startTime: string;
  endTime: string | null;
  startAt?: string | null;
  endAt?: string | null;
  durationMinutes: number;
  createdAt: string;
  location?: { latitude: number; longitude: number };
}

export interface CreateAttendanceSessionInput {
  subject: string;
  classId: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  attendanceMethod?: AttendanceMethod;
  location: { latitude: number; longitude: number };
}

export interface TeacherSessionSummary {
  activeSessions: AttendanceSession[];
  recentSessions: AttendanceSession[];
}
