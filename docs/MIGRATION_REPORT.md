# Media storage update

The application previously used local filesystem uploads. The current implementation uses ImageKit for all new Admin Panel media uploads.

- Firestore: application data and media metadata.
- ImageKit: new images and videos uploaded from the Admin Panel.
- Existing `/images/*` and `/uploads/*`: retained for backward compatibility.
- No startup migration.
- No background upload/retry job.
- ImageKit private key is server-only.
