# 06 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

Igual que en los documentos equivalentes de Pasos 15-19: este
repositorio **no contiene** un archivo único con los 21 pasos oficiales
— el roadmap maestro vive fuera del repo. Esta tabla es la MISMA
reconstrucción honesta desde `git log`, actualizada solo en lo que Paso
20 cambia (fila 20 y la proyección 21). Los pasos 1-19 no se han
reinvestigado — se copian del documento de Paso 19 sin alterar su
contenido. Ver también el documento 07 (PDF vivo) para la versión
consolidada de la tabla completa.

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
| 16 | SEO Provider real + auditoría multiproveedor (2 fuentes reales) | Hecho | `09d722f`, PR #44 |
| 17 | Accessibility Provider real (3 fuentes reales) | Hecho | `c4629cb`, PR #45 |
| 18 | Performance Provider real (4 fuentes reales) | Hecho | `6194ca8`, PR #46 |
| 19 | Adaptadores aislados Stripe/WhatsApp (alcance redefinido, sin credenciales) | Hecho | `be10a95`, PR #47 |
| **20** | **Generación visual multidispositivo + panel ROI/comercial + preparación de integraciones reales** | **Hecho (este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 21 | Piloto comercial real: renovación Airtable → validación Make 50/50 → WhatsApp Business → Stripe producción → dominio Hostinger → despliegue real | Pendiente (proyección, secuencia confirmada por el usuario) | — |

## Detalle del Paso 20 (este documento)

- **Hecho**: motor ROI (3 escenarios, cada cifra con fuente/fórmula/
  supuesto/confianza), panel comercial (10 perfiles + genérico), 21
  mockups reales HTML/CSS, propuesta comercial en 3 formatos, sistema de
  9 estados × 10 integraciones, puente sandbox Stripe/WhatsApp (sin red,
  con consentimiento e idempotencia conservados), CLI de 9 comandos,
  fuente del PDF vivo, 106 tests nuevos.
- **Explícitamente fuera de alcance**: cualquier PWA instalable (sin
  manifest/Service Worker), cualquier conexión real a Airtable/Make/
  Stripe/WhatsApp/dominio (por diseño: la secuencia de trabajo confirmada
  por el usuario pospone esto a después de la renovación de cuota de
  Airtable), un PDF binario generado (solo la fuente editable).

## Porcentajes — fórmula y criterio (igual que Pasos 15-19, sin inventar cifras nuevas)

Criterio: pasos "Hecho" / 21 totales, ponderado por complejidad relativa
observada, y por cuánto de la capacidad COMERCIAL (no solo técnica) de
la Agencia de IA queda realmente operativa.

- **Avance del Paso 20 en solitario**: 100% del alcance pedido cubierto
  con código + tests + documentación + mockups reales generados, dentro
  de los límites declarados (sin credenciales externas, por diseño de
  este paso).
- **Avance de Club Pádel 04** (Pasos 09-20 + app previa): **sin cambios,
  ~71-74%** — el motor de investigación/auditoría del producto no se ha
  tocado en este paso; la capa comercial/visual es una herramienta de la
  Agencia de IA para vender/onboardear clientes, no una funcionalidad
  del propio producto Club Pádel 04.
- **Avance de la Agencia de IA**: **~55-62%** (sube sustancialmente
  desde ~42-47% de Paso 19) — antes de este paso, la agencia tenía
  motor de auditoría + adaptadores de pago/mensajería aislados, pero
  NINGUNA forma de convertir eso en un entregable comercial concreto
  (ROI, propuesta, panel, mockups). Ahora existe una fábrica de
  entregables comerciales completa y funcional de extremo a extremo en
  modo simulado — el hueco que queda es puramente de credenciales
  externas (Airtable/Make/Stripe/WhatsApp/dominio), no de capacidad
  técnica construida.

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **45-80 horas** | Sin cambios respecto a Paso 19 — este paso no toca ese producto |
| Agencia de IA hasta un piloto real | **35-65 horas** | Baja sustancialmente desde 55-95h de Paso 19: la fábrica de entregables comerciales (ROI/propuesta/panel/mockups) ya no es trabajo pendiente; lo que queda es casi todo dependiente de credenciales externas, no de desarrollo |
| Paso 21 (piloto comercial + conexión real de todas las integraciones) | **25-45 horas** | Recalibrado al alza desde la proyección de 20-40h de Paso 19: ahora incluye explícitamente la secuencia completa de 6 pasos confirmada por el usuario (Airtable → Make → WhatsApp → Stripe → dominio → despliegue), no solo "conectar pagos/mensajería" — más piezas, pero cada una más acotada gracias al trabajo de Pasos 19-20 |

Estimación razonada, mismo criterio que los informes de Paso 13-19: no es
una métrica formal con peso verificado por tarea. El tiempo real de las
piezas bloqueadas por Airtable/WhatsApp/Stripe/dominio depende de
terceros (renovación de cuota, tiempos de aprobación de Meta,
verificación de cuenta de Stripe, propagación DNS) fuera del control de
esta estimación.
