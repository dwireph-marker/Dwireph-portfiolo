import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON } from "./env.js";

let firestore: Firestore | null = null;
let auth: Auth | null = null;

function getCredential() {
  try {
    const raw = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
      [key: string]: unknown;
    };
    if (!raw.project_id || !raw.client_email || !raw.private_key) {
      throw new Error("Firebase service-account JSON is missing project_id, client_email, or private_key.");
    }
    raw.private_key = String(raw.private_key).replace(/\\n/g, "\n");
    return cert(raw as Parameters<typeof cert>[0]);
  } catch (error) {
    throw new Error(`Firebase Admin credentials are invalid: ${error instanceof Error ? error.message : "invalid service-account configuration"}`);
  }
}

export function getFirebaseDb(): Firestore {
  if (firestore) return firestore;
  if (!getApps().length) {
    initializeApp({
      credential: getCredential(),
      ...(FIREBASE_PROJECT_ID ? { projectId: FIREBASE_PROJECT_ID } : {}),
    });
  }
  firestore = getFirestore();
  return firestore;
}


export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  // getFirebaseDb() initializes the Admin SDK exactly once.
  getFirebaseDb();
  auth = getAuth();
  return auth;
}
