# Auth And Roles

## Current Status

Authentication is not implemented yet. The current app shows role panels in demo mode only.

Do not publish admin, staff or support functionality as production-private data until backend authentication and server-side authorization exist.

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

- Auth0
- Clerk
- Supabase Auth
- Firebase Auth
- Custom backend sessions with secure cookies

The final choice should support role claims and server-side authorization checks.

## Future Variables

Backend/private variables:

- `AUTH_PROVIDER`
- `AUTH_ISSUER_URL`
- `AUTH_AUDIENCE`
- `AUTH_CLIENT_SECRET`
- `SESSION_SECRET`
- `JWT_VERIFICATION_KEY` or provider-specific equivalent

Public frontend variables if required by the provider:

- `VITE_CP04_PUBLIC_AUTH_PROVIDER`
- `VITE_CP04_PUBLIC_AUTH_CLIENT_ID`
- `VITE_CP04_PUBLIC_AUTH_DOMAIN`

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

- Admin and support panels are visible to any visitor.
- Internal operational data could be exposed once real data is connected.
- Users could call backend endpoints directly if those endpoints do not enforce roles.
- Frontend-only hiding of buttons or routes is not security.
