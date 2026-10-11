import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { userService } from "./user.service";

import type {
  LoginUserData,
  RegisterUserData,
  UserProfile,
} from "../types/auth.types";

class AuthService {
  async register(data: RegisterUserData): Promise<User> {
    if (data.role !== "student" && data.role !== "teacher") {
      throw new Error("Public registration is available only for student and teacher accounts.");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    const user = userCredential.user;

    try {
      await updateProfile(user, { displayName: data.name });
      await userService.createProfile(user.uid, {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        semester: data.semester,
        employeeId: data.employeeId,
        subjects: data.subjects,
        classId: data.classId,
      });
    } catch (error) {
      try {
        await deleteUser(user);
      } catch (rollbackError) {
        console.error("Student registration rollback failed", { code: getFirebaseErrorCode(rollbackError) });
      }
      throw error;
    }

    return user;
  }

  async login(data: LoginUserData): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    return userCredential.user;
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    return userService.getProfile(currentUser.uid);
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "Public registration is available only for student and teacher accounts.") {
      return error.message;
    }

    if (error.message.startsWith("Your account profile could not be found")) {
      return error.message;
    }

    if (error.message === "Your teacher application is pending.") {
      return error.message;
    }

    if (error.message.startsWith("Your account is inactive")) {
      return error.message;
    }

    if (error.message.includes("teacher application")) {
      return "Unable to submit your teacher application. Please try again.";
    }
  }

  const code = getFirebaseErrorCode(error);
  const message = getFirebaseErrorMessage(error);

  if (import.meta.env.DEV && (code || message)) {
    console.error("Firebase registration operation failed", { code, message });
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Choose a stronger password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/network-request-failed":
      return "Unable to connect. Check your internet connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password registration is disabled in Firebase. Enable the Email/Password provider in Firebase Authentication.";
    case "auth/admin-restricted-operation":
      return "Public registration is restricted. Please use the appropriate account application flow.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again later.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "Your account was created, but its profile could not be saved. Check the Firebase Firestore rules and try again.";
    case "unavailable":
    case "firestore/unavailable":
      return "Firebase is temporarily unavailable. Please try again shortly.";
    case "failed-precondition":
    case "firestore/failed-precondition":
      return "Registration could not be completed. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function getFirebaseErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "";
  }

  return typeof error.code === "string" ? error.code : "";
}

function getFirebaseErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return "";
  }

  return typeof error.message === "string" ? error.message : "";
}

export const authService = new AuthService();