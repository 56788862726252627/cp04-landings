# README · Landing Club Pádel 04

Punto de entrada único de todo lo relacionado con la landing de Club Pádel 04. Todo vive dentro de `projects/club-padel-04/landing/` para mantenerlo separado de cualquier otro negocio o proyecto futuro (ver §6).

---

## 1. Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Sistema visual (colores, tipografía, tarjetas, botones, reglas de qué NO hacer) | `../figma/BRAND_SYSTEM_CLUB_PADEL_04.md` |
| Especificación para recrear el diseño en Figma gratis | `../figma/FIGMA_LANDING_SPEC_CLUB_PADEL_04.md` |
| Copy completo de la landing (hero, secciones, FAQ, formulario) | `../copy/LANDING_COPY_CLUB_PADEL_04.md` |
| Código implementado — versión estática (HTML/CSS/JS, sin dependencias) | `./index.html`, `./styles.css`, `./main.js` (esta carpeta) |
| Código implementado — versión componente React (para integrar en la app más adelante) | `./LandingClubPadel04.jsx` |
| Imagen de fondo del hero (`torcal-padel-bg.png`, con versión optimizada `torcal-padel-bg.webp`) + vista previa social (`og-image.jpg`) + iconografía (`favicon.svg`, `og-image.svg` sin usar) | `../assets/images/` |
| Exports futuros desde Figma (SVG/PNG de iconos, capturas del diseño) | `../exports/` (vacía por ahora, ver §5) |

## 2. Cómo ver la landing ahora mismo (sin build, sin deploy)

La versión estática no necesita `npm install` ni build. Basta con servirla como archivos estáticos, por ejemplo:

```bash
cd projects/club-padel-04/landing
python3 -m http.server 8080
# abrir http://localhost:8080/src/index.html
```

Se ha verificado que `index.html`, `styles.css`, `main.js` y las imágenes referenciadas actualmente en `../assets/images/` (`torcal-padel-bg.png`, `torcal-padel-bg.webp`, `og-image.jpg`, `favicon.svg`) responden `200` servidos así.

**Corrección de honestidad visual (QA de imágenes, ver §4):** la sección de galería (pistas/recepción/torneos) usaba `pistas.jpg`, `recepcion.jpg`, `torneos.jpg` e `instalaciones.jpg` — las 4 eran el mismo archivo binario duplicado (mismo MD5), presentado con captions distintos como si fueran fotos reales diferentes. Se detectó en auditoría QA y se corrigió: los 4 archivos se eliminaron y la sección de galería en `index.html` se sustituyó por un bloque honesto ("Galería pendiente de fotos reales del club") hasta que existan fotografías propias y distintas que publicar.

## 3. Cómo replicar/editar la landing

1. **Diseño:** abrir `../figma/FIGMA_LANDING_SPEC_CLUB_PADEL_04.md`, crear un archivo de Figma gratis, seguir la spec sección por sección usando los tokens de `BRAND_SYSTEM_CLUB_PADEL_04.md`.
2. **Copy:** cualquier cambio de texto se edita primero en `../copy/LANDING_COPY_CLUB_PADEL_04.md` (fuente de verdad) y luego se replica en `index.html` y en `LandingClubPadel04.jsx` para que ambas versiones no diverjan.
3. **Código:** editar `styles.css` para cambios visuales (usa las variables CSS de `:root`, ya alineadas con `src/theme.js` de la app real — no inventar colores nuevos sin actualizar también el Brand System).

## 4. Qué falta para publicarla (checklist honesto)

- [ ] **Fotos reales del club:** la sección de galería (pistas/recepción/torneos) no tiene todavía fotografía propia y distinta que mostrar — se corrigió un defecto donde 4 nombres de archivo apuntaban al mismo binario duplicado, presentado como si fueran fotos distintas. Ahora mismo esa sección muestra un aviso honesto de "pendiente" en vez de imágenes falsas. Sustituir por fotos reales en cuanto estén disponibles (ver `../assets/images/`, sección vacía de fotos de galería). **Hallazgo (2026-07, mejora 4B):** en `/sdcard/Download/fotos_club_padel_04/` del usuario existen 5 imágenes distintas entre sí (`pistas.png`, `recepcion.png`, `cafeteria.png`, `torneos.png`, `instalaciones.png`) — no forman parte de este PR (fuera del alcance de la mejora de hero), pero son candidatas fuertes para resolver este pendiente de galería en una tarea dedicada. Su origen tampoco está confirmado como fotografía real (misma carpeta contiene archivos `ChatGPT Image *.png` del mismo lote) — habría que documentarlas igualmente como recurso visual de marca, no como foto real, salvo confirmación en contrario.
- [x] **Imagen de fondo del hero (`torcal-padel-bg.png`) — documentada correctamente y overlay mejorado (2026-07, mejora 4B):** su origen no está confirmado como fotografía real (sin metadatos EXIF/cámara al inspeccionarla; confirmado además que pertenece al mismo lote de generación que los archivos `ChatGPT Image *.png` de la carpeta de descargas del usuario). Se corrigió toda la documentación (`BRAND_SYSTEM_CLUB_PADEL_04.md`, `FIGMA_LANDING_SPEC_CLUB_PADEL_04.md`) para tratarla como **imagen visual de marca / recurso visual hero**, nunca como "foto real del club". Se evaluaron candidatas locales para sustituirla (ver Brand System §2) y ninguna resultó una mejora clara y segura, así que se mantuvo la misma imagen y se aclaró el overlay (`0.38/0.58/0.85` en vez de `0.55/0.68/0.94`) para que el fondo se vea más sin perder legibilidad. Pendiente, si se quiere fotografía auténtica o un hero claramente superior: sustituir por una foto real verificada del club, o encargar una imagen de marca nueva en formato panorámico ancho.
- [x] **Pulido responsive/tablet (2026-07):** corregido `.section` sin `scroll-margin-top` (los enlaces del nav sticky tapaban el inicio de cada sección al navegar por anclas); añadido nivel de espaciado intermedio para tablet (781–1024px) en `.section`, `.hero` y `.hero__content`, que antes heredaban valores de escritorio y dejaban demasiado aire vertical; aumentado `max-height` del panel FAQ abierto (200px → 280px) para no recortar respuestas largas en pantallas estrechas. Sin cambios de estructura ni de contenido.
- [x] **Accesibilidad FAQ (2026-07):** los 6 botones del acordeón ahora gestionan `aria-expanded` (true/false) igual que el toggle del menú móvil, en `index.html`, `main.js` y `LandingClubPadel04.jsx`.
- [x] **Rendimiento del hero (2026-07, pulido SEO/performance):** generado `torcal-padel-bg.webp` (calidad 88, `cwebp`) a partir del mismo `torcal-padel-bg.png`, sin sustituir la imagen ni cambiar el encuadre — mismo contenido, ~210 KB frente a ~2,17 MB del PNG (reducción del 90%, sin pérdida perceptible verificada visualmente). `styles.css` sirve el WebP vía `image-set()` con el PNG como fallback universal si el navegador no soporta `image-set()` o WebP; se quitó el `style` inline de `index.html` (bloqueaba el fallback CSS por especificidad) — el overlay y la visibilidad del fondo no cambian.
- [x] **`og:image` conectado (2026-07):** generado `og-image.jpg` (1200×630, recorte centrado del mismo `torcal-padel-bg.png`, sin foto nueva) y añadidas las etiquetas `og:title`, `og:description`, `og:image`, `og:type`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` en `index.html`. **Importante:** las URLs de imagen son rutas relativas (no hay dominio real todavía) — antes de publicar, convertir a URL absoluta y validar el resultado real en un validador externo (Facebook Sharing Debugger, Twitter Card Validator, LinkedIn Post Inspector), porque no se puede verificar la vista previa real desde este entorno de terminal. El `og-image.svg` original queda en `../assets/images/` sin usar (SVG no está soportado de forma fiable como `og:image` por la mayoría de plataformas) — se puede eliminar en una tarea futura si se confirma que no hace falta.
- [ ] **Fuentes reales:** Syne y DM Sans no están enlazadas (evitado a propósito para no hacer llamadas externas en esta fase). Añadir el `<link>` gratuito de Google Fonts, o auto-alojar los `.woff2`, antes de un despliegue real.
- [ ] **Formulario de contacto:** actualmente sin backend (detalle interno; el copy público ya no expone "sin backend" — ver §4 de `LANDING_COPY_CLUB_PADEL_04.md`, nota de honestidad comercial, sección "Formulario de contacto" corregida a "Solicitud preparada para diagnóstico"). El botón "Solicitar demo" está deshabilitado a propósito en la versión estática y el `submit` está interceptado (`preventDefault`) en ambas versiones. Falta decidir destino (Airtable/CRM, email, endpoint propio) y conectar — no se ha tocado Make/Airtable/Stripe/WhatsApp en esta tarea, según restricción explícita.
- [ ] **Integración en la app real:** `LandingClubPadel04.jsx` no está importado en `src/App.jsx` ni enrutado. Falta decidir si la landing vive en un dominio/ruta separada de la app (recomendado, para no mezclar marketing con producto autenticado) o dentro del mismo proyecto Vite.
- [ ] **Dominio y hosting:** sin deploy todavía. Cloudflare Pages es la opción gratuita ya usada por el resto del proyecto (`deploy-pages/` en la raíz del repo) — candidato natural cuando se autorice el deploy.
- [ ] **Diseño real en Figma:** la spec está escrita pero el archivo de Figma en sí no se ha creado todavía (requiere acción manual del usuario en figma.com, gratis).
- [ ] **Exports de iconos/capturas:** `../exports/` está vacía; se rellenará al maquetar en Figma.
- [ ] **Analítica/tracking:** deliberadamente no incluida (cero llamadas externas en esta fase). Añadir solo si se decide y con una herramienta gratuita compatible con RGPD.

## 5. Carpeta `exports/`

Reservada para cuando el diseño se maquete en Figma: exportar ahí los SVG de iconos definitivos y capturas de pantalla del diseño aprobado, en subcarpetas `icons/` y `screenshots/`. Vacía intencionalmente por ahora.

## 6. Cómo mantener Club Pádel 04 separado de futuros negocios

- Todo lo de Club Pádel 04 vive exclusivamente bajo `projects/club-padel-04/` y `drive-export/club-padel-04/`.
- Un negocio nuevo (p. ej. una clínica dental) debe crear su propia carpeta hermana `projects/<nombre-negocio>/` con la misma estructura interna (`landing/figma/`, `landing/copy/`, `landing/src/`, etc.), nunca reutilizar ni mezclar archivos dentro de `club-padel-04/`.
- Los sistemas ya existentes de plantillas replicables (`projects/templates/negocio-replicable/`, `docs/agencia-ia/replicacion/`, `drive-export/templates/`) son la base genérica para replicar a otros sectores — esta carpeta (`club-padel-04/`) es la instancia ya concretada para el pádel y no debe usarse como plantilla genérica sin generalizar antes sus referencias específicas (fotos del club, precios de pádel, textos de "pistas"/"jugadores").
- Si en el futuro se generaliza esta landing como plantilla para otros sectores, el trabajo de generalización debe hacerse en `projects/templates/negocio-replicable/`, no editando esta carpeta.

## 7. Cómo copiar esto a Google Drive

Ver `drive-export/club-padel-04/README_EXPORT_CLUB_PADEL_04.md` para el detalle completo de qué copiar y cómo organizarlo. Resumen rápido: la carpeta `drive-export/club-padel-04/landing/` ya contiene copias de los documentos de esta carpeta (`figma/`, `copy/`) listas para subir manualmente a Drive; el código (`src/`, `assets/`) se mantiene solo en GitHub, no se duplica en Drive.
