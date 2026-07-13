# CRM / Prospección — Plantilla

**Uso**: hoja de seguimiento de leads para este negocio/sector. Se implementa como hoja de cálculo (Google Sheets/Excel) o tabla simple — no requiere Airtable ni ninguna integración de pago.

**Regla crítica**: un CRM por sector/negocio. Nunca mezclar leads de sectores distintos ni con los de Club Pádel 04 en la misma hoja.

---

## Campos

| Campo | Descripción |
|---|---|
| Negocio | Nombre del negocio potencial cliente |
| Municipio | Localidad/zona |
| Sector | Debe coincidir exactamente con el sector de esta carpeta (no mezclar) |
| Teléfono | Contacto directo |
| Email | Contacto directo |
| Web | URL si existe |
| Redes | Instagram/Facebook/Google Business |
| Estilo visual observado | Nota rápida de la auditoría visual informal (colores, tono, calidad de imagen) — alimenta `03_identidad_visual/` si se convierte en cliente |
| Problema detectado | Hipótesis del problema principal (gestión manual, sin web, sin reservas online, etc.) |
| Prioridad | Alta / Media / Baja |
| Estado | Nuevo → Contactado → Diagnóstico agendado → Propuesta enviada → Negociación → Cerrado-ganado / Cerrado-perdido |
| Próximo paso | Acción concreta siguiente y fecha |
| Notas | Cualquier detalle relevante de la conversación o investigación |

## Plantilla de fila (copiar por cada lead)

```
Negocio:
Municipio:
Sector:
Teléfono:
Email:
Web:
Redes:
Estilo visual observado:
Problema detectado:
Prioridad:
Estado: Nuevo
Próximo paso:
Notas:
```

## Reglas de uso

- Actualizar el campo "Estado" cada vez que haya contacto real, no dejar leads "Contactado" indefinidamente sin seguimiento.
- Un lead pasa a `06_diagnostico/DIAGNOSTICO_TEMPLATE.md` solo cuando el estado llega a "Diagnóstico agendado" o posterior.
- Revisar la hoja semanalmente y mover a "Cerrado-perdido" los leads sin respuesta tras 3 intentos de contacto, para no inflar el pipeline con leads muertos.
