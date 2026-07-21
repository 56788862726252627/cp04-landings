# Checklist de puesta en marcha — Clínica Veterinaria Patitas Felices

Plantilla base: `veterinary-clinic` · Preset: `veterinarian`

## Pasos del negocio (de la plantilla/preset)
- [ ] Cargar salas de consulta como recursos
- [ ] Configurar veterinarios y turnos
- [ ] Definir campos de mascota (especie/raza, sin datos clínicos reales)
- [ ] Revisar aviso de revisión normativa veterinaria (ver seguridad y privacidad)
- [ ] Revisión normativa veterinaria antes de producción

## Pasos técnicos obligatorios antes de cualquier dato real
- [ ] Rellenar `env.example` con valores reales fuera del repositorio (nunca commitear secretos)
- [ ] Conectar los adaptadores de proveedor reales detrás de las interfaces de `adapters/providerAdapters.js` (siguen siendo mocks)
- [ ] Revisar y, si aplica, sustituir `demoData` por datos reales del cliente

## Aviso normativo
El sector "veterinary" maneja datos potencialmente sensibles (salud, situación legal o datos especialmente protegidos). Este núcleo SaaS no implementa ni certifica cumplimiento RGPD/sanitario/legal específico. Antes de producción real: revisión por un profesional cualificado en protección de datos y normativa sectorial.
