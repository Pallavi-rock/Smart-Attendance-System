import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { env } from "./env";

const app = initializeApp(env.firebase);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const functions = getFunctions(app, "asia-south1");

export default app;