# Club Pádel 04 · Auditoría 30 · Check inicial bundle JS

## Objetivo

Diagnosticar el peso del bundle principal antes de aplicar code splitting.

## Estado inicial

La Auditoría 29 terminó correctamente con optimización WebP, pero Vite sigue avisando de chunk JS mayor de 500 KB.

## Reglas de esta fase

- No se elimina funcionalidad.
- No se cambia diseño.
- No se toca backend.
- No se hace deploy.
- No se hace commit.
- Solo se mide, documenta y prepara la estrategia.

## Archivos revisados

- src/App.jsx
- src/main.jsx
- src/index.css
- src/cp04-legibility-polish.css
- package.json
- vite.config.js

## Próximo paso

Identificar qué partes de App.jsx conviene separar en módulos seguros:

- Datos estáticos / traducciones.
- Componentes grandes de vistas.
- Módulos de torneos.
- Módulos de ranking.
- Módulos de centro técnico.
- Módulos de perfil.
- Helpers reutilizables.

## Riesgo

Bajo en esta fase porque no se modifica lógica funcional.
