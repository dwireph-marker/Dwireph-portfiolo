import dotenv from "dotenv";

dotenv.config();

function required(name: string, value?: string) {
  if (!value) throw new Error(`[ENV] Missing required environment variable: ${name}`);
  return value;
}

export const SUPERADMIN_UID = process.env.SUPERADMIN_UID?.trim() || "";
export const SESSION_SECRET = required("SESSION_SECRET", process.env.SESSION_SECRET);
export const APP_ORIGIN = process.env.APP_ORIGIN?.trim() || "";

if (SESSION_SECRET.length < 32) throw new Error("[ENV] SESSION_SECRET must be at least 32 characters.");
if (process.env.NODE_ENV === "production" && !APP_ORIGIN) throw new Error("[ENV] APP_ORIGIN is required in production.");

export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID?.trim() || "";

// Vercel-friendly Firebase Admin configuration. Prefer one JSON secret, but also
// support separate service-account variables because multiline JSON is easy to
// misconfigure in dashboard environment variables.
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL?.trim() || "";
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || "";

export const FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
  (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY
    ? JSON.stringify({
        type: "service_account",
        project_id: FIREBASE_PROJECT_ID,
        client_email: FIREBASE_CLIENT_EMAIL,
        private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      })
    : "");
export const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY?.trim() || "";
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY?.trim() || "";
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY?.trim() || "";
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT?.trim().replace(/\/$/, "") || "";


if (!SUPERADMIN_UID) throw new Error("[ENV] SUPERADMIN_UID is required.");
if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error("[ENV] FIREBASE_SERVICE_ACCOUNT_JSON is required.");
}
