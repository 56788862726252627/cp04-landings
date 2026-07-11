# Fixtures — Tenant Config (Fase 10)

Fixtures de la arquitectura multi-tenant, consumidos por `tests/tenant-config/*.test.mjs`. Ninguno es un cliente real.

| # | Fixture | Qué demuestra |
|---|---|---|
| 1 | `config/client-config.example.valid.json` (reutilizado, no duplicado aquí) | Club Pádel 04 — único cliente real, válido de extremo a extremo. |
| 2 | `valid-second-club-fixture.client-config.json` | Segundo club **técnico, ficticio** — prueba que el modelo replica a un segundo tenant del mismo vertical sin tocar CORE. **No es un cliente real ni un lead comercial.** |
| 3 | `invalid-missing-branding.client-config.json` | `brand` ausente → `required`. |
| 4 | `invalid-unknown-feature.client-config.json` | `features.descuentosVip` → `additionalProperties: false`. |
| 5 | `invalid-forbidden-core-override.client-config.json` | `features.pagos: true` → `const: false` (campo protegido). |
| 6 | `invalid-cross-tenant-reference.client-config.json` | `webhookRef` referencia al tenant `fixture-club-02` desde el tenant `fixture-club-06`. |
| 7 | `invalid-secret-literal.client-config.json` | `webhookRef` con forma de secreto real (`whsec_...`) en vez de nombre de referencia. |
| 8 | `invalid-duplicate-domain.registry.json` | Dos tenants con el mismo `domains.subdomain` en el mismo registro. |
| 9 | `invalid-incompatible-feature-dependency.client-config.json` | `listaEspera: true` con `reservas: false` (dependencia incumplida). |
| 10 | `invalid-disabled-tenant-deployment.deployment-profile.json` | `environment: "production"` para un tenant marcado `disabled` en el registro (usar junto a `config/tenant-registry.example.valid.json`, tenant `fixture-club-03`). |

Registro auxiliar para dominio/duplicados/promoción: `config/tenant-registry.example.valid.json` (tenants `cp04` active, `fixture-club-02` staging, `fixture-club-03` disabled, `fixture-club-04` maintenance).
