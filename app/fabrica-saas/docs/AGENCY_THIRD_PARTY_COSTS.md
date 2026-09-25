# Costes de Terceros

> Fuente de verdad: `fabrica-saas/commercial/thirdPartyCosts.js`

## Principio fundamental

**Los costes de terceros NUNCA son margen de agencia.** Se presentan siempre separados y con indicación explícita de quién los paga.

## Tipos de responsabilidad

| Tipo | Significado |
|------|-------------|
| `INCLUDED` | Cubierto por la tarifa de agencia |
| `CLIENT_PAID` | El cliente contrata y paga directamente |
| `AGENCY_REBILLED` | La agencia paga y rebilla al cliente a coste |
| `USAGE_BASED` | Coste variable según uso (el cliente paga) |
| `DEFERRED` | No necesario ahora, futuro |

## Servicios

| Servicio | Responsabilidad | Coste mensual est. |
|----------|-----------------|--------------------|
| Cloudflare Pages | INCLUDED | €0 |
| Supabase | CLIENT_PAID | €0–25 |
| Make | CLIENT_PAID | €9–29 |
| SMTP/Email | CLIENT_PAID | €5–20 |
| Dominio | CLIENT_PAID | €1–2 |
| WhatsApp API | CLIENT_PAID | €50–200 |
| Anthropic API | USAGE_BASED | €10–100 |
| Stripe | USAGE_BASED | 1.5% + €0.25/txn |
| Airtable | CLIENT_PAID | €0–20 |
| Google Calendar | INCLUDED | €0 |
