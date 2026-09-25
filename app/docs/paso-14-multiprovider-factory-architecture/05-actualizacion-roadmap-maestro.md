# 05 — Actualización del roadmap maestro vivo

Mismo aviso de alcance que `docs/paso-13-real-public-website-provider/10-actualizacion-roadmap-maestro.md`:
el roadmap maestro vive como PDF fuera del repositorio; este documento es
la actualización viva en Markdown que refleja el estado real tras el
Paso 14, para usar como fuente la próxima vez que se regenere el PDF.

## Ítem 4 del roadmap — "Investigación pública y auditoría de presencia digital"

| | Antes del Paso 14 (tras Paso 13) | Después del Paso 14 |
|---|---|---|
| Proveedores reales conectados | 1 de ~13 (`publicWebsiteFetcher`) | **sigue siendo 1 de ~13** — Paso 14 no añadió proveedores reales nuevos |
| Arquitectura para añadir proveedores | Ad-hoc (un solo proveedor, integrado directamente en `auditOrchestrator.js`) | **Fábrica genérica**: registro + descubrimiento automático + pipeline con fallback/timeout/cancelación, lista para 12 proveedores más sin tocar el núcleo |
| Chequeo de salud | Solo del proveedor real (`public_website_fetcher_provider_loaded`) | + `multiprovider_registry_loaded` (13/13 proveedores cargan sin error) |
| Conexión al orquestador de auditorías | `publicWebsiteFetcher` invocado directamente | **Sigue sin cambiar** — el pipeline nuevo no está conectado a `runResearchAudit()` todavía (ver alcance en el informe técnico) |

**Lo que cambia realmente**: el *coste marginal* de convertir cada uno de
los 12 stubs restantes (Lighthouse, SEO, accesibilidad, WHOIS, DNS,
tecnologías, cabeceras de seguridad, redes sociales, contenido con IA,
velocidad, rendimiento, schema.org) en un proveedor real baja de forma
significativa: cada uno solo necesita implementar `collect()` real
siguiendo la receta de Paso 13 (documento 05) y encaja automáticamente en
el registro sin coordinación adicional. Esto no cambia el porcentaje de
proveedores reales conectados hoy, pero sí cambia el esfuerzo estimado
para conectar los siguientes.

## Estimación del ítem 4 en solitario

**~58-62% completo** (sube ligeramente de la estimación de Paso 13,
~55-60%): el motor sigue 100% funcional offline, sigue habiendo 1
proveedor real de ~13 conectado y probado end-to-end, pero ahora existe
además una arquitectura probada (74 tests en `providers/`) que reduce el
trabajo restante por proveedor. Sin panel/UI de cliente todavía; el
pipeline nuevo no está conectado al flujo de auditoría real.

## Horas restantes estimadas (orden de magnitud, no recalculado formalmente)

Se mantiene el rango ya estimado en Paso 13 para "conectar 2-3 proveedores
reales más" (80-120 horas hasta un MVP comercializable de Club Pádel 04) —
Paso 14 reduce el coste *por proveedor* dentro de ese rango al eliminar la
necesidad de tocar el núcleo por cada uno, pero no reduce el número de
proveedores que siguen sin implementación real (siguen siendo ~12).
