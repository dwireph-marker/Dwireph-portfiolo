# Firebase + ImageKit setup

Firestore stores application data and metadata. ImageKit stores all new Admin Panel media uploads (images and videos).

## Required server environment

```env
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

`IMAGEKIT_PRIVATE_KEY` is server-only and must never be exposed through Vite/client environment variables.

## Upload flow

Admin Panel -> authenticated `/api/media/upload` -> server validates the file -> ImageKit -> Firestore media metadata.

The browser receives only the public ImageKit CDN URL. It never receives the ImageKit private key.

New video uploads are placed under `/portfolio/videos` and images under `/portfolio/images`.

For reliable HTML5 playback, upload MP4 (H.264/AAC is recommended) or WebM. MOV files are intentionally rejected because browser playback is inconsistent.

## Existing files

Existing `/uploads/*` and `/images/*` files are left untouched for backward compatibility. There is no startup migration and no background upload job.
