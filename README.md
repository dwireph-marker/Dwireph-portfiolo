# Portfolio CMS

## Data and media architecture

Cloud Firestore stores runtime application data and media metadata. New media uploaded from the authenticated Admin Panel is stored in ImageKit. The browser receives the public ImageKit CDN URL; the ImageKit private key is server-only.

Existing files under `public/images` and `public/uploads` remain available for backward compatibility. There is no startup/background asset migration.

## Firebase initialization

The server reconciles required Firestore documents from `data/seed-data.json` when needed. It never uploads seed media to ImageKit automatically.

## ImageKit setup

Set these server environment variables:

```env
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

Never expose `IMAGEKIT_PRIVATE_KEY` to the frontend.

## Admin media upload

Admin Panel -> authenticated API -> server-side file validation -> ImageKit -> Firestore metadata.

Video uploads are stored under `/portfolio/videos`. MP4 and WebM are supported for reliable HTML5 playback. The generated ImageKit URL is used directly by the video player.


## Routing
The application uses `react-router-dom` with clean routes: `/` for the portfolio and `/admin` for the admin console. Hash-based page routing such as `/#admin` is not used. Run `npm install` once after extracting the project to regenerate `package-lock.json` with the router dependency.

## Vercel deployment

This project is arranged for Vercel with Vite static output plus an Express API function. Vercel serves the built frontend from `dist` and routes `/api/*` to `api/index.ts`. Direct `/admin/*` routes are rewritten to the SPA entry so React Router can handle them. Vercel supports Express as a serverless function, while static assets should be served from the deployment's static output rather than relying on `express.static()`.

Required Vercel environment variables:

- `NODE_ENV=production`
- `APP_ORIGIN=https://your-domain.vercel.app` (use your custom domain in production; set a separate Preview value if needed)
- `SESSION_SECRET=<64+ random characters>`
- `SUPERADMIN_UID=<Firebase Authentication UID>`
- `FIREBASE_PROJECT_ID=<project id>`
- `FIREBASE_SERVICE_ACCOUNT_JSON=<service account JSON>`
- `FIREBASE_WEB_API_KEY=<Firebase web API key>`
- `IMAGEKIT_PRIVATE_KEY=<ImageKit private key>`
- `IMAGEKIT_PUBLIC_KEY=<ImageKit public key>`
- `IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<imagekit-id>`
- `GEMINI_API_KEY=<only if the existing AI feature is enabled>`

For Vercel, new media uploads go directly from the authenticated browser to ImageKit using short-lived server-generated upload authentication parameters. The private ImageKit key never reaches the browser and large video files do not pass through a Vercel Function.

Deploy with:

```bash
npm install
npm run build
npx vercel --prod
```

Do not store uploaded files in the Vercel function filesystem. Vercel functions have read-only persistent filesystems; durable uploads should use object storage such as ImageKit.
