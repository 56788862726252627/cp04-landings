# Consentimiento y privacidad — Comunidad Pádel 04
### Prompt F ejecutado — Diseño de consentimiento, sin implementación

**Estado:** documento de diseño. Sin código, sin Supabase real, sin publicación de textos legales definitivos.
**Fecha:** 2026-07-14
**Rama:** `docs/comunidad-padel-consentimiento-privacidad-2026-07-14`
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`, `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` (mismo directorio, ya mergeados en `main`).
**Documentos hermanos:** `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`, `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (mismo directorio).

**Aviso legal:** ⚠️ **Ningún texto ni criterio de este documento constituye asesoría legal ni garantiza cumplimiento RGPD/LOPDGDD al 100%.** Todo lo aquí descrito es un **borrador técnico-funcional** que debe ser revisado, corregido y aprobado por un abogado o Delegado de Protección de Datos (DPO) real antes de cualquier implementación o publicación. Donde este documento dice "aviso" o "texto", léase siempre "borrador de aviso/texto pendiente de validación legal".

---

## 1. Resumen ejecutivo

Este documento traduce el modelo de datos y las reglas RLS ya diseñados (`MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`) en una capa de consentimiento operativa: qué se pide, cuándo, con qué palabras (borrador) y qué pasa si el usuario acepta, rechaza o retira su consentimiento más tarde. Extiende la entidad `PrivacyConsent` (ya mergeada, 5 tipos de consentimiento) con 3 tipos adicionales propuestos — `social_layer_opt_in`, `publish_photos`, `ranking_visibility` — necesarios para cubrir los flujos de UI pedidos en este prompt. Estos 3 tipos son una **propuesta de ampliación**, no una modificación retroactiva del modelo ya mergeado; se marcan como tal en todo el documento.

## 2. Objetivo de la capa de consentimiento

Que ninguna función social de Comunidad Pádel 04 se active para un jugador sin una acción explícita, informada y revocable de su parte, y que cada consentimiento quede registrado de forma auditable (vía `PrivacyConsent`, ya diseñada) antes de que exista cualquier implementación real.

## 3. Principios RGPD aplicables

- **Licitud, lealtad y transparencia** (art. 5.1.a): cada consentimiento explica qué se hace con el dato antes de pedirlo.
- **Minimización de datos** (art. 5.1.c): no se pide más de lo necesario para la función concreta.
- **Consentimiento libre, específico, informado e inequívoco** (art. 4.11, art. 7): un consentimiento por función, nunca un único "acepto todo".
- **Facilidad de retirada** (art. 7.3): retirar debe ser tan fácil como otorgar — mismo número de pasos, mismo lugar.
- **Responsabilidad proactiva** (art. 5.2): registro auditable de cada consentimiento (`PrivacyConsent` + `AuditLog`, ya diseñados).
- **Privacidad desde el diseño y por defecto** (art. 25): ya aplicado en el modelo de datos (sección 8 de `MODELO_DATOS_SOCIAL...md`) y reafirmado aquí.

## 4. Privacidad por defecto

Ningún dato social nace público. Al activar la capa social por primera vez, todos los campos de visibilidad (`PlayerSocialProfile.visibility_*`) parten en su valor más restrictivo ya definido (`private`/`friends`), y ningún consentimiento opcional se marca pre-aceptado. Ninguna casilla de consentimiento aparece premarcada — el usuario debe marcarla activamente (patrón ya validado como estándar de mercado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`, sección 14).

## 5. Consentimiento granular

Ocho consentimientos independientes, cada uno gateando una función concreta y revocable por separado (los 5 primeros ya existen en el modelo mergeado; los 3 últimos son propuesta de ampliación de este documento):

| Consentimiento | Estado | Gatea |
|---|---|---|
| `appear_in_feed` | Ya en modelo | Publicar actividad propia en el feed |
| `searchable_by_others` | Ya en modelo | Aparecer en búsqueda de jugadores (fase 2) |
| `receive_non_friend_messages` | Ya en modelo | Recibir mensajes/invitaciones de no-amigos (fase 2/3) |
| `approximate_location` | Ya en modelo | Búsqueda por zona aproximada (fase 3) |
| `activity_sharing` | Ya en modelo | Notificar a contactos sobre la propia actividad |
| `social_layer_opt_in` | **Propuesta nueva** | Activación general de la capa social (paraguas de todo lo demás) |
| `publish_photos` | **Propuesta nueva** | Adjuntar imágenes propias a publicaciones del muro/feed |
| `ranking_visibility` | **Propuesta nueva** | Aparecer en el ranking social (fase 2) |

## 6. Consentimientos obligatorios

Ninguno de los 8 consentimientos anteriores es obligatorio para usar Club Pádel 04 en general (reservas, torneos oficiales, perfil premium siguen funcionando sin ellos). Dentro de la capa social, el único "obligatorio en cascada" es `social_layer_opt_in`: sin él, ningún otro consentimiento social puede otorgarse ni tiene efecto (es la puerta de entrada, no una función en sí misma).

## 7. Consentimientos opcionales

Los 7 restantes son opcionales e independientes entre sí: un jugador puede activar `appear_in_feed` sin activar `publish_photos`, o usar `partidos abiertos` (`activity_sharing`) sin nunca activar `ranking_visibility`. Ningún consentimiento opcional implica otro.

## 8. Consentimientos por módulo

| Módulo (roadmap) | Consentimiento(s) requerido(s) |
|---|---|
| Perfil social de jugador | `social_layer_opt_in` (activación) |
| Partidos abiertos | `social_layer_opt_in` + `activity_sharing` |
| Muro/feed básico (publicar) | `social_layer_opt_in` + `appear_in_feed` (+ `publish_photos` si adjunta imagen) |
| Muro/feed básico (leer) | Solo `social_layer_opt_in` (leer no requiere exponerse) |
| Amigos/conexiones | `social_layer_opt_in` (enviar/aceptar solicitud no requiere consentimiento adicional — es una acción directa entre dos partes, no una exposición pasiva) |
| Grupos (fase 2) | `social_layer_opt_in` |
| Eventos | `social_layer_opt_in` (inscribirse es una acción directa, base jurídica ejecución de contrato/interés legítimo, no requiere opt-in adicional) |
| Ranking social (fase 2) | `social_layer_opt_in` + `ranking_visibility` |
| Notificaciones (recibidas) | Ninguno — es funcional, ver sección 19 |
| Notificaciones (generadas sobre uno mismo hacia terceros) | `activity_sharing` |
| Reportes | Ninguno — disponible siempre, es una función de protección, no de exposición (ver sección 21) |
| Bloqueo | Ninguno — disponible siempre, misma razón |

## 9. Retirada del consentimiento

Cada consentimiento se retira desde el mismo lugar donde se otorgó (pantalla de privacidad social), con una sola acción (toggle a "off"), sin necesidad de justificar el motivo, sin fricción añadida (no se pide "¿estás seguro?" con más de una confirmación, no se oculta la opción en submenús). Retirar `social_layer_opt_in` desactiva en cascada los 7 consentimientos restantes.

## 10. Revocación retroactiva y límites técnicos

- Retirar `appear_in_feed` oculta (no borra) retroactivamente los `CommunityPost.post_type=player_activity` ya publicados — coherente con el diseño de soft delete ya definido.
- Retirar `publish_photos` oculta las imágenes ya adjuntas en publicaciones pasadas, dejando el texto visible si el resto del consentimiento (`appear_in_feed`) sigue vigente.
- Retirar `ranking_visibility` retira al jugador del listado público de `SocialRanking` de forma inmediata; sus puntos históricos se conservan internamente (no se pierden si reactiva más tarde) pero no son visibles a terceros mientras esté retirado.
- **Límite técnico honesto:** si otro usuario ya vio o guardó (captura de pantalla, por ejemplo) un contenido antes de la revocación, este sistema no puede revertir eso — límite inherente a cualquier red social, debe explicarse así en el texto legal (ver `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`), no ocultarse.
- **Límite técnico honesto 2:** los registros de `AuditLog`/`Report`/`ModerationAction` asociados a la actividad pasada del usuario **no se eliminan** al revocar consentimiento (retención por trazabilidad legal, ya definida en el modelo de datos) — debe comunicarse con claridad.

## 11. Derechos del usuario

Aplicando los derechos ARSULIPO (acceso, rectificación, supresión, limitación, oposición, portabilidad) a la capa social:
- **Acceso**: ver todos sus datos sociales desde su propio perfil (sin necesidad de solicitud formal para lo que ya es autoservicio).
- **Rectificación**: editar `PlayerSocialProfile` directamente.
- **Supresión**: flujo de "borrar cuenta/solicitar supresión" (sección 12 de `FLUJOS_UI_CONSENTIMIENTO...md`).
- **Limitación**: retirar consentimientos individuales sin borrar la cuenta completa.
- **Oposición**: rechazar cualquier consentimiento opcional desde el alta, sin penalización funcional fuera de la capa social.
- **Portabilidad**: flujo de "exportar datos" (sección 11 de `FLUJOS_UI_CONSENTIMIENTO...md`), formato legible (p. ej. JSON), solo de sus propios datos.

## 12. Tratamiento de datos personales

Reutiliza íntegramente la clasificación ya hecha en `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md` (columnas Personal/Sensible/Base jurídica por campo) — este documento no la repite campo a campo, sino que la traduce a experiencia de usuario y texto. Cualquier discrepancia futura entre ambos documentos debe resolverse actualizando el diccionario como fuente de verdad de campos, y este documento como fuente de verdad de flujos/textos.

## 13. Datos sensibles o de especial atención

El diseño actual **no solicita ni almacena** categorías especiales del art. 9 RGPD (salud, religión, orientación, afiliación sindical, etc.) de forma estructurada. Riesgo residual ya señalado en el diccionario: campos de texto libre (`bio`, `body` de posts/comentarios) podrían recibir ese tipo de dato si el usuario lo escribe voluntariamente — el texto legal debe advertir de no compartir información sensible en campos públicos (ver `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`), y la moderación (sección 16) debe poder actuar si ocurre.

## 14. Menores de edad

**Riesgo abierto, no resuelto por este documento** (ya señalado en el roadmap y en el modelo de datos). Este Prompt F **no habilita** el alta de menores en la capa social. Se define un aviso borrador (ver textos legales) que declara la comunidad no apta para menores de 14 años sin consentimiento parental verificado, y que la verificación de edad real depende del sistema de cuentas ya existente (fuera de alcance de este documento). Hasta que exista un flujo de consentimiento parental verificado, la recomendación operativa es: si el club tiene socios menores, la capa social debe poder desactivarse por tenant o por perfil (ya contemplado como opción en el roadmap, sección 10).

## 15. Fotos, imágenes y contenido generado por usuarios

- Requiere `publish_photos` además de `appear_in_feed`.
- El usuario declara, en el propio flujo de subida (ver `FLUJOS_UI_CONSENTIMIENTO...md`), que la imagen es suya o que tiene derecho a publicarla, y que no debe incluir a terceros identificables sin su consentimiento — límite que este sistema **no puede verificar técnicamente**, solo advertir (riesgo ya señalado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`, sección 21).
- Las imágenes no se usan para ningún fin distinto de mostrarse en el contexto donde se publicaron (no se reutilizan en marketing, no se ceden a terceros) — principio a confirmar explícitamente en el texto legal final.

## 16. Comentarios, publicaciones y moderación

Publicar contenido (post, comentario) implica que puede ser leído, denunciado y, si corresponde, retirado por moderación humana (nunca automática sin revisión, ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 9). El usuario debe ser informado de esto en el momento de publicar, no solo en un documento legal aparte — de ahí el "aviso de moderación" en los textos legales (sección 8 de `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`).

## 17. Partidos abiertos y visibilidad social

Crear un `OpenMatch` revela la disponibilidad del jugador en fecha/hora/club a quien tenga visibilidad (`club` o `friends` según configuración) — debe comunicarse explícitamente en el flujo (sección 4 de `FLUJOS_UI_CONSENTIMIENTO...md`), ya que es un dato que combina actividad y disponibilidad, mayor sensibilidad relativa que un post genérico.

## 18. Ranking, estadísticas y gamificación

`SocialRanking`/`PlayerStats` visibles según `ranking_visibility`/`visibility_matches_played`. Debe quedar claro en la UI y en el texto legal que es un ranking "social, no oficial" (ya establecido en el roadmap) — no debe confundirse con ninguna clasificación federativa.

## 19. Notificaciones

Dos categorías con base jurídica distinta:
- **Notificaciones funcionales/transaccionales** (p. ej. "tu solicitud de partido fue aceptada"): base jurídica ejecución de contrato/interés legítimo — no requieren opt-in, son inherentes a usar la función que las genera. El usuario puede silenciarlas individualmente como preferencia de UX, no como retirada de consentimiento RGPD.
- **Notificaciones a terceros sobre la actividad propia** (p. ej. "tu amigo X se unió a un partido abierto"): requieren `activity_sharing` del usuario cuya actividad se notifica.

## 20. Eventos

Inscribirse a un `Event` es una acción directa del usuario (like aceptar un contrato de participación puntual) — base jurídica ejecución de contrato/interés legítimo, no requiere un consentimiento social adicional más allá de `social_layer_opt_in`. La lista de inscritos, si es visible a otros participantes, debe advertirse en el propio flujo de inscripción (sección 7 de `FLUJOS_UI_CONSENTIMIENTO...md`).

## 21. Reportes y bloqueos

Deliberadamente **sin gate de consentimiento** — son funciones de protección del propio usuario y de terceros, deben estar siempre disponibles sin fricción, incluso para un usuario que haya rechazado todo consentimiento opcional. Base jurídica: interés legítimo (seguridad de la comunidad), ya establecido en el diccionario de datos.

## 22. Logs y auditoría

`AuditLog`/`ModerationAction`/registro de `PrivacyConsent` (histórico de otorgar/revocar) no son visibles ni editables por el usuario (ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 10), pero **sí deben poder incluirse en una exportación de datos** si el usuario los solicita como parte de su derecho de acceso (a decidir con DPO real si se incluyen íntegros o un resumen — marcado como punto a revisar, sección 26).

## 23. Retención y borrado

Reutiliza íntegramente la tabla ya definida en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` (sección 27) — no se duplica aquí. Este documento añade la capa de comunicación: el usuario debe poder ver, en su propio flujo de "retirar consentimiento"/"borrar cuenta", un resumen en lenguaje claro de cuánto tiempo se conservan sus datos tras cada acción (ver textos legales, secciones 10-12).

## 24. Transferencias y terceros

En el diseño actual, **no hay transferencia de datos sociales a terceros** (no hay proveedor de push/email real integrado todavía, no hay ningún servicio externo de analítica o publicidad contemplado en este prompt). Si en el futuro se integra un proveedor real (email transaccional, push, moderación asistida por IA), este documento deberá actualizarse con esa transferencia y su base jurídica — marcado explícitamente como fuera de alcance actual.

## 25. Checklist antes de implementación

- [ ] Validación legal externa completa de este documento y de `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` antes de mostrar un solo texto a un usuario real.
- [ ] Decisión de negocio sobre menores de edad (sección 14) antes de habilitar el alta social para cualquier club con socios menores.
- [ ] Confirmar si `social_layer_opt_in`, `publish_photos` y `ranking_visibility` se añaden formalmente al enum `PrivacyConsent.consent_type` del modelo ya mergeado (actualización de `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, no incluida en este PR).
- [ ] Diseño visual de los flujos (Prompts B/C) debe implementar exactamente los toggles independientes descritos aquí, sin agrupar consentimientos distintos en una sola casilla.
- [ ] Ninguna implementación real hasta autorización explícita (Prompt N).

## 26. Puntos que debe revisar abogado/DPO

1. Plazos de retención exactos (especialmente `PrivacyConsent`: propuesta de 5 años tras baja, sin validar).
2. Tratamiento de menores de edad — decisión de negocio + flujo legal de consentimiento parental si se decide permitirlo.
3. Suficiencia del texto de "derecho de imagen" en publicaciones con fotos (sección 15).
4. Si `interés legítimo` es base jurídica suficiente para `Report`/`ModerationAction`/`AuditLog`, o si requiere una base distinta según jurisdicción.
5. Redacción final de todos los textos de `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` — son borradores, no textos aprobados.
6. Si se requiere un DPO formal o registro de actividades de tratamiento (RAT) actualizado antes de lanzar la capa social, según volumen de usuarios esperado.
7. Alcance exacto del derecho de portabilidad sobre `AuditLog`/`ModerationAction` (sección 22).

## 27. Siguiente prompt recomendado

Con el consentimiento diseñado (Prompt F), el catálogo recomienda avanzar a los **Prompts B/C — Prototipos visuales de Feed y Perfil de jugador**, implementando ya los flujos de UI de consentimiento definidos en `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md` como parte del prototipo, en vez de añadirlos después. Antes de eso, se recomienda una revisión legal externa de este documento (punto 1 del checklist), dado que condiciona el copy real de cualquier prototipo.
