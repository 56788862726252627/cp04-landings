# 10 — Actualización del roadmap maestro vivo

## Aviso de alcance (léase antes de los porcentajes)

El "Roadmap Maestro Vivo — Club Pádel 04 y Agencia de IA" existe como
**PDF fuera del repositorio** (`/sdcard/Download/Roadmap_Maestro_*.pdf`),
no como un archivo versionado en git. No puedo editar un PDF directamente,
y ese PDF no contiene porcentajes ni horas almacenadas (es una lista de
13 iniciativas, sin seguimiento numérico). Por tanto:

- **No he modificado ningún PDF** (no es técnicamente posible desde aquí).
- Este documento es la actualización viva en Markdown, dentro del
  repositorio, que refleja el estado real tras el Paso 13.
- Recomendación: la próxima vez que se regenere el PDF maestro, usar este
  archivo como fuente de la sección "Investigación pública y auditoría de
  presencia digital" (ítem 4 del roadmap) y del estado técnico general.
- Los porcentajes de abajo son una **estimación razonada** basada en el
  trabajo verificado en este repositorio (no una métrica formal con peso
  por ítem preexistente) — se marca explícitamente como estimación.

## Mapeo del roadmap (13 ítems) al trabajo real hasta hoy

| # | Ítem del roadmap | Estado real |
|---|---|---|
| 1 | Maximizar arquitectura y replicabilidad | En curso — Pasos 09-13 son exactamente este trabajo |
| 2 | Fábrica SaaS multisector de un solo prompt | **Hecho** (Paso 10, PR #38) |
| 3 | Diagnóstico automático del negocio | Parcial — Paso 11 interpreta lenguaje natural; el diagnóstico comercial pleno sigue pendiente |
| 4 | **Investigación pública y auditoría de presencia digital** | **Hecho el motor + 1 proveedor real** (Pasos 12-13, PR #40 y este PR) — ver detalle abajo |
| 5 | Auditoría/rediseño de web y branding premium | Parcial — motor de branding (Paso 10) existe; "rediseño" real no implementado |
| 6 | PDF profesional antes/después para clientes | No implementado (contrato/estructura preparados en Paso 10, sin generación real) |
| 7 | Gestión inteligente de flujos y automatizaciones | Parcial — catálogo de automatizaciones (Paso 11+13), sin conexión real a Make |
| 8 | Multi-tenant real, plantillas, presets, marketplace | Parcial — multi-tenant y presets existen (Paso 09-11); marketplace no existe |
| 9 | Motor IA por sector y branding white-label | Parcial — léxico sectorial + branding engine existen; "motor IA" real (LLM conectado) no existe |
| 10 | Panel de ROI, observabilidad, seguridad, SDK, migraciones | Parcial — observabilidad y seguridad avanzaron en otras sesiones/tracks; panel unificado no existe |
| 11 | Favicon/iconos PWA por tenant | No implementado (solo contrato/manifiesto, Paso 10) |
| 12 | Mockups visuales móvil/tablet/escritorio | No implementado (solo manifiesto determinista, Paso 10; Playwright deliberadamente no instalado) |
| 13 | Mantener el documento vivo | Este archivo es la contribución de esta sesión a ese mantenimiento |

## Detalle del ítem 4 (lo que entregan Pasos 12 y 13)

- Paso 12: motor completo offline (Research Request, política, Evidence,
  45 dimensiones, scoring, recomendaciones, automatizaciones, comparación
  de competidores, informes, enriquecimiento, CLI, 10 demos).
- Paso 13: 1 de ~13 proveedores reales conectado (`publicWebsiteFetcher`),
  con SSRF en 2 capas, validado end-to-end contra un dominio real.
- Pendiente dentro del propio ítem 4: los otros ~12 proveedores
  (búsqueda, mapas, reseñas, Lighthouse, accesibilidad, SEO,
  fingerprinting, IA) siguen siendo mocks/contrato.

**Estimación del ítem 4 en solitario**: ~55-60% completo (motor
100% funcional offline + 1 proveedor real de ~13 conectado y probado
end-to-end; sin panel/UI de cliente todavía, sin el resto de proveedores).

## Porcentajes globales (estimación razonada, no una métrica formal previa)

| | Estimación |
|---|---|
| **Club Pádel 04** (producto SaaS núcleo, Pasos 09-13 + trabajo previo de la app) | **~55-60%** — núcleo replicable, fábrica, intérprete NL y motor de auditoría están sólidos y probados; faltan integraciones reales de pago/mensajería/calendario, generación visual real (iconos/mockups/PDF), y comercialización (marketplace, panel ROI) |
| **Agencia de IA** (capacidad de vender esto como servicio replicable a otros sectores) | **~40-45%** — la arquitectura es genuinamente multisector (10 presets, generación de negocios ficticios ya probada para clínica dental/fisio/etc.), pero faltan piezas comerciales: precios reconciliados (memoria: 4 sistemas de pricing sin reconciliar), piloto real con cliente, proveedores reales de automatización conectados |

## Horas restantes estimadas (orden de magnitud, no un cálculo de proyecto formal)

| | Estimación |
|---|---|
| Club Pádel 04 hasta un MVP comercializable completo | **80-120 horas** — principalmente: conectar 2-3 proveedores reales más (pagos, mensajería, mapas/reseñas), generación real de iconos/mockups, un panel de administración mínimo |
| Agencia de IA hasta poder vender el paquete replicable a un primer cliente piloto real | **60-100 horas adicionales** — reconciliar pricing, preparar material comercial con datos reales (no solo demos ficticias), validar con un piloto real bajo consentimiento explícito |

Estas cifras son una estimación de ingeniería basada en el ritmo real de
los Pasos 09-13 (cada uno ~1 sesión extensa), no un desglose de tareas
verificado con estimaciones independientes por tarea.
