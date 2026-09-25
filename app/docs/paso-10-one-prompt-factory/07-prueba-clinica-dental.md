# Paso 10 · Fase 12 — Prueba real de generación local: clínica dental

Ejecutada de extremo a extremo con la CLI real, sin datos reales, sin
conexión a proveedores. Blueprint usado: `FULL_BUSINESS_BLUEPRINT`
(`businessBlueprintExamples.js`) — "Sonrisas de Málaga", ficticia, España,
español, plan Pro, 3 dentistas, 3 servicios, agenda, landing, PWA, branding.

## 1. Catálogo

```
$ npm run business:list -- --catalog
Plantillas disponibles: padel-club, sports-club, healthcare-clinic, professional-services,
                         beauty-salon, veterinary-clinic, local-service
Presets disponibles:    dental-clinic, physiotherapy-clinic, speech-therapy,
                         psychology-practice, law-firm, fertility-clinic, hair-salon, veterinarian
```

## 2. Primera generación

```
$ time npm run business:create -- --example=full
Paso 1/3 — Validando Business Blueprint "clinica-dental-sonrisas-de-malaga"...  OK.
Paso 2/3 — Ejecutando dry-run...  Se crearían 16 archivo(s), se actualizarían 0, colisiones: 0.
Paso 3/3 — Generando tenant y artefactos...
Negocio generado: clinica-dental-sonrisas-de-malaga
Archivos creados: 16 · actualizados: 0 · preservados: 0
Duración (interna, medida por el orquestador): 50 ms
Duración (wall-clock, incluye arranque de Node/npm): 0.695 s
Riesgos: Sector "dental" requiere revisión normativa antes de producción.
```

16 archivos contados en `filesCreated`: `business.blueprint.json`,
`tenant.config.json`, `env.example`,
`branding/{tokens.json,tokens.css,pending-assets.json}`,
`landing/{landing.config.json,index.html}`, `pwa/pwa.config.json`,
`demo-data/dataset.json`, `mockups/manifest.json`,
`docs/{README.md,guia-rapida.md,onboarding.md,checklist-tecnico.md,checklist-comercial.md}`.
Además, `report.md`/`report.json` y `.factory-manifest.json` se escriben
tras esos 16 (gestionados aparte porque su contenido siempre cambia entre
ejecuciones — ver `03-orquestador-pipeline.md`), para un total de 19
archivos en disco por negocio.

Dataset demo generado: 18 clientes, 3 profesionales, 24 citas, 3
incidencias — todo con `isDemoData: true`, consistencia referencial
verificada automáticamente antes de escribir.

## 3. Segunda generación — prueba de idempotencia

```
$ npm run business:create -- --example=full
Paso 2/3 — Ejecutando dry-run...  Se crearían 0 archivo(s), se actualizarían 0, colisiones: 0.
Paso 3/3 — Generando tenant y artefactos...
Archivos creados: 0 · actualizados: 0 · preservados: 16
Duración: 37 ms
```

**Idempotencia confirmada**: la segunda ejecución con el mismo blueprint no
creó ni actualizó ningún archivo — los 16 se preservaron sin tocar.

## 4. Diff

```
$ npm run business:diff -- --business=clinica-dental-sonrisas-de-malaga
{
  "businessId": "clinica-dental-sonrisas-de-malaga",
  "wouldCreate": [],
  "wouldUpdate": [],
  "unchanged": [16 archivos...],
  "collisions": [],
  "idempotentIfApplied": true
}
```

## 5. Doctor

```
$ npm run business:doctor
OK   extension_points_loaded: 19 puntos de extensión registrados
OK   all_extension_points_not_implemented: ninguna integración real activa (esperado en este paso)
OK   businesses_dir_readable: existe: src/saas-core/businesses
OK   generated_businesses_count: 1 negocio(s) generado(s)
OK   generated_businesses_still_valid: todos los blueprints generados siguen siendo válidos
OK   mockup_capture_tool_available: playwright NO instalado: solo manifest de mockups (esperado en este paso)
Fábrica saludable.
```

## 6. Informe (`business:report`)

Ver `src/saas-core/businesses/clinica-dental-sonrisas-de-malaga/report.md`
(y `.json` equivalente). Resumen: 14/14 módulos reutilizados del catálogo
genérico (100%), 0 archivos centrales del núcleo modificados, 1 riesgo
(revisión normativa sanitaria pendiente, esperado para el sector dental),
5 limitaciones honestas (sin proveedores reales, sin integración con
App.jsx, sin binarios de branding/PWA, sin captura real de mockups, datos
sintéticos).

## 7. Ningún archivo central modificado a mano

Verificado con `git status` tras las dos generaciones: los únicos cambios
son dentro de `src/saas-core/businesses/clinica-dental-sonrisas-de-malaga/`
(directorio nuevo). Ningún archivo de `templates.js`, `presets.js`,
`tenantSchema.js`, `moduleRegistry.js` ni de la app principal (`App.jsx`,
`theme.js`, Worker) fue tocado para lograr que la clínica dental generase
correctamente — el sector "dental" ya existía como preset en Paso 09 y la
fábrica lo reutilizó sin cambios.

## 8. Pasos manuales identificados (los que declara el propio blueprint + checklist técnico)

- Revisión normativa sanitaria/odontológica antes de producción (obligatoria
  por `privacy.regulatedSector: true`).
- Sustituir logotipo/branding placeholder por assets reales.
- Rellenar `env.example` con valores reales fuera del repositorio.
- Conectar cualquier proveedor real detrás de los adaptadores existentes.
- Revisar la landing generada antes de cualquier publicación real.
