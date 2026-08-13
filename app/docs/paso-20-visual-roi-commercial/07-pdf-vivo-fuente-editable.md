# 07 — PDF vivo: fuente editable (Pasos 1-20)

## Aviso de honestidad (léase antes de todo lo demás)

**No existe en este repositorio ninguna herramienta de generación de PDF**
(no hay `puppeteer`/`pdfkit`/`jspdf`/similar en `package.json`, y no se ha
instalado ninguna en este paso — "no instales herramientas pesadas si no
son necesarias"). Este documento es la **fuente Markdown estructurada**
del "PDF vivo" del roadmap — editable, versionada, y lista para
convertirse a PDF real en el futuro sin reescribir nada. **Ningún PDF
binario se ha generado en esta sesión.** Ver "Proceso futuro para
producir el PDF real" al final de este documento.

Precedente en el propio código: `src/saas-core/factory/reportGenerator.js`
(Paso 10) ya deja un comentario explícito: *"que un paso futuro pueda
convertir report.json a PDF sin reescribir esta [lógica]"* — este
documento sigue el mismo principio para el roadmap completo.

## Tabla maestra — Pasos 1-20

| # | Paso | Estado | Tiempo estimado | Tiempo real | Evidencia |
|---|---|---|---|---|---|
| 1 | (no identificado explícitamente en git log) | Presumiblemente base de la app | — | — | — |
| 2-8 | Integración App↔Make 50/50 | Hecho | — | — | Ver docs de Paso 15 |
| 9 | Núcleo SaaS replicable multisector | Hecho | — | — | `d19f258`, PR #37 |
| 10 | Fábrica SaaS de un solo prompt | Hecho | — | — | `c8f3ff0`, PR #38 |
| 11 | Agente constructor de negocios en lenguaje natural | Hecho | — | — | `412d604`/`8302780`, PR #39 |
| 12 | Motor de investigación pública y auditoría digital | Hecho | — | — | `f59b516`, PR #40 |
| 13 | Proveedor real `publicWebsiteFetcher` + validación E2E | Hecho | — | — | `fc57e62`, PR #41 |
| 14 | Arquitectura de fábrica multiproveedor | Hecho | — | — | `7e4ce42`, PR #42 |
| 15 | Integración del pipeline multiproveedor con orchestrator/scoring/perfiles | Hecho | — | — | `7f4fb84`, PR #43 |
| 16 | SEO Provider real + auditoría multiproveedor (2 fuentes reales) | Hecho | 3h | ~4-5h | `09d722f`, PR #44 |
| 17 | Accessibility Provider real (3 fuentes reales) | Hecho | 3h30 | ~5-6h | `c4629cb`, PR #45 |
| 18 | Performance Provider real (4 fuentes reales) | Hecho | 4h30 | ~5-6h | `6194ca8`, PR #46 |
| 19 | Adaptadores aislados Stripe/WhatsApp (alcance redefinido, sin credenciales) | Hecho | ~4h (proyectado) | ~2.5-3.5h | `be10a95`, PR #47 |
| **20** | **Generación visual multidispositivo + panel ROI/comercial + preparación de integraciones reales** | **Hecho (este paso)** | No especificada en el mensaje | Ver informe técnico (doc. 05, pendiente de completar con hora real) | Esta rama, PR nuevo |
| 21 | Piloto comercial real con un primer cliente + conexión real de Stripe/WhatsApp/Airtable/Make/dominio (secuencia de trabajo confirmada por el usuario) | Pendiente (proyección) | — | — | — |

## Mejoras incorporadas en el Paso 20

- Motor ROI determinista con 3 escenarios, cada cifra con
  fuente/fórmula/supuesto/confianza.
- Panel comercial reutilizable (diagnóstico + ROI + integraciones +
  roadmap), sin lógica sectorial embebida en la interfaz.
- Generador de propuesta comercial en JSON/Markdown/HTML.
- 21 mockups reales (7 vistas × 3 dispositivos), sin herramientas
  pesadas, sin marcas de terceros.
- Sistema central de estado de integraciones (9 estados × 10
  integraciones) con checklist de credenciales.
- Puente sandbox Stripe/WhatsApp: simulación completa sin red real, sin
  IDs falsos presentados como reales, consentimiento e idempotencia
  conservados.
- CLI comercial completa: 9 comandos
  (`commercial:assess/roi/proposal/preview/integrations/readiness` +
  `factory:package/preview/proposal`).
- Esta fuente del PDF vivo.

## Estado (resumen ejecutivo)

- **Motor de investigación/auditoría (Pasos 12-18)**: 4 proveedores
  reales conectados (publicWebsiteFetcher, seoProvider,
  accessibilityProvider, performanceProvider) de ~13 proveedores totales.
- **Capa de pagos/mensajería (Paso 19)**: adaptadores completos,
  `NOT_CONFIGURED` (sin credenciales reales).
- **Capa comercial/visual (Paso 20)**: ROI, panel, propuesta, previews,
  readiness, CLI — todo funcional en modo simulado/local, listo para
  conectarse a datos reales de cliente y a credenciales reales cuando
  existan.
- **Integraciones externas reales**: ninguna en producción todavía
  (Airtable con cuota agotada, Make sin validar con llamadas reales,
  Stripe/WhatsApp sin contratar/configurar, dominio sin comprar).

## Porcentajes (ver documento 06 para la fórmula y el detalle completo)

| | Paso 18 | Paso 19 | Paso 20 |
|---|---|---|---|
| Club Pádel 04 | ~71-74% | ~71-74% (sin cambios) | ~71-74% (sin cambios — Paso 20 es una herramienta de la Agencia de IA, no del producto Club Pádel 04) |
| Agencia de IA | ~40-45% | ~42-47% | **~55-62%** (ver justificación en doc. 06) |

## Horas restantes (ver documento 06 para el detalle completo)

| | Paso 18 | Paso 19 | Paso 20 |
|---|---|---|---|
| Club Pádel 04 hasta MVP | 45-80h | 45-80h | 45-80h (sin cambios) |
| Agencia de IA hasta piloto | 60-100h | 55-95h | **35-65h** (baja sustancialmente: la capa comercial ya no es trabajo pendiente, solo falta conectar credenciales reales) |
| Paso 21 | 20-40h (proyección Paso 18) | 20-40h (proyección Paso 19) | **25-45h** (recalibrado — ver doc. 06) |

## Dependencias externas (bloqueos activos a fecha de este paso)

1. Cuota de la API de Airtable agotada (renovación pendiente).
2. Los 50 flujos de Make sin validar con llamadas reales (depende de 1).
3. WhatsApp Business Cloud API sin contratar.
4. Stripe sin configurar en modo producción (test tampoco, en esta sesión).
5. Dominio propio sin comprar (Hostinger).
6. SSL/hosting/backups/monitorización: todos dependen de 5.

## Mockups y compatibilidad

21 previews HTML/CSS autocontenidos en
`docs/paso-20-visual-roi-commercial/mockups/` (7 vistas × 3
dispositivos) + un `CommercialPackage` de ejemplo completo en
`docs/paso-20-visual-roi-commercial/sample-package/`. Compatibilidad
declarada: Android (Chrome/WebView), iOS (Safari/WebView), navegadores
de escritorio modernos — HTML5/CSS3 estándar sin JavaScript adicional.
Base apta para una PWA futura (sin manifest/Service Worker en este
paso — declarado explícitamente como pendiente, no como ya construido).

## Siguiente paso recomendado

**Paso 21**, en el orden de la secuencia de trabajo confirmada por el
usuario: esperar la renovación de la cuota de Airtable, validar los 50
flujos de Make con llamadas reales, contratar y configurar WhatsApp
Business, configurar Stripe en producción, comprar el dominio en
Hostinger, y desplegar y validar la producción real — usando el runbook
de Paso 19 y el checklist de integraciones de este paso como guía
paso a paso.

## Proceso futuro para producir el PDF real

Cuando se decida generar el PDF binario, dos opciones sin dependencias
nuevas pesadas:

1. **Pandoc** (herramienta externa al repositorio, no una dependencia
   npm): `pandoc docs/paso-20-visual-roi-commercial/07-pdf-vivo-fuente-editable.md -o roadmap-vivo.pdf`.
2. **Imprimir a PDF desde el navegador**: abrir
   `docs/paso-20-visual-roi-commercial/sample-package/panel.html` (o
   cualquier preview de `mockups/`) y usar "Imprimir → Guardar como PDF"
   del propio navegador — cero dependencias, funciona hoy mismo con lo
   ya generado en este paso.

Ninguna de las dos opciones se ha ejecutado en esta sesión — quedan
documentadas para cuando el usuario decida producir el PDF real.
