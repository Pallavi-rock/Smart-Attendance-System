import type { User } from "firebase/auth";

export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "active" | "inactive";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string | null;
  department?: string;
  semester?: string;
  classId?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
  employeeId?: string;
  subjects?: string;
  department?: string;
  semester?: string;
  classId?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  register: (data: RegisterUserData) => Promise<UserProfile>;
}