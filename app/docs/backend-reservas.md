# Backend Reservas

## Why This Exists

The Vite/React app is a static frontend after `npm run build`. It cannot securely serve `/api/reservas` by itself in production and must not call Make, Airtable or any private service directly from the browser.

`worker-reservas/` contains a Cloudflare Worker proxy prepared to receive booking requests and forward them securely from the server side.

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

For local frontend development, set the Worker `ALLOWED_ORIGIN` to `http://localhost:5173` and set the frontend endpoint to the Worker URL if it is not same-origin.

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

Airtable variables are documented and detected by the Worker, but writes are intentionally skipped until a real table schema is defined. This avoids inventing columns or credentials.

Before enabling Airtable writes, define the exact fields, expected types, duplicate handling and error behavior.

## Response Shape

Successful response:

```json
{
  "ok": true,
  "status": "forwarded",
  "make": { "configured": true, "status": 200 },
  "airtable": { "configured": false, "skipped": true, "reason": "Airtable credentials not configured." }
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
