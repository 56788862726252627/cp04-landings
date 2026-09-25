# Auth And Roles

## Current Status

Authentication is implemented, not merely planned:

- Real Supabase-based auth exists in the frontend (`src/auth/AuthContext.jsx`, `src/auth/authService.js`).
- The Worker enforces role authorization server-side (`worker-reservas/auth/authorization.js`), gated by `CP04_ENFORCE_ROLE_GATES`, which is **active in production today**.
- The effective authorization decision is made server-side, not just hidden/shown in the UI.
- Verification level: (b) tested locally/in QA sessions against the real deployed Worker, across all 4 roles. (c) Not yet verified: a full production rollout with real end-user accounts at scale.
- Known open gap: the frontend still stores the Supabase access/refresh tokens in `localStorage` instead of using the Worker's existing `HttpOnly` session cookies. Auth still works, but this is a real security item to close before treating the auth flow as fully production-hardened — see `SECURITY.md`.

Do not publish admin, staff or support functionality against real private data until the specific data flow involved has been verified end-to-end (auth existing is necessary but not sufficient on its own).

## Planned Roles

### PLAYER

Intended for club players and customers.

Permissions:

- Create booking requests.
- View own future reservations when backend users exist.
- View ranking and tournament participation.
- Access future payments for own bookings.

Suggested visible sections:

- Inicio
- Reservas
- Ranking

### STAFF

Intended for reception and daily operations.

Permissions:

- View and manage reservations.
- Consult availability.
- Register and resolve incidents.
- Help customers at reception.

Suggested protected sections:

- Gestion

### ADMIN

Intended for club owners/managers.

Permissions:

- View business metrics.
- Manage courts, customers and staff.
- Configure tournaments and ranking rules.
- Review payments and automations.
- Manage integration settings at a high level.

Suggested protected sections:

- Admin

### SUPPORT

Intended for technical operators.

Permissions:

- View integration status.
- Review technical logs and errors.
- Audit Worker/backend configuration.
- Inspect pending private variables without exposing values.

Suggested protected sections:

- Soporte

## Sections To Protect Before Production

- Gestion
- Admin
- Soporte
- Any future customer reservation history
- Any future payment or invoice screen
- Any endpoint returning private data

## Recommended Auth Options

**Decision made: Supabase Auth was selected and is implemented.** The list below is kept only as historical context for why it was chosen.

- Auth0
- Clerk
- Supabase Auth ← selected
- Firebase Auth
- Custom backend sessions with secure cookies

## Auth Variables

Backend/Worker variables (already configured as Cloudflare Worker secrets, live in production):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Public frontend variable actually read by the app today (`src/auth/authService.js`, documented in `.env.example`):

- `VITE_CP04_AUTH_MODE`: controls demo vs. production auth behavior. Fails closed to production behavior if misconfigured in a production build.

The generic variables below were placeholders for a not-yet-chosen provider. They do not apply now that Supabase is the implemented provider; kept only in case an additional/alternative provider is ever added later:

- `AUTH_ISSUER_URL`, `AUTH_AUDIENCE`, `AUTH_CLIENT_SECRET`, `SESSION_SECRET`, `JWT_VERIFICATION_KEY` (or provider-specific equivalents).

Only public identifiers may use `VITE_`. Client secrets, session secrets and signing keys must never be exposed to the browser.

## Authorization Rules

Frontend role checks are only UX hints. Real protection must happen server-side.

Minimum backend rules:

- Validate user identity on every protected request.
- Validate role/permission on every protected request.
- Never trust role values sent from the browser.
- Keep admin/support data out of public build artifacts.
- Log access attempts without storing secrets.

## Risks If Published Without Real Auth

(Historical rationale for why auth was required — the auth described in "Current Status" above is now implemented; kept here as context for why these protections matter, not as a description of the current state.)

- Admin and support panels are visible to any visitor.
- Internal operational data could be exposed once real data is connected.
- Users could call backend endpoints directly if those endpoints do not enforce roles.
- Frontend-only hiding of buttons or routes is not security.
