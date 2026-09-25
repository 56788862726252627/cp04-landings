# Club Pádel 04 · Auditoría 31 · Mapa quirúrgico galería

## Objetivo

Localizar las líneas exactas de App.jsx relacionadas con la galería y los assets visuales para decidir si se puede extraer un componente separado sin riesgo.

## Reglas

No se modifica App.jsx en esta fase.

No se toca:

- Reservas
- Auth
- Worker
- Make
- Airtable
- Supabase
- Pagos
- Notificaciones
- Calendario

## Archivos de análisis generados

- AUDITORIA_31_MAPA_GALERIA_LINEAS_CP04.txt
- AUDITORIA_31_MAPA_GALERIA_FUNCIONES_CP04.txt
- AUDITORIA_31_RUTAS_VISUALES_ACTIVAS_CP04.txt

## Decisión esperada

Si la galería está poco acoplada, se extraerá primero como componente visual.

Si la galería está mezclada con lógica global, se hará extracción en dos pasos:

1. Datos visuales.
2. Componente visual.
