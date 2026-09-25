# PLAN FUTURO · Configuracion real SaaS deportivo

## Objetivo

Preparar la futura conversion de Club Padel 04 en una app configurable por cliente sin duplicar App.jsx ni App.css.

## Archivos futuros recomendados

Cuando se pase de documentacion a implementacion, se podrian crear archivos como:

- src/config/client.config.js
- src/config/sport.config.js
- src/config/theme.config.js
- src/config/modules.config.js
- src/config/automations.config.js
- src/config/pricing.config.js

## Orden recomendado

No hacerlo todo de golpe.

Orden seguro:

1. Crear carpeta src/config.
2. Extraer solo datos de marca.
3. Extraer textos basicos.
4. Extraer modulos activos.
5. Extraer deporte y terminos.
6. Extraer automatizaciones.
7. Probar build en cada paso.
8. Commit por cada bloque estable.

## Riesgos

Riesgos principales:

- romper App.jsx
- duplicar logica
- mezclar datos de cliente con codigo
- hacer refactor demasiado grande
- tocar CSS delicado
- cambiar demasiado sin pruebas

## Regla de implementacion futura

Cada cambio real debe cumplir:

- backup previo
- cambio pequeño
- build correcto
- revision visual
- commit estable

## Decision actual

En Auditoria 32 Parte 3 solo se documenta la configuracion conceptual. No se implementan todavia archivos config reales.
