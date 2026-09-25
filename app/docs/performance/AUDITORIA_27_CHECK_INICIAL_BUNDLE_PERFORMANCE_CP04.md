# Club Pádel 04 · Auditoría 27 · Check inicial bundle/performance

## Objetivo

Revisar el warning recurrente de Vite:

Some chunks are larger than 500 kB after minification.

## Estado de partida

- Auditoría 26 cerrada.
- Estructura predeploy limpia.
- Build correcto.
- Bundle principal supera 500 kB.
- App estable.

## Validaciones realizadas

- Build de control.
- Tamaño de dist.
- Archivos de dist ordenados por tamaño.
- Tamaño de App.jsx.
- Importaciones principales.
- Componentes principales.
- Bloques potencialmente pesados.

## Regla

No romper la app.

No aplicar code splitting todavía sin informe previo.

## Pendiente

- Crear diagnóstico de causas.
- Definir estrategia segura de optimización.
- Preparar cambios graduales si procede.
- Mantener build estable.
