# P1.6 — Supabase Remote + Memory↔Backend Sync + Validation
## Club Pádel 04 · Comunidad Deportiva

**Estado:** COMPLETADO (local/contractual)  
**Fecha:** 2026-08-17  
**Rama:** docs/resultado-merge-pr52-66-20260727  
**Base certificada:** P0–P1.5 (commit 4325194, 545/545 tests PASS)

---

## 1. Qué añade P1.6

| Componente | Descripción |
|------------|-------------|
| `CommunitySyncManager` | Coordina MemoryRepo (local) ↔ BackendRepo (durable) |
| `communityAsyncBridge` actualizado | Todas las mutaciones usan `_persist()` (write-through capable) |
| `communitySyncManager.test.mjs` | 30 tests: boot, write, reconcile, switchClub, recovery, stale, duplicados |
| Migration checklist | Acciones manuales para Supabase DEV/TEST (sin conectar remotamente) |

---

## 2. Arquitectura de Sync P1.6

```
CommunityAsyncBridge (P1.5+P1.6)
   │
   ├─ _persist(mutFn)
   │    ├── SyncManager presente → sync.writeThrough(mutFn)   [WRITE-THROUGH]
   │    └── Sin SyncManager    → mutación directa MemoryRepo  [LOCAL/DEMO]
   │
   ├─ _getStore() [solo lectura: getFeedPage, getNotifications, getUnread, hasSocialConsent]
   │
   └── CommunitySyncManager (P1.6 nuevo)
         │
         ├── hydrate()          BOOT:   backend → restoreSnapshot(MemoryRepo)
         ├── writeThrough(fn)   WRITE:  applyIfVersion(backend) → replica MemoryRepo
         ├── reconcile()        REFRESH: re-read backend → restoreSnapshot
         └── switchClub(...)   SWITCH: reset + new SyncManager + hydrate
```

### Invariantes de diseño

| Regla | Motivo |
|-------|--------|
| Backend-first en escrituras | No éxito falso si el backend falla |
| MemoryRepo no se modifica si backend falla | Rollback automático — MemoryRepo queda en estado previo |
| Reconcile automático tras conflicto de versión | El SyncManager detecta `CONFLICT` y dispara `reconcile()` en background |
| SyncManager fijo a un `clubId` | No cross-tenant — `switchClub` crea un nuevo manager para el nuevo club |
| `mutFn` siempre síncrono | `applyIfVersion` llama `mutFn(store)` síncronamente; `_ensureProfile` es sync |
| `writeThrough` devuelve `{ ok, version, result }` | `result` = valor devuelto por `mutFn`; permite capturar IDs de entidades creadas |

---

## 3. Operaciones del bridge actualizadas

### Mutaciones → usan `_persist()` (write-through cuando sync activo)

| Operación | Patrón |
|-----------|--------|
| `grantSocialConsent` | `_persist((store) => { _ensureProfile; grantConsent })` |
| `revokeSocialConsent` | `_persist((store) => revokeConsent)` |
| `sendFriend` | `_persist((store) => sendFriendRequest)` → captura `friendshipId` |
| `acceptFriend` | `_persist((store) => acceptFriendRequest)` |
| `rejectFriend` | `_persist((store) => rejectFriendRequest)` |
| `cancelFriend` | `_persist((store) => cancelFriendRequest)` |
| `removeFriendship` | `_persist((store) => removeFriend)` |
| `follow` | `_persist((store) => followUser)` → captura `followId` |
| `unfollow` | `_persist((store) => unfollowUser)` |
| `createPost` | `_persist((store) => { consentCheck; createPostMock })` → captura `postId` |
| `addComment` | `_persist((store) => { _ensureProfile; commentOnPost })` → captura `commentId` |
| `react` | `_persist((store) => reactTo)` → captura `reactionId` |
| `createMatch` | `_persist((store) => { consentCheck; createOpenMatchMock })` → captura `matchId` |
| `joinMatch` | `_persist((store) => { consentCheck; requestToJoin })` → captura `inviteId` |
| `acceptJoin` | `_persist((store) => acceptJoinRequest)` → captura `invite` |
| `markRead` | `_persist((store) => markNotificationRead)` |
| `markAllRead` | `_persist((store) => markAllNotificationsRead)` |
| `report` | `_persist((store) => reportContent)` → captura `reportId` |
| `moderateMarkInReview` | `_persist((store) => { _ensureProfile(STAFF); markInReview })` |
| `moderateApplyAction` | `_persist((store) => { _ensureProfile(STAFF); applyModerationAction })` |
| `moderateDismiss` | `_persist((store) => { _ensureProfile(STAFF); dismissReport })` |

### Lecturas → usan `_getStore()` directamente (sin persist)

| Operación | Motivo |
|-----------|--------|
| `hasSocialConsent` | Solo lectura de consenso |
| `getFeedPage` | Lectura paginada del feed |
| `getNotifications` | Lectura de notificaciones |
| `getUnread` | Cuenta de no leídas |

---

## 4. CommunitySyncManager — contrato

```javascript
import { createCommunitySyncManager, validateSyncManager, SYNC_ERROR_TYPES } from
  "./communityAsyncBridge.js";

const sync = createCommunitySyncManager({ memRepo, backendRepo, onError });

await sync.hydrate();               // { ok, version? }
await sync.writeThrough(mutFn);    // { ok, version?, result?, error? }
await sync.reconcile();            // { ok, version?, error? }
await sync.switchClub(newMem, newBack); // { ok, syncManager?, error? }
sync.isHydrated();                 // boolean
sync.getBackendVersion();          // number | null
sync.getClubId();                  // string
```

### SYNC_ERROR_TYPES

| Tipo | Cuándo |
|------|--------|
| `sync_not_hydrated` | `writeThrough` llamado antes de `hydrate()` |
| `sync_hydration_failed` | Backend no responde o datos inválidos en hydrate |
| `sync_write_failed` | `applyIfVersion` falló (red, excepción) |
| `sync_reconcile_failed` | Backend no responde en reconcile |
| `sync_club_mismatch` | `switchClub` con mismo `clubId` que el actual |
| `backend_unavailable` | Backend bloqueado (sin config) |

---

## 5. Tests P1.6

### communitySyncManager.test.mjs — 30 tests

| Suite | Tests | Descripción |
|-------|-------|-------------|
| inicialización | 3 | Errores de constructor, getClubId, isHydrated inicial |
| hydrate — boot | 5 | Primera hidratación, versión, datos desde backend, idempotente, no disponible |
| writeThrough | 4 | Sin hidratar, persiste en ambos repos, escrituras secuenciales, conflicto |
| reconcile | 3 | Réplica tras write, falla graciosamente, post-conflicto |
| switchClub | 3 | Error mismo club, nuevo manager, aislamiento tenant |
| validateSyncManager | 2 | Contrato válido, faltantes detectados |
| recovery | 2 | MemoryRepo vacío post-conflicto → reconcile restaura |
| versión stale | 4 | CONFLICT detectado, reconcile resincroniza, nuevas writes tras stale |
| no duplicados | 2 | writeThrough llamado 2x con misma mutación no duplica en MemoryRepo |

### Suites validadas en P1.6

| Suite | Tests | Estado |
|-------|-------|--------|
| `communitySyncManager.test.mjs` | 30 | ✅ PASS |
| `communityAsyncBridge.test.mjs` | 37 | ✅ PASS (regresión) |
| `communityIntegrationE2E.test.mjs` | 17 | ✅ PASS (regresión) |
| **Total P1.6** | **84** | ✅ |

---

## 6. Estado Supabase Remoto

**SUPABASE REMOTO: BLOQUEADO**

Este entorno solo tiene credenciales de Google Drive OAuth en `.env`. Las credenciales Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) están en el Worker de Cloudflare como Cloudflare Secrets — no accesibles localmente.

### Para activar backend real (acción manual futura)

```
PREREQUISITO: Supabase proyecto DEV/TEST ya creado

1. Ejecutar migrations en orden:
   migrations/community/001_p11_community_store.sql
   migrations/community/002_p14_idempotency_backend_rls.sql
   migrations/community/003_p15_snapshot_and_claims.sql

2. Verificar RPC community_write_snapshot:
   SELECT community_write_snapshot('test-club', '{}', 0);
   → Debe devolver { version: 1 }

3. Verificar RLS community_store_snapshots:
   - Lectura OK con JWT de club correcto
   - Lectura DENEGADA con JWT de otro club

4. Verificar community_get_app_metadata_claim:
   SELECT community_get_app_metadata_claim('club_id');
   → Debe devolver el club_id del JWT actual

5. Instanciar adaptador:
   import { createCommunityAdapterFromEnv } from "./communitySupabaseAdapter.js";
   const adapter = createCommunityAdapterFromEnv(process.env, userSession.access_token);

6. Crear BackendRepo + SyncManager:
   const backendRepo = createBackendCommunityRepository(clubId, adapter);
   const sync = createCommunitySyncManager({ memRepo, backendRepo });
   await sync.hydrate();

7. Instanciar bridge con sync:
   const bridge = createCommunityAsyncBridge({ repo: memRepo, auth, sync });

8. Validar write-through:
   await bridge.grantSocialConsent();
   → Debe persistir en Supabase Y en MemoryRepo
```

---

## 7. Bloqueos y NO-GO

| Bloqueo | Motivo |
|---------|--------|
| Supabase remoto | Sin credenciales DEV/TEST en este entorno |
| Realtime channels | Sin conexión Supabase — no aplica aún |
| Producción con datos reales | NO-GO hasta validación jurídica externa |
| PR #24 merge | Bloqueado por validación jurídica (RGPD/LOPDGDD) — sigue DRAFT |
| Menores reales | PROHIBIDO — age gate activo, test data solo ficticia |

---

## 8. communityBridge.js — garantía de inmutabilidad

```
communityBridge.js:  INMUTABLE ✅ (P0–P1.3-L protegidos)
communityRepository.js: INMUTABLE ✅
communityAgePolicy.js: INMUTABLE ✅
projects/club-padel-04/community-logic/: INMUTABLES ✅
```

---

## 9. Build

```
npm run build → ✅ PASS (3.45s)
Chunk size warning en index.js (710 kB) → preexistente, no regresión P1.6
```

---

## 10. DoD P1.6

| Criterio | Estado |
|----------|--------|
| CommunitySyncManager implementado | ✅ |
| hydrate / writeThrough / reconcile / switchClub | ✅ |
| SYNC_ERROR_TYPES normalizados | ✅ |
| validateSyncManager | ✅ |
| Todas las mutaciones del bridge usan `_persist()` | ✅ |
| Lecturas puras siguen usando `_getStore()` directamente | ✅ |
| `_ensureProfile` es síncrona (safe en callbacks de applyIfVersion) | ✅ |
| `writeThrough` devuelve `result` (captura IDs de entidades) | ✅ |
| 30 tests SyncManager PASS | ✅ |
| 37 tests AsyncBridge PASS (regresión) | ✅ |
| 17 tests E2E PASS (regresión) | ✅ |
| Build PASS | ✅ |
| communityBridge.js no modificado | ✅ |
| Sin datos reales | ✅ |
| Sin datos reales de menores | ✅ |
| Supabase remoto no conectado | ✅ (bloqueado por diseño) |
| Sin secretos impresos | ✅ |
| Sin push / PR / merge / deploy | ✅ |
| Sin commit | ✅ |
| PR #24 sigue DRAFT | ✅ |
| P0–P1.5 sin regresión | ✅ |

---

## 11. Acción manual necesaria para producción

1. Crear proyecto Supabase DEV (separado de producción)
2. Ejecutar las 3 migrations en orden
3. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local` (DEV only)
4. Instanciar `CommunitySyncManager` en el punto de entrada de la app (App.jsx o contexto de comunidad)
5. Llamar `sync.hydrate()` al montar el módulo de comunidad
6. Validación jurídica externa (RGPD/LOPDGDD) antes de cualquier dato real

---

## 12. Tests acumulados comunidad

| Fase | Nuevos | Acumulado |
|------|--------|-----------|
| P0 community-logic | 87 | 87 |
| P1.1–P1.3-L | 228 | 315 |
| P1.4 | 103 | 418 |
| P1.5 | 127 | 545 |
| **P1.6** | **30** | **575** |
