import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "../../../lib/firebase";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";
import type { RegisterUserData, UserProfile } from "../types/auth.types";
import { AuthContext } from "./auth-context";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncProfile(firebaseUser: User | null) {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await userService.getProfile(firebaseUser.uid);
      setProfile(nextProfile);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await syncProfile(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function loadProfileOrThrow(firebaseUser: User): Promise<UserProfile> {
    const nextProfile = await userService.getProfile(firebaseUser.uid);

    if (!nextProfile) {
      setProfile(null);
      throw new Error("Your account profile could not be found. Please contact an administrator.");
    }

    if (nextProfile.status === "inactive") {
      await authService.logout();
      setUser(null);
      setProfile(null);
      throw new Error("Your account is inactive. Contact an administrator.");
    }

    setProfile(nextProfile);
    return nextProfile;
  }

  async function login(email: string, password: string): Promise<UserProfile> {
    const firebaseUser = await authService.login({
      email,
      password,
    });

    setUser(firebaseUser);
    return loadProfileOrThrow(firebaseUser);
  }

  async function register(data: RegisterUserData): Promise<UserProfile> {
    const firebaseUser = await authService.register(data);

    setUser(firebaseUser);
    return loadProfileOrThrow(firebaseUser);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
