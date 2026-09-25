# Checklist de puesta en marcha — Peluquería Estilo Urbano

Plantilla base: `beauty-salon` · Preset: `hair-salon`

## Pasos del negocio (de la plantilla/preset)
- [ ] Cargar cabinas/puestos como recursos
- [ ] Configurar estilistas y su disponibilidad
- [ ] Definir catálogo de servicios y precios
- [ ] Configurar campaña de bienvenida

## Pasos técnicos obligatorios antes de cualquier dato real
- [ ] Rellenar `env.example` con valores reales fuera del repositorio (nunca commitear secretos)
- [ ] Conectar los adaptadores de proveedor reales detrás de las interfaces de `adapters/providerAdapters.js` (siguen siendo mocks)
- [ ] Revisar y, si aplica, sustituir `demoData` por datos reales del cliente
