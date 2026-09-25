# Moderación, reportes y roles — Comunidad Pádel 04
### Prompt E ejecutado — Capa de seguridad social, sin implementación

**Estado:** documento de diseño. Sin código, sin Supabase real, sin publicación de textos legales definitivos.
**Fecha:** 2026-07-14
**Rama:** `docs-ui/comunidad-padel-moderacion-reportes-roles-2026-07-14`
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md` (mismo directorio, ya mergeados en `main`).
**Documentos hermanos:** `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md`, `MATRIZ_ACCIONES_MODERACION_COMUNIDAD_PADEL_04.md`, `CHECKLIST_SEGURIDAD_SOCIAL_COMUNIDAD_PADEL_04.md`.

**Aviso legal:** ⚠️ Igual que en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, ningún criterio de este documento constituye asesoría legal ni garantiza cumplimiento normativo al 100%. Es un diseño técnico-funcional pendiente de validación por abogado/DPO.

---

## 1. Resumen ejecutivo

Este documento diseña la capa de seguridad social de Comunidad Pádel 04: quién puede reportar, bloquear, ocultar y moderar contenido; qué pasa con cada acción paso a paso; y cómo se audita todo sin exponer a quien reporta. Se apoya en las entidades ya mergeadas `Report`, `ModerationAction`, `AuditLog`, `Friendship` (para bloqueo) y en las reglas de rol ya definidas en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` — no redefine el modelo de datos, lo convierte en flujos operativos y en un prototipo visual mock.

## 2. Objetivo de moderación

Que ningún jugador tenga que tolerar contenido o comportamiento abusivo en la comunidad, que toda decisión de moderación la tome una persona (nunca una IA sola), y que el sistema sea difícil de usar mal — ni para acosar a otro jugador, ni para silenciar reportes legítimos, ni para saturar la cola de revisión con reportes de mala fe.

## 3. Principios de seguridad social

- **Protección por defecto**: reportar y bloquear están siempre disponibles, sin gate de consentimiento (ya establecido en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 21).
- **Revisión humana obligatoria**: ninguna acción de moderación (retirar contenido, suspender, banear) ocurre sin que una persona con rol STAFF/ADMIN/SUPPORT la ejecute (ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 9, y reafirmado en la sección 20 de este documento).
- **Anonimato del reportante frente al reportado**: nunca se revela quién reportó (ya establecido, `RLS...md` sección 8).
- **Proporcionalidad**: la primera respuesta a un reporte no es nunca el baneo — hay una escalera de severidad (sección 6 de `MATRIZ_ACCIONES_MODERACION...md`).
- **Trazabilidad completa**: toda acción sensible genera `AuditLog`, inmutable (ya establecido en el modelo de datos).
- **Minimización**: los datos de un reporte se comparten solo con quien necesita actuar sobre él (STAFF de ese club, ADMIN, SUPPORT si se escala) — nunca de forma pública ni entre clubes salvo escalado explícito a SUPPORT.

## 4. Roles implicados

Mismos 4 roles reales ya usados en toda la app (no se crean roles nuevos): `PLAYER`, `STAFF`, `ADMIN`, `SUPPORT` — descripción de su papel en moderación en la sección 5.

## 5. Permisos por rol

| Rol | Puede reportar | Puede bloquear | Puede ver cola de reportes | Puede resolver reportes | Puede ver `AuditLog` |
|---|---|---|---|---|---|
| `PLAYER` | Sí (propio criterio) | Sí (propio criterio) | No (solo el estado de sus propios reportes) | No | No |
| `STAFF` | Sí | Sí | Sí, de su club | Sí, salvo baneo permanente (ver sección 13) | No |
| `ADMIN` | Sí | Sí | Sí, de su club | Sí, incluida escalada y baneo permanente | Sí, de su club |
| `SUPPORT` | Sí (poco habitual) | Sí (poco habitual) | Sí, de todos los clubes (diagnóstico) | Solo si se le escala explícitamente | Sí, de todos los clubes |

Coherente con `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, secciones 1-2, sin contradicciones.

## 6. Tipos de contenido moderable

`CommunityPost`, `Comment`, `PlayerSocialProfile` (perfil completo, p. ej. `bio`/`avatar_url` inapropiados), `ClubGroup` (nombre/descripción, fase 2), `Event` (título/descripción, si es creado por un jugador), `OpenMatch` (uso indebido, p. ej. spam de partidos falsos) — todos ya contemplados como `Report.target_type` en el modelo de datos (`user`, `post`, `comment`, `group`, `event`); se añade aquí la lectura operativa de qué implica moderar cada uno.

## 7. Motivos de reporte

Reutiliza `Report.reason` ya definido en el modelo: `harassment` (acoso), `spam`, `inappropriate_content` (contenido inapropiado), `fake_profile` (perfil falso), `other` (otro, con campo de detalle obligatorio en ese caso).

## 8. Estados de un reporte

Reutiliza `Report.status` ya definido: `open` (recién creado) → `in_review` (asignado/visto por STAFF) → `resolved` (se tomó una acción) o `dismissed` (se revisó y no procede). Este documento añade el matiz operativo: un reporte no debe quedar en `open` más de un plazo razonable sin pasar a `in_review` — regla de proceso, no de esquema (a definir operativamente por cada club, no se fija un SLA numérico en este documento).

## 9. Flujo de reporte

1. Usuario pulsa "Reportar" desde cualquier contenido o perfil (sin gate de consentimiento).
2. Selecciona motivo (`Report.reason`) + detalle opcional.
3. Envía → se crea `Report(status=open)` + `AuditLog`.
4. Usuario recibe confirmación neutra ("Hemos recibido tu reporte") — sin prometer un plazo de resolución concreto.
5. El reporte entra en la cola de STAFF de su club (sección 12).

## 10. Flujo de bloqueo de usuario

1. Usuario pulsa "Bloquear" desde un perfil (sin gate de consentimiento).
2. Confirmación breve (una sola pantalla, sin fricción excesiva).
3. Se actualiza `Friendship.status=blocked` + `AuditLog`.
4. Efecto inmediato y transversal (ya definido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 7): sin nuevas invitaciones, comentarios, retos, ni visibilidad mutua en el feed.
5. La otra parte **no es notificada** del bloqueo.

## 11. Flujo de ocultar publicación

Acción **distinta** de reportar: "Ocultar" es una preferencia local del propio usuario (no genera `Report` ni es visible a nadie más), simplemente deja de mostrar ese post en su propio feed. No requiere moderación ni genera cola de trabajo para STAFF — es autoservicio inmediato.

## 12. Flujo de revisión por STAFF

1. STAFF entra a "Moderación" (solo visible con ese rol) → ve cola de `Report(status=open/in_review)` de su club, ordenada por antigüedad.
2. Abre un reporte → ve motivo, detalle, contenido/perfil reportado — **no ve quién reportó** (ya establecido).
3. Decide: `dismissed` (no procede, con nota interna opcional) o crea `ModerationAction` (aviso, retirar contenido, suspender) → `Report.status=resolved`.
4. Toda decisión genera `AuditLog`.
5. STAFF **no puede** ejecutar `user_banned` (baneo permanente) — ese nivel requiere `ADMIN` (ver sección 13, escalera de severidad).

## 13. Flujo de escalado a ADMIN

Casos que escalan de STAFF a ADMIN: reincidencia (mismo usuario con 2+ `ModerationAction` previas), solicitud de baneo permanente, contenido que implique un riesgo legal (amenazas, contenido potencialmente ilegal), o desacuerdo del usuario afectado con la decisión de STAFF (vía un canal de "solicitar revisión", no incluido como entidad nueva en este documento — se apoya en un nuevo `Report` sobre la propia decisión, evitando crear una tabla de apelaciones separada en el MVP). ADMIN puede revertir una `ModerationAction` de STAFF (crea una `ModerationAction` nueva referenciando la anterior en `notes`, nunca edita la original — inmutabilidad ya establecida).

## 14. Flujo de soporte técnico

`SUPPORT` interviene solo cuando: (a) un club no tiene STAFF/ADMIN disponible para resolver un reporte urgente, (b) se sospecha abuso de la plataforma a nivel multi-club (p. ej. mismo usuario reincidente en varios clubes, detectable solo con visión cross-tenant), o (c) se escala explícitamente desde un `ADMIN`. `SUPPORT` no debe moderar contenido rutinario de un club activo con STAFF propio — su intervención es la excepción, no la vía por defecto (principio de minimización de acceso, ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).

## 15. Auditoría y trazabilidad

Toda acción de esta capa genera `AuditLog` (ya definido en el modelo de datos): `report.created`, `report.status_changed`, `friendship.blocked/unblocked`, `moderation_action.created`. Ninguna se audita dos veces con formatos distintos — un único evento por acción, consistente con el resto de la app.

## 16. Protección ante abuso de reportes

Riesgo no cubierto explícitamente en el modelo de datos original, añadido aquí: un usuario que reporta de forma reiterada y sin fundamento (varios `dismissed` seguidos sobre el mismo objetivo) debe poder marcarse internamente (nota en `ModerationAction` o `AuditLog`, no un campo nuevo en el MVP) para que STAFF/ADMIN lo tengan en cuenta al revisar futuros reportes suyos — sin bloquear automáticamente su capacidad de reportar (un falso positivo aquí es peor que el propio abuso: podría silenciar una víctima real). Ver también fila específica en `MATRIZ_ACCIONES_MODERACION_COMUNIDAD_PADEL_04.md`.

## 17. Privacidad y minimización de datos

El detalle de un `Report` (motivo, texto libre) es visible solo a STAFF/ADMIN de ese club y a SUPPORT si se escala — nunca a otros jugadores, nunca entre clubes sin escalado explícito. `ModerationAction.notes` (deliberación interna) no es visible ni al reportante ni al reportado (ya establecido en `RLS...md`, sección 10) — el reportado solo ve un resumen genérico de la sanción, no el razonamiento interno.

## 18. Menores de edad

Mismo riesgo abierto ya señalado en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (sección 14) y en la matriz de riesgos (#1, crítico): si un club tiene socios menores con la capa social activa, la moderación debe tener un criterio más estricto y más rápido para contenido que involucre a un menor — no resuelto en este documento, señalado como dependencia directa de la decisión de negocio pendiente sobre menores.

## 19. Contenido sensible

Reportes o contenido que revelen datos de categoría especial (art. 9 RGPD, ver `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 13) introducidos voluntariamente por un usuario en texto libre deben tratarse con acceso más restringido incluso dentro de STAFF (idealmente solo ADMIN) — recomendación operativa, no forzada por el esquema de datos en el MVP.

## 20. Límites de automatización con IA

Reafirmación explícita, coherente con todo el catálogo: **ninguna acción de moderación (retirar contenido, suspender, banear) se ejecuta de forma automática por IA sin revisión humana**, en esta fase ni en ninguna futura sin que se documente y comunique expresamente antes de activarse (ya anticipado en `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`, texto 14). Ninguna IA tiene permiso de escritura en `ModerationAction` (ya establecido en RLS).

## 21. Qué NO entra todavía

Chat libre real, geolocalización real, pagos reales, tratamiento de menores sin control específico, integración con `App.jsx`, Supabase real, migraciones SQL reales, apelaciones formales como entidad separada (se gestionan como nuevo `Report` en el MVP), moderación automática por IA, sistema de puntuación/reputación de usuarios (no incluido en el modelo de datos actual).

## 22. MVP recomendado

Reportar (contenido y perfil), bloquear/desbloquear, ocultar publicación (autoservicio), cola de revisión STAFF con 3 acciones (`dismissed`, `warning`, `content_removed`), escalado manual a ADMIN, `user_suspended`/`user_banned` reservados a ADMIN. Sin apelaciones formales, sin panel de analítica de moderación, sin IA — todo pospuesto a fases posteriores.

## 23. Checklist antes de implementación

- [ ] Validación legal de los flujos de escalado y de la retención de `Report`/`ModerationAction` (ya pendiente desde el Prompt F).
- [ ] Definir operativamente el SLA de revisión de reportes por club (no fijado en este documento).
- [ ] Confirmar el mecanismo de "solicitar revisión" (nuevo `Report` sobre la decisión) con el equipo de producto antes de construir UI de apelación real.
- [ ] Ninguna implementación real hasta autorización explícita (Prompt N).

## 24. Siguiente prompt recomendado

Con moderación y seguridad social diseñadas (Prompt E), el catálogo recomienda avanzar al **Prompt D — Partidos abiertos** (lógica aislada + tests), que ya puede apoyarse en las reglas de bloqueo aquí confirmadas (un `MatchInvite` no debe poder crearse entre usuarios con `Friendship.status=blocked`, ya anticipado en el modelo de datos).
