# Club Padel 04 App

Frontend React/Vite for the Club Padel 04 prototype. This repository currently contains the browser app only; private integrations must be implemented behind a backend/API route.

## Stack

- React 19
- Vite 8
- ESLint 10

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Environment

Copy `.env.example` to a local env file when needed. Only public `VITE_` values may be used by the frontend.

Do not put Make, Airtable, Stripe, WhatsApp, Google or other private credentials in frontend environment variables. Keep those values in backend-only configuration.

## Security

See `SECURITY.md` for the current security baseline and required backend protections before production.

## Booking Backend

The Vite frontend cannot securely serve `/api/reservas` by itself. A Cloudflare Worker proxy in `worker-reservas/` is deployed and live in production, with CORS/role gates and secrets configured (implemented, active in production). It revalidates availability and applies idempotency before forwarding to Make (implemented and tested).

Airtable is mixed, not a single "done" state: reading availability is implemented but currently blocked externally by an Airtable account billing limit. The Worker does **not** write to Airtable directly — `prepareAirtableWrite` in `worker-reservas/src/index.js` is a stub that never calls the Airtable API by design; any real persistence happens inside the Make scenario, outside this repository. Resolving the billing limit restores reads only, never a Worker-side write. See `docs/backend-reservas.md` for the full breakdown.

See `docs/backend-reservas.md` for deployment, Make webhook setup and required environment variables.

## Project Docs

- `SECURITY.md`: security baseline.
- `docs/backend-reservas.md`: booking Worker/proxy.
- `docs/integraciones.md`: SaaS integrations map.
- `docs/auth-roles.md`: real auth/roles implementation status.
- `docs/seo.md`: SEO placeholders and production values.
- `docs/gallery-assets.md`: gallery configuration and unused asset notes.
- `docs/deployment.md`: deployment steps for frontend and Worker.
- `docs/production-checklist.md`: pre-production checklist.

## Phase 1 Notes

See `docs/phase-1-audit.md` for the initial secret scan result and files that look like Vite template leftovers or archive candidates.
