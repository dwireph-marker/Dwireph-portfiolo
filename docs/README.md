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
