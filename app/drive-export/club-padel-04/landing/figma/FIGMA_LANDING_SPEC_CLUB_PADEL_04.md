# Especificación Figma · Landing Club Pádel 04

Instrucciones para recrear esta landing en **Figma gratis** (plan Starter, sin coste). Usa como base de color/tipografía el documento `BRAND_SYSTEM_CLUB_PADEL_04.md` de esta misma carpeta — no dupliques valores, referencia ese archivo como fuente de verdad.

---

## 1. Setup inicial en Figma (gratis)

1. Crear archivo nuevo → "Design file".
2. Crear página `Landing / Desktop`, `Landing / Tablet`, `Landing / Mobile`.
3. Instalar plugin gratuito **Google Fonts** (o subir manualmente `Syne` y `DM Sans` desde fonts.google.com, ambas gratuitas) para que estén disponibles en el archivo.
4. Crear estilos locales (Local styles) de color con los 12 tokens de `BRAND_SYSTEM_CLUB_PADEL_04.md` §1, nombrados exactamente igual (`bg`, `surface`, `accent`, `accent2`, `primary`, `text`, `textDim`, `line`, `danger`, `warning`) para que cualquier persona que abra el archivo entienda que son los mismos tokens que usa la app real, no colores nuevos inventados.
5. Crear estilos de texto: `H1/Hero`, `H2/Section`, `H3/Card`, `Body`, `Button`, `Label` según la tabla de tipografía del Brand System §5.

## 2. Paleta visual (resumen rápido)

Fondo `#05080d` → tarjetas `#0b111d`/`#111a2b` → acento `#b6ff00` (verde lima) + `#20e3b2` (verde-teal) → texto blanco `#ffffff` / gris azulado `#9aa8bd`. Ver detalle completo en Brand System §1-§2.

## 3. Grid y breakpoints

| Breakpoint | Ancho de frame | Columnas | Gutter | Margen lateral |
|---|---|---|---|---|
| Desktop | 1440px | 12 | 24px | 80px |
| Tablet | 834px | 8 | 20px | 40px |
| Mobile | 390px | 4 | 16px | 20px |

Altura de sección variable según contenido; usar Auto Layout en todos los frames de sección (nunca posiciones absolutas fijas) para que el spec sea directamente traducible a CSS Flexbox/Grid.

## 4. Secciones de la landing (orden final)

1. **Header/Nav** — fijo, fondo `bg` con opacidad 90% + blur al hacer scroll. Logo Club Pádel 04 (icono `favicon.svg` + wordmark) a la izquierda; enlaces "Producto / Cómo funciona / Precios / FAQ" al centro-derecha; CTA "Solicitar demo" (botón primario) a la derecha.
2. **Hero** — full-width, imagen visual de marca de fondo (`torcal-padel-bg.png`, recurso visual hero, no etiquetado como foto real — ver Brand System §2) con overlay oscuro degradado (Brand System §2). Título H1 (Syne 800, 56–64px), subtítulo (DM Sans, `textDim`), dos CTA (primario "Solicitar demo" + secundario "Ver cómo funciona"), badge pequeño de credibilidad ("Sistema en producción real, no un prototipo").
3. **Problema** — fondo `bg` sólido. Título H2 + 4 tarjetas en fila (desktop) / columna (mobile) con icono + texto corto, cada una un punto de dolor (WhatsApp, Excel, dobles reservas, cero visibilidad).
4. **Solución / Producto** — fondo `surface`. Título H2 + grid de 3 columnas con capturas o mockups de módulos reales (reservas, torneos, ranking) enmarcados en un "browser frame" oscuro con barra superior de 3 puntos, para señalar "esto es producto real, no ilustración".
5. **Beneficios** — fondo `bg`. Tres columnas: "Para propietarios / Para empleados / Para jugadores", cada una con 3-4 bullets con icono check en `accent`.
6. **Cómo está construido (autoridad técnica)** — fondo `surface`. 4 tarjetas pequeñas: "Autenticación real", "Roles por persona", "Arquitectura auditada", "Backups y checkpoints". Tono sobrio, sin exagerar.
7. **Proceso de trabajo** — fondo `bg`. Timeline horizontal (desktop) / vertical (mobile) de 4 pasos con número grande en `accent` + título + descripción corta (basado en el cronograma real: preparación, configuración, demo/formación, puesta en marcha).
8. **Demo** — fondo `surface2`, tarjeta destacada centrada con borde en `accent` al 30%. Texto "Demo segura con datos ficticios, sin pagos reales" + CTA "Acceder a la demo".
9. **Precios** — fondo `bg`. 2 tarjetas lado a lado (no 3, para reflejar la estructura real de pricing: Piloto / Estándar), tarjeta "Piloto" destacada con badge "Precio de lanzamiento" y borde `accent`. Ver copy exacto en `LANDING_COPY_CLUB_PADEL_04.md`.
10. **Confianza / transparencia** — fondo `surface`. Bloque corto "Qué incluye hoy / Qué no incluye todavía" en dos columnas con check (`accent2`) y guion neutro (`textDim`) respectivamente — nunca una X roja agresiva, mantener tono de transparencia, no de carencia.
11. **FAQ** — fondo `bg`. Acordeón vertical, 6 preguntas, icono `+`/`−` en `accent`.
12. **CTA final** — fondo con gradiente de marca sutil sobre `surface3`, título corto + botón primario grande + subtítulo de baja fricción ("Sin compromiso. Respuesta en menos de 24h.").
13. **Footer** — fondo `bg`, borde superior `line`. Logo + enlaces legales mínimos + nota de que es un proyecto de Agencia IA (sin exponer proveedores internos).

## 5. Componentes a construir en Figma (Component set)

- `Button/Primary`, `Button/Secondary`, `Button/Ghost` (estados: default, hover, focus).
- `Card/Benefit` (icono + título + texto).
- `Card/Pricing` (título plan, precio setup, precio mensual, lista de incluye, CTA) — variantes `default` y `featured`.
- `Badge/Label` (pill pequeño, ej. "Precio de lanzamiento", "Demo gratuita").
- `Accordion/FAQ-Item` (estado abierto/cerrado).
- `Nav/Header`.
- `Icon/*` — importar set outline (Lucide/Phosphor vía plugin gratuito de Figma) y reencuadrar en `Icon/Padel`, `Icon/Automation`, `Icon/Booking`, `Icon/Ranking`, `Icon/Management`, `Icon/Growth`.

Construir cada componente con Auto Layout + Variants, no capas sueltas, para que el traspaso a código (React/CSS) sea directo.

## 6. Layout responsive — reglas clave

- **Desktop (1440):** secciones con contenido centrado a 1120px de ancho máximo; grids de 3-4 columnas.
- **Tablet (834):** grids de 3→2 columnas; hero mantiene imagen de fondo pero reduce altura; nav colapsa enlaces centrales bajo un menú si no caben.
- **Mobile (390):** todo a 1 columna; CTA del hero se apilan verticalmente y ocupan 100% de ancho; tabla de precios pasa de 2 columnas a tarjetas apiladas; timeline de proceso pasa a vertical; nav colapsa a menú hamburguesa con panel a pantalla completa en `bg`.

## 7. Estilo visual premium — checklist antes de dar por cerrado el diseño en Figma

- [ ] Ningún fondo blanco ni gris claro en ninguna sección.
- [ ] Un único gradiente de marca reutilizado (no gradientes distintos por sección).
- [ ] Toda tarjeta con borde `line` sutil, ninguna con borde de color sólido brillante salvo estado hover/featured.
- [ ] Tipografía Syne solo en titulares, nunca en párrafos largos.
- [ ] Imágenes reales del club, no stock genérico.
- [ ] Ninguna cifra de resultado de cliente inventada (0 clientes reales hoy — ver regla de honestidad en `LANDING_COPY_CLUB_PADEL_04.md`).
- [ ] Espaciado vertical entre secciones consistente (no secciones "apretadas").
- [ ] Contraste de texto verificado (blanco/gris claro sobre fondo oscuro, nunca texto oscuro sobre imagen sin overlay).

## 8. Inspiración SaaS (referencia de composición, no de color)

Referencia de estructura y densidad de información (no de paleta, que ya está definida): landings B2B SaaS en modo oscuro con hero de producto, secciones de beneficios en grid, y bloque de precios con tarjeta destacada. Usar como referencia de *composición y jerarquía*, adaptando siempre a la paleta e imágenes reales de Club Pádel 04 — el objetivo es que la landing se sienta como parte de la misma marca que la app, no como una plantilla intercambiable.

## 9. De Figma a código

Una vez maquetado en Figma:
1. Exportar tokens de color/tipografía como referencia (no hay integración automática gratuita fiable Figma→React sin plugins de pago; hacerlo manual es suficiente aquí).
2. Exportar imágenes/iconos usados como SVG/PNG a `projects/club-padel-04/landing/exports/`.
3. Usar `projects/club-padel-04/landing/src/index.html` (ya implementado, ver `README_LANDING_CLUB_PADEL_04.md`) como referencia de implementación 1:1 de esta spec — ya sigue esta estructura de secciones y esta paleta.
