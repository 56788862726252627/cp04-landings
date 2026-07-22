# Paso 10 · Fase 15 — Guía rápida (menos de 15 minutos) e instrucción natural

## Guía rápida: generar un negocio demo nuevo

1. **(1 min)** `npm run business:list -- --catalog` — ver plantillas/presets disponibles.
2. **(3 min)** Escribir un Business Blueprint (JSON) con al menos los 10 campos
   obligatorios (`schemaVersion, businessId, tenantId, commercialName, sector,
   country, timezone, locale, currencies, plan`), o partir de
   `businessBlueprintExamples.js` (`MINIMAL_BUSINESS_BLUEPRINT` o
   `FULL_BUSINESS_BLUEPRINT`) y adaptarlo.
3. **(1 min)** `npm run business:validate -- --blueprint=mi-negocio.json` — confirmar `OK`.
4. **(1 min)** `npm run business:preview -- --blueprint=mi-negocio.json` — revisar
   navegación por rol, branding y secciones de landing antes de escribir nada.
5. **(2 min)** `npm run business:create -- --blueprint=mi-negocio.json` — valida,
   hace dry-run, genera tenant/branding/landing/datos demo/documentación/informe.
6. **(2 min)** Abrir `src/saas-core/businesses/<businessId>/docs/README.md` y
   `checklist-tecnico.md` — repasar pasos pendientes y aviso normativo si aplica.
7. **(2 min)** `npm run business:doctor` — confirmar que la fábrica sigue sana.
8. **(2 min)** `npm run business:report -- --business=<businessId>` — leer el informe completo.

Total: ≤ 15 minutos, 0 líneas de código nuevas en el núcleo, 0 archivos del
núcleo tocados — verificado en esta sesión con la clínica dental demo (ver
`07-prueba-clinica-dental.md`).

## De instrucción natural a Business Blueprint (contrato, sin LLM real)

Instrucción de ejemplo (la pedida en la Fase 15):

> "Crear una solución SaaS para una clínica dental de Málaga, con tres
> odontólogos, agenda, pacientes, recordatorios, formularios, landing page,
> PWA y branding premium."

`draftBlueprintFromInstruction(instruction)`
(`src/saas-core/factory/nlToBlueprintContract.js`) la procesa **hoy** por
coincidencia de palabras clave (no un LLM) y produce:

```json
{
  "partialBlueprint": {
    "sector": "dental",
    "country": "ES",
    "locale": "es-ES",
    "currencies": ["EUR"],
    "publicInfo": { "address": { "city": "Málaga" } },
    "professionals": [
      { "name": "Profesional 1 (a confirmar)", "role": "" },
      { "name": "Profesional 2 (a confirmar)", "role": "" },
      { "name": "Profesional 3 (a confirmar)", "role": "" }
    ],
    "landingPage": {},
    "pwa": {},
    "manualSteps": ["Confirmar todos los campos extraídos automáticamente antes de generar el negocio (extracción por palabras clave, no NLU real)"]
  },
  "missingFields": ["businessId", "tenantId", "commercialName", "plan", "timezone"],
  "confidence": "media",
  "method": "keyword_matching_v1",
  "isRealLanguageUnderstanding": false,
  "detectedSignals": ["sector:dental", "ciudad:Málaga", "profesionales:3", "feature:agenda", "feature:landing", "feature:pwa"]
}
```

**Lo que NO hace esto**: no entiende lenguaje natural, no infiere
`businessId`/`tenantId`/`commercialName`/`plan` (siempre quedan en
`missingFields`, sin excepción), no genera branding "premium" real (solo
detecta la intención como señal). Un paso futuro conectaría aquí un LLM
real (o un flujo guiado con un humano) para completar `missingFields` y
subir la confianza — el contrato (forma de entrada/salida) ya está fijado
y probado (8 tests en `nlToBlueprintContract.test.mjs`), así que ese paso
futuro no debería requerir cambiar la interfaz, solo la implementación.

## Dónde seguir

- Conectar un proveedor real (Fase 13, `extensionPoints.js`) detrás de los
  adaptadores existentes — empezar por el más simple de validar
  (`airtable`/`make`, igual que recomienda `07-seguridad-privacidad-limites-migracion.md`
  de Paso 09).
- Implementar la generación real de binarios de branding/PWA (favicon,
  iconos, manifest.webmanifest) detrás del contrato ya preparado en
  `brandingEngine.js`.
- Añadir Playwright (o equivalente) como dependencia de desarrollo para
  activar `mockupCapture` sobre el manifest ya determinista de
  `mockupManifest.js`.
- Sustituir `draftBlueprintFromInstruction` por una integración real con un
  LLM, manteniendo el mismo contrato de entrada/salida.
