# Lógica aislada — Comunidad Pádel 04

**Estado:** módulo de lógica pura + tests, **sin integración en `App.jsx`, sin backend real, sin Supabase/Make/Airtable/Stripe/WhatsApp.** Ejecuta el prompt recomendado en `INFORME_FINAL_COMUNIDAD_PADEL_04_TERMINAL_READY.md` (sección "Pasos exactos recomendados", punto 3): cerrar el hueco identificado en `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` (sección 16) — ningún módulo social tenía lógica de negocio probada, solo documentación y HTML estático.

## Qué es esto

Un espejo funcional, en JavaScript puro (ESM, sin React, sin dependencias nuevas), de las reglas de negocio ya documentadas en `app/docs/club-padel-04/comunidad/` para: perfil social, feed, amigos/seguidores, partidos abiertos y moderación/reportes. Cada función opera sobre un `store` en memoria (un objeto plano con arrays por entidad) — no hay red, no hay disco, no hay estado global persistente.

## Estructura

```
community-logic/
├── entities/
│   ├── store.mjs      # createEmptyStore() + factorías de las 16 entidades pedidas
│   └── seed.mjs        # datos ficticios (7 usuarios demo) para tests y pruebas locales
├── logic/
│   ├── consent.mjs      # hasConsent, grantConsent, revokeConsent, hasSocialLayerActive
│   ├── blocking.mjs      # isBlocked, blockUser, unblockUser (regla crítica de bloqueo)
│   ├── friendship.mjs    # solicitar/aceptar/rechazar/cancelar amistad, eliminar amigo
│   ├── follow.mjs        # seguir/dejar de seguir (fase 2)
│   ├── feed.mjs           # crear publicación, listar feed visible, comentar, reaccionar
│   ├── moderation.mjs     # reportar, revisar, aplicar sanción, vistas mínimas para usuario
│   ├── open-matches.mjs   # crear partido, solicitar/aceptar/rechazar plaza, cancelar
│   └── permissions.mjs    # canView / canComment / canReport / canJoinMatch (fachada común)
├── tests/                 # 7 archivos, 59 tests, node:test + node:assert/strict
├── index.mjs               # punto de entrada único (reexporta todo)
└── README.md                # este archivo
```

## Cómo ejecutar los tests

Sin dependencias nuevas — usa el test runner nativo de Node (disponible desde Node 18+, confirmado con Node 24.16 en este entorno). No se ha tocado `package.json` porque no hacía falta.

```bash
cd app/projects/club-padel-04/community-logic
node --test tests/*.test.mjs
```

Resultado al cerrar este prompt: **59/59 tests en verde**, 0 fallos, 0 saltados.

## Entidades cubiertas (16, según el mock lógico pedido)

`UserProfile` (usuario social), `PlayerSocialProfile` (perfil social), `Friendship` (amistad/conexión), `Follow` (seguidor), `CommunityPost` (publicación/feed), `Comment`, `Reaction`, `OpenMatch` (partido abierto), `MatchInvite` (invitación a partido), `ClubGroup` (grupo — estructura mínima, sin lógica de negocio todavía), `EventRegistration` (inscripción a evento — estructura mínima), `SocialRanking` (ranking social — estructura mínima), `Notification`, `Report`, `ModerationAction`, `PrivacyConsent`. `AuditLog` incluido como registro transversal (`appendAudit`).

Grupos, eventos y ranking social se modelan solo como estructura de datos (factorías en `store.mjs`) porque el catálogo de prompts no llegó a diseñar sus flujos UI/reglas de negocio todavía (ver `INFORME_FINAL_COMUNIDAD_PADEL_04_TERMINAL_READY.md`, "Módulos pendientes") — no se ha inventado lógica de negocio para ellos que no estuviera ya documentada, para no adelantar decisiones de producto no tomadas.

## Reglas de seguridad implementadas y probadas

- Sin `social_layer_opt_in`, ninguna acción social se ejecuta (publicar, solicitar amistad, seguir, crear partido).
- Bloqueo con **doble barrera**: un usuario bloqueado no aparece en listados (feed, partidos) y, aunque se fuerce la llamada directa a una función de creación, la validación de bloqueo se repite de forma independiente — probado explícitamente en `tests/open-matches.test.mjs` ("barrera 2").
- Bloquear a alguien deshace de inmediato cualquier amistad o seguimiento existente entre las partes (regla propuesta en `AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md`, ahora implementada y probada).
- Partido cerrado (`full`/`cancelled`) no acepta nuevas solicitudes.
- Contenido reportado y resuelto como `content_removed` queda oculto para todos salvo `STAFF`/`ADMIN` (mismo criterio ya documentado).
- Ningún rol no autorizado puede ejecutar una `ModerationAction` — y `user_suspended`/`user_banned` están reservados exclusivamente a `ADMIN`, `STAFF` recibe un error explícito si lo intenta.
- Ninguna acción de moderación se ejecuta sin un `moderatorId` humano explícito — no existe ninguna función de "moderación automática" en este módulo, ni con IA ni sin ella.
- Minimización de datos: `getReportStatusForReporter` y `getSanctionSummaryForUser` nunca exponen `ModerationAction.notes` ni la identidad del reportante — probado explícitamente comprobando que el JSON serializado no contiene esos datos.
- Revocación retroactiva: retirar `appear_in_feed` oculta de inmediato el contenido ya publicado a terceros (el propio autor lo sigue viendo) — probado en `tests/consent-privacy.test.mjs`.
- Todos los datos son ficticios (`entities/seed.mjs`): 7 usuarios demo, ningún nombre, foto ni dato real.

## Un bug real detectado por los propios tests (transparencia del proceso)

La primera versión de `hasConsent()` ordenaba los registros de consentimiento por timestamp para determinar "el más reciente". Al ejecutar los tests (operaciones síncronas, sub-milisegundo), varios registros compartían el mismo timestamp, lo que rompía el orden y hacía que `revokeConsent()` no se reflejara correctamente en `hasConsent()`. Los tests fallaron (3 de 59) al primer intento, se diagnosticó la causa raíz y se corrigió usando el orden de inserción real del array en vez de comparar fechas — exactamente el tipo de fallo que este prompt existe para atrapar antes de llegar a `App.jsx`.

## Huecos conocidos, heredados de la documentación (no resueltos aquí a propósito)

- `Friendship.status="cancelled"` es una extensión local de este módulo (no existe en el modelo de datos ya mergeado, `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`) — ya señalado como pendiente en `CHECKLIST_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md`. Este módulo lo implementa para poder probar el flujo "cancelar solicitud enviada", pero debe formalizarse (o descartarse) en el modelo real antes de integrar.
- Un `OpenMatch` con `slotsTotal=1` nace con `slotsFilled=1` (el creador) pero no se marca `status=full` automáticamente al crearse — comportamiento actual documentado en `tests/edge-cases.test.mjs`, no decidido como correcto ni incorrecto; a confirmar con producto.
- `Report.targetType` no tiene un valor específico para `OpenMatch` (se usa `"event"` como aproximación, mismo hueco ya señalado en `PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md`, sección 21).

## Qué NO hace este módulo

No renderiza nada (sin React, sin HTML). No conecta a Supabase, Make, Airtable, Stripe ni WhatsApp. No lee ni escribe `App.jsx`. No usa datos personales reales. No implementa Grupos/Eventos/Ranking como lógica de negocio (solo estructura). No implementa chat ni geolocalización (fuera de alcance en todo el catálogo). No es un servidor ni expone ningún endpoint — es una librería de funciones puras pensada para ser importada, en el futuro y con autorización explícita, desde componentes React reales.
