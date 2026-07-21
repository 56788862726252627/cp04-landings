# Checklist de puesta en marcha — Despacho Jurídico Rivas y Asociados

Plantilla base: `professional-services` · Preset: `law-firm`

## Pasos del negocio (de la plantilla/preset)
- [ ] Cargar despachos/salas como recursos
- [ ] Configurar especialistas y áreas de práctica
- [ ] Definir plantillas de documentos (sin contenido legal real)
- [ ] Revisar aviso de revisión normativa (ver seguridad y privacidad)
- [ ] Revisión normativa de secreto profesional/protección de datos antes de producción

## Pasos técnicos obligatorios antes de cualquier dato real
- [ ] Rellenar `env.example` con valores reales fuera del repositorio (nunca commitear secretos)
- [ ] Conectar los adaptadores de proveedor reales detrás de las interfaces de `adapters/providerAdapters.js` (siguen siendo mocks)
- [ ] Revisar y, si aplica, sustituir `demoData` por datos reales del cliente

## Aviso normativo
El sector "law" maneja datos potencialmente sensibles (salud, situación legal o datos especialmente protegidos). Este núcleo SaaS no implementa ni certifica cumplimiento RGPD/sanitario/legal específico. Antes de producción real: revisión por un profesional cualificado en protección de datos y normativa sectorial.
