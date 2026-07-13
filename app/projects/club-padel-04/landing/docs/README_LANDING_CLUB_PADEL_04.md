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
| Imágenes reutilizadas del club (copiadas desde `public/gallery/cp04/` y `public/images/`) | `../assets/images/` |
| Exports futuros desde Figma (SVG/PNG de iconos, capturas del diseño) | `../exports/` (vacía por ahora, ver §5) |

## 2. Cómo ver la landing ahora mismo (sin build, sin deploy)

La versión estática no necesita `npm install` ni build. Basta con servirla como archivos estáticos, por ejemplo:

```bash
cd projects/club-padel-04/landing
python3 -m http.server 8080
# abrir http://localhost:8080/src/index.html
```

Se ha verificado que `index.html`, `styles.css`, `main.js` y todas las imágenes referenciadas en `../assets/images/` responden `200` servidos así (comprobación local realizada en esta misma sesión).

## 3. Cómo replicar/editar la landing

1. **Diseño:** abrir `../figma/FIGMA_LANDING_SPEC_CLUB_PADEL_04.md`, crear un archivo de Figma gratis, seguir la spec sección por sección usando los tokens de `BRAND_SYSTEM_CLUB_PADEL_04.md`.
2. **Copy:** cualquier cambio de texto se edita primero en `../copy/LANDING_COPY_CLUB_PADEL_04.md` (fuente de verdad) y luego se replica en `index.html` y en `LandingClubPadel04.jsx` para que ambas versiones no diverjan.
3. **Código:** editar `styles.css` para cambios visuales (usa las variables CSS de `:root`, ya alineadas con `src/theme.js` de la app real — no inventar colores nuevos sin actualizar también el Brand System).

## 4. Qué falta para publicarla (checklist honesto)

- [ ] **Fuentes reales:** Syne y DM Sans no están enlazadas (evitado a propósito para no hacer llamadas externas en esta fase). Añadir el `<link>` gratuito de Google Fonts, o auto-alojar los `.woff2`, antes de un despliegue real.
- [ ] **Formulario de contacto:** actualmente sin backend. El botón "Solicitar demo" está deshabilitado a propósito en la versión estática y el `submit` está interceptado (`preventDefault`) en ambas versiones. Falta decidir destino (Airtable/CRM, email, endpoint propio) y conectar — no se ha tocado Make/Airtable/Stripe/WhatsApp en esta tarea, según restricción explícita.
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
