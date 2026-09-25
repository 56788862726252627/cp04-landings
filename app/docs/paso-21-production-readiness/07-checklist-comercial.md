# 07 — Checklist comercial

## Capacidad ya construida (Paso 20)

- [x] Motor ROI con 3 escenarios y disclaimers explícitos (`npm run commercial:roi`).
- [x] Generador de propuesta comercial en JSON/Markdown/HTML (`npm run commercial:proposal` / `factory:proposal`).
- [x] Panel de diagnóstico + ROI + integraciones + roadmap (`npm run commercial:preview`).
- [x] Paquete comercial completo de un golpe (`npm run factory:package`).
- [x] Perfiles de los 10 sectores objetivo + genérico.
- [x] Mockups reales en 3 dispositivos para presentar a un prospecto.

## Pendiente antes de usar esto con un cliente real

- [ ] **Depende de datos reales del negocio prospecto**: sustituir los supuestos sectoriales de `roiEngine.js` por datos reales (ticket medio, reservas mensuales, etc.) — el motor ya soporta esto vía `--input=<ruta.json>`.
- [ ] **Depende de una auditoría real**: conectar el motor de investigación (Pasos 12-18, `research:audit`) al panel comercial (`auditScores`) para que el diagnóstico no dependa solo de datos manuales.
- [ ] **Depende de decisión editorial**: revisar y personalizar `exclusions`/`clientResponsibilities`/`terms` de `proposalGenerator.js` para el contrato comercial real de la agencia (actualmente son valores por defecto razonables, no cláusulas legales revisadas).
- [ ] **Depende de Stripe/WhatsApp reales**: el paquete comercial puede prometer "pagos y recordatorios automáticos", pero no puede activarse de verdad hasta que existan credenciales (ver checklist de producción).

## Material listo para una demo comercial hoy mismo (sin credenciales)

- `docs/paso-20-visual-roi-commercial/mockups/` — 21 previews reales.
- `docs/paso-20-visual-roi-commercial/sample-package/` — paquete de ejemplo completo (JSON/Markdown/HTML + previews).
- `npm run factory:package -- --profile=<sector> --business-name="<Nombre>" --output-dir=<carpeta>` genera un paquete a medida en segundos.
