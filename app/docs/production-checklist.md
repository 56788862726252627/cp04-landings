# Production Checklist

## Build And Quality

- [ ] `npm install` completed.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `git status --short` reviewed.
- [ ] `git diff` reviewed.
- [ ] No unexpected generated files staged.

## Secrets And Security

- [ ] No `.env` or `.env.local` committed.
- [ ] No Make webhook committed.
- [ ] No Airtable API key committed.
- [ ] No Stripe secret key committed.
- [ ] No WhatsApp token committed.
- [ ] No Google credentials committed.
- [x] Worker secrets configured only in Cloudflare/backend environment (confirmed live in `cp04-reservas-proxy`).
- [ ] `ALLOWED_ORIGIN` is exact production frontend origin.
- [ ] Admin, staff and support panels are not connected to real private data until auth exists.

## Frontend Configuration

- [ ] `VITE_CP04_PUBLIC_BOOKING_ENDPOINT` points to `/api/reservas` or deployed Worker URL.
- [ ] Public contact email is real and approved, or left unconfigured.
- [ ] Public contact phone is real and approved, or left unconfigured.
- [ ] Gallery image URLs point to approved real photos, or remain empty.

## SEO And Domain

- [ ] `https://clubpadel04.example/` replaced with production domain in `index.html`.
- [ ] Canonical URL is production URL.
- [ ] Open Graph URL is production URL.
- [ ] Open Graph image URL is production URL.
- [ ] Twitter image URL is production URL.
- [ ] JSON-LD `url`, `@id` and `image` are production URLs.
- [ ] `CONFIGURAR_ZONA_REAL` replaced only with verified real area.
- [ ] No fake address, phone or email added to JSON-LD.

## Worker / Backend

- [ ] Worker deployed from `worker-reservas/`.
- [ ] `/api/reservas` or `/reservas` tested with valid POST.
- [ ] Non-POST methods return `405`.
- [ ] Invalid payload returns validation error.
- [ ] CORS rejects unexpected origins.
- [ ] Make forwarding tested only after setting private webhook.
- [ ] Airtable write path is implemented in code (`prepareAirtableWrite`) and called on every `crear_reserva`/`reprogramar_reserva`; it is currently inactive end-to-end only because the Airtable account has hit a billing limit (external, not a code gate). Re-verify against real Airtable once that limit is resolved.

## Auth And Roles

- [ ] `docs/auth-roles.md` reviewed.
- [ ] Provider selected before connecting private data.
- [ ] `Gestion`, `Admin` and `Soporte` protected server-side before real data.
- [x] Role checks implemented server-side, not only in UI (`CP04_ENFORCE_ROLE_GATES` active in production).

## Final Pre-Publish Review

- [ ] All visible demo data is marked as demo or pending.
- [ ] No invented phone, email, address, testimonials or real clients.
- [ ] Mobile menu tested: open, close, overlay, Escape, section click.
- [ ] Reservation form tested with valid and invalid data.
- [ ] Ranking table scroll tested on mobile.
- [ ] Gallery fallback and real image rendering tested.
