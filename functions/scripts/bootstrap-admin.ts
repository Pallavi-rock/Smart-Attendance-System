import { stdin, stdout } from "node:process";

import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();
async function prompt(label: string, hidden = true): Promise<string> {
  stdout.write(label);
  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode?.(false);
      stdin.pause();
    };
    const onData = (chunk: Buffer) => {
      const input = chunk.toString();
      if (input === "\u0003") {
        cleanup();
        reject(new Error("Bootstrap cancelled."));
      } else if (input.includes("\n") || input.includes("\r")) {
        cleanup();
        stdout.write("\n");
        resolve(value.trim());
      } else if (input === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += input;
        if (!hidden) stdout.write(input);
      }
    };
    stdin.setRawMode?.(hidden);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function promptVisible(label: string): Promise<string> {
  return prompt(label, false);
}

async function main(): Promise<void> {
  const lockRef = db.doc("system/config");
  await db.runTransaction(async (transaction) => {
    const lock = await transaction.get(lockRef);
    const adminProfiles = await transaction.get(db.collection("users").where("role", "==", "admin"));
    if (lock.exists || !adminProfiles.empty) {
      throw new Error("Bootstrap refused: initialization has already been claimed or an administrator exists.");
    }
    transaction.create(lockRef, { state: "in_progress", claimedAt: FieldValue.serverTimestamp() });
  });

  const name = await promptVisible("Administrator name: ");
  const email = (await promptVisible("Administrator email: ")).toLowerCase();
  const password = await prompt("Temporary password (change it after first login): ");

  if (!name || !email || password.length < 12) {
    throw new Error("Name and email are required; password must be at least 12 characters.");
  }

  try {
    const user = await auth.createUser({ email, password, displayName: name });
    try {
      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        name,
        email,
        role: "admin",
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
      });
      await lockRef.update({ state: "completed", completedAt: FieldValue.serverTimestamp() });
    } catch (error) {
      await auth.deleteUser(user.uid);
      throw error;
    }
  } catch (error) {
    await lockRef.update({ state: "failed", failedAt: FieldValue.serverTimestamp() });
    throw error;
  }

  console.log(`Initial administrator created: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Bootstrap failed.");
    process.exitCode = 1;
  })
  .finally(() => stdin.pause());