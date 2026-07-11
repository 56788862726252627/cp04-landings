# Contrato de metadata de pago Stripe → tenant

Fecha: 2026-07-09 · Cómo el adapter Stripe aislado (`worker-reservas/payments/stripe-contract.js` + `stripe-adapter.mock.js` + `stripe-idempotency.js`) se conecta conceptualmente con la arquitectura multi-tenant ya diseñada (`docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md`, `src/config/resolveTenantContext.js`). Documento de diseño — **no conecta ningún servicio real, no crea ninguna ruta en el Worker, Stripe permanece con `enabled: false` por regla de proyecto (`config/client-config.schema.json#integrations.payments.enabled`, const `false`)**.

## 1. Por qué payment_reference no es tenant_id ni booking_id

`payment_reference` identifica **este intento de cobro concreto**, no la reserva ni el tenant. Una misma `booking_id` puede tener varios `payment_reference` a lo largo del tiempo (un intento fallido seguido de un reintento exitoso) — son eventos de negocio distintos aunque compartan reserva. `idempotencyKey()` combina los tres (`tenantId`, `bookingId`, `paymentReference`) precisamente porque ninguno de los tres solo basta: `tenantId` sin `bookingId` colisionaría entre reservas del mismo cliente; `bookingId` sin `tenantId` asumiría que los IDs de reserva son únicos globalmente, cosa que el Modelo A/C actual (un Airtable por cliente) no garantiza.

## 2. De `resolveTenantContext()` a `createCheckoutSession()`

`resolveTenantContext(resolvedConfig)` (`src/config/resolveTenantContext.js`) ya expone el bloque:

```js
integrations: {
  stripe: { tenantId, customerContextRef: null, enabled: false }
}
```

El día que `enabled` pase a `true` por decisión de negocio explícita, la ruta prevista es:

```
tenantContext = resolveTenantContext(resolvedConfig)   // ya existe, no se toca aquí
                     │
                     ▼
createCheckoutSession({
  tenantId:  tenantContext.tenantId,
  clientId:  tenantContext.slug,          // o un id de cliente propio si se separa de slug
  userId:    <id del usuario autenticado, fuera de este contrato — ver worker-reservas/auth>,
  bookingId: <id de la reserva que se está cobrando>,
  amount, currency, successUrl, cancelUrl,
})
```

`createCheckoutSession` (mock) exige los cinco campos como obligatorios (`REQUIRED_METADATA_FIELDS` en `stripe-contract.js`) y los escribe en `metadata` de la sesión — es la única forma en que Stripe "recuerda" el tenant/reserva/usuario cuando el webhook vuelve, porque Stripe no conoce el modelo de datos de CP04.

## 3. De un webhook entrante a `wrong_tenant` / `wrong_user`

El futuro endpoint del Worker (`STRIPE_ENDPOINTS.webhook`, hoy solo un nombre de ruta documental) resolvería primero el tenant de la request **por dominio** (mismo mecanismo que `docs/agencia-ia/DOMAIN_TENANT_RESOLUTION.md`, no uno nuevo) y se lo pasaría a `handleWebhookEvent` como `expectedTenantId`:

```
hostname de la request → resolveDomainTenant() → tenantId esperado
                                                        │
                                                        ▼
handleWebhookEvent(rawBody, signatureHeader, { webhookSecret, dedupStore, expectedTenantId })
```

Si `event.data.object.metadata.tenant_id !== expectedTenantId`, el adapter rechaza con `reason: "wrong_tenant"` **antes** de tocar cualquier dato — nunca se confía en que "si Stripe lo envió, es del tenant correcto". Esto es más estricto que el escenario Make actual (`audit/app-make-50-integration/APP_MAKE_50_STRIPE_SANDBOX_PLAN.md`), que hoy no valida tenant porque Club Pádel 04 es el único cliente con Airtable conectado (Modelo A: aislamiento físico, no lógico) — este contrato es el que haría falta el día que dos tenants compartan un mismo endpoint (Modelo B).

`expectedUserId` sigue el mismo principio a nivel de usuario: protege contra que el efecto de un pago (marcar cuota pagada) se aplique a la cuenta equivocada dentro del mismo tenant.

## 4. Qué campo llega a cada capa (resumen)

| Campo | Origen | Vive en |
|---|---|---|
| `tenant_id` | `resolveTenantContext().tenantId` | metadata del evento/sesión, `expectedTenantId` del webhook |
| `client_id` | `resolvedConfig.slug` (u otro id de cliente si se separa) | metadata del evento/sesión |
| `user_id` | Sesión autenticada (`worker-reservas/auth`), fuera de este contrato | metadata del evento/sesión, `expectedUserId` del webhook |
| `booking_id` | Reserva que se está cobrando (Airtable) | metadata del evento/sesión, clave de idempotencia |
| `payment_reference` | Generado por `createCheckoutSession()` (mock: `payref_<tenant>_<booking>_<n>`) | metadata del evento/sesión, clave de idempotencia |

## 5. Qué NO resuelve este documento

- No decide si el cobro final será Stripe Checkout (hosted) o Elements (embebido) — sigue pendiente como decisión de negocio (ver `audit/app-make-50-integration/APP_MAKE_50_STRIPE_SANDBOX_PLAN.md §Qué falta`).
- No crea la ruta real en `worker-reservas/src/index.js`.
- No cambia `enabled: false` en `client-config.schema.json`.
