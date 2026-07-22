# 06 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

El encargo de este Paso 15 pide actualizar "el roadmap maestro vivo de 21
pasos... sin sustituirlo por un roadmap reducido". Este repositorio **no
contiene** un archivo único que enumere los 21 pasos con ese formato
exacto — los roadmaps maestros anteriores (Paso 13, documento 10) ya
dejaron constancia de que el roadmap "oficial" vive como PDF fuera del
repositorio. Por tanto:

- Esta tabla es una **reconstrucción honesta desde `git log`**, no una
  transcripción de un documento externo que no puedo leer.
- Se identificaron **dos secuencias de "Paso N"** en el historial: una
  pista de integración App↔Make (Pasos 02-08, con subfases A-F) y una
  pista de fábrica SaaS/Agencia de IA (Pasos 09-15, con "Fases"
  numeradas internamente). 21 = 8 + 13 encaja exactamente si se cuentan
  ambas pistas como una sola numeración continua — es la interpretación
  más consistente con la evidencia disponible, pero **no tengo un commit
  "Paso 01" explícito** para confirmar el primer escalón (probablemente
  el arranque inicial de la app Club Pádel 04, anterior a que se
  adoptara esta convención de numerado).
- Los pasos 16-21 **no están definidos en ningún archivo de este repo**
  — son una proyección razonada por ritmo observado, no una lista
  cerrada. No se inventan títulos ficticios para ellos: se listan como
  "pendiente de definición" con una estimación de horas por analogía.

## Tabla de los 21 pasos

| # | Paso | Estado | Evidencia |
|---|---|---|---|
| 1 | (no identificado explícitamente en git log) | Presumiblemente base de la app Club Pádel 04 | — |
| 2 | Reconciliación de flujos Make "inferido" vía MCP | Hecho | `3eb853d` |
| 3 | Cierre de flujos "inferido" restantes | Hecho | `57a9edb` (03B) |
| 4 | Clasificación y causa raíz de flujos Make (A-E) | Hecho | `d674672`, `6a8a1d1` (04A/04B) |
| 5 | Confirmación de unicidad de los 50 flujos + pruebas API Reservas | Hecho | `9ca220a`, `3b06821`, `d1b534c` (05A/05C/05D) |
| 6 | Resiliencia Worker: caché Airtable 429, modo degradado, idempotencia, observabilidad | Hecho | `c83c92b`…`c520d68` (06A-06E) |
| 7 | Mapa App↔Make + Baja de Jugador/Promoción | Hecho | `0cef52c`, `b515d44`, `d53b979` (07A-07C) |
| 8 | Matriz canónica y representación visual App↔Make 50/50 | Hecho | `88c37a2`, `71ddb72` (08E/08F) |
| 9 | Núcleo SaaS replicable multisector | Hecho | `d19f258`, PR #37 |
| 10 | Fábrica SaaS de un solo prompt (One Prompt Factory) | Hecho | `c8f3ff0`, PR #38 |
| 11 | Agente constructor de negocios en lenguaje natural | Hecho | `412d604`/`8302780`, PR #39 |
| 12 | Motor de investigación pública y auditoría digital (offline, 45 dimensiones) | Hecho | `f59b516`, PR #40 |
| 13 | Proveedor real `publicWebsiteFetcher` + validación E2E | Hecho | `fc57e62`, PR #41 |
| 14 | Arquitectura de fábrica multiproveedor (registry + pipeline + 12 stubs) | Hecho | `7e4ce42`, PR #42 |
| **15** | **Integración del pipeline multiproveedor con orchestrator, scoring y perfiles** | **Hecho (este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 16 | Segundo proveedor real (candidato: `seoProvider` o `lighthouseProvider`) | Pendiente | — |
| 17 | Conexión de pagos/mensajería reales (Stripe/WhatsApp) al flujo comercial | Pendiente | — |
| 18 | Generación visual real (iconos/mockups/PDF profesional antes-después) | Pendiente | — |
| 19 | Panel de administración / ROI mínimo | Pendiente | — |
| 20 | Marketplace y plantillas multi-tenant comercializables | Pendiente | — |
| 21 | Piloto comercial real con un primer cliente (Agencia de IA) | Pendiente | — |

Los pasos 16-21 son una **proyección**, no un compromiso — reflejan los
temas pendientes ya identificados en los informes de Paso 13/14
(2-3 proveedores reales más, generación visual real, panel/ROI,
marketplace, piloto real) reordenados en pasos individuales, para
mantener la cuenta de 21. El propio dueño del roadmap externo es quien
debe confirmar o corregir esta numeración.

## Detalle del Paso 15 (este documento)

- **Hecho**: puente `auditOrchestrator.js` ↔ `ProviderRegistry`/
  `ProviderPipeline` funcional y probado; 10 perfiles sectoriales +
  genérico; agregación de evidencia con atribución y conflictos; scoring
  multiproveedor (reutilizando el motor de Paso 12, sin duplicar
  lógica); CLI extendido; 75 tests nuevos; 1 bug real encontrado y
  corregido; validación E2E real contra un dominio técnico reservado.
- **Explícitamente fuera de alcance** (ver informe técnico, sección
  "Alcance y honestidad"): pesos de scoring por proveedor como
  multiplicador (solo prioridad de intento, por ahora), puerta técnica de
  consentimiento (hoy informativa), preset de auditoría propio para
  "hotel" (usa el genérico).

## Porcentajes — fórmula y criterio (no una cifra inventada)

Igual que Paso 13/14, el criterio es: **pasos con estado "Hecho" /
21 pasos totales**, ponderado por complejidad relativa observada (los
pasos 9-15, cada uno una sesión extensa con tests exhaustivos, pesan más
que un paso de documentación/análisis de una tarde).

- **Avance del Paso 15 en solitario**: 100% de las 13 fases pedidas en
  el encargo están cubiertas con código + tests + documentación (ver
  informe técnico para el detalle honesto de qué queda como límite
  declarado, no como "no hecho").
- **Avance de Club Pádel 04** (producto SaaS núcleo, Pasos 09-15 +
  trabajo previo de la app): **~62-65%** — sube desde el ~55-60% de Paso
  13 porque la arquitectura de conexión de proveedores reales ya no
  requiere tocar el núcleo del orquestador cada vez (coste marginal por
  proveedor reducido), aunque el número de proveedores reales conectados
  sigue siendo 1 de ~13.
- **Avance de la Agencia de IA** (capacidad de vender esto como servicio
  replicable): **~40-45%**, sin cambios respecto a Paso 13 — este paso
  fue puramente técnico (motor de auditoría), no tocó piezas
  comerciales (pricing, piloto real, material de venta).

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **70-110 horas** | Baja ligeramente desde las 80-120h de Paso 13: conectar el próximo proveedor real (Paso 16) ahora es más barato gracias a la fábrica de Paso 14 + el puente de Paso 15 |
| Agencia de IA hasta un piloto real | **60-100 horas** | Sin cambios respecto a Paso 13 — nada de este paso movió la aguja comercial |
| Pasos 16-21 (proyección, 6 pasos) | **15-25 horas cada uno** (90-150h total) | Extrapolado del ritmo real de Pasos 09-15 (cada uno ~4-5h de esta sesión, o ~1 sesión extensa en las anteriores) — cifra de ingeniería, no un desglose de tareas verificado por paso |

Estas cifras son una estimación razonada, con el mismo criterio ya usado
en los informes de Paso 13/14: no son una métrica formal con peso
verificado por tarea.
