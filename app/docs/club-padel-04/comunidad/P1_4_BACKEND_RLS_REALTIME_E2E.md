# P1.4 — Backend Adapter + RLS + Persistencia Durable + Realtime/Polling + E2E
## Club Pádel 04 · Comunidad Deportiva

**Estado:** COMPLETADO (local/contractual)  
**Fecha:** 2026-08-16  
**Rama:** docs/resultado-merge-pr52-66-20260727

---

## 1. Arquitectura

```
React/UI
   ↓
communityBridge.js            ← INMUTABLE (P0–P1.3-L protegidos)
   ↓
CommunityRepository contract  ← interfaz compartida
   ↓
MemoryCommunityRepository     ← ACTIVO (fallback, dev, tests)
   ↓  ← punto de conmutación cuando backend esté configurado
BackendCommunityRepository    ← NUEVO P1.4 (async, contractual)
   ↓
BackendAdapter
   ↓
FakeBackendAdapter (P1.4)     ← en memoria async, para dev/tests
SupabaseAdapter (futuro)      ← cuando backend remoto esté disponible
```

---

## 2. MemoryRepository (status previo)

`src/utils/communityRepository.js` — sin cambios en P1.4.

- Contrato P1.1: `getStore / reset / snapshot / getClubId / isIdempotencyKeyUsed / markIdempotencyKey / getIdempotencyResult`
- Extensiones P1.2: `getVersion / restoreSnapshot / applyIfVersion / buildIdempotencyKey`
- 66/66 tests — PASS

---

## 3. BackendRepository (nuevo P1.4)

`src/utils/communityBackendRepository.js`

### FakeBackendAdapter
- En memoria, async, con latencia configurable y modos de fallo.
- No es un mock — mantiene estado real entre operaciones.
- Parámetros: `latencyMs`, `failureRate`, `failAfterN`.
- Aislamiento por `clubId`: cada clave de store e idempotencia es `clubId-scoped`.

### createBackendCommunityRepository(clubId, adapter)
- Mismo contrato conceptual que MemoryCommunityRepository, pero **todas las operaciones son async (Promise)**.
- Métodos async: `getStore / reset / snapshot / isIdempotencyKeyUsed / markIdempotencyKey / getIdempotencyResult / getVersion / restoreSnapshot / applyIfVersion`
- Métodos sync: `getClubId / buildIdempotencyKey`
- Locking optimista en `applyIfVersion`: lee versión, verifica, muta, escribe en una sola secuencia.
- Error normalizado `backend_unavailable` para backend caído (separado de los tipos COMMUNITY_ERROR_TYPES que solo son para errores de dominio).

---

## 4. Backend remoto DEV/TEST

**BACKEND REMOTO: BLOQUEADO POR CONFIGURACIÓN/ENTORNO**

Razones:
- No existe `supabase/` ni `migrations/` activas en el proyecto.
- No hay variables de entorno Supabase configuradas (ni en `.env`, ni en worker).
- No se creó ningún proyecto/tabla remota en esta sesión.

Para activar cuando esté disponible:
1. Implementar `SupabaseAdapter` con el mismo contrato de `validateBackendAdapter`.
2. Pasar a `createBackendCommunityRepository(clubId, supabaseAdapter)`.
3. Ningún cambio en `communityBridge.js` — solo el adapter cambia.

---

## 5. Esquema SQL

`migrations/community/001_community_schema.sql`

15 tablas:

| Tabla | Descripción |
|-------|-------------|
| `community_profiles` | Perfil de usuario social por club |
| `community_player_social_profiles` | Perfil social con privacidad |
| `community_consents` | Consentimientos RGPD/LOPD por tipo |
| `community_friendships` | Amistades + solicitudes |
| `community_follows` | Relaciones de seguimiento |
| `community_posts` | Publicaciones del feed |
| `community_comments` | Comentarios en posts |
| `community_reactions` | Reacciones (like, etc.) |
| `community_open_matches` | Partidos abiertos |
| `community_match_invites` | Solicitudes de plaza |
| `community_reports` | Reportes de contenido |
| `community_moderation_actions` | Acciones de moderación |
| `community_notifications` | Notificaciones persistentes |
| `community_idempotency` | Claves de idempotencia con TTL |
| `community_audit_log` | Log de auditoría |

Todas las tablas llevan: `club_id TEXT NOT NULL`, PK UUID, timestamps UTC, constraints CHECK, índices para queries frecuentes.

---

## 6. RLS

`migrations/community/002_community_rls.sql`

### Garantías

| Garantía | Estado |
|----------|--------|
| Club A no puede leer/escribir en Club B | ✅ `WHERE club_id = current_setting('app.club_id')` |
| Usuario no puede actuar como otro actor | ✅ `WHERE user_id = community_current_profile_id()` |
| Idempotency keys aisladas por tenant | ✅ `LIKE club_id || ':%'` |
| Moderación solo para STAFF/ADMIN/SUPPORT | ✅ `community_is_moderator()` |
| Audit log solo para ADMIN | ✅ `community_is_admin()` |

### Límites de RLS (requieren validación en dominio)

| Regla | Motivo |
|-------|--------|
| Age gate | No expresable en SQL — validar en `communityAgePolicy.js` |
| Consent | Requiere lógica cross-tabla compleja — validar en `consent.mjs` |
| Visibilidad friends/club | Requiere estado de amistad — validar en `getVisibleFeed` |
| Bloqueos | Requiere estado de bloqueo bilateral — validar en `blocking.mjs` |

---

## 7. Auth boundary

**AUTH BACKEND REAL: PENDIENTE**

El repositorio backend usa `clubId` como scope de tenant. En un backend Supabase real:
- `auth.uid()` → ID del usuario autenticado (claim de Supabase Auth)
- `current_setting('app.club_id')` → club_id del tenant activo (set por server function)
- **NUNCA** confiar en `clubId` enviado libremente por el cliente como única barrera.

En esta fase, `communityBridge.js` usa `COMMUNITY_BRIDGE_CLUB_ID` hardcodeado para la demo. La migración a auth real requiere pasar el `clubId` real del contexto de sesión.

---

## 8. Tenant boundaries

- Cada instancia de `BackendCommunityRepository` está aislada por `clubId`.
- El `FakeBackendAdapter` almacena datos en mapas indexados por `clubId`.
- `restoreSnapshot` valida `_meta.clubId` antes de escribir — falla con `TENANT_MISMATCH` si no coincide.
- Las claves de idempotencia llevan prefijo `${clubId}:` — no hay colisión entre clubs.

---

## 9. Async bridge

`communityBridge.js` — **sin cambios** (mantiene compatibilidad P0–P1.3-L).

Para usar `BackendCommunityRepository` desde React:
1. Instanciar `createBackendCommunityRepository(clubId, adapter)`.
2. Llamar `await repo.getStore()` para hidratar.
3. Operar sobre el store con las funciones de `community-logic`.
4. Persistir cambios con `await adapter.writeAll(clubId, store, expectedVersion)`.

Para conversión async completa del bridge: tarea pendiente (P1.5 o posterior).

---

## 10. Feed paginado backend-compatible

La función `getPaginatedFeed(store, viewerId, { cursor, limit, getVisibleFeed })` de `community-logic`:
- Retorna `{ ok, items, nextCursor, hasMore }` (usar `items`, no `posts`).
- Cursor keyset basado en `createdAt DESC + id DESC` — estable, sin duplicados con inserciones.
- Limit válido: 1–50.
- Filtra por visibilidad antes de paginar (tenant-scoped, bloqueos, consents).

Para backend real con cursor SQL:
```sql
WHERE club_id = $club_id
  AND deleted_at IS NULL
  AND (created_at, id) < ($cursor_created_at, $cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT $limit
```

---

## 11. Notificaciones persistentes

Las notificaciones se almacenan en `store.notifications` (en memory) y en `community_notifications` (en backend SQL).

Campos: `id, club_id, user_id, notification_type, payload (JSONB), read_at, created_at`.

Unread: `WHERE read_at IS NULL` — derivado, sin columna redundante.

Payload: objeto mínimo seguro (IDs de referencia, tipos). **Sin datos sensibles.**

---

## 12. Realtime / Polling

**Realtime Supabase: NO DISPONIBLE** (backend remoto bloqueado).

**Polling controlado:** `src/utils/communityPolling.js`

- `createCommunityPoller({ onTick, intervalMs, maxIntervalMs, backoffFactor, onError })`.
- Backoff exponencial en errores consecutivos.
- `start() / stop() / destroy()` — sin timers duplicados, idempotente.
- `createClubAwarePollerManager({ onTick })` — destruye el poller anterior al cambiar de club.
- Cleanup al desmontar componente: `poller.destroy()`.

---

## 13. Retries y fallback

Backend no disponible (`backend_unavailable`):
- `getStore()` lanza el error normalizado — no devuelve store vacío fingiendo éxito.
- `applyIfVersion()` devuelve `{ ok: false, error: { type: 'backend_unavailable' } }`.
- **NO se finge que una escritura persistió.**

Estrategia de fallback:
1. Si backend falla → mantener el estado local (MemoryRepository) sin marcar como sincronizado.
2. No implementar offline sync complejo sin requisito explícito.
3. El poller tiene backoff automático para no saturar el backend caído.

---

## 14. Errores normalizados

| Tipo | Origen | Descripción |
|------|--------|-------------|
| `validation` | Dominio | Parámetro inválido |
| `forbidden` | Dominio | Sin permiso |
| `not_found` | Dominio | Entidad no encontrada |
| `conflict` | Repositorio | Conflicto de versión optimista |
| `tenant_mismatch` | Repositorio | Tenant incorrecto en snapshot |
| `idempotency_conflict` | Repositorio | Clave usada con resultado distinto |
| `internal` | Repositorio | Error inesperado |
| `backend_unavailable` | BackendAdapter | Backend no disponible |

---

## 15. Migración Memory → Backend

`src/utils/communityMigration.js`

Función: `migrateMemoryToBackend({ snapshot, backendRepo, dryRun=true })`

Validaciones:
- Snapshot no nulo, con `_meta`.
- `_meta.clubId` coincide con `backendRepo.getClubId()`.
- Todas las entidades son arrays.
- Sin IDs duplicados.

`dryRun=true` (default): valida sin escribir.  
`dryRun=false`: llama a `backendRepo.restoreSnapshot(snapshot)`.

Resumen: `{ ok, dryRun, summary: { clubId, totalEntities, entityCounts, duplicateIds } }`.

---

## 16. Rollback

Gracias al locking optimista (`applyIfVersion`):
- Si la escritura falla (versión incorrecta o backend caído), el estado no cambia.
- No hay estado parcialmente escrito.

Para rollback manual de snapshot:
1. Guardar snapshot antes de operar: `const prev = await repo.snapshot()`.
2. Si la operación falla: `await repo.restoreSnapshot(prev)`.

---

## 17. E2E contractual

`src/utils/communityE2E.test.mjs` — 26 tests

Cubre:
- Age gate (ADULT_VERIFIED / AGE_UNKNOWN / MINOR_OR_BELOW_POLICY)
- Consentimiento persiste en backend
- Post → feed paginado → cursor sin duplicados
- Follow y amistad persisten
- Comentario y reacción persisten
- Partido abierto + solicitud + aceptación persisten
- Notificaciones persistentes + unread count
- markNotificationRead persiste read_at
- Moderación completa (reporte → in_review → acción) persiste
- Aislamiento tenant: Club A vs Club B
- Idempotencia end-to-end
- Versionado / detección de conflicto
- Migración Memory → Backend
- Resiliencia (backend caído → error normalizado, nunca éxito fingido)
- Perfil age_unknown bloqueado
- Garantías de datos: sin emails, sin IDs reales, todos prefijados `e2e-`

---

## 18. Age gate

**INTACTO** — `communityBridge.js` líneas 97–117 sin cambios.

El gate verifica `_ageStatusMap` antes de cualquier operación social:
- `AGE_UNKNOWN` (default sin entrada) → BLOQUEADO.
- `ADULT_VERIFIED` → PERMITIDO.
- `MINOR_OR_BELOW_POLICY` → BLOQUEADO.
- `VERIFICATION_PENDING` → BLOQUEADO.

El age gate **no puede ser bypassed por RLS** — se aplica en la capa de dominio/bridge.

---

## 19. Legal NO-GO

**Producción con datos reales: NO-GO**

Permanece bloqueada por:
- PR #24 sigue DRAFT (revisión legal externa pendiente).
- EIPD/DPIA pendiente de decisión externa.
- Validación de abogado/DPO pendiente.
- Auth backend real pendiente.

P1.4 puede quedar técnicamente cerrado sin que Comunidad quede legalmente en producción.

---

## 20. Seguridad

- Ningún secreto fue impreso, copiado ni incluido en documentación.
- Ningún dato real de jugadores fue usado.
- Ningún dato real de menores fue usado.
- IDs de test prefijados `e2e-` y `club-demo-` para evitar colisiones.
- `BACKEND_UNAVAILABLE` no pasa por `createCommunityError` (que lo reescribiría a `internal`) — se crea directamente como `{ type, message }`.

---

## 21. Qué falta para producción

| Item | Estado |
|------|--------|
| SupabaseAdapter real | Pendiente (schema SQL listo) |
| Ejecutar migrations contra Supabase DEV/TEST | Bloqueado (sin acceso) |
| RLS activa en Supabase | Bloqueado (sin acceso) |
| Auth boundary real (claims Supabase) | Pendiente |
| communityBridge async completo | P1.5 o posterior |
| Realtime Supabase | P1.5 o posterior |
| Validación jurídica (RGPD/LOPDGDD) | Externa — PENDIENTE |
| EIPD/DPIA | Externa — PENDIENTE |
| PR #24 merge | Bloqueado por validación jurídica |

---

## 22. DoD P1.4

| Criterio | Estado |
|----------|--------|
| BackendCommunityRepository con FakeAdapter | ✅ |
| Contrato async (all ops return Promise) | ✅ |
| Idempotencia persistente en backend | ✅ |
| Locking optimista (applyIfVersion) | ✅ |
| Snapshot/restore con tenant validation | ✅ |
| Tenant isolation (Club A ≠ Club B) | ✅ |
| Error normalizado backend_unavailable | ✅ |
| Schema SQL 15 tablas | ✅ (local, no ejecutado) |
| RLS 15 políticas | ✅ (local, no ejecutado) |
| Auth boundary documentado | ✅ (PENDIENTE implementación real) |
| Feed paginado cursor keyset | ✅ (contractual) |
| Notificaciones persistentes | ✅ (contractual) |
| Polling controlado con backoff | ✅ |
| Fallback: no fingir éxito en error | ✅ |
| Migración Memory→Backend | ✅ (dry-run + real) |
| E2E contractual 26 tests | ✅ |
| Age gate intacto | ✅ |
| P0–P1.3-L tests en verde | ✅ 315/315 |
| Nuevos P1.4 tests en verde | ✅ 103/103 |
| Build verde | ✅ |
| Sin datos reales | ✅ |
| Sin menores reales | ✅ |
| NO commit / NO push / NO merge | ✅ |

---

## 23. Migrations — ruta y orden

```
migrations/
  community/
    001_community_schema.sql   ← primero: CREATE TABLE, índices
    002_community_rls.sql      ← segundo: ENABLE ROW LEVEL SECURITY, políticas, helpers
```

Para ejecutar contra Supabase DEV/TEST (cuando esté disponible):
```bash
psql $SUPABASE_DB_URL -f migrations/community/001_community_schema.sql
psql $SUPABASE_DB_URL -f migrations/community/002_community_rls.sql
```
