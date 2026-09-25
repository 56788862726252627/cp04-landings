# 01 — Auditoría de las 20 dimensiones

## Aviso de alcance y honestidad

Esta auditoría examina el **árbol de commits real de esta rama**
(`main` → ... → Paso 09 → ... → Paso 20 → este paso), verificado con
comandos de terminal ejecutados en esta sesión. **No se da por buena
ninguna afirmación de memoria de sesiones anteriores que no se haya
podido verificar en este árbol concreto** — varias piezas avanzadas
mencionadas en el histórico del proyecto (observabilidad runtime
completa, cookies de sesión HttpOnly, motor de resiliencia/backups,
aislamiento de storage multi-tenant) fueron construidas en **otras
ramas/worktrees paralelos** (p. ej. `parallel/t8-resilience`,
`parallel/t1-data-governance`, u otro trabajo directo sobre
`cp04-landings`/`main`) que **nunca se han apilado sobre esta cadena de
PRs** (#37→#48). Donde eso ocurre, se indica explícitamente "existe en
otra rama, no en esta" en vez de presentarlo como si ya estuviera aquí.

---

## 1. Arquitectura completa

Modular y coherente: `src/saas-core/{adapters, automations,
businesses, commercial, domain, factory, modules, nl-builder, research,
security, templates, tenant, tenants, terminology}` + 4 CLIs
(`tenant-cli`, `factory-cli`, `research-cli`, `commercial-cli`) + backend
Cloudflare Worker (`worker-reservas/`) + frontend Vite/React (`src/`).
Cada dominio tiene su propio directorio con tests co-localizados
(`*.test.mjs` junto al código). **Estado: sólida.**

## 2. Estructura de carpetas

Convención consistente en 20 pasos: `docs/paso-NN-<slug>/00-indice.md` +
documentos numerados + `PROGRESS.md`. Sin carpetas huérfanas ni
duplicadas detectadas. 111 entradas en `docs/`, 34 directorios
`paso-*`. **Estado: sólida.**

## 3. Dependencias

`dependencies`: solo `react`+`react-dom` (sin bloat). `devDependencies`:
tooling estándar de Vite/ESLint. `npm audit` (producción): **0
vulnerabilidades**. `npm audit` (completo, incluye dev): **1
vulnerabilidad alta** en `brace-expansion` (dependencia transitiva de
tooling de ESLint, nunca se despliega a producción). **Estado: buena,
con 1 acción pendiente de bajo riesgo** (ver checklist de seguridad).

## 4. Configuración

`vite.config.js`/`eslint.config.js` presentes y funcionales.
`worker-reservas/wrangler.toml`: separa correctamente variables públicas
(`ALLOWED_ORIGIN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`,
`CP04_ENFORCE_ROLE_GATES`) de secretos (`MAKE_RESERVAS_WEBHOOK`,
`AIRTABLE_TOKEN` — solo referenciados en comentario, nunca committeados
con valor). **Estado: sólida.**

## 5. Seguridad

- **Hallazgo real (no de memoria, verificado en este árbol)**:
  `src/auth/authService.js` sigue almacenando `accessToken`/
  `refreshToken` en `localStorage` plano — **no** en cookies HttpOnly.
  El trabajo de cookies de sesión HttpOnly mencionado en el histórico
  del proyecto no está presente en esta cadena de commits.
- **Hallazgo real**: el backend de autenticación de este árbol es
  `worker-reservas/auth/auth-adapter.mock.js` — un adaptador **mock**,
  no una integración real con un proveedor de identidad. `authService.js`
  está diseñado para hablar con Supabase Auth vía el Worker cuando esté
  configurado, pero esa configuración real no está presente aquí.
- `CP04_ENFORCE_ROLE_GATES=true` está activo y aplicado a acciones de
  staff (`worker-reservas/src/index.js`).
- `ALLOWED_ORIGIN` (allowlist de CORS) está configurado con orígenes
  explícitos.
- Rate limiting (`checkMakeRateLimit`) y una capa de logging estructurado
  con `requestId` existen en el Worker.
- Escaneo de secretos en todo el árbol: **sin coincidencias reales**.
- **Estado: mixta — hay buenas prácticas de configuración/CORS/rate-limit,
  pero el almacenamiento de sesión en localStorage y la ausencia de un
  proveedor de identidad real son gaps de seguridad reales para
  producción**, no resueltos por ningún paso de esta cadena.

## 6. Variables de entorno

`.env.example` completo y bien organizado: separa explícitamente
variables públicas (`VITE_*`) de variables backend-only, con
advertencias explícitas contra comprometer secretos. **Estado: sólida.**

## 7. Secretos

Escaneo completo del árbol (`git grep` con patrones de claves Stripe/
AWS/GitHub/Slack/clave privada): **0 coincidencias reales** — solo
fixtures de test ya documentadas como falsos positivos verificados
(Paso 12). **Estado: sólida.**

## 8. Logs

`worker-reservas/src/index.js` registra eventos estructurados
(`console.error("CP04_EVENT", JSON.stringify(event))`) con `requestId`
propagado. Es una capa de logging **básica pero real** — no hay
agregación externa, dashboard, ni verificación exhaustiva de que ningún
dato personal llegue nunca al log (más allá de la intención declarada en
`SECURITY.md`). El sistema de observabilidad más completo mencionado en
el histórico del proyecto (correlación end-to-end, redacción
automática, health-live/health-ready) **no está en esta rama**. **Estado:
básica, funcional, mejorable.**

## 9. Backups

Sin implementación en esta rama. `integrationReadiness.js` (Paso 20) ya
lo declara honestamente `NOT_CONFIGURED`, bloqueado por "hosting" en
cadena. **Estado: pendiente, depende del despliegue.**

## 10. Monitorización

Sin `/health` ni integración de monitorización externa en
`worker-reservas/`. `integrationReadiness.js` lo declara
`NOT_CONFIGURED`, bloqueado por "hosting". **Estado: pendiente, depende
del despliegue.**

## 11. Make

`MAKE_RESERVAS_WEBHOOK` referenciado como secreto pendiente en
`wrangler.toml` (no configurado). Según la documentación histórica del
proyecto, los 50 flujos de Make no se han validado con llamadas reales
(pendiente de la renovación de cuota de Airtable). Adaptador/mock de
Make ya existe y probado offline (`worker-reservas`, `audit/`).
**Estado: código listo, validación real pendiente — depende de
Airtable.**

## 12. Airtable

`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_ID` configurados como valores
públicos (no secretos: no otorgan acceso sin el token). `AIRTABLE_TOKEN`
no está configurado en este entorno. La cuota gratuita de Airtable
agotada es un hecho externo (no verificable con red desde este audit) —
se documenta como bloqueo activo, tal y como confirma la secuencia de
trabajo del propio usuario. **Estado: código listo, credencial y cuota
pendientes.**

## 13. Stripe

`stripeAdapter.js` (Paso 19) completo: 7 funciones, `NOT_CONFIGURED` sin
`STRIPE_SECRET_KEY`, bloqueo de modo `live` sin `allowLiveMode`
explícito, verificación real de firma de webhook offline. Puente sandbox
(Paso 20) conectado al panel. **Estado: código completo, sin
credenciales — listo para modo test en cuanto existan.**

## 14. WhatsApp Business

`whatsappAdapter.js` (Paso 19) completo: consentimiento obligatorio
verificado antes que la configuración, verificación real de firma de
webhook offline. **Estado: código completo, sin contratar/configurar.**

## 15. Dominio

No hay dominio propio comprado — `.env.example` usa
`clubpadel04.example` como placeholder explícito. **Estado: pendiente,
depende de la compra en Hostinger (paso 6 de la secuencia del
usuario).**

## 16. SSL

Depende enteramente del dominio (paso 15) — sin dominio, no hay
certificado que emitir. **Estado: pendiente, encadenado a "dominio".**

## 17. Despliegue

Sin pipeline de CI/CD (no se encontró ningún workflow de GitHub
Actions en este árbol). `docs/deployment.md` documenta un proceso MANUAL
completo y correcto (build → `dist/` → Cloudflare Pages/Vercel/Netlify;
Worker vía `wrangler`). Ningún despliegue real se ha ejecutado desde
este audit (acción irreversible/de producción, fuera del modo autónomo
de este paso). **Estado: proceso documentado, sin automatizar, sin
ejecutar.**

## 18. Producción

No hay ninguna instancia en producción verificable desde este árbol de
código — ni URL pública confirmada, ni despliegue activo conocido desde
esta sesión. **Estado: no live.**

## 19. Documentación

111 documentos, 34 directorios `paso-*`, patrón consistente
`00-indice.md` + numerados + `PROGRESS.md` mantenido en cada paso desde
Paso 14. `SECURITY.md`/`README.md`/`docs/deployment.md` completos y
honestos sobre el estado real. **Estado: excelente — no se ha reducido
en ningún paso de esta cadena.**

## 20. Roadmap

El roadmap maestro vivo (reconstruido honestamente desde `git log`, no
existe un archivo único de 21 pasos oficiales en el repo) se ha
actualizado en cada paso desde el 14 sin reducirlo. Este es el
**último paso (21 de 21)** — ver documento 09 para la versión final.
**Estado: completo hasta el Paso 21 inclusive.**

---

## Resumen por bloqueo externo

| Bloqueado por | Dimensiones afectadas |
|---|---|
| **Solo credenciales reales** (código ya listo) | Stripe (13), WhatsApp (14) |
| **Airtable** | Make (11), validación de los 50 flujos |
| **Dominio** | SSL (16), y en cascada hosting/backups/monitorización |
| **Despliegue** | Producción (18), backups (9), monitorización (10), SSL si el hosting lo gestiona |
| **Decisión de producto/seguridad, no de credenciales** | Sesión en localStorage vs. cookies HttpOnly (5), proveedor de identidad real vs. mock (5), CI/CD (17) |
