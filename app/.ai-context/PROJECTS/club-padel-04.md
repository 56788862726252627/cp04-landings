# Club Pádel 04

Producto principal del repositorio: gestión de un club de pádel (reservas,
socios, torneos, comunidad, control de acceso QR).

## Estado resumido

Producto en curso, con varios bloques cerrados a "producción real" en
commits recientes (no verificado en vivo desde esta sesión: no hay acceso a
la URL de producción ni a Airtable/Make desde aquí).

Certeza general de esta página: **EVIDENCIA PREVIA** (memoria del asistente
de sesiones anteriores) + **VERIFICADO DIRECTAMENTE** para lo que aparece
explícitamente en `git log` de esta sesión (2026-08-26).

## Últimos hitos según `git log` (VERIFICADO DIRECTAMENTE, 2026-08-26)

- `d17bbc8` — reservas: single-flight + reintento acotado ante 429 de
  Airtable; el frontend deja de fingir "No disponible" ante fallo técnico.
- `7fe0fde` — CSP: permite en `connect-src` el origen del Worker (bloqueaba
  login/disponibilidad/reservas en navegadores reales).
- `046ff6d` — auth: centraliza los 7 endpoints de autenticación en la URL
  base del Worker.
- `12dbe90` — reservas: centraliza el endpoint público del Worker, amplía
  CORS a previews.
- `e2d60af` — reservas: commit de dependencias faltantes para build
  reproducible de la API de Reservas.
- `14a11da` — feat: flujo de recuperación de contraseña (#10) completo.
- `0600713` — feat: flujo GDPR cerrado al 100% en producción.
- `1d8eba9` / `5862dc5` / `f67a9b9` — generación y control de acceso QR
  cerrados con defensa en profundidad ante reserva/cancha reales.

## Bloques funcionales (según memoria del asistente, EVIDENCIA PREVIA)

- Reservas y disponibilidad (Airtable + Make + Worker de Cloudflare).
- Autenticación y roles (incl. cookies HttpOnly de sesión).
- Torneos, incluyendo bracket "Round Robin".
- Comunidad / perfil social, multi-club, feed y notificaciones, menores y
  aspectos legales (edad mínima).
- Control de acceso y generación de códigos QR.
- Centro Técnico ("EN VIVO").
- PWA.

## Bloqueadores conocidos (EVIDENCIA PREVIA, no verificados en vivo hoy)

- Histórico de incidentes "500 / sin conexión" achacados a Airtable como
  síntoma conocido.
- Deuda técnica aceptada explícitamente en el flujo de login (P1.3): no se
  toca porque romper ese comportamiento rompería `selectedRole`.
- Sincronización con Supabase remoto bloqueada en el pasado por falta de
  proyecto Supabase DEV/TEST dedicado.

## Working tree al crear este hub (2026-08-26, VERIFICADO DIRECTAMENTE)

Hay cambios sin commitear que **no pertenecen a esta tarea de Context Hub**
(pre-existían antes de esta sesión): `factory-cli/lib/businessCli.mjs`,
`src/components/demo/DemoSafeNotice.jsx`, varios módulos de
`src/saas-core/deliverables/` y `src/saas-core/commercial/`, y `.gitignore`
en `app/` y en la raíz del repo. Ver `git status` / `git diff` para el detalle
exacto; este hub no los ha tocado ni los commitea.

## Siguiente paso

Antes de seguir trabajando sobre Club Pádel 04, comprobar en vivo (con
acceso real a Airtable/Make/Cloudflare, del que esta sesión carece) si los
últimos fixes de `git log` ya están desplegados o siguen solo committeados
localmente.
