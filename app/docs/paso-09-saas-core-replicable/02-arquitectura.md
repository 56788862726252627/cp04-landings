# Paso 09 · Fase 2 — Arquitectura por capas

Toda la implementación vive bajo `app/src/saas-core/` (config/dominio, sin UI)
y `app/tenant-cli/tenant-*` (CLI). **Ningún archivo existente se mueve.**
`App.jsx`, `rbac.js`, `theme.js`, `authTypes.js`, `makeInventory.js` y el
Worker no se modifican en este paso.

```
app/src/saas-core/
├── tenant/
│   ├── tenantSchema.js       # SaaS Core: esquema tipado + validate()
│   └── defaultTenant.js      # Tenant "club-padel-04" (default, verificado == rbac.js)
├── terminology/
│   └── terminology.js        # SaaS Core: diccionario + resolver de términos
├── templates/
│   ├── templates.js          # Plantillas sectoriales base (capa "Módulos verticales" + "Plantillas")
│   └── presets.js            # Presets derivados (Configuración por tenant)
├── modules/
│   └── moduleRegistry.js     # SaaS Core: navegación/módulos/roles configurables
├── domain/
│   └── genericDomain.js      # SaaS Core: Customer/StaffMember/Service/Resource/Appointment/... + adaptadores CP04
├── adapters/
│   └── providerAdapters.js   # Adaptadores de proveedores externos (interfaces + mocks)
├── automations/
│   └── capabilityMap.js      # Matriz de capacidades genéricas → recomendaciones (no toca los 50 flujos)
├── security/
│   └── privacyChecklist.js   # Seguridad y privacidad por diseño
└── tenants/demo/*.json        # Tenants demostrativos generados por el CLI (Fase 10)

app/tenant-cli/
├── lib/tenantProvisioning.mjs # Lógica compartida del CLI
├── tenant-create.mjs
├── tenant-validate.mjs
├── tenant-list.mjs
└── tenant-preview.mjs
```

## Las 5 capas pedidas

1. **SaaS Core** (`tenant/`, `modules/`, `domain/`, parte de `adapters/`):
   autenticación/roles se **referencian** desde `rbac.js` (no se duplican
   como autoridad — el core define la *forma* configurable; CP04 sigue
   gobernado por `rbac.js` en producción). Clientes, agenda/citas,
   servicios, profesionales, notificaciones, pagos abstractos, informes,
   automatizaciones, configuración y auditoría se modelan en
   `domain/genericDomain.js` y `modules/moduleRegistry.js`.
2. **Módulos verticales** (`templates/templates.js`): pádel y deporte, salud
   y bienestar, servicios profesionales, belleza, veterinaria — cada uno una
   plantilla base con módulos/terminología/roles propios.
3. **Configuración por tenant** (`tenant/tenantSchema.js` + `tenants/demo/`):
   un objeto de configuración por negocio, validado, versionado.
4. **Adaptadores de proveedores externos** (`adapters/providerAdapters.js`):
   interfaces + mocks locales para Make/Airtable/Stripe/WhatsApp/Gmail/
   Calendar/almacenamiento/analítica, sin llamadas reales.
5. **Plantillas sectoriales** (`templates/presets.js`): 8 presets que
   heredan de las 7 plantillas base y solo sobrescriben configuración.

## Regla de integración con la app existente

La integración con `App.jsx` es **solo verificada por test de equivalencia**,
no en vivo: `modules/moduleRegistry.test.mjs` prueba que, para el tenant por
defecto `club-padel-04`, el resultado de `getEnabledSectionsForRole()` es
**idéntico** (mismo array, mismo orden) a `CP04_ROLE_PERMISSIONS` de
`rbac.js` para los 4 roles. Esto demuestra que el núcleo es capaz de
reproducir el comportamiento actual sin haber tocado `App.jsx` ni arriesgado
la navegación en producción. La conexión real (sustituir el import estático
por lectura del tenant activo) queda documentada como trabajo pendiente en
`06-limites-y-migracion.md`, coherente con el estado ya registrado en
memoria del proyecto para la capa `tenant-runtime` anterior (no integrada en
`App.jsx` por trabajo en paralelo de otro terminal).
