import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../../../lib/firebase";
import type { UserProfile, UserStatus } from "../types/auth.types";

interface CreateUserProfileInput {
  name: string;
  email: string;
  role: "student" | "teacher";
  department?: string;
  semester?: string;
  employeeId?: string;
  subjects?: string;
  classId?: string;
}

class UserService {
  async createProfile(uid: string, data: CreateUserProfileInput): Promise<UserProfile> {
    const profile: UserProfile = {
      uid,
      name: data.name,
      email: data.email,
      role: data.role,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), {
      uid: profile.uid,
      name: profile.name,
      email: profile.email,
      role: data.role,
      status: "active",
      createdAt: serverTimestamp(),
      ...(data.department ? { department: data.department } : {}),
      ...(data.semester ? { semester: data.semester } : {}),
      ...(data.employeeId ? { employeeId: data.employeeId } : {}),
      ...(data.subjects ? { subjects: data.subjects } : {}),
      ...(data.classId ? { classId: data.classId } : {}),
    });

    return profile;
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const role = data.role;
    const status = data.status ?? "active";

    if (role !== "student" && role !== "teacher" && role !== "admin") {
      throw new Error("Invalid user role in Firestore profile");
    }

    if (status !== "active" && status !== "inactive") {
      throw new Error("Invalid user status in Firestore profile");
    }

    return {
      uid: data.uid ?? uid,
      name: typeof data.name === "string" ? data.name : "",
      email: typeof data.email === "string" ? data.email : "",
      role,
      status: status as UserStatus,
      createdAt: this.serializeCreatedAt(data.createdAt),
      department: typeof data.department === "string" ? data.department : undefined,
      semester: typeof data.semester === "string" ? data.semester : undefined,
      classId: typeof data.classId === "string" ? data.classId : undefined,
    };
  }

  private serializeCreatedAt(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return new Date(value).toISOString();
    }

    if (typeof value === "object" && "toDate" in value) {
      const maybeDate = value as { toDate?: () => Date };

      if (typeof maybeDate.toDate === "function") {
        return maybeDate.toDate().toISOString();
      }
    }

    return null;
  }
}

export const userService = new UserService();
