# Deployment Guide

## Scope

This project has two deployable parts:

- Frontend: Vite/React static app from `app/`.
- Booking proxy: Cloudflare Worker from `worker-reservas/`.

Do not deploy secrets in frontend variables. Any value prefixed with `VITE_` is browser-visible.

## Frontend Build

From `app/`:

```bash
npm install
npm run lint
npm run build
```

Deploy the generated `dist/` folder to the chosen static hosting provider.

Recommended hosting options:

- Cloudflare Pages
- Vercel static output
- Netlify static output
- Any static hosting/CDN that serves `dist/`

## Frontend Public Variables

Set only public values in frontend hosting:

- `VITE_CP04_PUBLIC_BOOKING_ENDPOINT`: `/api/reservas` for same-origin routing, or full Worker URL.
- `VITE_CP04_PUBLIC_CONTACT_EMAIL`: only if the real public email is approved.
- `VITE_CP04_PUBLIC_CONTACT_PHONE`: only if the real public phone is approved.
- `VITE_CP04_PUBLIC_SITE_URL`: final production URL.
- `VITE_CP04_PUBLIC_SEO_AREA`: real local area only when confirmed.
- `VITE_CP04_PUBLIC_GALLERY_PISTAS`: optional public image URL/path.
- `VITE_CP04_PUBLIC_GALLERY_RECEPCION`: optional public image URL/path.
- `VITE_CP04_PUBLIC_GALLERY_CAFETERIA`: optional public image URL/path.
- `VITE_CP04_PUBLIC_GALLERY_TORNEOS`: optional public image URL/path.
- `VITE_CP04_PUBLIC_GALLERY_INSTALACIONES`: optional public image URL/path.

## Worker Deployment

From `app/worker-reservas/`:

```bash
wrangler deploy
```

Configure non-secret Worker variable:

- `ALLOWED_ORIGIN`: exact frontend origin, for example `https://tu-dominio.com`.

Configure Worker/backend secrets with Wrangler or Cloudflare dashboard:

```bash
wrangler secret put MAKE_RESERVAS_WEBHOOK
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
wrangler secret put AIRTABLE_RESERVAS_TABLE
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put WHATSAPP_PROVIDER_TOKEN
wrangler secret put WHATSAPP_PHONE_NUMBER_ID
wrangler secret put GOOGLE_CALENDAR_CREDENTIALS
wrangler secret put GOOGLE_DRIVE_CREDENTIALS
```

Only set secrets that are actually ready. Never commit real values.

## Same-Origin Routing Option

If the frontend should call `/api/reservas`, configure hosting routes so `/api/reservas` reaches the Worker.

Alternative: set `VITE_CP04_PUBLIC_BOOKING_ENDPOINT` to the full Worker URL, for example:

```text
https://cp04-reservas-proxy.<account>.workers.dev/api/reservas
```

When using a different origin, `ALLOWED_ORIGIN` must match the frontend origin exactly.

## Domain, Canonical And Open Graph

Before production, replace placeholder domain values in `index.html`:

- canonical URL
- `og:url`
- `og:image`
- `twitter:image`
- JSON-LD `@id`
- JSON-LD `url`
- JSON-LD `image`

Current placeholder domain:

```text
https://clubpadel04.example/
```

Also replace `CONFIGURAR_ZONA_REAL` only after the real operating area is confirmed.

## Future Integrations

See `docs/integraciones.md` for Make, Airtable, Stripe, WhatsApp, Google Calendar and Google Drive preparation.

Production rule:

```text
Frontend -> Worker/backend -> private services
```

Never:

```text
Frontend -> Make/Airtable/Stripe/Google with private credentials
```

## Safe Git Push Steps

Before pushing to GitHub:

```bash
git status --short
git diff
npm run lint
npm run build
```

Search for accidental secrets:

```bash
rg "hooks\.make\.com|sk_live|sk_test|pk_live|AIza|Bearer|API_KEY|SECRET|TOKEN|WEBHOOK" .
```

Review changed files, then commit only intended files:

```bash
git add <intended-files>
git commit -m "Prepare production deployment docs"
git push
```

Do not push `.env`, `.env.local`, credentials, service account JSON files, certificates or real provider secrets.
