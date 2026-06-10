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

## Phase 1 Notes

See `docs/phase-1-audit.md` for the initial secret scan result and files that look like Vite template leftovers or archive candidates.
