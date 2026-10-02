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
export const FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || "";
export const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY?.trim() || "";
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY?.trim() || "";
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY?.trim() || "";
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT?.trim().replace(/\/$/, "") || "";


if (!SUPERADMIN_UID) throw new Error("[ENV] SUPERADMIN_UID is required.");
if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error("[ENV] FIREBASE_SERVICE_ACCOUNT_JSON is required.");
}
