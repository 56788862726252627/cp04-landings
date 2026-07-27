# 05 — Guía visual maestra V1 · Club Pádel 04

Cada punto indica su estado: **[CONFIRMADO]** (ya existe y se ha
verificado en el código), **[PROPUESTA]** (recomendación razonada, no
implementada), o **[PENDIENTE DE APROBACIÓN]** (requiere una decisión
humana antes de implementarse).

## 1. Logotipo oficial — [CONFIRMADO]

Insignia circular: fondo azul marino muy oscuro, fotografía de pista de
pádel al fondo, texto "CLUB PÁDEL" en blanco y "04" en verde lima,
"ANTEQUERA" en la base. Fuente: `docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png` (1536×1536).

## 2. Variante principal — [CONFIRMADO]

El logotipo circular completo (punto 1) es la única variante oficial
existente — usada en todos los iconos de la Mejora 1.

## 3. Variante simplificada recomendada — [PROPUESTA]

No existe todavía una versión simplificada (p. ej. solo el "04" en
lima, sin la fotografía de fondo) para contextos de tamaño muy pequeño
(16px) donde el detalle fotográfico se pierde (ver doc. 03, hallazgo de
legibilidad de Mejora 1). Se propone como mejora futura: un glifo
monocromo o de 2 colores basado en el "04", nunca inventado sin
aprobación humana explícita del propio logotipo.

## 4. Uso sobre fondo claro — [PENDIENTE DE APROBACIÓN]

El logotipo actual está diseñado para fondos oscuros (coincide con
`background_color`/`theme_color` `#05080d` del manifest). No existe
todavía una variante ni una regla probada para fondos claros — la app
es 100% tema oscuro (`color-scheme: dark` en `src/index.css`), por lo
que este caso no se ha necesitado aún. Si se necesita en el futuro
(p. ej. materiales impresos con fondo blanco), requiere una variante
del logotipo con más contraste, pendiente de decisión.

## 5. Uso sobre fondo oscuro — [CONFIRMADO]

Es el uso real y único ya validado: el logotipo se integra de forma
natural sobre `#05080d`/`#020617` (fondos de la app).

## 6. Tamaño mínimo recomendado — [PROPUESTA]

Basado en la comprobación real de legibilidad (doc. 03 de Mejora 1):
**32px** es el tamaño mínimo donde el "04" y la forma general siguen
siendo reconocibles; a 16px el detalle fotográfico se pierde (aceptado
como limitación conocida del favicon de pestaña).

## 7. Zona de seguridad — [CONFIRMADO]

Ya aplicada en la generación de iconos (Mejora 1): el logotipo se
inscribe al 86% del lienzo (tamaños ≥48px) o al 98% (tamaños ≤32px,
priorizando legibilidad), dejando un margen de fondo `#05080d`
alrededor — cumple la zona segura recomendada para iconos adaptables de
Android.

## 8. Usos incorrectos — [PROPUESTA]

No deformar el círculo (aspecto 1:1 siempre), no recortarlo en una
forma no circular distinta a la máscara del sistema operativo, no
recolorear el texto "04"/"CLUB PÁDEL", no superponer otros logotipos
encima, no usarlo sobre fondos que reduzcan el contraste del texto
blanco/lima del propio logotipo.

## 9. Icono de la aplicación — [CONFIRMADO]

13 tamaños PNG (16 a 512px) + `favicon.ico` + `apple-touch-icon.png` —
Mejora 1, validado físicamente en Android (Chrome + PWA instalada).

## 10. Favicon — [CONFIRMADO]

`favicon.ico` (16/32/48 multi-resolución) + PNG 16/32/192 vía `<link>`
en `index.html`. Rayo morado histórico (`favicon.svg`) conservado solo
como recurso interno, sin uso visual (ver doc. 02).

## 11. Iconos PWA — [CONFIRMADO]

13 tamaños en `public/icons/`, listados en `manifest.webmanifest`.

## 12. Iconos Android — [CONFIRMADO]

`icon-192.png`/`icon-512.png` con `purpose: "any maskable"` — validado
físicamente instalado en Android (Mejora 1).

## 13. Recomendaciones para iOS — [CONFIRMADO] + [PROPUESTA]

Confirmado: `apple-touch-icon` 180×180 (iPhone) y 152×152 (iPad), sin
transparencia (requisito de iOS). Propuesta pendiente: no se ha
verificado físicamente en un dispositivo iOS real (solo Android, según
el propio cierre de Mejora 1) — validación física en iOS queda como
pendiente explícito.

## 14. Paleta principal — [CONFIRMADO]

De `src/theme.js` (`T`):

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#05080d` | Fondo base de toda la app |
| `surface` / `surface2` / `surface3` | `#0b111d` / `#111a2b` / `#18243a` | Capas de superficie (tarjetas, paneles) |
| `accent` | `#b6ff00` | Acento de marca principal (lima) — coincide con el "04" del logo |
| `accent2` | `#20e3b2` | Acento secundario (menta/teal) |
| `primary` | `#2f6bff` | Azul, uso puntual |
| `text` | `#ffffff` | Texto principal |
| `textDim` | `#9aa8bd` | Texto secundario |
| `line` | `rgba(255,255,255,.10)` | Bordes sutiles |

## 15. Paleta secundaria — [PROPUESTA]

No existe una paleta secundaria formal separada — `accent2` (`#20e3b2`)
y `primary` (`#2f6bff`) cumplen ese rol de facto. Se propone
formalizarlos explícitamente como "paleta secundaria" en una futura
revisión de `theme.js`.

## 16. Colores de éxito — [PENDIENTE DE APROBACIÓN]

**No hay un color de éxito único definido en `theme.js`.** En la
práctica se usan indistintamente `#2df5a3`, `#4ade80`, `#34d399`,
`#20e3b2` (`T.accent2`), `#31e89f` (ver doc. 03) — inconsistencia real
documentada, no corregida en esta mejora. **Recomendación**: adoptar
`T.accent2` (`#20e3b2`) como único color de éxito oficial y normalizar
el resto en una mejora futura dedicada.

## 17. Colores de advertencia — [CONFIRMADO]

`T.warning: "#ffad47"` — usado consistentemente donde aparece.

## 18. Colores de error — [PENDIENTE DE APROBACIÓN]

**Mismo problema que el punto 16**: `T.danger: "#ff5e3a"` es el token
oficial, pero conviven `#ff8b8b`, `#ff6b6b`, `#f87171`, `#ff5050` sin
normalizar. Recomendación: adoptar `T.danger` como único rojo oficial.

## 19. Colores informativos — [PROPUESTA]

`T.primary` (`#2f6bff`) cumple este rol de facto pero no está declarado
explícitamente como "color informativo" — se propone formalizarlo.

## 20. Colores desactivados — [CONFIRMADO]

Uso de `opacity: .55` sobre el color base para estados `disabled` (ver
doc. 03) — patrón consistente donde se comprobó.

## 21. Tipografía principal — [CONFIRMADO] + nota

`T.fontDisplay: "'Syne', sans-serif"` — declarada y usada en cientos de
puntos, pero **no cargada** (sin `@font-face`/Google Fonts) — fallback
real a la fuente sans-serif del sistema. Decisión deliberada
documentada (evitar llamadas externas).

## 22. Tipografías alternativas — [CONFIRMADO] + nota

`T.fontBody: "'DM Sans', sans-serif"` — mismo caso que el punto 21.

## 23. Jerarquía de títulos y textos — [PROPUESTA]

No existe una escala tipográfica formal documentada (tamaños de h1-h6,
párrafo, caption) — se usan valores `clamp()` puntuales por componente
en `App.jsx`. Se propone extraer una escala oficial en una mejora
futura, sin tocar ahora los tamaños ya usados.

## 24. Botones — [CONFIRMADO] + hallazgo

Estilo de botón activo/CTA: degradado `linear-gradient(135deg, #b6ff00 0%, #2df5a3 100%)` con texto oscuro (`#05080d`/`#06100a`, tras la corrección de esta mejora) — patrón repetido de forma consistente tras la corrección de contraste (doc. 04).

## 25. Formularios — [CONFIRMADO]

65 reglas `:focus`/`:focus-visible` ya cubren estados de foco en
formularios — buena base de accesibilidad existente.

## 26. Tarjetas — [CONFIRMADO]

Clase `.cp04-card` con fondo semitransparente + `backdrop-filter: blur()` — patrón consistente en toda la app (login, módulos internos).

## 27. Navegación — [CONFIRMADO] + corregido

Barra lateral (`cp04-sidebar`) con ítem activo en degradado lima/menta —
contraste de texto corregido en esta mejora (doc. 04).

## 28. Iconografía — [CONFIRMADO]

Uso extensivo de emoji Unicode como iconos (🎾💬📋⚠️📉🔐🧩🛡️👁️, etc.) en
vez de un set de iconos SVG propio — funcional y sin dependencias
externas, pero sin tamaño ni estilo unificado formalmente documentado.

## 29. Fondos — [CONFIRMADO] + optimizado

4 fondos internos por rol/módulo (Torcal, admin, reservas, general),
ahora servidos en WebP con fallback PNG (doc. 04).

## 30. Reglas de contraste — [PROPUESTA]

Se propone adoptar formalmente como regla de equipo: "ningún texto
sobre un fondo con luminancia >0.5 debe usar `color: #ffffff` — usar
`T.bg` (`#05080d`) en su lugar", exactamente el criterio aplicado en la
corrección de esta mejora.

## 31. Aplicación en móvil — [PENDIENTE — ver doc. 08]

No hay bugs de overflow evidentes detectados en el código (doc. 03),
pero requiere confirmación visual física (checklist en doc. 08).

## 32. Aplicación en tablet — [PENDIENTE — ver doc. 08]

Mismo caso que el punto 31 — es precisamente el dispositivo que el
usuario ya está usando para validar Mejora 1/2.

## 33. Aplicación en ordenador — [PENDIENTE — ver doc. 08]

No verificado visualmente en esta sesión (sin herramienta de
navegador).

## 34. Compatibilidad prevista con Android — [CONFIRMADO]

Validado físicamente en Mejora 1 (icono visible tras instalar la PWA).

## 35. Compatibilidad prevista con iOS — [PROPUESTA, no validado]

Iconos generados correctamente (180/152px, opacos) pero sin validación
física en un dispositivo iOS real.

## 36. Compatibilidad PWA — [CONFIRMADO]

`manifest.webmanifest` completo y válido, `display: standalone`,
iconos maskable, `start_url`/`scope` configurados — validado en Mejora 1.

## 37. Material comercial y redes sociales — [CONFIRMADO] + [PROPUESTA]

Confirmado: `og-image.svg` conectado (Open Graph/Twitter Card/JSON-LD).
Propuesta: el sprite `public/icons.svg` (iconos sociales tipo Bluesky)
existe pero no está conectado a ninguna función de compartir — decisión
pendiente sobre si se implementa esa función o se archiva el sprite
(ver doc. 02).
