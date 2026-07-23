# 06 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

Igual que en los documentos equivalentes de Paso 15/16/17: este
repositorio **no contiene** un archivo único con los 21 pasos oficiales —
el roadmap maestro vive fuera del repo (PDF externo, según los informes
de Paso 13/14). Esta tabla es la MISMA reconstrucción honesta desde `git
log`, actualizada solo en lo que Paso 18 cambia (fila 18 y la proyección
19-21). Los pasos 1-17 no se han reinvestigado — se copian del documento
de Paso 17 sin alterar su contenido.

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
| **18** | **Performance Provider real + auditoría multiproveedor con cuatro fuentes reales** | **Hecho (este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 19 | Conexión de pagos/mensajería reales (Stripe/WhatsApp) al flujo comercial | Pendiente (proyección) | — |
| 20 | Generación visual real (iconos/mockups/PDF profesional antes-después) + panel de administración/ROI mínimo | Pendiente (proyección) | — |
| 21 | Piloto comercial real con un primer cliente (Agencia de IA) | Pendiente (proyección) | — |

Nota: el documento de Paso 17 proyectaba 4 pasos pendientes (18-21);
Paso 18 consumió el primero. La numeración de pendientes se desplaza en
uno; 19-21 quedan sin cambios respecto a la proyección de Paso 17 (ya no
quedan más candidatos naturales de "quinto proveedor derivado" en el
plan original — el siguiente bloque de trabajo es comercial, no técnico
de proveedores).

## Detalle del Paso 18 (este documento)

- **Hecho**: `performanceProvider` real, conectado al pipeline
  multiproveedor y al scoring existente (dimensión `performance`,
  categoría `technicalQuality`), 10 perfiles + genérico con reglas de
  rendimiento propias, CLI extendido con comando dedicado, 84 tests
  nuevos, timing real añadido a `publicWebsiteFetcher.js` sin una
  segunda petición, validación E2E con red real con los 4 proveedores
  reales simultáneos.
- **Explícitamente fuera de alcance** (ver informe técnico y documento
  03): Core Web Vitals (LCP/CLS/INP/FCP), compresión real ante un
  cliente normal, peso real de recursos descargables, coste de ejecución
  de JavaScript, CSS no utilizado, filmstrip/Speed Index — todos
  declarados como no medibles con esta arquitectura, nunca como "no
  hecho" silenciosamente ni estimados como si fueran reales.

## Porcentajes — fórmula y criterio (igual que Paso 15/16/17, sin inventar cifras nuevas)

Criterio: pasos "Hecho" / 21 totales, ponderado por complejidad relativa
observada.

- **Avance del Paso 18 en solitario**: 100% de las 13 fases del encargo
  cubiertas con código + tests + documentación, con los límites
  declarados arriba (decisiones de alcance explícitas, no trabajo
  olvidado).
- **Avance de Club Pádel 04** (Pasos 09-18 + trabajo previo de la app):
  **~71-74%** — sube desde el ~68-71% de Paso 17: ahora hay 4 de ~13
  proveedores reales conectados (antes 3), con el patrón de "proveedor
  derivado" ya probado con un tercer consumidor sin fricción.
- **Avance de la Agencia de IA**: **~40-45%**, sin cambios — Paso 18
  sigue siendo puramente técnico (motor de auditoría), no toca piezas
  comerciales.

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **45-80 horas** | Baja ligeramente desde las 50-85h de Paso 17: 4 de ~13 proveedores reales ya conectados, patrón "proveedor derivado" consolidado con 3 usos reales |
| Agencia de IA hasta un piloto real | **60-100 horas** | Sin cambios respecto a Paso 17 |
| Pasos 19-21 (proyección, 3 pasos) | **20-40 horas cada uno** (60-120h total) | Extrapolado del ritmo real de Pasos 09-18 (cada uno ~4-6h en las últimas cuatro sesiones); 19-21 son de naturaleza comercial (pagos/mensajería reales, generación visual, piloto con cliente real), con más incertidumbre que los pasos técnicos de proveedores por depender de terceros externos (Stripe/WhatsApp Business API/un cliente real) |

Estimación razonada, mismo criterio que los informes de Paso 13-17: no es
una métrica formal con peso verificado por tarea.
