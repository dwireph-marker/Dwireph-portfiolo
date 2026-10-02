import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON } from "./env.js";

let firestore: Firestore | null = null;
let auth: Auth | null = null;

function getCredential() {
  return cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON));
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
