# P1.2 — Async-Ready + Recovery + Tenant Hardening

**Fecha:** 2026-08-16  
**Estado:** CERRADO  
**Tests:** 59/59 community-logic · 96/96 bridge · 66/66 repository (34 P1.1 + 32 P1.2)  
**Build:** PASS  

---

## 1. Arquitectura final P1.2

```
React UI
  ↓
communityBridge.js          ← API pública sync (96 tests)
  ↓
CommunityRepository contract (7 métodos base P1.1)
  ↓ + extensiones P1.2 (4 métodos)
MemoryCommunityRepository   ← implementación activa hoy
  ├── _store (createEmptyStore)
  ├── _version (int, 0-based)
  └── _idempotencyKeys (Map)
```

### Nuevas capacidades P1.2

| Capacidad | Método | Estado |
|-----------|--------|--------|
| Versión del store | `getVersion()` | PASS |
| Snapshot con metadatos | `snapshot()` → `_meta` | PASS |
| Recovery desde snapshot | `restoreSnapshot(snap)` | PASS |
| Locking optimista | `applyIfVersion(v, fn)` | PASS |
| Claves de idempotencia con scope | `buildIdempotencyKey(op, a, t)` | PASS |
| Errores normalizados | `createCommunityError(type, msg)` | PASS |
| Validación de extensiones | `validateRepositoryP12Extensions(repo)` | PASS |

---

## 2. Sync hoy / Async futuro

### Hoy (MemoryRepository)

Todos los métodos son síncronos. Los valores se devuelven directamente:
```js
const version = repo.getVersion();         // number
const snap    = repo.snapshot();           // object
const result  = repo.applyIfVersion(0, fn); // { ok, result, version } | { ok, error }
```

### Futuro (BackendRepository)

Una implementación backend puede devolver `Promise` sin cambiar el contrato de tipos.
El bridge solo necesita pasar a `async`/`await`:

```js
// bridge.js futuro
async function communityCreatePost(authorId, body) {
  try {
    const result = await _communityRepo.applyIfVersion(
      await _communityRepo.getVersion(),
      (store) => createPostMock(store, { clubId, authorId, body })
    );
    return result.ok ? { ok: true, postId: result.result.id } : result;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
```

**Los 96 tests del bridge se adaptan con `await`. Los 59 tests de community-logic no cambian.**

---

## 3. Versionado

`_version` empieza en 0. Solo `applyIfVersion()` lo incrementa (en 1 por llamada exitosa).
Mutaciones directas vía `getStore()` no lo incrementan — esto es intencional en P1.2:
el bridge usa `getStore()` directamente. En P2+, todo cambio pasará por `applyIfVersion`.

### Snapshot con versión

```js
const snap = repo.snapshot();
// snap._meta.version === repo.getVersion()  ← siempre sincronizados
```

### Reset de versión

`repo.reset()` reinicia `_version` a 0 junto con el store.

---

## 4. Tenant isolation

### Garantía de instancia

Cada `createMemoryCommunityRepository(clubId)` tiene su propio closure. Imposible acceder
al `_store` de otra instancia desde fuera. Probado en 6 tests de aislamiento P1.1 +
4 tests de tenant hardening P1.2.

### Snapshot como barrera de tenant

`restoreSnapshot(snap)` valida `snap._meta.clubId === this.getClubId()`.
Si no coincide, devuelve `{ ok: false, error: { type: "tenant_mismatch", ... } }`.
El store del receptor no se modifica. Probado: snapshot de club-a rechazado en club-b.

### Operaciones legítimamente globales

Ninguna en P0–P1.2. Todas las entidades (usuarios, posts, partidos, reportes) están
asociadas a un `clubId`. Si en el futuro se añaden torneos inter-club o rankings globales,
documentar explícitamente que cruzan el límite de tenant y requieren permisos especiales.

---

## 5. Snapshots

### Estructura

```js
{
  // Colecciones del store (mismo formato que createEmptyStore()):
  userProfiles: [...],
  playerSocialProfiles: [...],
  consents: [...],
  friendships: [...],
  follows: [...],
  posts: [...],
  comments: [...],
  reactions: [...],
  openMatches: [...],
  matchInvites: [...],
  reports: [...],
  moderationActions: [...],
  auditLog: [...],
  // ...otras colecciones de community-logic

  // Metadatos (añadidos por snapshot(), nunca presentes en createEmptyStore()):
  _meta: {
    clubId: string,       // tenant del repo que generó el snapshot
    version: number,      // versión del store en el momento del snapshot
    timestamp: string,    // ISO 8601
  }
}
```

### Propiedades de compatibilidad

- `snap.userProfiles` — acceso directo funciona (tests P1.1 lo verifican)
- `snap._meta` — no colisiona con ninguna propiedad del store
- JSON round-trip: `JSON.parse(JSON.stringify(snap))` produce objeto idéntico

---

## 6. Recovery

### Flujo de recovery

```
1. Tomar snapshot antes de una operación arriesgada:
   const checkpoint = repo.snapshot();

2. Ejecutar la operación (puede mutar el store)

3. Si falla o se quiere revertir:
   const result = repo.restoreSnapshot(checkpoint);
   // result.ok === true → store vuelve al estado del checkpoint
   // result.version === checkpoint._meta.version
```

### Validaciones en restoreSnapshot

| Caso | Error devuelto |
|------|----------------|
| `snap` es null | `{ type: "validation", ... }` |
| `snap` no tiene `_meta` | `{ type: "validation", ... }` |
| `snap._meta.clubId !== clubId` | `{ type: "tenant_mismatch", ... }` |
| Error de serialización | `{ type: "internal", ... }` |

### Las claves de idempotencia NO se restauran

Al restaurar un snapshot, `_idempotencyKeys` permanece en su estado actual.
Esto es intencional: las claves son para evitar duplicados en operaciones de red;
no son parte del estado del dominio.

---

## 7. Rollback

El mismo `restoreSnapshot` sirve como rollback. Patrón recomendado:

```js
const before = repo.snapshot();
try {
  // mutaciones
} catch (e) {
  repo.restoreSnapshot(before); // rollback automático
}
```

Para backend real: usar transacciones del motor de BD (ROLLBACK en SQL, transacciones
en Firestore). `restoreSnapshot` es el equivalente local en memoria.

---

## 8. Idempotencia

### Claves con scope de clubId

`buildIdempotencyKey(operation, actorId, targetId)` produce:
```
"<clubId>:<operation>:<actorId>:<targetId>"
// Ejemplo: "club-demo-04:follow:user-1:user-2"
```

El scope de instancia ya garantiza aislamiento entre repos. El prefijo `clubId`
en la clave facilita el debugging y la migración a un KV compartido en producción.

### Operaciones y claves recomendadas

| Operación | Clave | Dominio ya idempotente |
|-----------|-------|------------------------|
| follow | `"follow:<actor>:<target>"` | No (puede duplicar) |
| unfollow | `"unfollow:<actor>:<target>"` | No |
| sendFriendRequest | `"friendReq:<actor>:<target>"` | Sí (lanza si ya existe) |
| reactTo | `"react:<actor>:<targetType>:<targetId>:<type>"` | Depende |
| requestToJoin | `"joinReq:<actor>:<match>"` | Sí (lanza si ya existe) |
| reportContent | `"report:<actor>:<targetType>:<targetId>"` | No |
| applyModerationAction | `"modAction:<report>:<moderator>"` | Sí (requiere in_review) |

---

## 9. Errores normalizados

### Tipos

```js
COMMUNITY_ERROR_TYPES = {
  VALIDATION:           "validation",           // parámetro faltante o inválido
  FORBIDDEN:            "forbidden",             // sin permiso
  NOT_FOUND:            "not_found",             // entidad no encontrada
  CONFLICT:             "conflict",              // versión o estado no coincide
  TENANT_MISMATCH:      "tenant_mismatch",       // datos de otro club
  IDEMPOTENCY_CONFLICT: "idempotency_conflict",  // clave ya usada con resultado distinto
  INTERNAL:             "internal",              // error inesperado
}
```

### Estructura

```js
{ type: string, message: string, details?: any }
// Nunca incluye stack trace, datos internos, ni secretos
```

---

## 10. Transición a backend real

### Ruta de migración incremental

```
P1.1/P1.2 hoy     → MemoryRepository (sync, en proceso)
P2 (futuro)        → HybridRepository (memory + write-through async a Supabase)
P3 (producción)    → SupabaseRepository (async, RLS, transacciones)
```

### Qué implementar en P2

1. `SupabaseCommunityRepository(clubId, supabaseClient)` — mismo contrato
2. `getVersion()` → `SELECT version FROM community_meta WHERE club_id = $1`
3. `applyIfVersion(v, fn)` → transacción optimista con SELECT FOR UPDATE
4. `restoreSnapshot(snap)` → no aplicable en producción (usar migraciones)
5. Claves de idempotencia → Redis/Upstash KV con TTL de 24h

### Cambios en el bridge al migrar

- Todos los wrappers pasan a `async`
- `store = _repo.getStore()` desaparece — cada operación consulta el backend
- Los 96 tests de bridge se adaptan con `await`
- Sin cambios en community-logic (funciones puras)

---

## 11. Riesgos residuales

| Riesgo | Nivel | Descripción |
|--------|-------|-------------|
| `getStore()` referencia mutable | P1 | Mutaciones directas no incrementan `_version`; se resuelve cuando el bridge use `applyIfVersion` |
| `_version` no se incrementa en bridge | P2 | Intencional en P1.2; bridge usa `getStore()` directamente |
| Sin TTL en idempotencyKeys | P2 | Map en memoria sin expiración; en producción necesita Redis con TTL |
| restoreSnapshot sin persistencia de idempotencyKeys | P3 | Las claves no se restauran con el snapshot |
| Multi-club en UI no implementado | P0 | `COMMUNITY_BRIDGE_CLUB_ID` sigue siendo constante global |

---

## 12. Definition of Done — P1.2

- [x] `COMMUNITY_ERROR_TYPES` con 7 tipos
- [x] `createCommunityError(type, msg, details?)` — no expone internals
- [x] `COMMUNITY_REPOSITORY_P12_EXTENSIONS` con 4 métodos
- [x] `validateRepositoryP12Extensions(repo)` — verificación en runtime
- [x] `getVersion()` — devuelve versión actual
- [x] `snapshot()` — incluye `_meta.{clubId, version, timestamp}`
- [x] `restoreSnapshot(snap)` — valida tenant + estructura; rollback funcional
- [x] `applyIfVersion(v, fn)` — locking optimista; error en versión incorrecta
- [x] `buildIdempotencyKey(op, a, t)` — prefijo clubId explícito
- [x] 32 tests P1.2 (+ 34 P1.1 = 66/66 total)
- [x] 59/59 community-logic sin regresar
- [x] 96/96 bridge sin regresar
- [x] Build PASS
- [x] Sin servicios externos
- [x] Cambios ajenos preservados
