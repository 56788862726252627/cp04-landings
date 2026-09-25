# Informe — Optimización de Bundle Frontend (Club Pádel 04)

Fecha: 2026-07-07
Rama: `checkpoint/fase-11-rama-limpia-cp04`
Alcance: exclusivamente frontend/build (React + Vite). Sin cambios en Make, Airtable, webhooks, secretos ni `app/audit/make-50-auditoria-20260707/`.

## 1. Baseline

- `node --test`: 140 tests, 140 PASS, 0 FAIL.
- `npm run build`: correcto.
- Chunks antes:
  - `dist/assets/index-LY_pZfM5.js` — **637.20 kB** (gzip 164.77 kB)
  - `dist/assets/ClubGallery-*.js` — 1.53 kB (gzip 0.53 kB) *(ya lazy de una fase anterior)*
  - `dist/assets/index-*.css` — 59.79 kB
- Total chunks JS: 2
- Aviso de build: "Some chunks are larger than 500 kB after minification."

## 2. Diagnóstico

- El proyecto **no usa librerías de terceros pesadas** (`package.json` solo declara `react`/`react-dom` como dependencias). El peso del bundle es 100% código propio.
- `src/App.jsx` tiene **7349 líneas (66% del código fuente total de `src/`, 11019 líneas)**. Contiene, definidos *inline* dentro del propio archivo, todos los módulos de sección (Inicio, Reservas, AltaJugador, ReprogramarReserva, CancelarReserva, Gestión, Torneos, Ranking, Admin, Soporte, Perfil). Solo se renderiza uno a la vez (`modules[safeCurrentSection]`), pero al no existir en archivos separados no son separables en chunks sin extraerlos primero — refactor de riesgo medio-alto, fuera de alcance de esta sesión.
- Ya existía infraestructura de lazy loading (`LazyLoadBoundary.jsx`, `lazySections.js`, `lazyGallery.js`) de una fase anterior, con `ClubGallery.jsx` ya diferido.
- Dos componentes de alto valor **ya estaban en archivos separados** pero se importaban de forma estática (síncrona) pese a no ser necesarios en la carga inicial:
  - `CentroTecnico.jsx` (591 líneas) — solo se renderiza si el usuario navega a la sección `flujos_make`, y solo el rol SUPPORT tiene acceso.
  - `CP04GuidedTutorial.jsx` (664 líneas) — siempre montado, pero autocontenido (sin dependencias externas) y gestiona su propia visibilidad internamente.
- No se detectaron librerías de charts, PDF, QR, calendario ni iconos importadas de forma ineficiente (no existen en el proyecto).
- No se detectó duplicación de dependencias ni imports circulares relevantes en el alcance revisado.
- Las imágenes de `dist/gallery/` (decenas de JPG/PNG de varios MB cada una) **no forman parte del bundle JS** — son assets estáticos servidos por ruta, no importados por el código. Quedan fuera de este informe de "bundle JS/code splitting", pero se anotan como pendiente relevante para Core Web Vitals general (ver sección 12).

## 3. Mapa de dependencias (candidatos evaluados)

| Módulo | Líneas | Clasificación | Notas |
|---|---|---|---|
| `App.jsx` (módulos inline) | ~5000+ | CRÍTICO | Mayor responsable del bundle; no extraíble hoy sin refactor grande |
| `CentroTecnico.jsx` | 591 | ALTO | SUPPORT-only, archivo ya aislado, cero tests de render dependientes de import síncrono |
| `CP04GuidedTutorial.jsx` | 664 | ALTO | Sin dependencias externas, gestiona su propia visibilidad |
| `ClubGallery.jsx` | 32 | BAJO (ya resuelto) | Ya lazy de una fase anterior |
| `CP04DemoRealista.jsx` | 145 | MEDIO (no tocado) | Candidato para una futura iteración, pendiente de confirmar condiciones de render |
| Librerías de terceros pesadas | — | N/A | Ninguna presente en el proyecto |
| Imágenes de galería | — | MEDIO (fuera de alcance JS) | No es bundle JS; auditoría de imágenes recomendada aparte |

## 4. Candidatos a lazy loading evaluados

| Candidato | Ahorro estimado | Coste implementación | Riesgo UX | Riesgo regresión | Decisión |
|---|---|---|---|---|---|
| `CentroTecnico.jsx` | Alto (591 líneas + lógica propia) | Muy bajo (ya archivo separado) | Bajo (fallback visible solo al navegar a Centro Técnico) | Muy bajo (sin tests de render que dependan del import síncrono) | **Implementado** |
| `CP04GuidedTutorial.jsx` | Medio-alto (664 líneas) | Muy bajo (ya archivo separado) | Muy bajo (`Suspense fallback={null}`, sin parpadeo visible) | Bajo (autocontenido, sin deps externas) | **Implementado** |
| Extracción de módulos inline de `App.jsx` (Torneos, Admin, Ranking, etc.) | Muy alto | Alto (refactor, paso de props/estado compartido) | Medio | Medio-alto | **No implementado** — Plan C, siguiente fase |
| Chunking por rol (STAFF/ADMIN/SUPPORT) | Alto | Alto | Medio | Medio-alto | **No implementado** — Plan C, siguiente fase |

## 5. Plan seleccionado

**Plan B (Recomendado)**: lazy loading de `CentroTecnico.jsx` y `CP04GuidedTutorial.jsx`, reutilizando la infraestructura `LazyLoadBoundary` ya existente. Equilibrio entre impacto real y riesgo controlado, sin tocar lógica de negocio, RBAC, autenticación ni rutas.

Se descartó el Plan C (extracción de módulos inline de `App.jsx` + chunking por rol) por su mayor riesgo de regresión y alcance de refactor, incompatible con "cambios pequeños y verificables" en una sola sesión.

## 6. Cambios realizados

| Archivo | Cambio | Beneficio | Riesgo |
|---|---|---|---|
| `src/components/lazy/lazyCentroTecnico.js` (nuevo) | `export const LazyCentroTecnico = lazy(() => import("../CentroTecnico.jsx"))` | Aísla el import diferido siguiendo el patrón ya usado por `lazyGallery.js` | Ninguno (archivo nuevo, aditivo) |
| `src/components/lazy/lazyGuidedTutorial.js` (nuevo) | `export const LazyCP04GuidedTutorial = lazy(() => import("../CP04GuidedTutorial.jsx"))` | Ídem | Ninguno |
| `src/App.jsx` | Import estático de `CentroTecnico`/`CP04GuidedTutorial` reemplazado por los lazy wrappers; `<main>` envuelto en `<LazyLoadBoundary label="Cargando módulo...">`; `<LazyCP04GuidedTutorial>` envuelto en `<Suspense fallback={null}>` | Saca ~48 kB minificados (~13 kB gzip) del chunk principal a chunks bajo demanda | Bajo — lógica de navegación (`safeCurrentSection`, RBAC) sin tocar; sin tests de render que dependan de import síncrono |

Sin cambios en lógica de negocio, RBAC, autenticación, rutas, Make ni Airtable.

## 7. Tests

- `node --test`: **140 ejecutados, 140 PASS, 0 FAIL** (antes y después del cambio — sin variación, ningún test existente renderiza componentes React vía RTL/jsdom, por lo que el cambio de import síncrono→lazy no tiene superficie de test que romper).

## 8. Build

`npm run build` correcto antes y después. El aviso de chunk >500 kB **persiste** (589.18 kB > 500 kB) — esperado y documentado desde el inicio: la causa raíz (`App.jsx` monolítico) no se resuelve con este cambio, solo se mitiga parcialmente.

## 9. Comparación bundle antes/después

| | Antes | Después | Δ absoluta | Δ % |
|---|---|---|---|---|
| Chunk principal (minificado) | 637.20 kB | 589.18 kB | −48.02 kB | **−7.54%** |
| Chunk principal (gzip) | 164.77 kB | 151.48 kB | −13.29 kB | **−8.07%** |
| Nº de chunks JS | 2 | 4 | +2 | — |
| Chunks nuevos | — | `CentroTecnico-*.js` (34.36 kB / gzip 9.59 kB), `CP04GuidedTutorial-*.js` (14.34 kB / gzip 4.84 kB) | — | — |

## 10. Riesgos

- El aviso de bundle >500 kB no queda resuelto, solo reducido (~7.5%); requiere Plan C en una fase futura para bajar del umbral.
- `CP04GuidedTutorial` se monta siempre (aunque autocontenido); su chunk se solicita casi inmediatamente tras el primer render, por lo que el ahorro es principalmente de *parseo/compilación inicial*, no de peticiones de red diferidas de forma duradera.
- No existe suite de tests de render de componentes React (RTL/jsdom) en el proyecto — la verificación de que `Suspense`/`lazy` funcionan correctamente en navegador real queda pendiente de prueba manual (ver sección QA).

## 11. Rollback

Si se detecta cualquier regresión:
```
git checkout -- src/App.jsx
rm src/components/lazy/lazyCentroTecnico.js src/components/lazy/lazyGuidedTutorial.js
```
Cambio totalmente aislado y reversible en un solo paso; no toca ningún otro archivo ni lógica.

## 12. Pendientes

1. **Plan C** (siguiente fase, mayor alcance): extraer los módulos inline de `App.jsx` (Torneos, Admin, Ranking, Gestión, etc.) a archivos propios y aplicar `React.lazy` por sección/rol. Es la única vía para bajar el chunk principal por debajo de 500 kB de forma sustancial.
2. Evaluar `CP04DemoRealista.jsx` (145 líneas) como candidato adicional de bajo riesgo en una futura iteración.
3. Auditoría de imágenes estáticas en `dist/gallery/` (varias decenas de MB en JPG/PNG sin versión WebP para todos los casos) — fuera del alcance de "bundle JS", pero relevante para Core Web Vitals (LCP) en el módulo de galería.
4. Prueba manual real en navegador de: cambio de rol, navegación a Centro Técnico (fallback de `LazyLoadBoundary` visible brevemente), apertura del tutorial guiado — no ejecutada en esta sesión (sin herramienta de navegador interactivo disponible; solo se verificó arranque del dev server sin errores de compilación/import).

## 13. Siguiente mejora no solapada recomendada

Auditoría y optimización de imágenes estáticas (`app/dist/gallery/`, `app/public` equivalente): convertir a WebP/AVIF de forma consistente, verificar `loading="lazy"` en `<img>`, y revisar dimensiones servidas vs. mostradas. Es independiente de Make/Airtable (Terminal 6), independiente de los archivos tocados en esta tarea (`App.jsx`, `lazyCentroTecnico.js`, `lazyGuidedTutorial.js`), y no afecta al PR actual salvo que se decida incluirla explícitamente.
