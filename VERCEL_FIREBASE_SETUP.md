# Vercel Firebase setup

The public portfolio uses Firestore through the Express Vercel Function. Public CMS reads do not require `SUPERADMIN_UID` or `APP_ORIGIN` to be present at module startup.

Set these Production environment variables in Vercel:

```text
SESSION_SECRET=<32+ character random secret>
FIREBASE_SERVICE_ACCOUNT_JSON=<the complete Firebase service-account JSON as one environment variable>
FIREBASE_PROJECT_ID=<Firebase project ID>
FIREBASE_WEB_API_KEY=<Firebase Web API key>
SUPERADMIN_UID=<Firebase Authentication UID of the superadmin>
IMAGEKIT_PRIVATE_KEY=<ImageKit private key>
IMAGEKIT_PUBLIC_KEY=<ImageKit public key>
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<imagekit-id>
```

`APP_ORIGIN` is optional on Vercel. If omitted, the API derives the same-origin host from the incoming request. If you set it, use the exact production URL, for example:

```text
APP_ORIGIN=https://dwportfolio-black.vercel.app
```

Do not commit `.env` or service-account JSON to GitHub.

## Why the public site no longer depends on admin bootstrap

Firestore CMS initialization and superadmin bootstrap are separate concerns. Existing Firestore content is used directly. A missing or stale `SUPERADMIN_UID` can no longer make public `/api/settings`, `/api/content`, or `/api/projects` requests fail.

The superadmin document is bootstrapped lazily when the configured Firebase Auth UID successfully authenticates.
