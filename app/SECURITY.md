# Security Notes

## Current Status

- No real secrets, API keys, tokens, webhooks or credentials were found in the frontend source during the initial audit.
- The browser app is designed to call a public backend endpoint through `VITE_CP04_PUBLIC_BOOKING_ENDPOINT`.
- Private integrations must remain server-side only.

## Secret Handling Rules

- Never commit `.env`, `.env.local` or provider credentials.
- Only variables prefixed with `VITE_` are exposed to the browser, so they must contain public values only.
- Keep Make, Airtable, Stripe, WhatsApp and Google credentials in backend-only environment variables.
- Route browser requests through a controlled backend/API route before calling third-party services.

## Required Backend Protections Before Production

- Validate all request payloads server-side.
- Add rate limiting and anti-spam controls to public endpoints.
- Restrict admin/support features behind authentication and authorization.
- Keep logs free of tokens, credentials and personal data where possible.
- Configure CORS to allow only expected origins.
