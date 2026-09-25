# 03 — Panel, propuesta, mockups y compatibilidad multidispositivo

## Panel comercial (`commercialPanel.js`)

`buildCommercialPanel(input)` combina `CommercialAssessment` + `RoiModel`
+ `IntegrationReadiness` + `ImplementationRoadmap` + `sandboxReadiness`
en una única estructura. Admite los 10 perfiles sectoriales + `generic`
— la lógica sectorial vive SOLO en `commercialSectorProfiles.js`, nunca
en el panel ni en el HTML. Renderizado en secciones reutilizables
(`renderDiagnosticSectionHtml`/`renderRoiSectionHtml`/
`renderIntegrationsSectionHtml`/`renderRoadmapSectionHtml`), compuestas
tanto por el panel completo como por los previews de dispositivo — sin
duplicar HTML entre ambos usos.

## Propuesta comercial (`proposalGenerator.js`)

Genera título, resumen ejecutivo, situación actual, problemas
detectados, oportunidades, solución propuesta, módulos incluidos,
automatizaciones, plan de implantación, calendario estimado, inversión,
mantenimiento, escenarios ROI, riesgos, dependencias, exclusiones,
responsabilidades del cliente, términos y próximos pasos — en JSON,
Markdown y HTML imprimible. **Nunca inventa datos del cliente**: sin
`business.name`, se marca `"[Nombre del negocio pendiente]"`; sin
riesgos/oportunidades registrados, se marca explícitamente "pendiente de
diagnóstico"; `pendingInformation` recoge exactamente qué campos son
supuestos o faltan, para que el equipo comercial los confirme antes de
enviar la propuesta a un cliente real.

## Mockups multidispositivo (`devicePreview.js`)

7 vistas × 3 dispositivos = 21 previews HTML/CSS autocontenidos (sin
imágenes, sin JavaScript, sin marcas de terceros, sin Playwright ni
ninguna herramienta de captura de pantalla):

| Vista | Contenido |
|---|---|
| `diagnostic` | Puntuaciones + riesgos + oportunidades + recomendaciones |
| `roi` | Los 3 escenarios ROI |
| `proposal` | La propuesta comercial completa |
| `integrations` | Estado de las 10 integraciones |
| `roadmap` | Plan de implantación |
| `clientView` | Resumen + ROI + próximos pasos — **sin bloqueos internos ni información pendiente** |
| `agencyView` | Todo lo anterior + información pendiente/bloqueos — solo para uso interno de la agencia |

Los 3 anchos de dispositivo (`390px`/`834px`/`1280px`) se simulan con
CSS puro (contenedor de ancho máximo + media queries), el mismo enfoque
que cualquier diseño responsive real — sin necesitar un navegador
automatizado ni capturas de pantalla reales.

### Compatibilidad declarada

HTML5/CSS3 estándar — compatible con Android (Chrome/WebView), iOS
(Safari/WebView) y cualquier navegador de escritorio moderno sin
JavaScript adicional ni polyfills. Base apta para una PWA futura — este
paso **NO añade `manifest.json` ni Service Worker**: queda declarado como
trabajo pendiente explícito, nunca presentado como ya construido.

## Artefactos generados en este paso (no solo código, también salida real)

- `docs/paso-20-visual-roi-commercial/mockups/` — los 21 previews
  reales, generados con `npm run factory:preview`.
- `docs/paso-20-visual-roi-commercial/sample-package/` — un
  `CommercialPackage` de ejemplo completo, generado con
  `npm run factory:package`.

Ambos se pueden regenerar en cualquier momento (son deterministas) con
los mismos comandos — no son artefactos "hechos a mano" que puedan
desincronizarse del código.
