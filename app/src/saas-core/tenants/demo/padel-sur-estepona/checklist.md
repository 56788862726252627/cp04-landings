# Checklist de puesta en marcha — Pádel Sur Estepona

Plantilla base: `padel-club`

## Pasos del negocio (de la plantilla/preset)
- [ ] Cargar catálogo de pistas como recursos
- [ ] Definir horario del club
- [ ] Configurar entrenadores como profesionales
- [ ] Revisar reglas del ranking

## Pasos técnicos obligatorios antes de cualquier dato real
- [ ] Rellenar `env.example` con valores reales fuera del repositorio (nunca commitear secretos)
- [ ] Conectar los adaptadores de proveedor reales detrás de las interfaces de `adapters/providerAdapters.js` (siguen siendo mocks)
- [ ] Revisar y, si aplica, sustituir `demoData` por datos reales del cliente
