import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";
import {
  getAttendanceMethodLabel,
  normalizeAttendanceMethod,
} from "./attendance-methods";
import type {
  AttendanceMethod,
  AttendanceSession,
  AttendanceSessionStatus,
  CreateAttendanceSessionInput,
} from "../types/attendance.types";

const attendanceSessionsCollection = collection(db, "attendanceSessions");
const attendanceSecretsCollection = collection(db, "attendanceSessionSecrets");

function toTimestampMilliseconds(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function isSessionActive(session: AttendanceSession, now = Date.now()): boolean {
  return getEffectiveSessionStatus(session, now) === "active";
}

export function getSessionMethodLabel(method: AttendanceMethod | unknown): string {
  return getAttendanceMethodLabel(method);
}

export function getEffectiveSessionStatus(
  session: AttendanceSession,
  now = Date.now(),
): AttendanceSessionStatus {
  if (session.status === "ended") {
    return "ended";
  }

  if (session.status === "expired") {
    return "expired";
  }

  const startAt = toTimestampMilliseconds(session.startAt ?? session.startTime);
  const endAt = toTimestampMilliseconds(session.endAt ?? session.endTime ?? null);

  if (startAt === null || endAt === null) {
    if (session.status === "created") {
      return "created";
    }

    return session.status === "active" ? "active" : "ended";
  }

  if (now < startAt) {
    return "created";
  }

  if (now >= endAt) {
    return "expired";
  }

  return "active";
}

export function getAttendanceErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";

  switch (code) {
    case "permission-denied":
    case "firestore/permission-denied":
      return "You do not have permission to access this attendance data. Sign in with the correct account role and try again.";
    case "functions/permission-denied":
      return error instanceof Error ? error.message : "You do not have permission to mark attendance.";
    case "unauthenticated":
    case "firestore/unauthenticated":
      return "Your session has expired. Please sign in again.";
    case "not-found":
    case "firestore/not-found":
      return "The requested attendance session no longer exists.";
    case "failed-precondition":
    case "firestore/failed-precondition":
    case "functions/failed-precondition":
      return "This attendance operation is not currently allowed.";
    case "already-exists":
    case "functions/already-exists":
      return "Attendance already marked for this session.";
    case "invalid-argument":
    case "functions/invalid-argument":
      return error instanceof Error ? error.message : "Invalid attendance details.";
    case "unavailable":
    case "firestore/unavailable":
      return "Attendance is temporarily unavailable. Check your connection and try again.";
    default:
      return error instanceof Error ? error.message : "Unable to load attendance data.";
  }
}

class AttendanceSessionService {
  async createSession(
    teacherId: string,
    input: CreateAttendanceSessionInput,
  ): Promise<AttendanceSession> {
    if (typeof teacherId !== "string" || !teacherId.trim()) {
      throw new Error("Teacher ID is required to create a session.");
    }

    const normalizedTeacherId = teacherId.trim();

    if (typeof input.subject !== "string" || !input.subject.trim()) {
      throw new Error("Subject is required to create a session.");
    }

    if (typeof input.classId !== "string" || !input.classId.trim()) {
      throw new Error("Class ID is required to create a session.");
    }

    if (
      typeof input.durationMinutes !== "number"
      || !Number.isFinite(input.durationMinutes)
      || input.durationMinutes <= 0
    ) {
      throw new Error("Duration must be a positive finite number.");
    }

    if (typeof input.sessionDate !== "string" || !input.sessionDate.trim()) {
      throw new Error("A valid session date is required.");
    }

    const sessionMethod = normalizeAttendanceMethod(input.attendanceMethod ?? "both");
    const sessionDate = input.sessionDate.trim();
    const startAt = new Date(`${sessionDate}T${input.startTime}`);

    if (!Number.isFinite(startAt.getTime())) {
      throw new Error("A valid session date is required.");
    }

    const endAt = new Date(startAt.getTime() + input.durationMinutes * 60 * 1000);
    if (!input.location || !Number.isFinite(input.location.latitude) || !Number.isFinite(input.location.longitude)) {
      throw new Error("Session location coordinates are required.");
    }
    const attendanceCode = sessionMethod === "qr" ? "" : this.generateAttendanceCode();
    const qrSessionToken = sessionMethod === "code" ? "" : this.generateQrToken();

    const sessionPayload = {
      teacherId: normalizedTeacherId,
      subject: input.subject.trim(),
      classId: input.classId.trim(),
      attendanceCode: "",
      attendanceMethod: sessionMethod,
      qrSessionToken: "",
      status: "active" as AttendanceSessionStatus,
      sessionDate,
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      durationMinutes: input.durationMinutes,
      createdAt: serverTimestamp(),
      location: input.location,
    };

    const docRef = await addDoc(attendanceSessionsCollection, sessionPayload);
    try {
      await setDoc(doc(attendanceSecretsCollection, docRef.id), { attendanceCode, qrSessionToken });
    } catch (error) {
      await deleteDoc(docRef);
      throw error;
    }

    return {
      sessionId: docRef.id,
      teacherId: normalizedTeacherId,
      subject: sessionPayload.subject,
      classId: sessionPayload.classId,
      attendanceCode,
      attendanceMethod: sessionMethod,
      qrSessionToken,
      status: sessionPayload.status,
      sessionDate,
      startTime: sessionPayload.startTime,
      endTime: sessionPayload.endTime,
      startAt: sessionPayload.startTime,
      endAt: sessionPayload.endTime,
      durationMinutes: sessionPayload.durationMinutes,
      createdAt: new Date().toISOString(),
      location: input.location,
    };
  }

  async getTeacherSessions(teacherId: string): Promise<AttendanceSession[]> {
    const sessionQuery = query(
      attendanceSessionsCollection,
      where("teacherId", "==", teacherId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(sessionQuery);
    return Promise.all(snapshot.docs.map(async (docSnap) => this.mapSession(docSnap, true)));
  }

  async getRecentTeacherSessions(teacherId: string, count = 5): Promise<AttendanceSession[]> {
    const recentQuery = query(
      attendanceSessionsCollection,
      where("teacherId", "==", teacherId),
      orderBy("createdAt", "desc"),
      limit(count),
    );

    const snapshot = await getDocs(recentQuery);
    return Promise.all(snapshot.docs.map(async (docSnap) => this.mapSession(docSnap, true)));
  }

  private async mapSession(docSnap: QueryDocumentSnapshot, includeSecrets = false): Promise<AttendanceSession> {
    const data = docSnap.data();
    const secretDoc = includeSecrets ? await getDoc(doc(attendanceSecretsCollection, docSnap.id)) : null;
    const secrets = secretDoc?.data();
    const rawStatus = typeof data.status === "string" ? data.status : "created";
    const normalizedStatus: AttendanceSessionStatus =
      rawStatus === "created" || rawStatus === "active" || rawStatus === "ended" || rawStatus === "expired"
        ? rawStatus
        : "created";

    const sessionMethod = normalizeAttendanceMethod(data.attendanceMethod ?? "both");
    const session: AttendanceSession = {
      sessionId: docSnap.id,
      teacherId: typeof data.teacherId === "string" ? data.teacherId : "",
      subject: typeof data.subject === "string" ? data.subject : "",
      classId: typeof data.classId === "string" ? data.classId : "",
      attendanceCode: typeof secrets?.attendanceCode === "string" ? secrets.attendanceCode : "",
      attendanceMethod: sessionMethod,
      qrSessionToken: typeof secrets?.qrSessionToken === "string" ? secrets.qrSessionToken : undefined,
      status: normalizedStatus,
      sessionDate: typeof data.sessionDate === "string" ? data.sessionDate : "",
      startTime: typeof data.startTime === "string" ? data.startTime : this.toIsoString(data.startAt),
      endTime: typeof data.endTime === "string" ? data.endTime : this.toIsoString(data.endAt),
      startAt: this.toIsoString(data.startAt),
      endAt: this.toIsoString(data.endAt),
      durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 0,
      createdAt: this.toIsoString(data.createdAt),
      location: this.toLocation(data.location),
    };

    return {
      ...session,
      status: getEffectiveSessionStatus(session, Date.now()),
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

  private toLocation(value: unknown): { latitude: number; longitude: number } | undefined {
    if (typeof value !== "object" || value === null) return undefined;
    const location = value as { latitude?: unknown; longitude?: unknown };
    if (typeof location.latitude !== "number" || typeof location.longitude !== "number") return undefined;
    return { latitude: location.latitude, longitude: location.longitude };
  }

  private generateAttendanceCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    const randomValues = new Uint32Array(6);
    crypto.getRandomValues(randomValues);

    for (let index = 0; index < 6; index += 1) {
      code += chars[randomValues[index] % chars.length];
    }

    return code;
  }

  private generateQrToken(): string {
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (value) => value.toString(16).padStart(2, "0")).join("");
  }
}

export const attendanceSessionService = new AttendanceSessionService();
export type { AttendanceMethod, AttendanceSession, CreateAttendanceSessionInput, AttendanceSessionStatus } from "../types/attendance.types";
