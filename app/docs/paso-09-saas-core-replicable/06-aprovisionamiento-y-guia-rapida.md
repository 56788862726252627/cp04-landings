# Paso 09 · Fase 9 y 14 — Aprovisionamiento, nuevo sector, nuevo cliente, guía rápida

## CLI (`app/tenant-cli/`)

```
npm run tenant:list -- --catalog        # lista las 7 plantillas + 8 presets disponibles
npm run tenant:create -- --template=healthcare-clinic --preset=dental-clinic --name="Clínica Demo"
npm run tenant:create -- --template=padel-club --name="Pádel Sur Estepona"
npm run tenant:validate -- --tenant=<tenantId>
npm run tenant:list
npm run tenant:preview -- --tenant=<tenantId>
```

Comportamiento verificado por tests (`tenant-cli/lib/tenantProvisioning.test.mjs`,
18 tests) y por ejecución real en esta sesión (7 tenants generados, ver
`04-tenants-demo.md`):

- Valida argumentos (`--name` y `--template`/`--preset` obligatorios; mensajes de error explícitos, nunca un stack trace crudo).
- Deriva un slug seguro (`slugify`: minúsculas, sin acentos, kebab-case) tanto del nombre como de un `--tenant-id` explícito.
- **No sobrescribe**: si el directorio del tenant ya existe, falla con un error claro salvo `--force` explícito.
- Solo crea 4 archivos conocidos por tenant: `tenant.config.json`, `env.example`, `checklist.md`, `summary.md` — nunca archivos arbitrarios.
- `env.example` solo contiene NOMBRES de variable (`STRIPE_SECRET_KEY=`), nunca valores.
- `--no-demo-data` desactiva el flag `demoData.enabled` sin dejar de generar la config.
- Genera `checklist.md` (pasos de negocio de la plantilla + 3 pasos técnicos fijos + aviso normativo si el sector lo requiere) y `summary.md` (módulos, roles, navegación por rol, integraciones).
- Es seguro repetir la operación: sin `--force` falla limpio (no dos mitades de un tenant a medio escribir); con `--force` regenera de forma determinista.

## Crear un sector nuevo (sin tocar núcleo)

1. Añadir una entrada a `KNOWN_SECTORS` en `tenant/tenantSchema.js` si el sector es nuevo (no un preset de uno existente).
2. Definir una plantilla en `templates/templates.js` con `defineTemplate({...})`: elegir un subconjunto de `CORE_MODULE_CATALOG`, terminología, servicios típicos, capacidades de automatización recomendadas (del catálogo de 17 de la Fase 11).
3. Ejecutar `npm test` — el test `un tenant construido a partir de cada plantilla valida contra el esquema central` se extiende automáticamente a la nueva plantilla si se añade a `SECTOR_TEMPLATES`.
4. No se toca ningún componente de UI ni `App.jsx`.

## Crear un cliente nuevo (preset o tenant directo)

- Si el sector ya tiene preset: `npm run tenant:create -- --preset=<id> --name="<Nombre real>"`.
- Si el sector solo tiene plantilla base: `npm run tenant:create -- --template=<id> --name="<Nombre real>"`.
- Si el negocio necesita ajustes de terminología/servicios propios que no encajan en un preset existente: añadir un preset nuevo en `templates/presets.js` con `definePreset({baseTemplateId, ...overrides})` (nunca redefine módulos desde cero).

## Guía rápida: tenant de demostración en menos de 15 minutos

1. **(1 min)** `npm run tenant:list -- --catalog` — elegir plantilla o preset.
2. **(1 min)** `npm run tenant:create -- --preset=<id> --name="Nombre del negocio demo"`.
3. **(1 min)** `npm run tenant:validate -- --tenant=<slug-generado>` — confirmar `OK`.
4. **(2 min)** `npm run tenant:preview -- --tenant=<slug-generado>` — revisar `navigationByRole` y `regulatoryNotice`.
5. **(5 min)** Abrir `src/saas-core/tenants/demo/<slug>/checklist.md` y `summary.md` — repasar pasos de negocio y aviso normativo si aplica.
6. **(5 min)** Si se necesita ajustar terminología/servicios sin tocar código: editar directamente `tenant.config.json` (campos `terminologyOverrides`, `demoData`) y volver a `tenant:validate`.

Total: ≤ 15 minutos, 0 líneas de código nuevas, 0 archivos del núcleo tocados — verificado en esta sesión para los 7 tenants demo reales.

## Límite explícito de este flujo

El resultado de `tenant:create` es **configuración**, no un tenant
funcionando en producción: no despliega nada, no crea una base de datos,
no conecta ningún proveedor real. Conectar la configuración generada a
`App.jsx`/`rbac.js` en vivo (Fase 6, "límite de integración") y a
proveedores reales (Fase 8) son pasos posteriores, fuera de alcance de
este paso — documentados en `07-seguridad-privacidad-limites-migracion.md`.
