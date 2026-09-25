# Paso 09 · Fase 10 — Tenants demostrativos

Generados con el CLI real (`npm run tenant:create`) el 2026-07-21, en
`app/src/saas-core/tenants/demo/`. Son **no productivos**: nombres de
negocio ficticios, sin personas reales, sin datos clínicos/legales reales.

| Tenant | Plantilla | Preset | Sector | Módulos activos | Roles | Término "cliente" | Regulado |
|---|---|---|---|---|---|---|---|
| `padel-sur-estepona` | padel-club | — | padel | 14 | CLIENT/STAFF/ADMIN/SUPPORT | jugador | no |
| `clinica-dental-sonrisas-malaga` | healthcare-clinic | dental-clinic | dental | 14 | CLIENT/STAFF/ADMIN/SUPPORT | paciente | **sí** |
| `fisioterapia-activa-granada` | healthcare-clinic | physiotherapy-clinic | physiotherapy | 14 | CLIENT/STAFF/ADMIN/SUPPORT | paciente | **sí** |
| `consulta-psicologica-mente-clara` | healthcare-clinic | psychology-practice | psychology | 14 | CLIENT/STAFF/ADMIN/SUPPORT | paciente | **sí** |
| `despacho-juridico-rivas-y-asociados` | professional-services | law-firm | law | 13 | CLIENT/STAFF/ADMIN/SUPPORT | cliente | **sí** |
| `peluqueria-estilo-urbano` | beauty-salon | hair-salon | hair-salon | 13 | CLIENT/STAFF/ADMIN/SUPPORT | cliente | no |
| `clinica-veterinaria-patitas-felices` | veterinary-clinic | veterinarian | veterinary | 13 | CLIENT/STAFF/ADMIN/SUPPORT | propietario | **sí** |

## Verificación por tenant (evidencia, no afirmación)

Para cada uno de los 7:

- **Plantilla y preset usados**: ver tabla (columna `meta.templateId`/`meta.presetId` de cada `tenant.config.json`).
- **Módulos activados**: `modulesEnabled` en `tenant.config.json`, 13-14 según vertical (el rango completo llega a 19 en el catálogo; ningún tenant de cliente activa `centro_tecnico`).
- **Terminología**: `terminologyOverrides` por tenant; verificado sin fugas de vocabulario de pádel fuera de `padel-sur-estepona` (test automático `findLeakedSportsTerms`, ver `templates.test.mjs`).
- **Roles**: los 4 roles genéricos (`CLIENT/STAFF/ADMIN/SUPPORT`) en los 7 — ninguno reutiliza los roles legacy de CP04.
- **Navegación**: `npm run tenant:preview -- --tenant=<id>` calcula `navigationByRole` en vivo con `buildSidebarNavigation`.
- **Configuración**: cada `tenant.config.json` valida contra el esquema central (`npm run tenant:validate`, 7/7 OK — ver salida de comandos ejecutada en esta sesión).
- **Ausencia de secretos**: `grep -rEn "sk_live|sk_test|whsec_|AIza|xox[baprs]-|=[A-Za-z0-9+/]{20,}"` sobre los 28 archivos generados → 0 coincidencias. `env.example` de cada tenant solo tiene `NOMBRE_VARIABLE=` sin valor.
- **Pasos manuales**: listados en `checklist.md` de cada tenant (pasos de negocio de la plantilla + 3 pasos técnicos fijos + aviso normativo cuando aplica).
- **Código central modificado**: **0 archivos**. `git status` tras generar los 7 tenants solo muestra archivos nuevos bajo `src/saas-core/`, `tenant-cli/`, `docs/paso-09-saas-core-replicable/` y la única edición a un archivo existente: `package.json` (los 4 scripts `tenant:*` añadidos en la Fase 9, antes de generar ningún tenant). Ningún archivo de `src/App.jsx`, `src/utils/rbac.js`, `src/data/*`, `src/theme.js` ni `worker-reservas/` fue tocado.

## Objetivo cumplido

Ningún tenant demo requirió modificar un componente principal: los 7 se
generaron con la misma plantilla/preset + CLI genéricos, sin ninguna línea
de código nueva por tenant. Los detalles cuantitativos de replicabilidad
(tiempo, archivos, pasos manuales) se desarrollan en
`05-medicion-replicabilidad.md` (Fase 15).
