# 03 — Auditoría visual de la aplicación

## Metodología y alcance honesto

Esta auditoría se basa en **lectura de código real** (`App.jsx`, 8499
líneas, y los CSS asociados) y **cálculo matemático de contraste WCAG**
— no en capturas de pantalla ni renderizado visual (sin herramienta de
automatización de navegador en este entorno). Es una auditoría
**dirigida y basada en evidencia** (colores hardcoded, patrones de
hover/estado, tokens), no una revisión visual exhaustiva pantalla por
pantalla de las ~30 áreas listadas — para eso hace falta la validación
física en tablet (ver doc. 08).

## Hallazgo principal: contraste ilegible en el ítem activo de la barra lateral

**Severidad: alta. Corregido en esta mejora (ver doc. 04).**

El botón de navegación activo de la barra lateral (`cp04-sidebar`) usaba
`color: "#ffffff"` sobre `background: "linear-gradient(135deg, #b6ff00 0%, #2df5a3 100%)"` —un degradado lima→menta, ambos colores muy claros.

Contraste WCAG calculado:

| Combinación | Ratio | Mínimo WCAG AA (texto normal) |
|---|---|---|
| Blanco sobre `#b6ff00` | **1.21** | 4.5 |
| Blanco sobre `#2df5a3` | **1.43** | 4.5 |
| `#05080d` (color de fondo de la propia app) sobre `#b6ff00` | 16.52 | 4.5 ✅ |
| `#05080d` sobre `#2df5a3` | 14.04 | 4.5 ✅ |

Encontrado en 9 ubicaciones dentro del mismo componente de barra
lateral (`App.jsx`): el estilo base del botón activo, y las 8
repeticiones del mismo par color/degradado en los manejadores
`onMouseEnter`/`onMouseOver`/`onMouseLeave`/`onPointerDown`/
`onMouseDown`/`onTouchStart` (código con bastante duplicación de
estilos inline, ver más abajo).

## Hallazgo relacionado: el mismo bug persiste en un caso específico (APLAZADO, no corregido)

`src/torcal-role-background.css` contiene reglas específicas para el
botón "Perfil" y el selector de idioma dentro del selector de
`body.cp04-role-screen-active` (pantalla de selección de rol/login),
todas con `!important` y comentarios `AUDITORIA 29 · FIX FINAL HOVER
PERFIL NO ROJO` / `REFUERZO FINAL ANTI-ROJO` — evidencia de que una
sesión anterior ya luchó extensamente contra un bug de "hover rojo" en
este mismo botón, dejando **múltiples capas defensivas superpuestas**.
Estas reglas fuerzan el mismo patrón `color: #ffffff` sobre el mismo
degradado lima/menta (líneas 276-338 y 358-377 del archivo).

**Decisión**: no se toca. Editar este archivo con seguridad requeriría
entender y probar las 4-5 capas de overrides ya existentes una por una
— excede "evidente/seguro/local" y tiene riesgo real de reintroducir el
bug de hover rojo que ya se corrigió antes. Documentado como mejora
futura dedicada (ver doc. 04).

## Colores inconsistentes (documentado, NO corregido — requiere decisión de paleta)

Recuento real de colores hardcoded en `App.jsx` (`grep` de valores
hexadecimales):

| Familia | Valores encontrados | Frecuencia |
|---|---|---|
| Verde/éxito | `#2df5a3`, `#4ade80`, `#34d399`, `#20e3b2`, `#31e89f` | 9, 4, 2, 2, 1 |
| Rojo/error | `#ff8b8b`, `#ff6b6b`, `#f87171`, `#ff5050`, `#ff5e3a` | 6, 3, 3, 1, 1 |
| Blanco (misma notación, dos formas) | `#fff` vs `#ffffff` | 17 vs 11 |

`src/theme.js` (el token oficial `T`) solo define **un** verde de acento
(`accent2: "#20e3b2"`) y **un** rojo (`danger: "#ff5e3a"`) — el resto de
variantes están hardcodeadas directamente en componentes puntuales de
`App.jsx`, sin pasar por el token compartido. Esto es una inconsistencia
real, pero **normalizarla implicaría tocar docenas de puntos dispersos
en un archivo de 8499 líneas** — clasificado como refactor grande,
explícitamente fuera de alcance de esta mejora (ver Fase 4 del
encargo: "no sustituyas masivamente colores... sin auditoría previa").

## Acento de marca — inconsistencia menor detectada

`src/theme.js` define `accent: "#b6ff00"` (rgb 182,255,0). `src/index.css`
usa `#a8ff00` (rgb 168,255,0) en `.cp04-lazy-fallback__dot` y su
`box-shadow` — un lima ligeramente distinto, probablemente sin intención
de diferenciarlo. Diferencia perceptual pequeña, severidad baja, no
corregida (fuera del alcance de "evidente y sin impacto" al no haber
podido verificar visualmente el efecto exacto).

## Tipografía de marca — no cargada (deliberado, documentado previamente)

`T.fontDisplay: "'Syne', sans-serif"` y `T.fontBody: "'DM Sans',
sans-serif"` se usan en cientos de puntos del código, pero **no existe
ningún `<link>` de Google Fonts ni `@font-face`** en `index.html` — se
confirmó la misma decisión ya documentada en
`projects/club-padel-04/landing/docs/README_LANDING_CLUB_PADEL_04.md`:
"evitado a propósito para no hacer llamadas externas en esta fase". La
app renderiza con la fuente `sans-serif` del sistema como fallback. No
es un bug: es una decisión de producto ya tomada y coherente en todo el
proyecto — documentada aquí como "activo pero mejorable", con la
recomendación de auto-alojar los `.woff2` (sin llamada externa) si se
quiere la tipografía de marca real.

## Accesibilidad — aspectos positivos confirmados

- **65 reglas `:focus`/`:focus-visible`** repartidas en las hojas de
  estilo — buena cobertura de navegación por teclado ya existente.
- Atributos `aria-current`, `aria-label`, `aria-expanded` presentes en
  los componentes de navegación revisados (sidebar, acordeón FAQ de la
  landing).

## Estilos inline repetidos (hallazgo de mantenibilidad, no visual)

El mismo bloque de estilo (fondo degradado + color + borde + sombra) se
repite **9 veces** de forma casi idéntica dentro del componente de
barra lateral, vía `element.style.setProperty(...)` en distintos
manejadores de eventos en lugar de una clase CSS o una función
compartida. No es un bug visual en sí mismo, pero es la causa de que el
mismo bug de contraste tuviera que corregirse en 9 sitios en vez de
uno. Se documenta como candidato a refactor (consolidar en una función
`applySidebarItemStyle(el, isActive)` o clase CSS), fuera de alcance de
esta mejora (sería un refactor, no una corrección puntual).

## No se encontraron

- Referencias visuales rotas.
- Overflow horizontal evidente en el código revisado (`overflow-x`
  aparece 2 veces, ambas como protección explícita, no como síntoma de
  un bug).
- Estados `disabled` con opacidad insuficiente para distinguirse
  visualmente (los pocos encontrados usan `opacity: .55`, diferenciable).
