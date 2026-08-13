# 06 — Actualización del roadmap maestro vivo (21 pasos)

## Aviso de alcance (léase antes de la tabla)

Igual que en el documento equivalente de Paso 15: este repositorio **no
contiene** un archivo único con los 21 pasos oficiales — el roadmap
maestro vive fuera del repo (PDF externo, según los informes de Paso
13/14). Esta tabla es la MISMA reconstrucción honesta desde `git log`
del documento de Paso 15, actualizada solo en lo que Paso 16 cambia
(fila 16 y las proyecciones 17-21). Los pasos 1-15 no se han
reinvestigado — se copian del documento de Paso 15 sin alterar su
contenido.

## Tabla de los 21 pasos

| # | Paso | Estado | Evidencia |
|---|---|---|---|
| 1 | (no identificado explícitamente en git log) | Presumiblemente base de la app Club Pádel 04 | — |
| 2-8 | Integración App↔Make 50/50 (reconciliación de flujos, resiliencia del Worker, mapa App↔Make) | Hecho | Ver documento equivalente de Paso 15 |
| 9 | Núcleo SaaS replicable multisector | Hecho | `d19f258`, PR #37 |
| 10 | Fábrica SaaS de un solo prompt | Hecho | `c8f3ff0`, PR #38 |
| 11 | Agente constructor de negocios en lenguaje natural | Hecho | `412d604`/`8302780`, PR #39 |
| 12 | Motor de investigación pública y auditoría digital | Hecho | `f59b516`, PR #40 |
| 13 | Proveedor real `publicWebsiteFetcher` + validación E2E | Hecho | `fc57e62`, PR #41 |
| 14 | Arquitectura de fábrica multiproveedor | Hecho | `7e4ce42`, PR #42 |
| 15 | Integración del pipeline multiproveedor con orchestrator/scoring/perfiles | Hecho | `7f4fb84`, PR #43 |
| **16** | **SEO Provider real + auditoría multiproveedor con dos fuentes reales** | **Hecho (este paso)** | Esta rama, PR nuevo (ver informe técnico) |
| 17 | Tercer proveedor real (candidato: `lighthouseProvider` o `accessibilityProvider`) | Pendiente (proyección) | — |
| 18 | Conexión de pagos/mensajería reales (Stripe/WhatsApp) al flujo comercial | Pendiente (proyección) | — |
| 19 | Generación visual real (iconos/mockups/PDF profesional antes-después) | Pendiente (proyección) | — |
| 20 | Panel de administración / ROI mínimo | Pendiente (proyección) | — |
| 21 | Piloto comercial real con un primer cliente (Agencia de IA) | Pendiente (proyección) | — |

Nota: el documento de Paso 15 proyectaba 6 pasos pendientes (16-21);
Paso 16 consumió exactamente el primero de esa lista ("segundo proveedor
real"), así que la numeración de pendientes se desplaza en uno —
"generación visual real"/"panel/ROI"/"marketplace"/"piloto real" del
documento anterior se han consolidado en los pasos 18-21 de esta tabla
(marketplace se fusiona con el piloto comercial, ya que ambos dependen
del mismo trabajo comercial pendiente). Sigue siendo una proyección, no
un compromiso.

## Detalle del Paso 16 (este documento)

- **Hecho**: `seoProvider` real, conectado al pipeline multiproveedor y
  al scoring existente, 10 perfiles + genérico con reglas SEO propias,
  CLI extendido con comando dedicado, 83 tests nuevos, 1 bug real de
  timeout encontrado y corregido, validación E2E con red real.
- **Explícitamente fuera de alcance** (ver informe técnico): enlaces
  rotos fuera del lote recopilado, peso de imágenes, validación oficial
  de Schema.org/sitemap.xml — todos declarados como límites de diseño
  deliberados, no como trabajo olvidado.

## Porcentajes — fórmula y criterio (igual que Paso 15, sin inventar cifras nuevas)

Criterio: pasos "Hecho" / 21 totales, ponderado por complejidad relativa
observada (cada paso 9-16 es una sesión extensa con tests exhaustivos).

- **Avance del Paso 16 en solitario**: 100% de las 13 fases del encargo
  cubiertas con código + tests + documentación, con los límites
  declarados arriba (no "no hecho", sino decisiones de alcance
  explícitas y verificables).
- **Avance de Club Pádel 04** (Pasos 09-16 + trabajo previo de la app):
  **~65-68%** — sube desde el ~62-65% de Paso 15: ahora hay 2 de ~13
  proveedores reales conectados (antes 1), y el coste de conectar el
  siguiente (Paso 17) es aún menor gracias al patrón "recopila → analiza"
  ya probado.
- **Avance de la Agencia de IA**: **~40-45%**, sin cambios — Paso 16
  sigue siendo puramente técnico (motor de auditoría), no toca piezas
  comerciales.

## Horas restantes estimadas (orden de magnitud)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable | **60-95 horas** | Baja ligeramente desde las 70-110h de Paso 15: el patrón de "proveedor derivado sobre publicWebsiteFetcher" ya está probado y documentado (ver "cómo añadir una regla nueva") |
| Agencia de IA hasta un piloto real | **60-100 horas** | Sin cambios respecto a Paso 15 |
| Pasos 17-21 (proyección, 5 pasos) | **15-25 horas cada uno** (75-125h total) | Extrapolado del ritmo real de Pasos 09-16 (cada uno ~4-5h en las últimas dos sesiones) — cifra de ingeniería, no un desglose de tareas verificado por paso |

Estimación razonada, mismo criterio que los informes de Paso 13/14/15:
no es una métrica formal con peso verificado por tarea.
