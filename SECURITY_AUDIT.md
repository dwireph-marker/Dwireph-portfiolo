> Historical audit generated before the Firebase + ImageKit migration.
> Runtime persistence described below has since been replaced by Firestore.

# Security & Structure Audit

Five independent static audit passes were run after the changes. The project does **not** contain Firebase configuration/rules; it uses a local JSON database and local media storage.

1. **Secrets: PASS** — No suspicious hard-coded secret assignments remain in source.
2. **Session exposure: PASS** — No browser storage or JSON response token patterns remain.
3. **Script sinks: PASS** — No dangerous HTML/eval sinks found by static scan.
4. **Uploads: PASS** — Upload size cap, extension allowlist, cryptographic filenames, and SVG rejection were inspected.
5. **Authorization: PASS** — Admin mutation routes use requireAuth; public GET/contact submit routes remain intentionally public.

## Applied fixes
- Admin session tokens are no longer persisted in browser storage or returned in API JSON; authentication uses an HTTP-only, `SameSite=Strict` cookie.
- Session tokens are stored hashed (SHA-256) in the server auth file.
- State-changing requests are same-origin checked and production HSTS/COOP/CORP headers were added.
- SVG uploads are rejected; uploads are limited to one file, 50 MB, and an explicit extension allowlist. Filenames use cryptographic randomness.
- General JSON/urlencoded request bodies are capped at 2 MB.
- Hard-coded default admin credentials were removed; `Firebase Authentication email` and `Firebase Authentication password` are required.
- Responsive CSS was added for mobile, tablet, desktop, safe-area insets, reduced motion, and overflow/viewport containment.
- Large CSS files were split into importable parts, and source files are now at or below 300 lines.

## Validation
- TypeScript transpile parsing completed without syntax diagnostics for the server/auth/API files.
- Full dependency-backed lint/build could not be executed because the uploaded project dependencies were not installed and package installation timed out in the execution environment.
- Firebase rules were checked for `firebase.json`, Firestore rules, and Storage rules; none are present, so there is no Firebase ruleset to modify.


## Security Hardening Applied (2026-10-01)

The current codebase has been hardened with the following changes:

- Admin authentication is cookie-only; session tokens are never returned to or stored in browser JavaScript.
- Admin sessions use HTTP-only, Secure-in-production, SameSite=Strict cookies with 12-hour absolute lifetime and 1-hour idle timeout.
- CSRF protection uses a per-session token plus strict Origin validation for unsafe requests.
- Arbitrary credentialed CORS was removed.
- Admin authorization now validates the stored role and protects super-admin backup operations separately.
- Session identifiers are stored using HMAC-SHA256 derived from the server-only SESSION_SECRET.
- Login requires the configured administrator email and a 12–128 character password. The bootstrap password is no longer accepted as a perpetual alternate login credential.
- Brute-force protection now includes per-account and per-IP controls.
- Security headers include CSP, frame protection, COOP/CORP, HSTS in production, and restrictive Permissions-Policy.
- JSON/form body limits were reduced.
- Project update payloads are allowlisted to prevent mass assignment.
- CMS/backup payloads are bounded and checked for prototype-pollution keys and excessive nesting/size.
- Media uploads are capped at 100 MB, rate-limited, and checked against file signatures rather than trusting only the client MIME type.
- Internal upload/storage errors are no longer returned verbatim to clients.
- Password changes require the current password, enforce 12–128 characters, reject reuse, and invalidate all existing sessions.

### Verification note

The source-level security checks were completed. A full production build/dependency audit could not be completed in this environment because the uploaded archive did not contain `node_modules` and package installation could not fully complete due external registry/network timeouts. Run `npm ci`, `npm run build`, `npm audit --omit=dev`, and your deployment smoke tests before release.

## Data exposure hardening (latest review)

- Public project listing excludes unpublished projects.
- Public project detail requests return 404 for unpublished projects unless the requester has a valid current admin role.
- Draft listing authorization re-checks the current UID-keyed Firestore admin record rather than trusting only an existing session.
- Backup export is restricted to superadmin, because backups contain messages and audit logs.
- Firebase client rules are fail-closed for every collection; the browser has no direct Firestore access. The server uses Firebase Admin SDK, so server-side authentication/authorization remains the authoritative boundary.
- Firebase Auth credentials, service-account JSON, session secret, Gemini secret, and ImageKit private key are server-only environment variables and are not referenced by client code.
