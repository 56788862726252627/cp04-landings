# Matriz de bloqueos no técnicos — Comunidad Pádel 04

**Estado:** documento de clasificación de bloqueos. **Borrador técnico/legal revisable — no sustituye asesoramiento legal profesional. No afirma cumplimiento normativo al 100% en ningún punto.**
**Fecha:** 2026-07-15
**Depende de:** `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md`, `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` (mismo directorio).

Separa, con precisión, qué impide qué — para no tratar todos los bloqueos como si fueran del mismo tipo o requirieran la misma acción.

---

## Bloqueos legales

| Bloqueo | Origen | Estado |
|---|---|---|
| Edad mínima aplicable no confirmada por abogado/DPO | `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, pregunta 1 | Abierto |
| 15 textos legales sin redacción final aprobada | `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` | Abierto |
| Necesidad de EIPD/DPIA formal sin confirmar | `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md` | Abierto |
| Reparto de responsabilidad club vs. Agencia IA sin cerrar contractualmente | `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md` | Abierto |

## Bloqueos de negocio

| Bloqueo | Origen | Estado |
|---|---|---|
| Elegir entre Opción A/B/C de menores | `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, secciones 3-5 | Abierto (recomendación de producto ya dada: Opción A) |
| Decidir si se lanza Comunidad Pádel 04 a todos los clubes o a un piloto primero | Fuera de los documentos técnicos, decisión comercial | Abierto |
| Priorizar Grupos/Eventos/Ranking (aún sin flujo UI) frente a otras líneas de producto | `INFORME_FINAL_COMUNIDAD_PADEL_04_TERMINAL_READY.md`, módulos pendientes | Abierto |

## Bloqueos operativos del club

| Bloqueo | Origen | Estado |
|---|---|---|
| Si se elige Opción C de menores, cada club necesitaría un proceso propio de verificación | `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, sección 5 | Abierto, condicionado a la decisión de negocio |
| Formación de `STAFF`/`ADMIN` de cada club en el flujo de moderación antes de activar la capa social | `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` | No iniciado, no bloqueante para seguir diseñando |
| Definir el SLA de revisión de reportes por club (ya señalado como no fijado) | `REGLAS_MATCHMAKING_PRIVACIDAD_COMUNIDAD_PADEL_04.md` / `REGLAS_PRIVACIDAD_CONEXIONES_COMUNIDAD_PADEL_04.md` | Abierto |

## Bloqueos técnicos reales

| Bloqueo | Origen | Estado |
|---|---|---|
| Persistencia real (Supabase) no conectada — el módulo `community-logic` solo opera en memoria | `MATRIZ_RIESGOS_BACKEND_REAL_COMUNIDAD_PADEL_04.md` | Abierto, pendiente de diseño de capa de persistencia |
| 3 huecos de modelo de datos sin resolver (`Friendship.status=cancelled`, `Report.targetType` para partidos, `slotsTotal=1` sin auto-`full`) | `CHECKLIST_INTEGRACION_LOGICA_COMUNIDAD_PADEL_04.md` | Abiertos, menores, no bloquean seguir probando en local |
| Ningún componente React de Comunidad existe todavía (solo prototipos HTML estáticos) | `CHECKLIST_PRE_INTEGRACION_APPJS_COMUNIDAD_PADEL_04.md` | Abierto, es la tarea propia del Prompt N |
| **"Lógica sin probar"** | — | **Cerrado** (PR #23, 59/59 tests) — ya no es un bloqueo técnico real |

## Qué está desbloqueado

- Diseño funcional completo de 5 módulos (perfil, feed, moderación, partidos abiertos, amigos/seguidores), consistente y auditado en 10 PRs.
- Modelo de datos, RLS y consentimiento diseñados y estables.
- Lógica de negocio aislada, probada con 59 tests, verificando las reglas de seguridad críticas (bloqueo con doble barrera, roles de moderación, minimización de datos).
- 5 prototipos HTML navegables, verificados visualmente sin errores de consola.
- Documentación honesta de todos los huecos conocidos, sin ocultarlos para parecer "más terminado" de lo que está.

## Qué impide integrar en App.jsx

1. **Menores de edad sin decisión de negocio ni confirmación legal** — si un club real tiene socios menores y se integra tal cual, se activaría la capa social para ellos sin ninguna de las 3 opciones implementada.
2. **Textos legales sin aprobar** — no se puede mostrar ningún texto de consentimiento real a un usuario real sin la redacción final del abogado/DPO.
3. **Sin capa de persistencia real** — sería necesario diseñarla e implementarla antes de que la lógica ya probada sirva de algo conectada a `App.jsx`.

Ninguno de estos 3 puntos se resuelve por sí solo con más documentación — el primero y el segundo requieren decisiones externas a este equipo técnico; el tercero requiere un prompt de implementación nuevo, no descrito en este documento.

## Qué NO impide mostrar demo/mock interna

Los 3 puntos anteriores **no** impiden:

- Mostrar los 5 prototipos HTML ya construidos como demo visual a un cliente potencial o al equipo comercial — son estáticos, sin datos reales, sin usuarios reales, sin distinción de edad porque no hay usuarios reales.
- Ejecutar y ampliar la suite de 59 tests de `community-logic` en local — opera solo con datos ficticios en memoria.
- Continuar diseñando (sin implementar) los módulos pendientes (Grupos, Eventos, Ranking social) siguiendo el mismo patrón ya validado.
- Iterar sobre los textos legales en modo borrador, siempre que se sigan marcando explícitamente como no aprobados.
- Usar este paquete de documentos como material de entrada para la revisión legal externa (es precisamente su propósito).

**Justificación técnica de por qué esto es seguro:** ninguna de estas acciones trata datos personales reales ni de menores reales — el riesgo de menores, por definición, solo existe cuando hay usuarios reales con posible minoría de edad interactuando con la capa social. Mientras Comunidad Pádel 04 permanezca en modo documentación + prototipo estático + lógica probada solo con mocks, el riesgo de menores es **teórico, no materializado** — lo cual no lo resuelve, pero sí permite seguir trabajando sin agravarlo.
