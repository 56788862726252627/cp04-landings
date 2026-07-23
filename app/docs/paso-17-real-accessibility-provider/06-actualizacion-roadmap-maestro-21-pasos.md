# 06 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

Igual que en los documentos equivalentes de Paso 15/16: este repositorio
**no contiene** un archivo único con los 21 pasos oficiales — el roadmap
maestro vive fuera del repo (PDF externo, según los informes de Paso
13/14). Esta tabla es la MISMA reconstrucción honesta desde `git log`,
actualizada solo en lo que Paso 17 cambia (fila 17 y la proyección
18-21). Los pasos 1-16 no se han reinvestigado — se copian del documento
de Paso 16 sin alterar su contenido.

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
| **17** | **Accessibility Provider real + auditoría multiproveedor con tres fuentes reales** | **Hecho (este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 18 | Cuarto proveedor real (candidato: `lighthouseProvider`/`performanceProvider`, con métricas reales tipo Core Web Vitals) | Pendiente (proyección) | — |
| 19 | Conexión de pagos/mensajería reales (Stripe/WhatsApp) al flujo comercial | Pendiente (proyección) | — |
| 20 | Generación visual real (iconos/mockups/PDF profesional antes-después) + panel de administración/ROI mínimo | Pendiente (proyección) | — |
| 21 | Piloto comercial real con un primer cliente (Agencia de IA) | Pendiente (proyección) | — |

Nota: el documento de Paso 16 proyectaba 5 pasos pendientes (17-21);
Paso 17 consumió el primero. La numeración de pendientes se desplaza en
uno, y "panel/ROI" (antes paso 20 propio) se fusiona con "generación
visual real" por ser trabajo comercial del mismo bloque. Sigue siendo
una proyección, no un compromiso.

## Detalle del Paso 17 (este documento)

- **Hecho**: `accessibilityProvider` real, conectado al pipeline
  multiproveedor y al scoring existente, 10 perfiles + genérico con
  reglas de accesibilidad propias, CLI extendido con comando dedicado,
  93 tests nuevos, generalización del patrón de proveedor derivado
  (reutilizable para un futuro cuarto proveedor), validación E2E con red
  real con los 3 proveedores reales simultáneos.
- **Explícitamente fuera de alcance** (ver informe técnico): validación
  ARIA normativa completa, interacción real de teclado/foco, contraste
  en CSS externo, subtítulos/transcripción reales de vídeo/audio — todos
  declarados como comprobaciones de revisión manual obligatoria, nunca
  como "no hecho" silenciosamente.

## Porcentajes — fórmula y criterio (igual que Paso 15/16, sin inventar cifras nuevas)

Criterio: pasos "Hecho" / 21 totales, ponderado por complejidad relativa
observada.

- **Avance del Paso 17 en solitario**: 100% de las 13 fases del encargo
  cubiertas con código + tests + documentación, con los límites
  declarados arriba (decisiones de alcance explícitas, no trabajo
  olvidado).
- **Avance de Club Pádel 04** (Pasos 09-17 + trabajo previo de la app):
  **~68-71%** — sube desde el ~65-68% de Paso 16: ahora hay 3 de ~13
  proveedores reales conectados (antes 2), con el patrón de "proveedor
  derivado" ya generalizado y reutilizable para el siguiente.
- **Avance de la Agencia de IA**: **~40-45%**, sin cambios — Paso 17
  sigue siendo puramente técnico (motor de auditoría), no toca piezas
  comerciales.

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **50-85 horas** | Baja ligeramente desde las 60-95h de Paso 16: el patrón de "proveedor derivado" ya está generalizado y documentado (ver "cómo añadir una regla nueva") |
| Agencia de IA hasta un piloto real | **60-100 horas** | Sin cambios respecto a Paso 16 |
| Pasos 18-21 (proyección, 4 pasos) | **15-30 horas cada uno** (60-120h total) | Extrapolado del ritmo real de Pasos 09-17 (cada uno ~4-6h en las últimas tres sesiones); un cuarto proveedor con métricas reales (Core Web Vitals) probablemente exige más esfuerzo que SEO/accesibilidad por necesitar medición de rendimiento real, no solo análisis estático |

Estimación razonada, mismo criterio que los informes de Paso 13-16: no es
una métrica formal con peso verificado por tarea.
