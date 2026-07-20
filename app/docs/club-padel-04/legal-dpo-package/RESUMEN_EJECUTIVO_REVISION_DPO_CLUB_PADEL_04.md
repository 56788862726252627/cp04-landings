# Resumen ejecutivo para abogado/DPO — Comunidad Pádel 04

**Estado: BORRADOR PARA REVISIÓN LEGAL EXTERNA. No sustituye asesoramiento legal profesional. No afirma cumplimiento normativo definitivo en ningún punto.**

**Fecha:** 2026-07-18

---

## Qué es Club Pádel 04

Aplicación SaaS de gestión para clubes de pádel: reservas de pista, torneos, perfil de socio, y un módulo nuevo en preparación, **Comunidad Pádel 04**, una capa social (estilo Playtomic/Vola) con feed de actividad, perfil social, amigos/seguidores, partidos abiertos y moderación.

## Qué se pide revisar

El módulo Comunidad introduce tratamiento de datos personales de tipo social (publicaciones, fotos, conexiones entre usuarios, ranking visible) que no existía en las funciones anteriores de la app (reservas/torneos). Antes de activarlo con usuarios reales, el equipo técnico ha preparado un paquete de documentación de autoevaluación y necesita **validación legal externa**, en particular sobre el tratamiento de datos de menores de edad.

## Por qué es urgente resolver esto primero

Existe una cadena de 4 pull requests de gobernanza técnica ya lista y verificada (`MERGEABLE`/sin conflictos, tests en verde), pero **bloqueada en su totalidad** hasta que este punto legal se resuelva. Ningún otro trabajo técnico pendiente impide avanzar — es el único bloqueador real identificado.

## Fase actual (importante)

**No hay ningún dato personal real de menores (ni de nadie) siendo tratado por Comunidad Pádel 04 en este momento.** El módulo existe como:
- Prototipos HTML estáticos (sin backend, sin usuarios reales).
- Lógica de negocio aislada, probada con 59 tests automatizados, operando con datos ficticios en memoria.
- Documentación de diseño (modelo de datos, RLS, consentimiento, moderación) ya completa mas no validada legalmente.

No se integrará en la aplicación real (`App.jsx`) ni se conectará a una base de datos real hasta recibir esta revisión.

## El punto crítico: menores de edad

Desde la primera auditoría de privacidad interna, el riesgo de menores de edad es el **único marcado como crítico** en todo el catálogo de riesgos del módulo Comunidad. El equipo técnico ha preparado 3 opciones posibles (ver `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, incluido en este envío):

- **Opción A** — no permitir menores en la capa social en el lanzamiento inicial (recomendación de producto del equipo técnico, pendiente de confirmación legal).
- **Opción B** — permitir menores solo con consentimiento parental verificado.
- **Opción C** — permitir menores bajo responsabilidad operativa del club (verificación fuera de la plataforma).

Ninguna de las tres ha sido validada legalmente. El equipo técnico no puede ni debe decidir esto por su cuenta.

## Qué se necesita del abogado/DPO

Ver `PREGUNTAS_ABOGADO_DPO_CLUB_PADEL_04.md` para el listado completo. Como mínimo, se necesita respuesta a:
1. Edad mínima aplicable, según normativa española/UE vigente.
2. Si es necesaria una Evaluación de Impacto (EIPD/DPIA) formal antes de activar la capa social.

## Documentación incluida en el envío completo

Ver `README_PAQUETE_REVISION_LEGAL_DPO_CLUB_PADEL_04.md` para el listado completo de los 3 documentos de este paquete más los 9 documentos técnicos ya existentes (modelo de datos, consentimiento, textos legales borrador, matriz de riesgos, moderación, QA).

## Qué desbloquea esta revisión

La respuesta a este paquete permite cerrar la decisión sobre PR #24 (menores), lo cual desbloquea en cascada 3 PRs técnicos adicionales ya verificados y listos, sin que quede ningún trabajo de ingeniería pendiente detrás de esta decisión.
