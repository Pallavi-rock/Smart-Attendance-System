import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { db, functions } from "../../../lib/firebase";
import type { UserProfile, UserStatus } from "../../auth/types/auth.types";

interface CreateAdminInput { name: string; email: string; }
interface CreateAdminResult { uid: string; email: string; status: UserStatus; passwordResetRequired: boolean; }
interface SetAdminStatusInput { uid: string; status: UserStatus; }
interface SetAdminStatusResult { uid: string; status: UserStatus; }
export interface AdminPage { admins: UserProfile[]; cursor: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean; }
export interface AdminActivity { action: string; targetUid: string; createdAt: string | null; }

export interface AdminDashboardStats {
  students: number;
  teachers: number;
  admins: number;
  activeAdmins: number;
  inactiveAdmins: number;
}

const createAdminCallable = httpsCallable<CreateAdminInput, CreateAdminResult>(functions, "createAdmin");
const setAdminStatusCallable = httpsCallable<SetAdminStatusInput, SetAdminStatusResult>(functions, "setAdminStatus");

class AdminService {
  async listAdmins(pageSize = 25, cursor: QueryDocumentSnapshot<DocumentData> | null = null): Promise<AdminPage> {
    const constraints = [where("role", "==", "admin"), orderBy("createdAt", "desc"), limit(pageSize + 1)];
    const snapshot = await getDocs(cursor ? query(collection(db, "users"), ...constraints.slice(0, 2), startAfter(cursor), constraints[2]) : query(collection(db, "users"), ...constraints));
    const page = snapshot.docs.slice(0, pageSize);

    return {
      admins: page.map((item) => {
      const data = item.data();
      return {
        uid: item.id,
        name: typeof data.name === "string" ? data.name : "",
        email: typeof data.email === "string" ? data.email : "",
        role: "admin" as const,
        status: data.status === "inactive" ? "inactive" as const : "active" as const,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
      }),
      cursor: page.at(-1) ?? null,
      hasMore: snapshot.docs.length > pageSize,
    };
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const count = (role: string, status?: UserStatus) => getCountFromServer(
      status
        ? query(collection(db, "users"), where("role", "==", role), where("status", "==", status))
        : query(collection(db, "users"), where("role", "==", role)),
    ).then((result) => result.data().count);
    const [students, teachers, admins, activeAdmins, inactiveAdmins] = await Promise.all([
      count("student"), count("teacher"), count("admin"), count("admin", "active"), count("admin", "inactive"),
    ]);
    return {
      students,
      teachers,
      admins,
      activeAdmins,
      inactiveAdmins,
    };
  }

  async getRecentActivity(): Promise<AdminActivity[]> {
    const snapshot = await getDocs(query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(8)));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        action: typeof data.action === "string" ? data.action : "admin_updated",
        targetUid: typeof data.targetUid === "string" ? data.targetUid : "",
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
  }

  async createAdmin(input: CreateAdminInput): Promise<CreateAdminResult> {
    return (await createAdminCallable(input)).data;
  }

  async setAdminStatus(input: SetAdminStatusInput): Promise<SetAdminStatusResult> {
    return (await setAdminStatusCallable(input)).data;
  }
}

export function getAdminErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  switch (code) {
    case "functions/permission-denied": return "Administrator access is required.";
    case "functions/already-exists": return "An account already exists with this email.";
    case "functions/failed-precondition": return error instanceof Error ? error.message : "This administrator action is not allowed.";
    case "functions/invalid-argument": return "Check the administrator details and try again.";
    default: return "Unable to complete the administrator action. Please try again.";
  }
}

export const adminService = new AdminService();