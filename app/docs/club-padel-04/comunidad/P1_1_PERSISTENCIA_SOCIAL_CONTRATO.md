# P1.1 — Contrato de Persistencia Social + Aislamiento Multi-Club

**Fecha:** 2026-08-15  
**Estado:** CERRADO — contrato y MemoryAdapter operativos  
**Tests:** 59/59 community-logic · 96/96 communityBridge · 34/34 repository  
**Build:** PASS  

---

## 1. Arquitectura

```
React UI (ComunidadDemo.jsx)
   │
   ▼
communityBridge.js          ← API pública para React (sync, 96 tests)
   │
   ├── _communityRepo       ← CommunityRepository activo (P1.1: MemoryImpl)
   │      └── getStore()    ← store mutable (referencia directa)
   │
   ▼
community-logic/            ← Funciones puras de dominio (59 tests)
```

### Capa de repositorio (nueva en P1.1)

```
src/utils/communityRepository.js
  createMemoryCommunityRepository(clubId)  → MemoryRepository
  validateRepositoryContract(repo)         → { valid, missing }
  COMMUNITY_REPOSITORY_CONTRACT            → string[]
```

---

## 2. Contrato del repository

```js
// 7 métodos obligatorios:
repo.getStore()                          // referencia al store mutable (sync)
repo.reset()                             // reinicia a estado vacío (sync, tests)
repo.snapshot()                          // copia profunda serializable (sync)
repo.getClubId()                         // string — clubId del tenant
repo.isIdempotencyKeyUsed(key)           // boolean
repo.markIdempotencyKey(key, result)     // void
repo.getIdempotencyResult(key)           // resultado | null
```

Verificación en runtime:
```js
import { validateRepositoryContract } from "./communityRepository.js";
const { valid, missing } = validateRepositoryContract(myRepo);
```

---

## 3. MemoryCommunityRepository

Implementación activa — sin red, sin disco, determinista.

| Propiedad | Valor |
|-----------|-------|
| Persistencia | Memoria del proceso (se pierde al recargar) |
| Aislamiento | Por instancia — cada `createMemoryCommunityRepository(clubId)` es independiente |
| Serializable | Sí (JSON.stringify / snapshot()) |
| Idempotencia | Map en memoria sin TTL |
| Tests propios | 34/34 |
| Producción | NO |

---

## 4. Aislamiento multi-club / multi-tenant

### Principio

Cada club tiene su propia instancia de `MemoryCommunityRepository`. No es posible
contaminar datos entre clubs porque cada instancia mantiene su propio objeto `store`
aislado en un closure.

```js
const repoClubA = createMemoryCommunityRepository("club-a");
const repoClubB = createMemoryCommunityRepository("club-b");
// Mutar repoA.getStore() no tiene efecto sobre repoB.getStore()
```

### Garantías probadas (34 tests)

- Dos repos con distinto clubId no comparten ninguna colección
- Reset de repo A no afecta a repo B
- Posts, consentimientos y reportes de A no aparecen en B
- Claves de idempotencia son locales a cada instancia
- Snapshot de A no contiene datos de B

### Situación actual (P1.1)

El bridge usa un único repo (`COMMUNITY_BRIDGE_CLUB_ID = "club-demo-04"`).
Para multi-tenant real: instanciar un repo por club y pasar el clubId como
contexto de sesión (no como constante global).

---

## 5. Aislamiento por usuario

Hoy: el store es un objeto plano; el aislamiento por usuario lo hace community-logic
mediante `clubId` + validaciones de rol. El bridge NO expone el store a React.

Para producción multi-tenant completa (FASE futura):
- Row-Level Security en Supabase (usuario solo ve sus propias filas)
- El repository debe recibir `userId` en el contexto de sesión y filtrarlo en las queries
- community-logic ya valida permisos — el backend añade la barrera de persistencia

---

## 6. Idempotencia — preparación para backend

### Formato de clave recomendado
```
"<operación>:<actorId>:<targetId>"
// Ejemplos:
"follow:user-1:user-2"
"friendRequest:user-1:user-2"
"report:user-1:post-abc"
"reaction:user-1:post-abc:like"
```

### Operaciones candidatas a protección de idempotencia

| Operación | Dominio ya idempotente | Clave de repo necesaria |
|-----------|------------------------|------------------------|
| follow / unfollow | No (puede duplicar follows) | `"follow:<actor>:<target>"` |
| sendFriendRequest | Sí (lanza si ya existe pending) | Opcional |
| reactTo | Depende de impl. | `"react:<actor>:<targetType>:<targetId>:<type>"` |
| requestToJoin | Sí (lanza si ya existe) | Opcional |
| reportContent | No (permite múltiples) | `"report:<actor>:<targetType>:<targetId>"` |
| applyModerationAction | Sí (requiere status in_review) | Opcional |

### Uso en backend futuro
```js
async function followUserSafe(repo, actorId, targetId) {
  const key = `follow:${actorId}:${targetId}`;
  if (repo.isIdempotencyKeyUsed(key)) {
    return repo.getIdempotencyResult(key); // replay sin efecto
  }
  const result = await backendFollowUser(actorId, targetId);
  repo.markIdempotencyKey(key, result);
  return result;
}
```

---

## 7. Transición a backend real

### Punto de migración

El bridge usa `_communityRepo = createMemoryCommunityRepository(...)`.
Para cambiar a backend real, crear `SupabaseCommunityRepository` con el mismo
contrato e inyectarlo en el bridge:

```js
// bridge.js (futuro)
import { createSupabaseCommunityRepository } from "./communityRepository.supabase.js";
let _communityRepo = createSupabaseCommunityRepository(COMMUNITY_BRIDGE_CLUB_ID, supabaseClient);
```

No se cambia el contrato público del bridge ni los 96 tests.

### Impacto async

Todos los wrappers del bridge son síncronos hoy. Al migrar a backend:
1. `getStore()` no tiene sentido async — el store se convierte en un cache local
2. Cada operación mutante del bridge pasa a `async`
3. Los 96 tests de bridge se adaptan con `await`
4. Los 59 tests de community-logic no cambian (son de dominio puro)

### Estrategia de migración incremental

```
Fase actual (P1.1)  → MemoryRepository (sin red)
Fase P2             → HybridRepository (memory + write-through a Supabase)
Fase P3             → SupabaseRepository (read desde DB, community-logic valida)
```

---

## 8. Rollback

Si el backend falla o la migración rompe tests:
1. Revertir el import en `communityBridge.js` a `createMemoryCommunityRepository`
2. Los 96 tests del bridge vuelven a pasar sin cambios adicionales
3. El bridge es el firewall entre React y el backend — React no sabe qué adapter está activo

---

## 9. Qué sigue sin ser producción tras P1.1

| Item | Estado |
|------|--------|
| Datos persistidos al recargar | NO — todo en memoria |
| Multi-club en la UI | NO — bridge usa un único clubId constante |
| `userId` como contexto dinámico de sesión | NO — lo pasa la UI como argumento |
| TTL en claves de idempotencia | NO — Map sin expiración |
| Audit log persistido | NO — sí existe en el store, pero se pierde al recargar |
| Row-Level Security | NO — solo validaciones en dominio |

---

## 10. Definition of Done — Persistencia Real

- [ ] `SupabaseCommunityRepository` implementa `COMMUNITY_REPOSITORY_CONTRACT`
- [ ] `validateRepositoryContract(supabaseRepo).valid === true`
- [ ] Todos los wrappers del bridge son `async`
- [ ] 96+ tests de bridge adaptados a `async`/`await`
- [ ] Row-Level Security configurada en Supabase por `club_id` y `user_id`
- [ ] Claves de idempotencia con TTL en Redis/KV
- [ ] Test de carga: 2 clubs concurrentes sin cross-contamination
- [ ] Rollback documentado y probado en staging
- [ ] RBAC del Worker verifica autorización antes de llegar al repo
- [ ] audit_log persistido en backend
