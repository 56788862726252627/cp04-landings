# Backend Reservas

## Why This Exists

The Vite/React app is a static frontend after `npm run build`. It cannot securely serve `/api/reservas` by itself in production and must not call Make, Airtable or any private service directly from the browser.

`worker-reservas/` contains a Cloudflare Worker proxy that is implemented, deployed and live in production, receiving booking requests and forwarding them securely from the server side.

## Endpoints

The Worker accepts:

- `POST /api/reservas`
- `POST /reservas`

It rejects other methods with `405` and unknown paths with `404`.

## Required Variables

Public frontend variable:

- `VITE_CP04_PUBLIC_BOOKING_ENDPOINT`: public URL used by the React app. For same-origin deployments, use `/api/reservas`. For a Worker on another domain, use the full Worker URL.

Private Worker/backend variables:

- `ALLOWED_ORIGIN`: exact frontend origin allowed by CORS, for example `https://clubpadel04.com`.
- `MAKE_RESERVAS_WEBHOOK`: private Make webhook URL used only by the Worker.
- `AIRTABLE_API_KEY`: private Airtable token, reserved for backend use.
- `AIRTABLE_BASE_ID`: Airtable base ID, reserved for backend use.
- `AIRTABLE_RESERVAS_TABLE`: Airtable reservations table name or ID, reserved for backend use.

Also configured and used by the Worker today (auth/role gates, not booking-specific but part of the same deployment):

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`: real Supabase project used for authentication.
- `CP04_ENFORCE_ROLE_GATES`: set to `"true"` in production; enforces server-side role authorization.

Never put `MAKE_RESERVAS_WEBHOOK`, `AIRTABLE_API_KEY` or other private values in frontend `.env` files, Vite variables, React code or browser-visible configuration.

## Local Setup

Install Wrangler if you want to run/deploy the Worker:

```bash
npm install --global wrangler
```

Run locally from the Worker folder:

```bash
cd worker-reservas
wrangler dev
```

For local frontend development, the Worker `ALLOWED_ORIGIN` already includes both `http://localhost:5173` and `http://localhost:5174` in the versioned `wrangler.toml`; set the frontend endpoint to the Worker URL if it is not same-origin.

## Deploy

From `worker-reservas/`:

```bash
wrangler deploy
```

Set private secrets with Wrangler:

```bash
wrangler secret put MAKE_RESERVAS_WEBHOOK
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
wrangler secret put AIRTABLE_RESERVAS_TABLE
```

Set or override `ALLOWED_ORIGIN` in `worker-reservas/wrangler.toml` or in the Cloudflare dashboard.

## Connect Make

1. Create a Make scenario with a custom webhook trigger.
2. Copy the webhook URL.
3. Store it only as the Worker secret `MAKE_RESERVAS_WEBHOOK`.
4. Deploy/redeploy the Worker.
5. Point `VITE_CP04_PUBLIC_BOOKING_ENDPOINT` to the Worker endpoint, for example `https://cp04-reservas-proxy.tu-cuenta.workers.dev/api/reservas`.

The frontend continues sending to one safe endpoint. Make receives data only from the Worker.

## Airtable Status

Airtable credentials (`AIRTABLE_TOKEN`/`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`) are configured as real secrets/vars on the Worker — implemented, not just documented placeholders.

- **Reading** availability (`cp04FetchOcupadas`, used by `/api/disponibilidad` and by revalidation before forwarding to Make) is implemented and was previously confirmed working end-to-end. It is currently **blocked externally**: the Airtable account has hit a billing limit (`PUBLIC_API_BILLING_LIMIT_EXCEEDED`), unrelated to this code. Resolving that limit on the Airtable account is expected to restore reads without any code change.
- **Writing** a reservation directly to Airtable from this Worker is **not implemented**: `prepareAirtableWrite` in `src/index.js` is a stub/preparation step that always reports `skipped: true` and never calls the Airtable API, by design (to avoid duplicate/403 writes racing with the Make scenario). Any real persistence of a confirmed reservation into Airtable happens inside the Make scenario triggered by `MAKE_RESERVAS_WEBHOOK`, which lives outside this repository and is not verified by anything here.
- Resolving the Airtable billing limit restores **reads only**. It does **not** activate a Worker-side write path, because none exists today.

Before implementing a real Worker-side write (if ever needed instead of relying on Make), define the exact fields, expected types, duplicate handling and error behavior.

See `docs/integraciones.md` for the full SaaS integration map and proposed Airtable tables.

## Response Shape

Successful response:

```json
{
  "ok": true,
  "status": "forwarded",
  "make": { "configured": true, "status": 200 },
  "airtable": { "configured": true, "skipped": true, "ok": true, "status": 200, "reason": "Reserva confirmada vía Make. Escritura directa Airtable desactivada para evitar duplicados y bloqueos 403." }
}
```

Validation error:

```json
{
  "ok": false,
  "error": "Validation failed",
  "fields": { "email": "Email invalido." }
}
```
