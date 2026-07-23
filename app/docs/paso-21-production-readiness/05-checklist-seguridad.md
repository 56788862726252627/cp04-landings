# 05 — Checklist de seguridad

## Verificado en esta sesión (real, no de memoria)

- [x] Escaneo completo de secretos en el árbol: 0 coincidencias reales.
- [x] `npm audit` en dependencias de producción: 0 vulnerabilidades.
- [x] `ALLOWED_ORIGIN` (CORS) configurado con allowlist explícita, no `*`.
- [x] `CP04_ENFORCE_ROLE_GATES=true` activo y aplicado a acciones de staff en el Worker.
- [x] Rate limiting (`checkMakeRateLimit`) presente en el Worker.
- [x] Logging estructurado con `requestId` en el Worker (`CP04_EVENT`).
- [x] `.env.example`/`SECURITY.md` documentan correctamente qué nunca debe exponerse en el frontend.

## Hallazgos que requieren decisión (no bloqueados por credenciales externas)

- [ ] **P1 — Sesión en `localStorage`**: `src/auth/authService.js` almacena `accessToken`/`refreshToken` en `localStorage` plano. Recomendado antes de producción real: migrar a cookies `HttpOnly`/`Secure`/`SameSite` (el propio `worker-reservas/docs/AUTH_CONTRACT_CP04.md` ya lo señala como requisito, ítem 24). Este trabajo NO depende de ninguna credencial externa — es una decisión de arquitectura de sesión a implementar.
- [ ] **P1 — Autenticación mock**: el backend de auth activo en esta rama es `auth-adapter.mock.js`. Antes de producción real hace falta conectar un proveedor de identidad real (p. ej. Supabase Auth, ya contemplado en el diseño de `authService.js`).
- [ ] **P2 — Sin CI/CD**: sin pipeline automático que ejecute tests/lint/build en cada PR — el control de calidad depende hoy de ejecutarlo manualmente (como en este mismo audit).
- [ ] **P3 — `brace-expansion` (dev-only)**: 1 vulnerabilidad alta en una dependencia transitiva de ESLint, sin impacto en producción (nunca se empaqueta). Corregible con `npm audit fix` cuando se decida tocar el lockfile.

## Bloqueados por credenciales/infraestructura externa

- [ ] Secretos reales de Airtable/Make/Stripe/WhatsApp deben entrar por `wrangler secret put`, nunca en `wrangler.toml` ni en el repositorio — el mecanismo ya está preparado, falta la credencial.
- [ ] SSL depende del dominio (no comprado todavía).
- [ ] Monitorización de intentos de intrusión/anomalías depende de tener producción desplegada.

## Regla de oro para cuando lleguen las credenciales reales

Ninguna credencial real (Airtable/Make/Stripe/WhatsApp) debe escribirse
nunca en un archivo versionado (`wrangler.toml`, `.env`, código fuente) —
usar siempre el mecanismo de secretos de la plataforma
(`wrangler secret put`, variables de entorno del hosting elegido). Esta
regla ya está documentada en `SECURITY.md`/`.env.example` y no ha sido
tocada por ningún paso de esta cadena.
