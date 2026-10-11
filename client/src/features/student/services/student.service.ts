import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { auth, db, functions } from "../../../lib/firebase";
import { isAttendanceMethodAllowed, normalizeAttendanceMethod } from "../../attendance/services/attendance-methods";
import { getEffectiveSessionStatus, isSessionActive } from "../../attendance/services/session.service";
import type { AttendanceSession } from "../../attendance/types/attendance.types";
import type {
  MarkAttendanceInput,
  StudentAttendanceAnalytics,
  StudentAttendanceRecord,
  SubjectAttendanceSummary,
} from "../types/student.types";

const attendanceSessionsCollection = collection(db, "attendanceSessions");
const attendanceRecordsCollection = collection(db, "attendanceRecords");

class StudentService {
  async getAvailableSessions(classId?: string): Promise<AttendanceSession[]> {
    const sessionQuery = query(
      attendanceSessionsCollection,
      where("status", "==", "active"),
    );

    const snapshot = await getDocs(sessionQuery);
    const sessions = snapshot.docs.map((docSnap) => this.mapSession(docSnap));

    return sessions
      .filter((session) => isSessionActive(session))
      .filter((session) => !classId || session.classId === classId)
      .map((session) => ({ ...session, attendanceCode: "", qrSessionToken: undefined }))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  subscribeActiveSessions(
    classId: string,
    onChange: (sessions: AttendanceSession[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const sessionQuery = query(
      attendanceSessionsCollection,
      where("status", "==", "active"),
    );

    return onSnapshot(
      sessionQuery,
      (snapshot) => {
        const sessions = snapshot.docs
          .map((docSnap) => this.mapSession(docSnap))
          .filter((session) => isSessionActive(session) && session.classId === classId)
          .map((session) => ({ ...session, attendanceCode: "", qrSessionToken: undefined }))
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

        onChange(sessions);
      },
      (error) => onError(error),
    );
  }

  async getClassSessions(classId: string): Promise<AttendanceSession[]> {
    if (!classId) {
      return [];
    }

    const sessionQuery = query(
      attendanceSessionsCollection,
      where("classId", "==", classId),
    );

    const snapshot = await getDocs(sessionQuery);
    return snapshot.docs
      .map((docSnap) => this.mapSession(docSnap))
      .map((session) => ({ ...session, attendanceCode: "", qrSessionToken: undefined }))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  subscribeAttendanceRecords(
    studentId: string,
    onChange: (records: StudentAttendanceRecord[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const recordsQuery = query(
      attendanceRecordsCollection,
      where("studentId", "==", studentId),
    );

    return onSnapshot(
      recordsQuery,
      (snapshot) => {
        const records = snapshot.docs
          .map((docSnap) => this.mapRecord(docSnap))
          .sort((left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime());

        onChange(records);
      },
      (error) => onError(error),
    );
  }

  async getMyAttendanceRecords(studentId: string): Promise<StudentAttendanceRecord[]> {
    const recordsQuery = query(
      attendanceRecordsCollection,
      where("studentId", "==", studentId),
    );

    const snapshot = await getDocs(recordsQuery);
    return snapshot.docs
      .map((docSnap) => this.mapRecord(docSnap))
      .sort((left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime());
  }

  buildAnalytics(
    records: StudentAttendanceRecord[],
    classSessions: AttendanceSession[],
    now = Date.now(),
  ): StudentAttendanceAnalytics {
    const countableSessions = classSessions.filter((session) => {
      const status = getEffectiveSessionStatus(session, now);
      return status === "active" || status === "ended" || status === "expired";
    });

    const recordsBySession = new Map(records.map((record) => [record.sessionId, record]));
    const history: StudentAttendanceRecord[] = countableSessions.map((session) => {
      const existing = recordsBySession.get(session.sessionId);
      if (existing) {
        return {
          ...existing,
          sessionDate: session.sessionDate || existing.sessionDate,
          subject: session.subject || existing.subject,
        };
      }

      return {
        attendanceId: `${session.sessionId}_absent`,
        sessionId: session.sessionId,
        studentId: "",
        studentName: "",
        subject: session.subject,
        attendanceMethod: session.attendanceMethod,
        markedAt: session.endAt || session.endTime || session.startTime,
        status: "absent",
        sessionDate: session.sessionDate,
      };
    });

    for (const record of records) {
      if (!history.some((row) => row.sessionId === record.sessionId)) {
        history.push(record);
      }
    }

    history.sort((left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime());

    const presentRecords = history.filter((record) => record.status === "present");
    const absentRecords = history.filter((record) => record.status === "absent");
    const totalClasses = history.length;
    const classesAttended = presentRecords.length;
    const classesAbsent = absentRecords.length;
    const percentage = totalClasses === 0 ? 0 : Math.round((classesAttended / totalClasses) * 100);

    const subjectMap = new Map<string, SubjectAttendanceSummary>();
    for (const row of history) {
      const current = subjectMap.get(row.subject) ?? {
        subject: row.subject,
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      };
      current.total += 1;
      if (row.status === "present") {
        current.present += 1;
      } else {
        current.absent += 1;
      }
      current.percentage = current.total === 0 ? 0 : Math.round((current.present / current.total) * 100);
      subjectMap.set(row.subject, current);
    }

    return {
      totalClasses,
      classesAttended,
      classesAbsent,
      percentage,
      subjectSummaries: [...subjectMap.values()].sort((left, right) => left.subject.localeCompare(right.subject)),
      history,
    };
  }

  async getSessionByCode(code: string): Promise<AttendanceSession | null> {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return null;
    }

    const sessionQuery = query(
      attendanceSessionsCollection,
      where("attendanceCode", "==", normalizedCode),
      where("status", "==", "active"),
    );

    const snapshot = await getDocs(sessionQuery);

    if (snapshot.empty) {
      return null;
    }

    const sessions = snapshot.docs.map((docSnap) => this.mapSession(docSnap));
    const activeSession = sessions.find((session) => isSessionActive(session));

    return activeSession ?? null;
  }

  async getSessionByQrToken(qrValue: string): Promise<AttendanceSession | null> {
    const normalizedValue = qrValue.trim();

    if (!normalizedValue) {
      return null;
    }

    const [sessionId, token] = normalizedValue.split(":");

    if (!sessionId || !token) {
      return null;
    }

    const sessionRef = doc(attendanceSessionsCollection, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    const session = this.mapSession(sessionDoc);

    if (!isSessionActive(session)) {
      return null;
    }

    if ((session.qrSessionToken ?? "") !== token.trim()) {
      return null;
    }

    return session;
  }

  async markAttendance({ sessionId, studentName, subject, attendanceMethod, value, location }: MarkAttendanceInput): Promise<StudentAttendanceRecord> {
    const studentId = auth.currentUser?.uid;

    if (!studentId) {
      throw new Error("You must be signed in as a student to mark attendance.");
    }

    const sessionDoc = await getDoc(doc(attendanceSessionsCollection, sessionId));

    if (!sessionDoc.exists()) {
      throw new Error("Invalid attendance QR.");
    }

    const session = this.mapSession(sessionDoc);

    if (!isSessionActive(session)) {
      throw new Error("This attendance session has expired.");
    }

    if (!isAttendanceMethodAllowed(session.attendanceMethod, attendanceMethod)) {
      throw new Error("This attendance method is not enabled for this session.");
    }

    const markAttendance = httpsCallable(functions, "markAttendance");
    await markAttendance({ sessionId, attendanceMethod, value: value ?? "", location });
    const attendanceId = `${sessionId}_${studentId}`;

    return {
      attendanceId,
      sessionId,
      studentId,
      studentName,
      subject,
      attendanceMethod: normalizeAttendanceMethod(attendanceMethod),
      markedAt: new Date().toISOString(),
      status: "present",
    };
  }

  private mapRecord(docSnap: QueryDocumentSnapshot): StudentAttendanceRecord {
    const data = docSnap.data();
    const rawStatus = typeof data.status === "string" ? data.status : "present";

    return {
      attendanceId: docSnap.id,
      sessionId: typeof data.sessionId === "string" ? data.sessionId : "",
      studentId: typeof data.studentId === "string" ? data.studentId : "",
      studentName: typeof data.studentName === "string" ? data.studentName : "",
      subject: typeof data.subject === "string" ? data.subject : "",
      attendanceMethod: normalizeAttendanceMethod(data.attendanceMethod ?? "both"),
      markedAt: this.toIsoString(data.markedAt),
      status: rawStatus === "absent" ? "absent" : "present",
    };
  }

  private mapSession(docSnap: QueryDocumentSnapshot): AttendanceSession {
    const data = docSnap.data();
    const rawStatus = typeof data.status === "string" ? data.status : "created";
    const normalizedStatus: AttendanceSession["status"] =
      rawStatus === "created" || rawStatus === "active" || rawStatus === "ended" || rawStatus === "expired"
        ? rawStatus
        : "created";

    return {
      sessionId: docSnap.id,
      teacherId: typeof data.teacherId === "string" ? data.teacherId : "",
      subject: typeof data.subject === "string" ? data.subject : "",
      classId: typeof data.classId === "string" ? data.classId : "",
      attendanceCode: typeof data.attendanceCode === "string" ? data.attendanceCode : "",
      attendanceMethod: normalizeAttendanceMethod(data.attendanceMethod ?? "both"),
      qrSessionToken: typeof data.qrSessionToken === "string" ? data.qrSessionToken : undefined,
      status: normalizedStatus,
      sessionDate: typeof data.sessionDate === "string" ? data.sessionDate : "",
      startTime: typeof data.startTime === "string" ? data.startTime : this.toIsoString(data.startAt),
      endTime: typeof data.endTime === "string" ? data.endTime : this.toIsoString(data.endAt),
      startAt: this.toIsoString(data.startAt),
      endAt: this.toIsoString(data.endAt),
      durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 0,
      createdAt: this.toIsoString(data.createdAt),
    };
  }

  private toIsoString(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object" && value !== null && "toDate" in value) {
      const maybeDate = value as { toDate?: () => Date };

      if (typeof maybeDate.toDate === "function") {
        return maybeDate.toDate().toISOString();
      }
    }

    return new Date().toISOString();
  }
}

export const studentService = new StudentService();
export type { AttendanceMethod } from "../../attendance/types/attendance.types";
