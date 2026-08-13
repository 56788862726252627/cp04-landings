# Club Pádel 04 · Auditoría 27 · Diagnóstico causas bundle pesado

## Estado

Diagnóstico de causas del bundle preparado.

## Problema observado

Vite avisa:

Some chunks are larger than 500 kB after minification.

El build funciona correctamente, pero el JS principal supera el umbral recomendado.

## Causas probables

### 1 · App.jsx demasiado grande

Gran parte de la aplicación vive dentro de un único archivo:

- componentes principales
- módulos de reservas
- módulos de torneos
- ranking
- soporte
- perfil
- administración
- gestión
- textos/traducciones
- lógica de navegación
- lógica de roles
- lógica de auth demo/preparada

### 2 · Traducciones embebidas

Las traducciones en varios idiomas aumentan mucho el tamaño del bundle inicial.

### 3 · Módulo torneos/ranking

La lógica de torneos, parejas, bracket, sorteos, exportación y ranking añade peso al JS principal.

### 4 · Módulos no críticos cargados desde el inicio

Admin, soporte, torneos, ranking y perfil podrían cargarse bajo demanda en una fase futura.

## Recomendación segura

No aplicar una refactorización agresiva todavía.

Primero preparar una estrategia gradual:

1. Mantener build estable.
2. Extraer datos/traducciones si es seguro.
3. Extraer módulos grandes si es seguro.
4. Valorar React.lazy/Suspense.
5. Medir antes y después.
6. Guardar checkpoints por cada cambio.

## Estado

Diagnóstico creado. Pendiente estrategia de optimización segura.
