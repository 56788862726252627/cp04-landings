# P1.5 — Async Bridge + Supabase Adapter + Auth Boundary + Integration E2E
## Club Pádel 04 · Comunidad Deportiva

**Estado:** COMPLETADO (local/contractual)  
**Fecha:** 2026-08-16  
**Rama:** docs/resultado-merge-pr52-66-20260727

---

## 1. Arquitectura P1.5

```
React/UI
   ↓
communityBridge.js              ← INMUTABLE (P0–P1.3-L protegidos)
   ↓
CommunityAsyncBridge (P1.5)     ← NUEVO: capa async sobre MemoryRepo
   ↓ lee/escribe
CommunityRepository
   ├── MemoryCommunityRepository (P1.1+P1.2) ← activo como capa local
   └── BackendCommunityRepository (P1.4)     ← para persistencia durable (applyIfVersion)
         ↓
         BackendAdapter
           ├── FakeBackendAdapter (P1.4)     ← tests
           └── SupabaseCommunityAdapter (P1.5) ← REST sin SDK

CommunityAuthBoundary (P1.5)    ← identidad verificada (3 variantes)
   ├── DemoAuthBoundary          ← tests y UI demo
   ├── WorkerBackedAuthBoundary  ← producción CP04 (Worker ya tiene Supabase)
   └── SupabaseAuthBoundary      ← alternativa sin Worker
```

---

## 2. Archivos nuevos P1.5

| Archivo | Descripción |
|---------|-------------|
| `src/utils/communitySupabaseAdapter.js` | SupabaseAdapter REST (fetch, sin SDK) |
| `src/utils/communitySupabaseAdapter.test.mjs` | 32 tests |
| `src/utils/communityAuthBoundary.js` | 3 variantes de AuthBoundary |
| `src/utils/communityAuthBoundary.test.mjs` | 41 tests |
| `src/utils/communityAsyncBridge.js` | AsyncBridge sobre MemoryRepo |
| `src/utils/communityAsyncBridge.test.mjs` | 37 tests |
| `src/utils/communityIntegrationE2E.test.mjs` | 17 tests de integración |
| `migrations/community/003_p15_snapshot_and_claims.sql` | RPC atómica + claims helpers |
| `docs/club-padel-04/comunidad/P1_5_ASYNC_SUPABASE_AUTH_E2E.md` | Este documento |

---

## 3. SupabaseCommunityAdapter

`src/utils/communitySupabaseAdapter.js`

### Diseño

- Usa `fetch()` directo a la API REST de PostgREST — sin `@supabase/supabase-js`.
- Mismo patrón que `worker-reservas/auth/authorization.js`.
- Si no hay URL/KEY: devuelve `createBlockedSupabaseAdapter` (no lanza, tiene interfaz correcta).

### Métodos (contrato BackendAdapter)

| Método | Implementación |
|--------|---------------|
| `readAll(clubId)` | GET `/rest/v1/community_store_snapshots?club_id=eq.${clubId}` |
| `writeAll(clubId, data, version)` | POST `/rest/v1/rpc/community_write_snapshot` |
| `isIdempotencyKeyUsed(clubId, key)` | GET `/rest/v1/community_idempotency` |
| `markIdempotencyKey(clubId, key, result)` | POST `/rest/v1/community_idempotency` |
| `getIdempotencyResult(clubId, key)` | GET `/rest/v1/community_idempotency` |

### Estado

**SUPABASE REMOTO: BLOQUEADO** — sin SUPABASE_URL ni SUPABASE_ANON_KEY en este entorno.

Para activar:
```js
const adapter = createCommunityAdapterFromEnv({
  VITE_SUPABASE_URL: "https://xxx.supabase.co",
  VITE_SUPABASE_ANON_KEY: "eyJ...",
  authToken: userSession.access_token,
});
const repo = createBackendCommunityRepository(clubId, adapter);
```

---

## 4. CommunityAuthBoundary

`src/utils/communityAuthBoundary.js`

### Contrato (validateAuthBoundary)

Todas las funciones devuelven `Promise`:

```
isAuthenticated() → boolean
getActorId()      → string | null
getClubId()       → string | null
getRole()         → string | null
getAuthToken()    → string | null
getAgeStatus()    → AGE_STATUS (opcional)
isCommunityAllowed() → { allowed, reason }
```

### Variantes

| Variante | Uso | Estado |
|----------|-----|--------|
| `createDemoCommunityAuthBoundary` | Tests y UI demo | LISTO |
| `createWorkerBackedAuthBoundary` | Producción CP04 | LOCAL (Worker sin llamar) |
| `createSupabaseAuthBoundary` | Alternativa sin Worker | LOCAL (Supabase bloqueado) |

### clubId y role

- Vienen de `app_metadata` del JWT verificado por el Worker/Supabase.
- **Nunca** se aceptan libremente del cliente como única barrera.
- `getAgeStatus()` devuelve `AGE_UNKNOWN` en las variantes de producción — el age gate se resuelve externamente con `communityAgePolicy.js`.

### Cache

- `WorkerBackedAuthBoundary` y `SupabaseAuthBoundary` cachean el usuario 30s.
- `__invalidateCache()` disponible en ambas (para tests y logout).
- Cache corta (5s) en caso de fallo de red o 401.

---

## 5. CommunityAsyncBridge

`src/utils/communityAsyncBridge.js`

### Diseño

Complementa (no reemplaza) `communityBridge.js`:
- `communityBridge.js` sigue siendo la capa sync para demo/UI.
- `communityAsyncBridge` es la capa async para operaciones autenticadas.

### Operaciones disponibles

| Categoría | Métodos |
|-----------|---------|
| Consentimiento | `grantSocialConsent`, `revokeSocialConsent`, `hasSocialConsent` |
| Amistad | `sendFriend`, `acceptFriend`, `rejectFriend`, `cancelFriend`, `removeFriendship` |
| Follow | `follow`, `unfollow` |
| Feed/Posts | `createPost`, `getFeedPage`, `addComment`, `react` |
| Partidos | `createMatch`, `joinMatch`, `acceptJoin` |
| Notificaciones | `getNotifications`, `getUnread`, `markRead`, `markAllRead` |
| Moderación | `report`, `moderateMarkInReview`, `moderateApplyAction`, `moderateDismiss` |
| Introspección | `getClubId`, `getActorId`, `isAuthenticated` |

### Garantías

| Garantía | Estado |
|----------|--------|
| Auth verificado antes de cada mutación | ✅ `_requireAuth()` |
| Age gate verificado antes de operaciones sociales | ✅ `_requireAdult()` |
| UserProfile auto-registrado cuando es necesario | ✅ `_ensureProfile()` |
| Idempotencia en operaciones key (follow, sendFriend, react) | ✅ |
| No éxito falso ante error de dominio | ✅ |
| communityBridge.js no modificado | ✅ |

### Nota de arquitectura: MemoryRepo vs BackendRepo

El bridge opera sobre `MemoryRepo`:
- Cada `getStore()` devuelve el store mutable (en memoria, compartido).
- Las mutaciones persisten en la misma sesión.

Para `BackendRepo` (persistencia durable), la sincronización ocurre vía `applyIfVersion`:
- **No** usar `BackendCommunityRepository` directamente como `repo` del bridge
  (cada `getStore()` hace un fetch independiente, las mutaciones no persisten).
- Usar `BackendCommunityRepository.applyIfVersion(v, fn)` para escrituras atómicas.
- Usar el bridge con `MemoryRepo` como estado local, y `BackendRepo` para persistencia
  en background (hidratación inicial + sincronización en background).

Esta separación es intencional — simplifica los contratos y evita race conditions.

---

## 6. Migration 003

`migrations/community/003_p15_snapshot_and_claims.sql`

Añade:

### `community_write_snapshot(p_club_id, p_data, p_expected_version)`

- **RPC SECURITY DEFINER** — escritura atómica con locking optimista.
- Devuelve `{ version: N }` si ok, `{ error: 'conflict' }` si versión no coincide.
- Valida `club_id` del JWT vs `p_club_id` solicitado.
- Serializa escrituras concurrentes por `club_id` con `FOR UPDATE`.

### `community_get_app_metadata_claim(claim_key)`

- Lee `app_metadata.{key}` del JWT actual.
- Para obtener `club_id`, `role` del token verificado por Supabase.

### Índice y RLS

- `community_idempotency_key_idx` — índice en `idem_key` para búsquedas rápidas.
- RLS en `community_store_snapshots` — solo tenant propio puede leer.
- Escrituras directas (fuera de RPC) bloqueadas por RLS.

---

## 7. Resumen de tests P1.5

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `communitySupabaseAdapter.test.mjs` | 32 | Blocked, REST mock, fetch, HTTP errors |
| `communityAuthBoundary.test.mjs` | 41 | 3 variantes, cache, validateAuthBoundary |
| `communityAsyncBridge.test.mjs` | 37 | Auth gate, age gate, amistad, feed, partidos, notificaciones, moderación |
| `communityIntegrationE2E.test.mjs` | 17 | Auth→Bridge, flujos sociales, tenant isolation, BackendRepo, moderación, partidos |
| **Total P1.5** | **127** | |

### Tests acumulados

| Fase | Tests |
|------|-------|
| P0 community-logic | 87 |
| P1.1–P1.3-L | 228 |
| P1.4 | 103 |
| **P1.5** | **127** |
| **TOTAL** | **545** |

---

## 8. Constraints mantenidos

| Constraint | Estado |
|------------|--------|
| `communityBridge.js` no modificado | ✅ |
| Sin datos reales | ✅ |
| Sin datos reales de menores | ✅ |
| Sin Supabase remoto | ✅ (bloqueado por configuración) |
| Sin secretos impresos | ✅ |
| Sin push/PR/merge/deploy | ✅ |
| PR #24 sigue DRAFT | ✅ |
| P0–P1.4 tests en verde | ✅ |
| Build en verde | ✅ |

---

## 9. Estado para producción

| Item | Estado |
|------|--------|
| SupabaseCommunityAdapter | Local, contractual ✅ |
| Ejecutar migration 003 contra Supabase DEV/TEST | Bloqueado |
| WorkerBackedAuthBoundary real (con credenciales) | Bloqueado (Worker OK, bridge pendiente) |
| communityBridge.js async completo | No iniciado |
| Sync MemoryRepo ↔ BackendRepo | No iniciado |
| Realtime Supabase channels | No iniciado |
| Validación jurídica (RGPD/LOPDGDD) | Externa — PENDIENTE |
| PR #24 merge | Bloqueado por validación jurídica |

---

## 10. DoD P1.5

| Criterio | Estado |
|----------|--------|
| SupabaseAdapter REST (fetch, sin SDK) | ✅ |
| Blocked adapter cuando sin config | ✅ |
| createCommunityAdapterFromEnv | ✅ |
| DemoAuthBoundary | ✅ |
| WorkerBackedAuthBoundary (con cache) | ✅ |
| SupabaseAuthBoundary (con cache) | ✅ |
| validateAuthBoundary | ✅ |
| AsyncBridge sobre MemoryRepo | ✅ |
| Auth gate en todas las mutaciones | ✅ |
| Age gate en operaciones sociales | ✅ |
| _ensureProfile automático | ✅ |
| Idempotencia en operaciones key | ✅ |
| Migration 003 (RPC atómica + claims) | ✅ |
| P1.5 tests: 127 nuevos | ✅ |
| P0–P1.4 tests: 418 en verde | ✅ |
| Build en verde | ✅ |
| Sin datos reales | ✅ |
| Sin menores reales | ✅ |
| NO commit / NO push / NO merge | ✅ |
