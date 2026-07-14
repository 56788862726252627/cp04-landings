# Checklist previo a integración con App.jsx — Comunidad Pádel 04

**Estado:** checklist de control. **Ninguno de estos puntos autoriza por sí mismo tocar `App.jsx` — la autorización final es siempre una decisión explícita del usuario, nunca automática (último punto de este checklist).**
**Fecha:** 2026-07-14
**Depende de:** `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md`, `MATRIZ_READINESS_INTEGRACION_COMUNIDAD_PADEL_04.md`.

**Aviso legal:** ⚠️ Este documento es un **borrador técnico/legal revisable**, pendiente de validación por abogado/DPO en los puntos que dependan de textos legales o consentimiento. No sustituye asesoramiento legal profesional ni afirma cumplimiento normativo al 100% en ningún punto.

---

## Revisión de rama limpia

- [ ] `origin/main` sincronizado y sin conflictos pendientes en el momento de crear la rama de integración.
- [ ] La rama de integración parte de `origin/main` (nunca de una rama de trabajo intermedia), igual que todas las ramas de este catálogo hasta ahora.
- [ ] `git status` limpio antes de empezar, verificado explícitamente (mismo hábito ya seguido en los 8 PRs anteriores).

## PR #1 y PR #13

- [ ] PR #1 (`checkpoint/fase-11-rama-limpia-cp04`) revisado: sigue sin mergear a fecha de este checklist; su higiene de rama es un tema aparte, no bloqueante para Comunidad Pádel, pero debe confirmarse que no introduce conflictos nuevos con lo ya mergeado (#14-#21).
- [ ] PR #13 (histórico, "superseded by #14") permanece intacto, sin cerrar, sin tocar — confirmado en cada auditoría de limpieza de rama de este catálogo.
- [ ] Ninguna acción sobre PR #1 o PR #13 se ejecuta como parte de la integración de Comunidad Pádel.

## Backups

- [ ] Backup o snapshot de `App.jsx` real inmediatamente antes de cualquier cambio (mismo patrón ya usado en otras integraciones del proyecto, p. ej. `backups/playtomic-benchmark-saas-audit-20260625-190708/App.jsx`).
- [ ] Punto de restauración documentado explícitamente (comando exacto de revertir) antes de empezar, no después.

## Rutas permitidas

- [ ] Confirmar con el usuario, antes de empezar, el alcance exacto de rutas que se pueden tocar (previsiblemente `src/App.jsx` + una carpeta nueva de componentes de comunidad, a definir) — no asumir un alcance amplio por defecto.
- [ ] Ninguna ruta sensible (auth real, reservas reales, worker, Make, Airtable, Stripe, WhatsApp, Supabase real, `.env`, tokens, `package.json`) se toca salvo autorización explícita adicional y específica, distinta de la autorización de tocar `App.jsx`.

## Módulos a integrar

- [ ] Orden de integración recomendado (a confirmar con el usuario, no impuesto aquí): perfil social → consentimiento/privacidad (gate transversal) → feed → moderación/reportes → partidos abiertos → amigos/seguidores — de menor a mayor dependencia entre módulos.
- [ ] Cada módulo se integra en su propio PR pequeño, siguiendo el mismo patrón ya usado en todo este catálogo (nunca un PR único con los 5 módulos a la vez).

## Componentes a crear

- [ ] Componentes React nuevos derivados 1:1 de los prototipos HTML ya validados (`feed-social.html`, `perfil-jugador.html`, `moderacion-reportes.html`, `partidos-abiertos.html`, `amigos-seguidores.html`), sin inventar estructura visual nueva no revisada.
- [ ] Sistema de diseño (`UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md`) trasladado a tokens/CSS reales del proyecto, no reinventado durante la integración.

## Componentes a NO tocar

- [ ] Ningún componente ya existente de reservas, torneos, ranking oficial, perfil premium o admin se modifica como parte de esta integración — Comunidad Pádel se añade, no sustituye ni refactoriza módulos existentes.
- [ ] `authService`/sistema de auth real no se modifica — `UserProfile.auth_user_id` se resuelve leyendo la sesión ya existente, sin tocar su lógica interna.

## Datos mock

- [ ] Fase inicial de integración con datos mock/fixtures locales (mismo patrón ya usado en `tenant-storage-harness`, adaptadores Stripe/WhatsApp) antes de conectar cualquier fuente real.
- [ ] Ningún dato ficticio de los prototipos (nombres "Jugador Demo N") se reutiliza como seed de producción sin revisión — señalado ya en `CHECKLIST_PROTOTIPOS_FEED_PERFIL_COMUNIDAD_PADEL_04.md`.

## Auth mock/real

- [ ] Confirmar explícitamente con el usuario si la primera integración usa el modo demo ya existente en la app o la auth real — no asumir, dado el patrón de confusión demo/real ya señalado como aprendizaje de este proyecto (`feedback-login-demo-vs-real`, memoria del proyecto).
- [ ] `PrivacyConsent` y el resto de entidades sociales deben poder probarse en modo demo sin depender de que la auth real esté conectada.

## Supabase no real

- [ ] Ninguna tabla de este modelo se crea en Supabase real como parte de esta integración — la integración inicial usa almacenamiento local/mock, coherente con el resto del catálogo hasta ahora.
- [ ] Las políticas RLS descritas en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (sección 12) permanecen como especificación, no como SQL ejecutado, salvo autorización explícita adicional y separada de esta integración.

## Pruebas visuales

- [ ] Comparación visual de cada componente React nuevo contra su prototipo HTML de referencia antes de dar por cerrado un módulo.
- [ ] Verificación manual de que la paleta de marca (verde lima/negro/blanco) se mantiene idéntica a la ya usada en el resto de la app.

## Pruebas responsive

- [ ] Verificación en al menos 3 anchos de viewport (móvil <640px, tablet ~980px, escritorio) por cada componente integrado, mismo criterio ya validado en los prototipos.

## Pruebas accesibilidad

- [ ] Ejecutar una herramienta automatizada (axe u equivalente) sobre cada componente integrado — no realizada todavía en ningún prototipo (ya señalado como pendiente en `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md`, sección 17).
- [ ] Navegación completa por teclado verificada manualmente en cada flujo crítico (consentimiento, reportar, bloquear).

## Pruebas privacidad

- [ ] Verificar que ningún dato con `visibility=private` es accesible desde el componente integrado a un usuario sin permiso, no solo desde el mock.
- [ ] Verificar que retirar un consentimiento oculta retroactivamente el contenido asociado en tiempo real dentro de la app integrada, no solo en el diseño.

## Pruebas moderación

- [ ] Verificar que ninguna acción de moderación se ejecuta automáticamente — probar explícitamente que un `Report` no cambia de estado sin una acción humana (`STAFF`/`ADMIN`/`SUPPORT`).
- [ ] Verificar que el reportante nunca es visible al reportado en la implementación real, no solo en el mock.

## Pruebas bloqueo

- [ ] Test específico de la doble barrera de bloqueo (listado + creación) para `MatchInvite`, `Friendship` y `Follow` — el hallazgo más repetido de este catálogo como "pendiente de test real" (Prompts D, E, G).
- [ ] Verificar que un bloqueo deshace amistad/seguimiento existente en la implementación real, coherente con la regla propuesta en `AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md`.

## Pruebas consentimiento

- [ ] Verificar que ningún consentimiento nace premarcado en la UI integrada real, no solo en el mock estático.
- [ ] Verificar el versionado de consentimiento (`consent_version`) se registra correctamente al aceptar un texto legal ya validado por el abogado/DPO (no el borrador de este catálogo).

## Rollback

- [ ] Plan de rollback explícito por cada PR de integración: revertir el componente sin afectar a otros módulos ya integrados (dado que la integración es incremental, módulo a módulo).
- [ ] Ningún cambio de integración debe requerir tocar datos ya existentes de reservas/torneos/auth reales de forma que un rollback los deje inconsistentes.

## Merge strategy

- [ ] Mismo patrón ya usado en todo el catálogo: rama nueva desde `origin/main` limpio por cada módulo, PR individual, merge commit normal (sin squash, sin rebase), sin force push.
- [ ] Ninguna integración se mergea sin la validación explícita del usuario (mismo patrón de auditoría antes de merge ya seguido en los 8 PRs anteriores).

## Criterios de aceptación

- [ ] Cada módulo integrado debe pasar: comparación visual con su prototipo, pruebas responsive, pruebas de accesibilidad automatizada, pruebas de privacidad/consentimiento/moderación/bloqueo listadas arriba, y confirmación de que no toca ninguna ruta sensible fuera de lo autorizado.
- [ ] Ningún módulo se considera "cerrado" solo por compilar sin errores — debe cumplir los criterios funcionales y de privacidad específicos de este documento.

## Aprobación explícita del usuario

- [ ] **Ninguna tarea de este checklist, ni la existencia de este documento, autoriza por sí misma tocar `App.jsx`.** La autorización debe ser una instrucción explícita y específica del usuario en el momento de iniciar el Prompt N, coherente con el modo seguro ya aplicado en toda esta sesión.
- [ ] Si el usuario autoriza el Prompt N antes de resolver los bloqueantes de `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` (menores de edad, lógica aislada con tests, validación legal), debe quedar registrado explícitamente que se asume ese riesgo de forma consciente, no por omisión del checklist.
