# 05 — Informe técnico

## Resumen

Sustituye `public/favicon.svg` (rayo morado) por el logotipo oficial de
Club Pádel 04 como icono de la aplicación, generando 13 tamaños PNG,
`favicon.ico` multi-resolución y `apple-touch-icon.png`, y actualizando
`index.html`/`manifest.webmanifest`/`sw.js` en consecuencia. **Solo
recursos gráficos, configuración de iconos y manifest** — cero cambios
de lógica de negocio o comportamiento de la app.

## Precheck

- Base confirmada: commit `d30dc0b` (Paso 21), branch
  `feature/production-readiness-audit-20260724`.
- Worktree reutilizado (no se creó uno nuevo, según instrucción
  explícita del usuario): `/root/cp04-t-app-icon-branding`, rama
  `feature/app-icon-branding-20260724`.
- PR previa confirmada abierta y sin tocar: #49 (base
  `feature/visual-roi-commercial-platform-20260724`).
- `node_modules` symlinked desde el worktree hermano (se había omitido
  al crear el worktree en el turno anterior; corregido en este turno
  antes de ejecutar lint).

## Decisión clave: mantener `favicon.svg`

Se auditó activamente `src/App.jsx` antes de tocar nada y se encontró
que `retryConnection()` usa `fetch("/favicon.svg", ...)` como
comprobación ligera de conectividad — no como icono visual. Por eso
`public/favicon.svg` **se mantiene en disco sin modificar**, cumpliendo
la regla "no eliminar un recurso antiguo hasta comprobar que ya no se
usa" — en este caso SÍ se usa, aunque no visualmente, así que no se
toca ni el archivo ni esa lógica.

## Composición de los iconos

Ver documento 02 para el detalle completo. Resumen: fondo `#05080d`
(coincide con `theme_color`/`background_color` ya existentes), logo
inscrito al 86% (iconos ≥48px, con margen de seguridad para Android
adaptive icons) o al 98% (iconos ≤32px, maximizando píxeles útiles) con
una máscara de nitidez adicional para compensar el reescalado agresivo.
100% opaco (necesario para `apple-touch-icon` en iOS y para poder
reutilizar los mismos archivos como iconos "any" y "maskable").

## Verificación ejecutada

```
$ npm test          → 1302/1302 tests (app), 0 fallos — sin cambios (este paso no toca JS de negocio)
$ npm run test:worker → 173/173 tests, 0 fallos — sin cambios (no se tocó worker-reservas)
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes; 0 introducidos
$ npm run build      → correcto; 13 PNG + favicon.ico + apple-touch-icon.png copiados a dist/;
                        el logotipo fuente (2.2MB) confirmado EXCLUIDO de dist/ (vive en docs/, no en public/)
$ python3 -c "...json.load..." → manifest.webmanifest es JSON válido, 13 iconos, 192/512 con purpose "any maskable"
$ vite dev + curl    → index.html/favicon.ico/icons/icon-192.png/manifest.webmanifest sirven 200 OK;
                        HTML renderizado contiene los <link> de icono nuevos, no el favicon.svg antiguo
$ grep de referencias activas al rayo morado (#863bff/#7e14ff, favicon.svg) en index.html/manifest/sw.js/src/
                     → 0 coincidencias (solo el propio archivo favicon.svg, mantenido intencionalmente)
```

## Alcance y honestidad

- No se modificó ningún componente React, ninguna lógica de reservas/
  roles/auth, ningún archivo de `worker-reservas/`.
- No se ha comprobado el renderizado en un dispositivo Android/iOS
  físico ni con capturas de pantalla de navegador (sin herramienta de
  automatización de navegador en este entorno) — ver documento 03 para
  el detalle de qué sí y qué no se ha verificado.
- El script de generación de iconos fue una herramienta **efímera**
  (ejecutada fuera del repositorio, en el directorio temporal de la
  sesión) — no se ha commiteado ningún generador ni dependencia nueva
  de procesamiento de imágenes al proyecto, solo los archivos de
  resultado (PNG/ICO) y los cambios de configuración.
- No se ha realizado ningún merge, ni cambio directo sobre `main`, ni
  se ha tocado ningún otro worktree/PR.

## Tiempo

**Nota de honestidad**: sin acceso a timestamps de herramienta para una
medición formal de reloj real.

| | |
|---|---|
| Estimación inicial | No especificada en el mensaje del usuario |
| Trabajo realizado | Auditoría inicial (turno anterior) + inspección del logotipo + generación de 15 archivos de icono en 2 iteraciones (ajuste de legibilidad a tamaños pequeños) + reubicación del logotipo fuente fuera de `public/` + actualización de 3 archivos de configuración + validación completa (tests/lint/build/servidor dev) + 5 documentos |
| Estimación real de tiempo de ingeniería | **~1-1.5 horas** (repartidas en dos turnos: auditoría inicial + generación/validación tras recibir el logotipo) |
