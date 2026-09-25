# CIERRE P0 — Comunidad Deportiva · Club Pádel 04

**Fecha:** 2026-08-15  
**Estado:** CERRADO — P0.1 · P0.2 · P0.3 · P0.4 · P0.5 completos  
**Rama:** `docs/resultado-merge-pr52-66-20260727`  
**Tests finales:** 59/59 community-logic · 96/96 communityBridge  
**Build:** PASS (sin errores nuevos)

---

## 1. Qué se implementó

| Fase | Alcance | Estado |
|------|---------|--------|
| P0.1 | Amistades, seguidores, bloqueo, consentimiento social | Cerrado |
| P0.2 | Feed de posts, comentarios, reacciones | Cerrado |
| P0.3 | Partidos abiertos, solicitudes de plaza | Cerrado |
| P0.4 | Moderación, reportes, sanciones RBAC, privacidad de perfil | Cerrado |
| P0.5 | Hardening: comment reporting, tests de gaps, limpieza demo | Cerrado |

---

## 2. Arquitectura

```
community-logic/          ← Biblioteca de funciones puras (sin React, sin I/O)
  logic/
    consent.mjs           consentimiento social
    blocking.mjs          bloqueo bidireccional
    friendship.mjs        solicitudes y amistad
    feed.mjs              posts, comentarios, reacciones, feed filtrado
    open-matches.mjs      partidos abiertos, solicitudes de plaza
    moderation.mjs        reportes, sanciones, ocultación de contenido
    permissions.mjs       helpers transversales (canView, canReport, canJoinMatch)
  entities/
    store.mjs             createEmptyStore() — estado en memoria
  index.mjs               barrel re-export

src/utils/communityBridge.js   ← ÚNICA conexión entre community-logic y React
src/components/ComunidadDemo.jsx   ← Componente UI que consume el bridge
src/data/comunidadDemoData.js      ← Solo datos de display (sin state real)
```

### El bridge como fuente de verdad

`communityBridge.js` mantiene `let store = createEmptyStore()` — un objeto
plano en memoria. Todo el estado de la comunidad vive aquí. La UI lee desde el
store mediante funciones del bridge y escribe mediante mutaciones que el bridge
aplica invocando a community-logic.

**Ninguna regla de negocio se reimplementa en el bridge** — todas las
validaciones, restricciones y invariantes están en community-logic.

---

## 3. Persistencia — qué hay hoy y qué se necesita para producción

### Hoy (P0)
El store vive **solo en memoria del proceso**. Al recargar la página, todo se
pierde. Los datos de demo se resiembran en cada montaje mediante
`communitySeedDemoRelationships()`.

### Punto de migración a backend real

Todos los wrappers del bridge son síncronos. La migración requiere:

1. **Reemplazar `let store = createEmptyStore()`** por una capa async que lea
   el estado inicial desde Supabase/API al montar.
2. **Hacer async cada wrapper mutante** (`communityCreatePost`, etc.) para que
   persistan cada mutación antes de retornar.
3. **Adaptar los tests** al contrato async.
4. **Multi-club/multi-tenant:** `COMMUNITY_BRIDGE_CLUB_ID` debe convertirse en
   parámetro de contexto, no constante global.

No se necesita refactorizar community-logic — sus funciones son puras y
agnósticas al transporte.

---

## 4. RBAC — quién puede hacer qué

| Acción | PLAYER | STAFF | ADMIN | SUPPORT |
|--------|--------|-------|-------|---------|
| Reportar contenido | ✓ (con `social_layer_opt_in`) | ✓ | ✓ | ✓ |
| Ver cola de reportes | ✗ | ✓ (sin reporterId) | ✓ (con reporterId) | ✓ (sin reporterId) |
| Marcar en revisión | ✗ | ✓ | ✓ | ✓ |
| Aplicar `warning` / `content_removed` | ✗ | ✓ | ✓ | ✓ |
| Aplicar `user_suspended` / `user_banned` | ✗ | ✗ | ✓ | ✗ |
| Desestimar reporte | ✗ | ✓ | ✓ | ✓ |
| Cambiar visibilidad de perfil | ✓ (propio) | — | — | — |

La autoridad es el **dominio** (`assertModeratorRole` en moderation.mjs).
La UI solo muestra/oculta botones según rol pero no sustituye la validación.

---

## 5. Minimización de datos

- **`communityGetReportsQueue`**: STAFF y SUPPORT reciben la cola sin `reporterId`. ADMIN recibe `reporterId`.
- **`communityGetReportStatusForReporter`**: el reportante solo ve `status` + `reason` + `createdAt`. Sin notas del moderador ni `moderatorId`.
- **`communityGetSanctionSummaryForUser`**: el usuario sancionado ve `actionType` + `createdAt` + `reasonCategory`. Sin notas internas ni identidad del moderador.

---

## 6. Privacidad de perfil

- Toggle en `PerfilTab` conectado a `communityUpdateProfileVisibility` / `communityGetProfileVisibility`.
- Niveles: `"private"` | `"friends"` | `"club"`.
- La visibilidad se persiste en el store del bridge (en memoria) y se aplica via `canView` en permissions.mjs.

---

## 7. Hardening P0.5

- **Limpieza demo:** `DEMO_POSTS` y `DEMO_OPEN_MATCHES` eliminados de `comunidadDemoData.js`; la UI usa el store real.
- **Comment reporting:** botón real en `FeedTab` para cada comentario ajeno; estado `reportedComments` en `ComunidadDemo`.
- **Firma de componentes limpia:** `ModeracionTab` sin `moderationVersion` no utilizado.
- **Header bridge actualizado:** refleja P0.1–P0.5 y documenta el punto de migración a persistencia real.

---

## 8. Tests — cobertura mínima por capa

**community-logic (59/59):**
- consentimiento, bloqueo, amistad, seguidores
- feed, comentarios, reacciones
- partidos abiertos, solicitudes de plaza
- permisos transversales
- moderación, reportes, sanciones, ocultación de contenido

**communityBridge (96/96):**
- Todos los wrappers P0.1–P0.4 con contratos de error explícitos
- Minimización de datos por rol (PLAYER / STAFF / ADMIN / SUPPORT)
- P0.5: SUPPORT sin reporterId, comment targetType, markInReview sobre reporte resuelto → ok:false, reportId inexistente → ok:false
- Regresión P0.4: amistad + feed + partidos + moderación coexisten sin interferencias

---

## 9. Seguridad — restricciones mantenidas

- Sin llamadas a servicios externos (Airtable, Make, Supabase, Stripe, WhatsApp).
- Sin persistencia fuera de memoria del proceso.
- Sin datos de usuarios reales ni menores activos.
- Ningún secreto / credencial en código.
- Ningún git reset / push / PR / merge / deploy ejecutado.

---

## 10. Riesgos residuales antes de producción

| Riesgo | Prioridad | Descripción |
|--------|-----------|-------------|
| Persistencia en memoria | P0 | Todo se pierde al recargar |
| `COMMUNITY_BRIDGE_CLUB_ID` constante | P1 | Multi-tenant requiere contexto dinámico |
| Consentimiento bundled en demo | P2 | `activity_sharing` y `appear_in_feed` se conceden con `social_layer_opt_in` — simplificación documentada, requiere flujo explícito en producción |
| Validación legal menores | P0 | Ver PR #24 antes de activar con usuarios reales |
| Sin moderación asíncrona | P2 | Cola de moderación es síncrona/en memoria; notificaciones y escalado requieren backend |

---

## 11. Definition of Done para producción

- [ ] Store reemplazado por capa async (Supabase / API)
- [ ] `COMMUNITY_BRIDGE_CLUB_ID` como parámetro de contexto (multi-tenant)
- [ ] Consentimientos granulares independientes (`activity_sharing`, `appear_in_feed`)
- [ ] Validación legal externa completada (PR #24)
- [ ] Tests de integración con backend real (no solo unit tests en memoria)
- [ ] Moderación con notificaciones y escalado async
- [ ] QA Playwright con usuario real (no demo)
- [ ] RBAC verificado en Worker (no solo en frontend)
