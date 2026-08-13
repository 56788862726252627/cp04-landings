# Brand System · Club Pádel 04 (Landing)

Fuente de verdad: `src/theme.js` (CORE_THEME, usado ya por la app real — 488 usos en `App.jsx`) y `src/torcal-role-background.css`. Este documento traduce esos tokens a un sistema utilizable en Figma y en la landing, sin inventar una identidad nueva.

No es una propuesta de rediseño. Es la codificación del estilo que Club Pádel 04 ya tiene en producción, para que la landing se vea como una extensión de la app y no como una pieza de marketing genérica.

---

## 1. Colores principales

| Token | Hex | Uso |
|---|---|---|
| `bg` (fondo base) | `#05080d` | Fondo general de página, casi negro con matiz azulado frío |
| `surface` | `#0b111d` | Fondo de secciones/tarjetas nivel 1 |
| `surface2` | `#111a2b` | Fondo de tarjetas nivel 2 (hover, tarjetas destacadas) |
| `surface3` | `#18243a` | Fondo de tarjetas nivel 3 (elementos más elevados, badges) |
| `accent` (verde lima/neón) | `#b6ff00` | Color principal de marca. CTA primario, acentos, iconos activos, subrayados |
| `accent2` (verde-teal) | `#20e3b2` | Acento secundario. Gradientes con `accent`, iconos secundarios, estados de éxito |
| `primary` (azul) | `#2f6bff` | Uso puntual: enlaces técnicos, badges "Cloudflare/tecnología", nunca como CTA principal |
| `text` | `#ffffff` | Texto principal sobre fondo oscuro |
| `textDim` | `#9aa8bd` | Texto secundario, subtítulos, metadatos |
| `line` | `rgba(255,255,255,0.10)` | Bordes sutiles de tarjetas y separadores |
| `danger` | `#ff5e3a` | Solo estados de error/alerta, nunca decorativo |
| `warning` | `#ffad47` | Solo avisos, nunca decorativo |

Color de acento adicional visto en la app (login/CTAs): `#a8ff00` (verde lima ligeramente distinto al `accent` de `theme.js`). Tratar `#b6ff00` y `#a8ff00` como el mismo verde lima de marca; usar `#b6ff00` como referencia canónica en la landing porque es el token vivo en `theme.js`.

## 2. Fondos y gradientes

- **Fondo base de página:** `#05080d`, prácticamente negro. No usar negro puro (`#000000`).
- **Fondo hero:** imagen visual de marca (`torcal-padel-bg.png`, hero visual inspirado en Club Pádel 04 y El Torcal de Antequera — origen no confirmado como fotografía real, no etiquetar como foto real del club) con overlay degradado vertical oscuro para legibilidad de texto:
  `linear-gradient(180deg, rgba(2,6,23,0.38) 0%, rgba(2,6,23,0.58) 45%, rgba(5,8,13,0.85) 100%)` sobre la imagen (ajustado 2026-07: overlay aclarado respecto a versiones previas para que el fondo se vea más, manteniendo contraste AA razonable en la zona donde se apoya el texto).
  **Revisión de imagen (2026-07):** se exploraron candidatas locales en `fotos_club_padel_04/` (carpeta de descargas del usuario) para sustituir el hero por algo "más bonito". Todas las variantes de la misma escena (Torcal + pista al atardecer, incluida `Foto Torcal horizontal.png`) resultaron ser el mismo archivo o del mismo lote de generación que archivos `ChatGPT Image *.png` presentes en la misma carpeta — es decir, contenido generado, no fotografía verificable, y sin mejora real sobre la imagen ya en uso. Ninguna otra candidata (fotos de pista/recepción/interior) tenía resolución o encuadre horizontal adecuado para hero de ancho completo. Se mantuvo la imagen actual y se mejoró solo el overlay. Recomendación: si se quiere un hero claramente superior, encargar una fotografía real del club o una nueva imagen de marca generada específicamente en formato panorámico ancho.
  **Optimización de peso (2026-07, pulido SEO/performance):** se generó `torcal-padel-bg.webp` (mismo encuadre y contenido, calidad 88, ~210 KB frente a ~2,17 MB del PNG) servido vía `image-set()` en CSS con el PNG como fallback — no es una imagen nueva ni distinta, solo una versión comprimida del mismo recurso de marca.
- **Gradiente de marca (CTA, iconos, títulos destacados):** `linear-gradient(135deg, #b6ff00 0%, #20e3b2 100%)` — verde lima a verde-teal, diagonal.
- **Gradiente de tarjeta elevada:** `linear-gradient(135deg, rgba(8,13,25,0.46), rgba(8,13,25,0.28))` con `backdrop-filter: blur(6px)` cuando la tarjeta va sobre una imagen (patrón real usado en `.cp04-card` sobre el fondo Torcal).
- Nunca usar fondos blancos o muy claros en ninguna sección. Todo el scroll de la landing se mantiene en fondo oscuro.

## 3. Estilo de tarjetas

- Fondo: `surface` o `surface2`, radio de borde 16–20px.
- Borde: 1px `line` (`rgba(255,255,255,0.10)`), nunca borde de color sólido brillante.
- Sombra: sutil, difusa, oscura (`0 20px 40px rgba(0,0,0,0.35)`), no sombras de color.
- Hover: elevar ligeramente (`translateY(-4px)`), aclarar el borde a `rgba(182,255,0,0.35)` o añadir un resplandor (`box-shadow`) muy tenue en verde lima — sutil, no neón agresivo.
- Tarjetas de icono: icono dentro de un contenedor circular/redondeado con fondo `surface3` y el icono en `accent` o `accent2`.

## 4. Estilo de botones

- **CTA primario:** fondo sólido o gradiente `accent → accent2`, texto en `bg` (`#05080d`, oscuro sobre verde claro — no blanco sobre verde), radio de borde grande (999px/pill o 12px), peso de fuente alto.
- **CTA secundario:** fondo transparente, borde 1px `line` o `accent` al 40% de opacidad, texto en `text` blanco. Hover: borde pasa a `accent` sólido.
- **CTA terciario/enlace:** solo texto en `accent`, subrayado en hover.
- Nunca usar botones con fondo azul (`primary`) como CTA de conversión — el azul queda reservado para elementos técnicos/informativos.

## 5. Tipografías

Tokens ya definidos en `theme.js`:

- **Display / títulos:** `'Syne', sans-serif` — geométrica, con carácter, para H1/H2 y titulares de sección.
- **Cuerpo:** `'DM Sans', sans-serif` — para párrafos, botones, formularios, texto de UI.

Ambas son gratuitas en Google Fonts. Jerarquía sugerida:

| Elemento | Fuente | Peso | Tamaño (desktop) |
|---|---|---|---|
| H1 hero | Syne | 800 | 56–64px |
| H2 sección | Syne | 700 | 36–40px |
| H3 tarjeta | Syne | 600 | 20–22px |
| Cuerpo | DM Sans | 400 | 16–18px |
| Botón | DM Sans | 600 | 15–16px |
| Metadato/label | DM Sans | 500, uppercase, letter-spacing +0.08em | 12–13px |

## 6. Iconografía recomendada

Set de iconos lineales (estilo outline, 1.5–2px stroke), no iconos rellenos ni ilustraciones planas infantiles. Familias gratuitas compatibles: Lucide Icons, Phosphor Icons (outline).

Temas a cubrir:
- Pádel: pala/raqueta, pelota, pista (vista superior con red), marcador.
- Automatización: engranaje, rayo, flujo de conexión (nodos enlazados).
- Reservas: calendario, reloj, check circular.
- Ranking/torneos: trofeo, podio, medalla, cuadro de llaves (bracket).
- Gestión: panel/dashboard, usuarios, escudo (seguridad).
- Crecimiento/IA: gráfico ascendente, chip/circuito, sparkles muy discretos (no genéricos "magia IA").

Color de icono: `accent` o `accent2` sobre fondo `surface3`. Nunca icono multicolor tipo emoji.

## 7. Uso de imágenes

- Usar **fotografía real y distinta del club** (pistas, recepción, torneos, instalaciones) cuando exista. **Estado actual (corregido en QA de imágenes):** no hay todavía fotos reales y distintas disponibles en el repo — una versión anterior de la galería usaba 4 nombres de archivo que apuntaban al mismo binario duplicado, presentado como si fueran fotos diferentes; se eliminó. Mientras no existan fotos reales verificadas, la sección de galería debe mostrar un aviso honesto de "pendiente" (ver `README_LANDING_CLUB_PADEL_04.md` §4), nunca imágenes repetidas ni de stock.
- Nunca usar fotos de stock genéricas de pádel/tenis que no sean del club — rompe la promesa de "esto es real, no un mockup" que ya es el ángulo de venta validado (`audit/agency-growth-marketing-system/06_META_ADS_CREATIVE_COPY_LANDING.md`).
- Las imágenes reales siempre llevan overlay oscuro degradado para mantener contraste de texto (ver §2).
- Capturas de producto (si se añaden): usar capturas reales de la app (reservas, torneos, ranking), etiquetadas visiblemente como "Vista real de la app" — nunca mockups inventados.

## 8. Tono visual general

- SaaS deportivo premium, no una web municipal ni una landing "de plantilla".
- Oscuro, técnico, con un único acento de color vivo (verde lima) que dirige la mirada al CTA y a los datos clave.
- Espacios generosos, mucho aire entre secciones (padding vertical 96–140px en desktop).
- Contraste alto: fondo casi negro, texto blanco, un acento saturado. Nada de grises medios como protagonistas.
- Inspiración: dashboards SaaS B2B modernos (tipo Linear, Vercel, Stripe en modo oscuro) combinados con el hero visual de marca inspirado en el entorno del Torcal de Antequera (recurso visual no etiquetado como foto real, ver §2) para dar contexto humano/local sin perder seriedad.

## 9. Qué NO hacer visualmente

- No usar fondos blancos o de colores pastel.
- No usar iconos emoji ni ilustraciones tipo clip-art.
- No mezclar más de dos acentos de color saturados en una misma sección.
- No usar tipografías redondeadas "infantiles" (nada de estilo Comic/rounded playful).
- No usar stock photos genéricas de pádel que no sean del club real.
- No prometer visualmente (con badges, sellos, gráficas) datos que no existen — nada de "+500 clubes confían en nosotros" ni gráficas de resultados inventadas.
- No saturar de gradientes de colores distintos en una misma vista — un único gradiente de marca (verde lima → verde-teal) es suficiente.
- No usar sombras de color fuerte (glow morado/rosa tipo landing genérica de IA) — el resplandor, si existe, es siempre en tono verde lima muy sutil.
- No romper el contraste alto oscuro/claro con secciones intermedias en gris medio "neutro" — todo se mantiene en la escala de fondos definida en §2.
