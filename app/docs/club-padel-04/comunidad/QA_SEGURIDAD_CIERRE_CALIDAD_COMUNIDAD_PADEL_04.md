# QA, seguridad y cierre de calidad — Comunidad Pádel 04
### Prompt Q ejecutado — Auditoría transversal, sin implementación

**Estado:** documento de auditoría. Sin código, sin Supabase real, sin integración en `App.jsx`.
**Fecha:** 2026-07-14
**Rama:** `docs/comunidad-padel-qa-cierre-calidad-2026-07-14`

**Aviso legal:** ⚠️ Este documento es un **borrador técnico/legal revisable**, pendiente de validación por abogado/DPO. No sustituye asesoramiento legal profesional ni afirma cumplimiento normativo al 100% en ningún punto.

---

## 1. Resumen ejecutivo

Comunidad Pádel 04 tiene, tras 8 PRs mergeados (#14-#21), un diseño funcional, de datos, de privacidad, de moderación y de UI internamente coherente para 5 módulos (perfil social, feed, moderación/reportes, partidos abiertos, amigos/seguidores), con 4 prototipos HTML estáticos navegables y un sistema de componentes reutilizado de la marca real de Club Pádel 04. **Es documentación y maquetación de referencia, no código funcional probado.** La conclusión de esta auditoría (sección 24) es que el conjunto **no está listo para el Prompt N** todavía — no por errores de diseño, sino por tres huecos reales y ya identificables: validación legal pendiente, decisión de negocio sobre menores sin resolver, y ausencia de una capa de lógica aislada con tests (a diferencia de otros módulos ya maduros del proyecto).

## 2. Alcance de la auditoría

Revisión de coherencia interna, privacidad, seguridad social, accesibilidad, responsive, ausencia de datos reales y de copia de terceros, y preparación real para tocar `App.jsx`. No incluye pruebas automatizadas (no existe código ejecutable que probar), ni una evaluación de impacto (DPIA) formal, ni revisión legal profesional — ambas quedan señaladas como pendientes, no realizadas aquí.

## 3. Documentos revisados

Los 26 documentos existentes en `app/docs/club-padel-04/comunidad/` (4038 líneas en total): roadmap, catálogo de 17 prompts, auditoría de capturas, modelo de datos (21 entidades), diccionario de datos, RLS/permisos, consentimiento/privacidad, flujos UI de consentimiento (14 flujos), textos legales (15 borradores), matriz de riesgos de privacidad (17 riesgos), prototipo funcional de feed y de perfil, sistema UX/UI, checklist de prototipos, moderación/reportes/roles, flujos UI de moderación (12 flujos), matriz de acciones de moderación (17 acciones), checklist de seguridad social, partidos abiertos (30 secciones), flujos UI de partidos (15 flujos, 14 puntos c/u), reglas de matchmaking, checklist de partidos, amigos/seguidores/conexiones (28 secciones), flujos UI de amigos (17 flujos, 15 puntos c/u), reglas de privacidad de conexiones, checklist de amigos.

## 4. Prototipos revisados

Los 5 archivos de `app/projects/club-padel-04/community-prototypes/` (solo lectura, sin modificar en este prompt): `feed-social.html`, `perfil-jugador.html`, `moderacion-reportes.html`, `partidos-abiertos.html`, `amigos-seguidores.html`, más `community-prototypes.css` (compartido, crecido de forma aditiva en cada PR) y `README.md`. Verificado por grep en todo el corpus: **0 `<script>` en los 5 HTML**, sin imports externos, sin patrones de datos reales (email/teléfono) en ningún documento ni prototipo.

## 5. Coherencia funcional global

Los 5 módulos comparten exactamente los mismos roles (`PLAYER`/`STAFF`/`ADMIN`/`SUPPORT`, sin ninguno inventado), la misma taxonomía de nivel (4 valores), el mismo patrón de estados (`open`/`pending`/`accepted`... ninguno redefinido de forma contradictoria entre documentos) y la misma paleta de marca. No se detectan contradicciones de terminología entre los 26 documentos.

## 6. Coherencia entre modelo de datos y flujos UI

Todos los flujos UI (Prompts F, E, D, G) referencian exclusivamente entidades ya definidas en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` — ninguna entidad nueva se introdujo de forma no documentada. Dos huecos identificados y ya auto-documentados por sus propios autores (no encontrados de nuevo aquí, sino confirmados como reales y aún abiertos): (a) `Friendship.status` no tiene un valor `cancelled` distinto de `rejected` para el flujo "cancelar solicitud enviada"; (b) `Report.target_type` no tiene un valor específico para `OpenMatch`, documentado como aproximación con `event`.

## 7. Coherencia entre privacidad y prototipos

Los 5 prototipos representan visualmente el estado "sin consentimiento" (`consent-gate`) de forma idéntica y reutilizada — no hay una versión distinta de este componente por módulo, lo cual reduce el riesgo de que la implementación real diverja entre pantallas. La taxonomía de 8 consentimientos (5 ya en el modelo mergeado + 3 propuestas: `social_layer_opt_in`, `publish_photos`, `ranking_visibility`) se usa de forma consistente en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, en los flujos de partidos y de amigos — **pero las 3 propuestas nunca se formalizaron como cambio en `PrivacyConsent.consent_type`** del modelo ya mergeado (PR #16). Es una inconsistencia real, aunque documentada: el modelo de datos "oficial" no refleja todavía el vocabulario de consentimiento que ya usan 3 documentos posteriores.

## 8. Coherencia entre moderación y funciones sociales

Reportar y bloquear siguen exactamente el mismo patrón en los 4 módulos que lo usan (feed, perfil, partidos, amigos): sin gate de consentimiento, reportante anónimo, revisión humana obligatoria. La regla crítica de bloqueo (Prompt D, extendida en Prompt G) se aplica de forma consistente a `MatchInvite` y a `Friendship`/`Follow`. Ninguna moderación automatizada por IA se ha introducido en ningún documento — verificado por grep de "automátic" en los 26 documentos, coherente en todos los casos con revisión humana obligatoria.

## 9. Coherencia entre feed, perfil, partidos y amigos

Confirmado: la visibilidad `friends` prometida en el Prompt B (feed) y el Prompt C (perfil) — mergeados antes que el Prompt G — dependía de una pieza (`Friendship`) que no tuvo su propio flujo operativo hasta el Prompt G. Durante las auditorías de PR #18 y #20 esto no se marcó como bloqueante porque la entidad ya existía en el modelo de datos (PR #16); esta auditoría confirma retroactivamente que la promesa ya está resuelta con el PR #21 mergeado — no queda ninguna dependencia circular sin cerrar entre los 5 módulos actuales.

## 10. Riesgos de seguridad

Ningún endpoint, credencial ni conexión real existe en este corpus — el riesgo de seguridad de aplicación (inyección, XSS, CSRF) es **no aplicable hoy** porque no hay código ejecutable con entrada de usuario real. El riesgo relevante hoy es de **diseño**: la doble barrera de bloqueo (listado + creación) está especificada en 3 documentos distintos (Prompt E, D, G) de forma consistente, pero **nunca se ha probado con un test real** — es una promesa de diseño, no una garantía verificada.

## 11. Riesgos RGPD/privacidad

Los 17 riesgos ya catalogados en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` siguen vigentes sin cambios; esta auditoría no encuentra riesgos RGPD nuevos no ya identificados por los propios documentos del catálogo — es una señal de calidad del proceso (cada prompt se auditó individualmente antes de mergear), no una casualidad.

## 12. Riesgos de menores

**Sigue siendo el único riesgo marcado "crítico"** en todo el corpus (ya en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` #1, repetido en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` sección 14, en `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` sección 18, y en el roadmap original). Ningún documento posterior lo resuelve — es correcto que no lo hagan sin una decisión de negocio previa, pero significa que **sigue bloqueante** para cualquier club con socios menores de edad con la capa social activa.

## 13. Riesgos de abuso social

Cubiertos de forma consistente en los 4 módulos con reglas antiabuso explícitas (límites operativos de solicitudes/partidos simultáneos, sin cifra numérica fija — delegado a implementación). Ningún mecanismo técnico automático de detección de abuso existe todavía (por diseño, ver sección 8) — la primera línea de defensa sigue siendo el reporte humano.

## 14. Riesgos de reputación comercial

Confusión entre "ranking social" y ranking oficial de Torneos: mitigado con etiquetado "no oficial" en 4 documentos distintos, consistente. Riesgo residual: si la implementación real omite ese etiquetado por prisa, el diseño no lo impediría técnicamente — es una responsabilidad de QA visual en implementación, no resuelta por el diseño en sí.

## 15. Riesgos de copia o dependencia de terceros

Verificado por grep en los 26 documentos y 5 prototipos: las únicas menciones de "Playtomic"/"Vola" están en títulos, citas de trazabilidad y disclaimers explícitos de no-copia — ninguna en contexto de nombre de función, componente o texto de producto. Cero coincidencias de nombres de marca de terceros en el código HTML/CSS de los prototipos.

## 16. Riesgos técnicos antes de App.jsx

El hallazgo más importante de esta auditoría: **ningún módulo tiene una capa de lógica aislada con tests**, a diferencia del patrón ya usado con éxito en otras partes del proyecto (`tenant-runtime`, adaptador Stripe, adaptador WhatsApp — todos con funciones puras y suites de tests antes de tocar `App.jsx`). Los Prompts D y G pedían explícitamente "lógica aislada + tests" en el catálogo original, pero lo entregado en la práctica fue documentación + HTML estático — la lógica de negocio (incremento de `slots_filled`, doble barrera de bloqueo, transición de estados) existe solo como texto en markdown, nunca como función ejecutable verificada. Recomendación explícita en la sección 25.

## 17. Accesibilidad

Los 5 prototipos comparten componentes con `aria-label` en botones de icono, `aria-pressed`/`aria-selected` en chips y tabs, foco visible (`outline` en `accent`), y comunicación de estado por texto + color (nunca solo color) — verificado por inspección de los 5 HTML. **Ninguna validación automatizada** (axe u otra herramienta) se ha ejecutado en ningún momento del catálogo — todos los checklists de cada PR lo señalan explícitamente como pendiente, de forma consistente.

## 18. Responsive/mobile

Los 5 prototipos comparten el mismo patrón mobile-first (`app-shell` a 480px, ampliable a 640px), ya validado visualmente (no con herramienta automatizada) en cada auditoría de PR individual. Sin regresiones detectadas entre prototipos — el CSS compartido creció de forma aditiva sin sobreescribir clases previas en ningún PR (verificado en las 4 auditorías de extensión de CSS, PR #19-#21).

## 19. Datos ficticios y ausencia de datos reales

Verificado en esta auditoría con grep sobre el corpus completo (26 docs + 5 HTML + 1 CSS): **cero coincidencias** de patrones de email, teléfono o nombre real. Todos los nombres de jugador son "Jugador Demo N" o variantes claramente ficticias, todos los clubes son "Club Pádel 04 (demo)".

## 20. Qué está listo

Diseño de datos completo y estable (21 entidades, sin cambios desde el PR #16); reglas de privacidad y consentimiento completas para el MVP; flujos de moderación completos y consistentes en los 4 módulos que los usan; 5 prototipos visuales navegables, responsive, accesibles a nivel de marcado, sin datos reales; documentación de reglas de negocio exhaustiva y honesta sobre sus propios límites.

## 21. Qué NO está listo

- Validación legal profesional de los 15 textos legales y de los ~23 puntos marcados "revisión legal: sí" en las 3 matrices de riesgo/acciones del catálogo.
- Decisión de negocio sobre menores de edad (bloqueante, sección 12).
- Formalización de las 3 propuestas de ampliación de `PrivacyConsent.consent_type` en el modelo ya mergeado (sección 7).
- Decisión sobre `Friendship.status=cancelled` y `Report.target_type` para partidos (sección 6).
- **Ninguna capa de lógica de negocio aislada con tests** — el hueco más relevante para decidir el siguiente paso (sección 16).
- Ninguna validación de accesibilidad con herramienta automatizada (sección 17).
- Ninguna definición numérica de límites antiabuso (delegados a implementación en 3 documentos distintos).

## 22. Bloqueantes antes de integración

1. **Menores de edad** — bloqueante de negocio, no técnico.
2. **Ausencia de lógica aislada con tests** — bloqueante técnico: implementar directamente sobre `App.jsx` sin esta capa intermedia repetiría el patrón que el propio catálogo (Prompts D/G) quería evitar.
3. **Validación legal de textos y retención** — bloqueante de cumplimiento, no de código, pero debe resolverse antes de mostrar cualquier texto a un usuario real.

Ninguno de los 3 es un defecto del trabajo ya hecho — son, correctamente, las condiciones que el propio catálogo había anticipado como pendientes en cada documento individual.

## 23. Recomendaciones de mejora

1. Crear un prompt intermedio de "lógica aislada + tests" (ej. `tests/community-logic/`) antes del Prompt N, replicando el patrón ya validado en `tenant-runtime`/Stripe/WhatsApp — probar la doble barrera de bloqueo, el incremento de `slots_filled`, las transiciones de estado de `Report`/`Friendship`, sin tocar `App.jsx`.
2. Resolver los 2 huecos de modelo de datos (sección 6) en un PR pequeño y aislado antes de escribir lógica real, para no heredar deuda de esquema.
3. Solicitar la validación legal externa como tarea paralela (no bloquea el trabajo técnico de la recomendación 1, pero sí bloquea cualquier publicación real de texto a usuarios).
4. Ejecutar una pasada de accesibilidad automatizada sobre los 5 HTML existentes — no requiere backend, es viable ya mismo como tarea aislada.

## 24. Decisión final: listo/no listo para Prompt N

**No listo todavía.** El diseño es sólido y coherente, pero faltan las 3 condiciones de la sección 22. Se recomienda no autorizar el Prompt N hasta resolver al menos el bloqueante técnico (lógica aislada con tests) y tener claridad de negocio sobre menores — la validación legal puede correr en paralelo sin bloquear el trabajo técnico previo.

## 25. Siguiente prompt recomendado

Un prompt nuevo, no numerado en el catálogo original, de **"Lógica aislada y tests de Comunidad Pádel 04"**: implementar en TypeScript/JavaScript puro (sin React, sin `App.jsx`) las funciones de negocio ya documentadas (transiciones de `OpenMatch`/`MatchInvite`/`Friendship`/`Report`, la doble barrera de bloqueo, el cálculo de conexiones sugeridas) con una suite de tests, en una ruta nueva aislada (p. ej. `app/tests/community-logic/` o similar, a definir). Solo después de esto, y con las decisiones de negocio/legal ya tomadas, tendría sentido evaluar el Prompt N.
