/**
 * Centralized environment configuration.
 * Values are read from Vite env vars — never hardcode secrets here.
 * Add corresponding keys to `.env.local` at the project root.
 */
const requiredFirebaseKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const firebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingFirebaseKeys = requiredFirebaseKeys.filter((key) => {
  const value = import.meta.env[key];
  return typeof value !== "string" || !value.trim();
});

if (missingFirebaseKeys.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingFirebaseKeys.join(", ")}`);
}

export const env = {
  appEnv: import.meta.env.MODE,
  firebase,
};