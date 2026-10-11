import { randomBytes } from "node:crypto";

import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

if (getApps().length === 0) {
  initializeApp();
}

setGlobalOptions({ region: "asia-south1", maxInstances: 10 });

const auth = getAuth();
const db = getFirestore();

function distanceInMeters(first: { latitude: number; longitude: number }, second: { latitude: number; longitude: number }): number {
  const earthRadius = 6371000;
  const latitudeDelta = (second.latitude - first.latitude) * Math.PI / 180;
  const longitudeDelta = (second.longitude - first.longitude) * Math.PI / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(first.latitude * Math.PI / 180) * Math.cos(second.latitude * Math.PI / 180)
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type AdminStatus = "active" | "inactive";

interface CallableRequest {
  auth?: { uid: string } | null;
  data?: Record<string, unknown>;
}

async function requireActiveAdmin(request: CallableRequest): Promise<string> {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const profile = await db.collection("users").doc(uid).get();
  const data = profile.data();

  if (!profile.exists || data?.role !== "admin" || data.status === "inactive") {
    throw new HttpsError("permission-denied", "Administrator access is required.");
  }

  return uid;
}

function validateText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    throw new HttpsError("invalid-argument", `${field} is invalid.`);
  }

  return normalized;
}

function validateEmail(value: unknown): string {
  const email = validateText(value, "Email", 254).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Enter a valid email address.");
  }

  return email;
}

async function writeAuditLog(
  actorUid: string,
  action: "admin_created" | "admin_activated" | "admin_deactivated",
  targetUid: string,
): Promise<void> {
  await db.collection("auditLogs").add({
    actorUid,
    action,
    targetUid,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export const createAdmin = onCall(async (request) => {
  const actorUid = await requireActiveAdmin(request);

  const name = validateText(request.data?.name, "Name", 120);
  const email = validateEmail(request.data?.email);

  try {
    await auth.getUserByEmail(email);
    throw new HttpsError("already-exists", "An account already exists with this email.");
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    if ((error as { code?: string }).code !== "auth/user-not-found") {
      throw new HttpsError("internal", "Unable to verify the email address.");
    }
  }

  const user = await auth.createUser({
    email,
    displayName: name,
    password: randomBytes(32).toString("base64url"),
    disabled: false,
  });

  try {
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      name,
      email,
      role: "admin",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    await writeAuditLog(actorUid, "admin_created", user.uid);
  } catch (error) {
    try {
      await db.collection("users").doc(user.uid).delete();
      await auth.deleteUser(user.uid);
    } catch (rollbackError) {
      console.error("Admin creation rollback failed", rollbackError);
    }
    console.error("Admin profile creation failed", error);
    throw new HttpsError("internal", "Unable to create the administrator profile.");
  }

  return { uid: user.uid, email, status: "active", passwordResetRequired: true };
});

export const setAdminStatus = onCall(async (request) => {
  const actorUid = await requireActiveAdmin(request);

  const targetUid = validateText(request.data?.uid, "User ID", 128);
  const status = request.data?.status as AdminStatus;

  if (status !== "active" && status !== "inactive") {
    throw new HttpsError("invalid-argument", "Invalid administrator status.");
  }

  if (targetUid === actorUid && status === "inactive") {
    throw new HttpsError("failed-precondition", "You cannot deactivate your own account.");
  }

  const targetRef = db.collection("users").doc(targetUid);
  const target = await targetRef.get();

  if (!target.exists || target.data()?.role !== "admin") {
    throw new HttpsError("not-found", "Administrator profile not found.");
  }

  let previousStatus: AdminStatus = target.data()?.status === "inactive" ? "inactive" : "active";
  if (previousStatus === status) {
    return { uid: targetUid, status };
  }

  const previousDisabled = (await auth.getUser(targetUid)).disabled;
  try {
    await auth.updateUser(targetUid, { disabled: status === "inactive" });
    await db.runTransaction(async (transaction) => {
      const currentTarget = await transaction.get(targetRef);
      if (!currentTarget.exists || currentTarget.data()?.role !== "admin") {
        throw new HttpsError("not-found", "Administrator profile not found.");
      }
      previousStatus = currentTarget.data()?.status === "inactive" ? "inactive" : "active";
      if (status === "inactive") {
        const activeAdmins = await transaction.get(db.collection("users")
          .where("role", "==", "admin")
          .where("status", "==", "active"));
        if (activeAdmins.size <= 1) {
          throw new HttpsError("failed-precondition", "The last active administrator cannot be deactivated.");
        }
      }
      transaction.update(targetRef, { status });
    });
    await writeAuditLog(actorUid, status === "active" ? "admin_activated" : "admin_deactivated", targetUid);
  } catch (error) {
    try {
      await auth.updateUser(targetUid, { disabled: previousDisabled });
      await targetRef.update({ status: previousStatus });
    } catch (rollbackError) {
      console.error("Administrator status rollback failed", rollbackError);
    }
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Administrator status update failed", error);
    throw new HttpsError("internal", "Unable to update the administrator status.");
  }

  return { uid: targetUid, status };
});

export const markAttendance = onCall(async (request) => {
  const studentId = request.auth?.uid;
  if (!studentId) throw new HttpsError("unauthenticated", "Authentication is required.");

  const sessionId = validateText(request.data?.sessionId, "Session ID", 128);
  const attendanceMethod = request.data?.attendanceMethod;
  const value = typeof request.data?.value === "string" ? request.data.value.trim().toUpperCase() : "";
  const location = request.data?.location as { latitude?: unknown; longitude?: unknown } | undefined;
  if ((attendanceMethod !== "qr" && attendanceMethod !== "code")
    || typeof location?.latitude !== "number" || typeof location.longitude !== "number") {
    throw new HttpsError("invalid-argument", "Attendance method and location are required.");
  }

  const studentRef = db.collection("users").doc(studentId);
  const sessionRef = db.collection("attendanceSessions").doc(sessionId);
  const recordRef = db.collection("attendanceRecords").doc(`${sessionId}_${studentId}`);
  const secretRef = db.collection("attendanceSessionSecrets").doc(sessionId);
  const [student, session, secret] = await Promise.all([studentRef.get(), sessionRef.get(), secretRef.get()]);
  const studentData = student.data();
  const sessionData = session.data();
  if (!student.exists || studentData?.role !== "student" || studentData.status !== "active") {
    throw new HttpsError("permission-denied", "Student access is required.");
  }
  if (!session.exists || !sessionData) throw new HttpsError("not-found", "This attendance session no longer exists.");
  const secretData = secret.data();
  if (!secret.exists || !secretData) throw new HttpsError("failed-precondition", "This session is not ready for attendance.");
  const now = Date.now();
  const start = sessionData.startAt.toMillis();
  const end = sessionData.endAt.toMillis();
  if (sessionData.status !== "active" || now < start || now >= end) throw new HttpsError("failed-precondition", "This session is not active.");
  if (studentData.classId !== sessionData.classId) throw new HttpsError("permission-denied", "You are not enrolled in this class.");
  if (sessionData.attendanceMethod !== "both" && sessionData.attendanceMethod !== attendanceMethod) throw new HttpsError("permission-denied", "This attendance method is not enabled.");
  if (attendanceMethod === "code" && value !== String(secretData.attendanceCode).toUpperCase()) throw new HttpsError("invalid-argument", "Invalid attendance code.");
  if (attendanceMethod === "qr" && value !== `${sessionId}:${secretData.qrSessionToken}`.toUpperCase()) throw new HttpsError("invalid-argument", "Invalid attendance QR.");
  if (!sessionData.location) {
    throw new HttpsError("failed-precondition", "Attendance location has not been configured for this session.");
  }
  if (distanceInMeters(sessionData.location, { latitude: location.latitude as number, longitude: location.longitude as number }) > 10) {
    throw new HttpsError("permission-denied", "You are outside the allowed attendance area.");
  }

  try {
    await recordRef.create({ sessionId, studentId, studentName: studentData.name, subject: sessionData.subject, attendanceMethod, status: "present", markedAt: FieldValue.serverTimestamp() });
  } catch (error) {
    if ((error as { code?: number }).code === 6) throw new HttpsError("already-exists", "Attendance already marked for this session.");
    throw new HttpsError("internal", "Unable to mark attendance.");
  }
  return { attendanceId: recordRef.id, sessionId, studentId, subject: sessionData.subject, status: "present" };
});