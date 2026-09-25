# Paquete de revisión legal/DPO — Comunidad Pádel 04

**Estado: BORRADOR PARA REVISIÓN LEGAL EXTERNA. No sustituye asesoramiento legal profesional. Ningún documento de este paquete afirma cumplimiento normativo definitivo.**

**Fecha de preparación:** 2026-07-18
**Preparado desde:** entorno `frontend/audit-fixes-20260709` (Terminal 6), a partir de los documentos ya existentes en PR #24 (`docs/comunidad-padel-legal-menores-readiness-2026-07-15`).
**Propósito:** reunir en un único lugar todo lo necesario para enviar a un abogado/DPO real, y dejar preparado el espacio para incorporar después el apoyo auxiliar de investigación normativa (Spanish Law Research).

---

## Por qué existe este paquete

La cadena de gobernanza técnica de Club Pádel 04 (PR #24 → PR #26 → PR #27 → PR #36) tiene un único bloqueador raíz confirmado por auditoría: **la resolución legal/de negocio de PR #24 (menores)**. Los otros tres PRs están técnicamente terminados (`MERGEABLE`/`CLEAN`, sin deuda técnica) y esperan exclusivamente a que esta decisión se tome. Este paquete no resuelve esa decisión — la prepara para que un humano cualificado (abogado/DPO) pueda tomarla con la información completa delante.

## Contenido de este paquete (5 documentos)

1. **`README_PAQUETE_REVISION_LEGAL_DPO_CLUB_PADEL_04.md`** — este índice.
2. **`RESUMEN_EJECUTIVO_REVISION_DPO_CLUB_PADEL_04.md`** — resumen de una página del contexto, alcance y estado actual, pensado para que el abogado/DPO entienda el caso sin leer los 12 documentos técnicos primero.
3. **`PREGUNTAS_ABOGADO_DPO_CLUB_PADEL_04.md`** — lista concreta y numerada de preguntas que necesitan respuesta.
4. **`EMAIL_SOLICITUD_REVISION_DPO_CLUB_PADEL_04.md`** — borrador de email listo para adaptar y enviar.
5. **`PLANTILLA_CONSULTA_SPANISH_LAW_RESEARCH_CLUB_PADEL_04.md`** — plantilla estructurada para usar el complemento Spanish Law Research como investigación normativa preliminar, con espacio para pegar sus respuestas y para las dudas que sigan abiertas después de usarlo.

## Documentos fuente de PR #24 (no duplicados aquí, referenciados)

Ya existen en `app/docs/club-padel-04/comunidad/` en la rama de PR #24 (`docs/comunidad-padel-legal-menores-readiness-2026-07-15`):

- `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md` — 3 opciones (A/B/C) sobre menores, con riesgos/impactos de cada una.
- `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md` — checklist completo de puntos RGPD/LOPDGDD/menores/imagen/moderación/retención a validar.
- `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md` — clasificación de qué bloquea qué (legal/negocio/operativo/técnico).

## Documentos hermanos ya mergeados en `main` (a entregar junto con este paquete, según indica el checklist de PR #24)

- `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md`
- `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` + `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`
- `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`
- `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` + `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`
- `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` (15 borradores de texto)
- `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`
- `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` + `MATRIZ_ACCIONES_MODERACION_COMUNIDAD_PADEL_04.md`
- `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` + `MATRIZ_READINESS_INTEGRACION_COMUNIDAD_PADEL_04.md`

Este paquete no los copia (evita duplicar ~330KB de documentación y el riesgo de que ambas copias diverjan); los referencia como parte del envío completo al abogado/DPO.

## Fase actual del producto (contexto imprescindible para quien revise)

**Club Pádel 04 — módulo Comunidad — está en fase demo/prototipo, no en producción con usuarios reales:**
- Los 5 módulos sociales (perfil, feed, moderación, partidos abiertos, amigos/seguidores) existen como prototipos HTML estáticos y lógica de negocio probada (`community-logic`, 59 tests), **operando exclusivamente con datos ficticios en memoria**.
- No hay componente React de Comunidad integrado en `App.jsx` todavía.
- No hay capa de persistencia real (Supabase) conectada.
- **No se ha tratado, ni se tratará, ningún dato personal real de menores hasta que este paquete reciba respuesta legal y se resuelva PR #24.**

## Qué desbloquearía la cadena completa

La respuesta del abogado/DPO a las preguntas de `PREGUNTAS_ABOGADO_DPO_CLUB_PADEL_04.md` (como mínimo, edad mínima aplicable y necesidad de EIPD/DPIA) permitiría:
1. Cerrar PR #24 con una decisión informada sobre menores.
2. Lo cual habilita la autorización de negocio pendiente en PR #27 para adoptar `main`.
3. Lo cual permite mergear PR #26 (staging → `main`).
4. Lo cual deja a PR #36 (hardening del Worker, ya 100% técnicamente listo) con una base integrada, sin ningún trabajo técnico adicional pendiente.

Ninguna acción técnica en este repositorio puede acelerar este paso — depende de un proceso humano externo.
