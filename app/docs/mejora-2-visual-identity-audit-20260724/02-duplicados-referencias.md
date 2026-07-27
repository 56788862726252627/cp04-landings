# 02 — Auditoría de duplicados y referencias

Detección real por hash MD5 (`md5sum` sobre los 94 archivos de imagen/
icono) + `grep` de referencias activas en `src/`, `index.html`,
`public/manifest.webmanifest`, `public/sw.js`. Ningún archivo se ha
eliminado en esta fase.

## Duplicados exactos encontrados (por MD5)

| Grupo | Archivos | Hash (prefijo) | Peso c/u | ¿Referenciado? |
|---|---|---|---|---|
| Galería — mismo binario, 6 nombres distintos | `cafeteria.jpg`, `instalaciones.jpg`, `pistas.jpg`, `recepcion.jpg`, `torneos.jpg`, `collage_club_padel_04.png` (todos en `public/gallery/cp04/`) | `3a3a30f7` | 2.14 MB | **No** — solo aparece como valor inerte del campo `original` en `src/data/visualAssets.js`, que a su vez solo lo usa `ClubGallery.jsx`, que no está importado en `App.jsx` |
| Icono app — duplicado intencional (Mejora 1) | `public/apple-touch-icon.png` y `public/icons/icon-180.png` | `4bfa549d` | 46.9 KB | **Sí, ambos** — nombres convencionales distintos que algunos navegadores/iOS buscan por rutas diferentes |

## Referencias rotas

**Ninguna encontrada.** Se verificaron todas las rutas activamente
referenciadas en `index.html`, `public/manifest.webmanifest`,
`public/sw.js` y los componentes que importan imágenes — todas
resuelven a un archivo real existente.

## Recursos sin uso confirmado (no duplicados, simplemente huérfanos)

| Recurso | Peso | Motivo |
|---|---|---|
| `public/gallery/cp04/candidatas/` (23 archivos) | 96 MB | Fotos de casting a resolución de cámara completa (4128×3096), sin ninguna referencia en código — proceso de selección ya completado (la galería final usa 5 fotos distintas vía WebP) |
| `public/gallery/cp04/galeria_completa_club_padel_04.png` + `.webp` | 945 KB | Sin referencia en código |
| `public/icons.svg` (sprite Bluesky, etc.) | 5.0 KB | Sin referencia en código — posible feature de compartir en redes nunca conectada |
| `src/assets/vite.svg`, `src/assets/react.svg`, `src/assets/hero.png` | ~pequeño | Restos de scaffolding/prototipo, sin relación con la marca |
| `src/data/visualAssets.js` + `src/components/ClubGallery.jsx` | — (código) | Módulo/componente completo no importado por `App.jsx` — código muerto |

## Imágenes de resolución insuficiente

**Ninguna detectada** entre los recursos activos — los 13 iconos PWA
tienen las dimensiones exactas requeridas, los fondos y la galería
activa tienen resolución adecuada para su uso (verificado con `PIL`).

## Imágenes/formatos con peso mejorable

| Recurso | Situación | Recomendación |
|---|---|---|
| 4 fondos internos (`torcal-padel-bg`, `admin-technical-bg`, `user-reservas-bg`, `general-modules-bg`) | PNG servido directamente (1.6-2.3 MB c/u), WebP ya generado (52-201 KB) pero sin conectar | **Corregido en esta mejora** — ver doc. 04 |
| `public/gallery/cp04/candidatas/*.jpg` | 4.1-4.9 MB cada una, resolución de cámara sin redimensionar | No se toca (sin uso, ver tabla de archivado) |

## Tabla de clasificación final

### 1. Duplicados seguros para eliminar en el futuro (requiere confirmación humana antes de borrar)

- Los 6 archivos idénticos de `public/gallery/cp04/` (`cafeteria.jpg`, `instalaciones.jpg`, `pistas.jpg`, `recepcion.jpg`, `torneos.jpg`, `collage_club_padel_04.png`) — 2.14 MB × 6 ≈ 12.8 MB recuperables. Antes de borrar: confirmar que `src/data/visualAssets.js`/`ClubGallery.jsx` (que los referencian como metadato inerte) tampoco se necesitan, o actualizar su campo `original` primero.

### 2. Recursos que deben archivarse (mover fuera de `public/`, no borrar)

- `public/gallery/cp04/candidatas/` completa (96 MB) — mover a un almacenamiento externo (Drive, como ya se hace con otros activos del proyecto) o a una carpeta fuera de `public/` no servida por Vite/el build, igual que se hizo con el logotipo fuente de Mejora 1.
- `public/gallery/cp04/galeria_completa_club_padel_04.png` + `.webp` — mismo criterio, si se confirma que no hace falta para ninguna vista futura.

### 3. Recursos que deben conservarse (aunque no se usen activamente ahora mismo)

- `public/favicon.svg` — mantenido explícitamente por su uso como ping de conectividad.
- `public/gallery/cp04/{cafeteria,instalaciones,pistas,recepcion,torneos}.png` (versiones distintas, no duplicadas) — fuente legítima para regenerar los `.webp` si cambia el proceso de optimización.
- `docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png` — fuente canónica del logo oficial.

### 4. Recursos que requieren revisión humana antes de decidir

- `src/data/visualAssets.js` + `src/components/ClubGallery.jsx`: ¿se planeaba usar este componente en algún módulo futuro (p. ej. una vista de galería más completa que la actual inline en `App.jsx`)? Si no, es candidato a eliminarse; si sí, es candidato a conectarse.
- `public/icons.svg` (sprite social): ¿existe intención de añadir botones de compartir en redes? Si no, candidato a archivar.
- `src/assets/hero.png`: sin contexto de qué prototipo representaba — revisar antes de decidir si conservar como referencia histórica o eliminar.
