# 04 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

Igual que en los documentos equivalentes de Pasos 15-18: este
repositorio **no contiene** un archivo único con los 21 pasos oficiales
— el roadmap maestro vive fuera del repo. Esta tabla es la MISMA
reconstrucción honesta desde `git log`, actualizada solo en lo que Paso
19 cambia (fila 19 y la proyección 20-21). Los pasos 1-18 no se han
reinvestigado — se copian del documento de Paso 18 sin alterar su
contenido.

## Tabla de los 21 pasos

| # | Paso | Estado | Evidencia |
|---|---|---|---|
| 1 | (no identificado explícitamente en git log) | Presumiblemente base de la app Club Pádel 04 | — |
| 2-8 | Integración App↔Make 50/50 | Hecho | Ver documento equivalente de Paso 15 |
| 9 | Núcleo SaaS replicable multisector | Hecho | `d19f258`, PR #37 |
| 10 | Fábrica SaaS de un solo prompt | Hecho | `c8f3ff0`, PR #38 |
| 11 | Agente constructor de negocios en lenguaje natural | Hecho | `412d604`/`8302780`, PR #39 |
| 12 | Motor de investigación pública y auditoría digital | Hecho | `f59b516`, PR #40 |
| 13 | Proveedor real `publicWebsiteFetcher` + validación E2E | Hecho | `fc57e62`, PR #41 |
| 14 | Arquitectura de fábrica multiproveedor | Hecho | `7e4ce42`, PR #42 |
| 15 | Integración del pipeline multiproveedor con orchestrator/scoring/perfiles | Hecho | `7f4fb84`, PR #43 |
| 16 | SEO Provider real + auditoría multiproveedor con dos fuentes reales | Hecho | `09d722f`, PR #44 |
| 17 | Accessibility Provider real + auditoría multiproveedor con tres fuentes reales | Hecho | `c4629cb`, PR #45 |
| 18 | Performance Provider real + auditoría multiproveedor con cuatro fuentes reales | Hecho | `6194ca8`, PR #46 |
| **19** | **Adaptadores aislados de pagos/mensajería (Stripe/WhatsApp), sin credenciales reales** | **Hecho (alcance redefinido, este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 20 | Conexión REAL de pagos/mensajería (requiere credenciales — ver runbook, doc. 02) + generación visual/panel ROI | Pendiente (proyección, alcance ampliado) | — |
| 21 | Piloto comercial real con un primer cliente (Agencia de IA) | Pendiente (proyección) | — |

**Nota importante**: el documento de Paso 18 proyectaba el Paso 19 como
"conectar pagos/mensajería reales". Al confirmarse con el usuario que
eso requiere credenciales que no están disponibles en esta sesión, el
Paso 19 real construyó los adaptadores aislados en su lugar, y la tarea
de "conectar de verdad" se desplaza al Paso 20 (que además absorbe la
proyección previa de "generación visual/panel ROI" de Paso 18, para no
inflar el conteo total de pasos por encima de 21). Esto es una decisión
de alcance explícita, documentada aquí y en el propio Paso 19 — no una
tarea olvidada ni oculta.

## Detalle del Paso 19 (este documento)

- **Hecho**: `stripeAdapter.js` (7 funciones) y `whatsappAdapter.js` (8
  funciones), ambos `NOT_CONFIGURED`-safe, con verificación real de
  firma de webhook (HMAC-SHA256 verificable offline), idempotencia
  determinista, gate de consentimiento obligatorio para WhatsApp, gate
  de modo LIVE explícito para Stripe. 49 tests nuevos. Runbook de
  configuración futura completo.
- **Explícitamente fuera de alcance** (ver informe técnico y runbook):
  cualquier llamada de red real a Stripe/Meta, cualquier conexión a un
  flujo comercial existente, la ventana de sesión de 24h de WhatsApp,
  una implementación real del "consent store".

## Porcentajes — fórmula y criterio (igual que Pasos 15-18, sin inventar cifras nuevas)

Criterio: pasos "Hecho" / 21 totales, ponderado por complejidad relativa
observada.

- **Avance del Paso 19 en solitario**: 100% del alcance ACORDADO
  (adaptadores aislados) cubierto con código + tests + documentación +
  runbook. 0% del alcance ORIGINALMENTE proyectado ("conexión real"),
  que se desplaza honestamente al Paso 20.
- **Avance de Club Pádel 04** (Pasos 09-19 + app previa): **sin
  cambios, ~71-74%** — este paso no toca el motor de auditoría/
  investigación pública que mide este porcentaje; los adaptadores de
  pagos/mensajería pertenecen al proyecto de la Agencia de IA, no al
  producto Club Pádel 04 en sí.
- **Avance de la Agencia de IA**: **~42-47%** (sube ligeramente desde
  ~40-45% de Paso 18) — el sistema comercial ahora tiene una capa de
  integración de pagos/mensajería lista para conectar (antes solo
  existía el trabajo equivalente en otra rama no apilada en esta
  cadena), aunque sin credenciales reales el avance funcional sigue
  siendo modesto.

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **45-80 horas** | Sin cambios respecto a Paso 18 — este paso no toca ese producto |
| Agencia de IA hasta un piloto real | **55-95 horas** | Baja ligeramente desde 60-100h de Paso 18: la capa de integración de pagos/mensajería ya no es trabajo pendiente desde cero, aunque conectarla de verdad (Paso 20) sigue pendiente |
| Paso 20 (conexión REAL con credenciales + generación visual/panel ROI) | **30-55 horas** | Sube desde la estimación previa de 20-40h para "generación visual+panel" porque ahora incluye también obtener y configurar credenciales reales de Stripe/WhatsApp y validar contra sus APIs de test, que Paso 19 dejó listo para hacer pero no hizo |
| Paso 21 (piloto comercial con cliente real) | **20-40 horas** | Sin cambios respecto a Paso 18 |

Estimación razonada, mismo criterio que los informes de Paso 13-18: no es
una métrica formal con peso verificado por tarea.
