# 10 — Mejora 2.1: unificación visual definitiva del sidebar

Continuación de la Mejora 2 / cierre definitivo. No es un rediseño:
corrige el origen real de un borde/fondo rojizo que seguía apareciendo
en "Perfil y ajustes" y en el selector de idioma pese a las
correcciones de contraste ya aplicadas.

## Causa raíz (confirmada por lectura de código, no por suposición)

`src/cp04-legibility-polish.css` (líneas ~567-588, comentario "Cerrar
sesión más legible y menos plano") usaba el selector `.cp04-sidebar
button:last-child` para dar un tono rojizo diferenciado al botón
"Cerrar sesión". El problema: `:last-child` selecciona el último
elemento **entre los hermanos de su propio padre**, no "el último
botón visualmente en el sidebar".

Estructura real del DOM (`src/App.jsx`, componente `Sidebar`):

```
<nav>                          <- padre de los botones de navegación
  {navItems.map(...)}           navKeys termina con ["perfil", ...] —
</nav>                          Perfil es SIEMPRE el último <button>
                                 hijo de <nav> para cualquier rol
{onClearRole && <button .../>}  <- "Cerrar sesión" real, pero NO es
                                    el último hijo de .cp04-sidebar
                                    (le siguen el div del idioma y
                                    la Card de "modo seguro")
<div><LanguageSelector /></div> <- el trigger del selector de idioma
                                    es HIJO ÚNICO de este div cuando
                                    el desplegable está cerrado, por
                                    lo que también es :last-child de
                                    SU padre
<Card>...</Card>
```

Resultado real: `:last-child` coincidía con el botón **Perfil** (por
ser el último `<button>` de `<nav>`) y con el **trigger del selector
de idioma** (por ser hijo único de su `<div>`) — nunca con el botón
"Cerrar sesión" real, que era la intención original del comentario.

## Corrección aplicada

1. **`src/App.jsx`** (1 línea): el botón real de "Cerrar sesión" gana
   la clase `cp04-sidebar-logout-btn` (además de la ya existente
   `cp04-menu-button`) — puramente un gancho de CSS, sin tocar
   `onClick`, rutas ni lógica.
2. **`src/cp04-legibility-polish.css`** (2 bloques, 4 seletores):
   `.cp04-sidebar button:last-child` / `:last-child:hover` →
   `.cp04-sidebar button.cp04-sidebar-logout-btn` /
   `.cp04-sidebar-logout-btn:hover`.

Con este cambio, Perfil e idioma dejan de recibir cualquier regla
pensada para "Cerrar sesión" y usan exclusivamente sus propias reglas
(ya corregidas en el cierre anterior). El botón "Cerrar sesión" pasa a
recibir, por orden de cascada, el tratamiento **neutro** definido más
adelante en el mismo archivo (línea ~773, comentario "diferenciado
pero elegante, no rojo fuerte") en vez del tono rojizo más fuerte de
los bloques anteriores — ambos bloques ya existían; el cambio no
introduce ningún tono nuevo, solo corrige a qué elemento se aplican.

## Por qué es seguro

- Cambio de **una clase CSS añadida** + **cuatro selectores
  reescritos con la misma especificidad**. Cero cambios de
  `onClick`, `href`, rutas, `useEffect`, estado o llamadas a
  `auth.logout()`.
- La clase `cp04-sidebar-logout-btn` no existía antes en ningún sitio
  del código (verificado con `grep`), por lo que no puede chocar con
  ningún otro estilo o lógica existente.
- `npm test`: 1302/1302 sin cambios. `npm run build`: correcto.
  `localhost:5175`: 200.

## Resto de la auditoría de esta mejora (sin cambios adicionales necesarios)

- **Verdes/rojos secundarios**: repetido el barrido de `grep` sobre
  todos los archivos CSS + patrones `rgb`/nombres de color — no se
  encontraron más bordes/fondos/sombras rojizos fuera de: (a) el ya
  corregido arriba, y (b) usos legítimos con significado funcional
  claro (badge "Eliminada" en brackets de torneo, indicador de pista
  "Ocupado", variante `danger` del componente `Btn`) — todos ya usaban
  `T.danger`/`T.dangerText` o su equivalente antes de esta mejora.
- **Estados del sidebar** (normal/hover/active/selected/focus/pressed):
  revisados los 4 mecanismos existentes — reglas CSS por atributo
  (`[aria-current="page"]`), reglas CSS por clase (`.is-active`),
  estilo inline declarativo (`style={{...}}`) y estilo inline forzado
  vía manejadores de puntero (`.style.setProperty(..., "important")`)
  — todos ya coherentes tras el cierre anterior. No existe estado
  `disabled` en los botones de navegación del sidebar (no aplica).
  El foco de teclado (`:focus-visible`) usa el mismo anillo lima
  compartido (`outline: 3px solid rgba(182,255,0,.55)`) para todos
  los botones de la app, sidebar incluido.
- **Botones secundarios**: el componente compartido `Btn` (línea 519
  de `App.jsx`) ya centraliza `background`/`color`/`border`/
  `padding`/`border-radius`/tipografía/sombra para su variante
  `secondary` — donde se usa, la consistencia ya está garantizada por
  construcción. La variación de `border-radius` detectada en un
  barrido general (8px–28px, más `999px` para píldoras) corresponde a
  **categorías de componente distintas** (tarjetas, píldoras/badges,
  inputs, botones), no a botones secundarios inconsistentes entre sí
  — unificar esas categorías sería un rediseño de layout, fuera del
  alcance explícito de esta tarea.

## Validación

- `npm test`: 1302/1302, 0 fallos.
- `npm run lint`: mismos 4 errores + 1 warning preexistentes, 0 nuevos.
- `npm run build`: correcto.
- `localhost:5175`: 200.
- `git diff --stat`: 2 archivos (`App.jsx` 1 línea, `cp04-legibility-polish.css` 13 líneas).
- No se ha tocado `/root/cp04-landings`, Make, Airtable, autenticación ni rutas.
