# Consolidación localhost:5175 + Sidebar Cierre Temporal de Pistas (Paso 07G)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07E (`docs/paso-07e-cierre-temporal-pistas/`, integración app/API) y Paso 07F (actualización de PR #36 con 07E).

---

## Puerto y worktree oficiales

- **Puerto de revisión visual oficial: `localhost:5175`.** Servido por `npm run dev` desde `/root/cp04-t-frontend-fixes/app`, en la rama `frontend/audit-fixes-20260709`, con HEAD en `5d2e7fa` (Paso 07E) antes de este paso.
- **`localhost:5173` NO debe usarse como referencia.** El proceso que lo sirve corre desde `/root/cp04-landings/app`, en la rama `docs/comunidad-padel-legal-menores-readiness-2026-07-15` — una rama distinta, de trabajo documental de Comunidad Pádel, sin relación con los pasos 07A-07F de este bloque. Confirmado por proceso (`ps aux`) y por `git branch --show-current` en ese directorio.
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`. Verificado con `git status -sb`, `git branch --show-current` y `git log --oneline -10` antes de tocar nada.

## Qué se añadió al sidebar

Nuevo acceso directo **"Cierre temporal"** (`nav.cierre_pistas`, icono 🚧) en el menú lateral (`Sidebar()` en `src/App.jsx`), justo después de "Reservas" (id `gestion`). Antes de este paso, Cierre Temporal de Pistas (Paso 07E) solo era visible como un card embebido dentro de la sección "Gestión" — sin entrada propia en el sidebar.

## Cómo se implementó (sin duplicar lógica)

1. **Extracción, no duplicación:** el formulario y toda su lógica (estado, validación, `submitCierre`) vivían dentro de `Gestion()`. Se extrajeron tal cual a un nuevo componente de nivel superior, `CierreTemporalPista()`, colocado justo antes de `Gestion()` en `src/App.jsx`. `Gestion()` volvió a su forma previa al Paso 07E (solo "Consultar mis reservas"); el card de Cierre Temporal ya no aparece duplicado dentro de Gestión — vive únicamente en su propia sección.
2. **Nueva sección en el router de módulos:** `modules.cierre_pistas = <CierreTemporalPista />` en el objeto `modules` de `ClubPadel04SaaSApp()` (`src/App.jsx`), mismo patrón que el resto de secciones (`alta_jugador`, `gestion`, etc.).
3. **Nuevo item de navegación:** añadido a `navKeys` en `Sidebar()` — `["cierre_pistas","nav.cierre_pistas","🚧"]`.
4. **Nueva clave i18n:** `"nav.cierre_pistas":"Cierre temporal"` añadida **solo** al diccionario `es-ES` en `TRANSLATIONS`. La función `t()` ya hace fallback automático a `es-ES` cuando un idioma no tiene una clave (`dict[key] ?? esDict[key] ?? key`), así que el resto de idiomas (en/fr/it/pt/pt-BR/de) mostrarán el mismo texto en español hasta que se traduzcan, en vez de mostrar la clave cruda `nav.cierre_pistas`. Mismo criterio de footprint mínimo ya usado en el formulario del Paso 07C/07E (sin i18n completo para textos nuevos de estas acciones administrativas).
5. **Gate de rol:** nueva sección `"cierre_pistas"` añadida a `CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`, exactamente con los mismos 3 roles que ya tenían `"gestion"` (STAFF/ADMIN/SUPPORT). PLAYER no la recibe. No se tocó `CP04_PROTECTED_SECTIONS` ni `CP04_SUPPORT_ONLY_SECTIONS` (Cierre Temporal no es SUPPORT-only, es STAFF/ADMIN/SUPPORT igual que Gestión).

## Roles con acceso

- **PLAYER:** no puede acceder. No está en su lista de permisos (`CP04_ROLE_PERMISSIONS.PLAYER`), así que el item ni siquiera se renderiza en su sidebar (`Sidebar()` filtra `navKeys` por `allowedMenu.includes(id)`).
- **STAFF / ADMIN / SUPPORT:** sí, ven el item y pueden usarlo.

## Navegación directa protegida (defensa en profundidad)

`ClubPadel04SaaSApp()` ya tenía un guard de "última línea" independiente del sidebar: `safeCurrentSection = cp04CanAccessSection(selectedRole, current) ? current : cp04GetSafeStartSection(selectedRole)`. Este guard usa la misma función `cp04CanAccessSection()` que ahora reconoce `"cierre_pistas"` — así que si algo forzara `current = "cierre_pistas"` para un PLAYER (URL, hash, devtools, estado corrupto), el guard lo redirige automáticamente a su sección segura de inicio (`"inicio"`), sin necesidad de ningún cambio adicional. Verificado con test nuevo en `rbac.test.mjs` (ver sección de tests).

## Mejoras previas verificadas (siguen presentes en este worktree)

- **Paso 07A:** `src/data/makeAppIntegrationMap.js` (50 escenarios), Panel A3 en `src/components/CentroTecnico.jsx` (`eyebrow="A3" title="Integración App ↔ Make 50/50"`), contadores calculados dinámicamente vía `computeIntegracionResumen()` en `src/utils/makeCentroTecnicoLogic.js`.
- **Paso 07B:** `docs/paso-07b-grupo-e-huecos/grupo-e-gap-analysis.md` y `grupo-e-priorizacion.md`, íntegros.
- **Paso 07C:** Baja de Jugador + Promoción (`grupo: "A"` en el mapa, `handleBajaJugador` en el Worker, tests en `baja-jugador.test.mjs`) — no se tocó nada de esto en este paso; verificado que sigue respondiendo igual (test de regresión).
- **Paso 07E:** Cierre Temporal de Pistas (`grupo: "A"` en el mapa, `handleCierreTemporalPista` en el Worker, `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` pendiente, 16 tests en `cierre-temporal-pista.test.mjs`), contador **4/50** confirmado en `makeCentroTecnicoLogic.test.mjs`.
- **Mejoras visuales generales:** sidebar sin hover rojo (confirmado por grep: no hay ningún `red`/`#ff0000` en los estilos de `Sidebar()`, solo la paleta verde-lima `T.accent`/`#b6ff00`), Centro Técnico protegido (SUPPORT-only, sin cambios), mensajes seguros de Airtable 429 (`PUBLIC_API_BILLING_LIMIT_EXCEEDED` detectado y manejado en `worker-reservas/src/index.js`), idempotencia/caché en el Worker (`caches.default`, huella de clave de idempotencia — sin cambios), ningún flujo confirma una acción sin respuesta real del sistema (patrón ya verificado en Alta/Baja/Cierre Temporal).

## Mejoras faltantes detectadas

Ninguna. Todo lo listado arriba se verificó presente y sin regresiones en `/root/cp04-t-frontend-fixes`.

## Qué se comparó con el otro worktree y qué no se copió

Se revisó (solo lectura, `git log`/`git branch`) `/root/cp04-landings/app` — el proceso que sirve `localhost:5173`. Está en la rama `docs/comunidad-padel-legal-menores-readiness-2026-07-15`, con commits exclusivamente de tipo `docs:`/`docs-ui:` sobre el roadmap de Comunidad Pádel (prototipos de feed, perfil, moderación, amigos/seguidores, consentimiento/privacidad, legal de menores). Es un flujo de trabajo completamente distinto al de este bloque (integración App↔Make 50/50, Cierre Temporal de Pistas). **No se copió nada**: no hay ninguna mejora visual o funcional de esa rama que aplique al sidebar/Cierre Temporal de Pistas de esta rama, y mezclar ramas de alcance distinto sin criterio sería exactamente el tipo de copia masiva que las reglas de este paso prohíben.

## Cómo probarlo visualmente

1. Con el servidor en `localhost:5175` corriendo (Terminal 1), entrar como STAFF, ADMIN o SUPPORT.
2. Confirmar que el sidebar muestra el item **"🚧 Cierre temporal"** entre "Reservas" y "Torneos".
3. Pulsarlo: debe abrir directamente el formulario de Cierre Temporal de Pistas (mismo formulario que antes vivía dentro de "Gestión"), con el aviso *"Esta acción prepara el cierre, pero no se considerará confirmada hasta recibir respuesta real del sistema."*
4. Entrar como PLAYER: el item **no debe aparecer** en el sidebar en absoluto.
5. Verificar que "Gestión" (📅 Reservas) ya no muestra el card de Cierre Temporal — solo "Consultar mis reservas", como antes del Paso 07E.
