# Club Pádel 04 · Auditoría 27 · Estrategia segura de optimización bundle

## Estado

Estrategia de optimización segura preparada.

## Problema

El bundle principal supera el umbral recomendado de Vite:

- JS principal aproximado: 592 KB.
- Warning: Some chunks are larger than 500 kB after minification.

## Diagnóstico

La causa principal no parece ser un error, sino concentración de demasiada app en un único bundle:

- App.jsx concentra casi toda la aplicación.
- Traducciones embebidas.
- Módulos de torneos/ranking.
- Lógica de exportación.
- Módulos Admin/Soporte/Perfil cargados desde el inicio.
- Lógica de auth/roles y paneles técnicos.

## Estrategia recomendada por fases

### Fase 27A · Medición y documentación

Estado: completada.

- Medir dist.
- Medir App.jsx.
- Detectar componentes grandes.
- Confirmar build estable.

### Fase 27B · Optimización segura sin romper

Acciones recomendadas:

- Ajustar configuración de Vite/Rollup para dividir chunks básicos.
- Separar vendor React si procede.
- No tocar lógica de negocio todavía.
- Medir antes/después.

### Fase 27C · Code splitting por módulos

Solo si la Fase 27B no es suficiente:

- Cargar Admin bajo demanda.
- Cargar Soporte bajo demanda.
- Cargar Torneos bajo demanda.
- Cargar Ranking bajo demanda.
- Cargar Perfil bajo demanda.

### Fase 27D · Extracción estructural

Solo si sigue haciendo falta:

- Extraer traducciones a archivo separado.
- Extraer lógica de torneos.
- Extraer lógica de ranking.
- Extraer módulos de soporte/admin.

## Reglas de seguridad

- No romper App.jsx.
- No hacer refactor grande sin checkpoint.
- No borrar lógica.
- No eliminar traducciones.
- No eliminar módulos.
- Medir antes y después.
- Mantener build correcto.

## Primera optimización recomendada

Aplicar `manualChunks` en `vite.config.js` para separar dependencias principales.

Motivo:

- Es reversible.
- Es de bajo riesgo.
- No cambia la lógica de la app.
- Puede reducir o repartir el bundle inicial.
- Es adecuado antes de hacer code splitting real.

## Pendiente

- Revisar vite.config.js actual.
- Aplicar manualChunks controlado.
- Ejecutar build.
- Comparar dist antes/después.
- Guardar checkpoint.
