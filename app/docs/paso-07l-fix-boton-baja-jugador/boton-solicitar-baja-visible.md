# Fix definitivo — botón "Solicitar baja de jugador" (Paso 07L)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07K (`docs/paso-07k-ui-baja-reprogramar-login/`), que ya había reforzado el botón (fondo sólido `T.accent`, borde de definición) pero no resolvía el problema real.

---

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `30cd817` (Paso 07K)

## Problema detectado visualmente

Tras validar en `localhost:5175` con cuentas STAFF/ADMIN/SUPPORT: el formulario de Baja de Jugador se abre correctamente, el título dinámico (Paso 07J) es correcto, los roles son correctos — pero el botón inferior **"Solicitar baja de jugador"** seguía viéndose con el texto demasiado oscuro/casi invisible sobre un fondo también oscuro, a pesar de que el código del botón (desde 07J/07K) ya fijaba explícitamente un fondo lima sólido (`background: T.accent`) y texto casi negro (`color:"#06100a"`) — una combinación de alto contraste sobre el papel.

## Causa raíz encontrada

El botón vive dentro de un `<Card>` (`.cp04-card`), dentro de la app autenticada, donde el detector `internal-background-detector.js` activa la clase `cp04-module-screen-active` en `<body>` (se activa en cualquier pantalla interna, detectado por texto como "cerrar sesión", "alta de jugador", etc. — siempre presente en el sidebar).

Existían **dos reglas CSS genéricas, casi duplicadas**, pensadas para dar un efecto "cristal" a bloques internos con fondo propio dentro de una tarjeta, pero con un selector demasiado amplio:

```css
/* src/cp04-legibility-polish.css */
body.cp04-module-screen-active .cp04-card [style*="background"],
body.cp04-role-screen-active .cp04-card [style*="background"] {
  background: linear-gradient(135deg, rgba(4,9,16,.54), rgba(4,9,16,.34)) !important;
  ...
}

/* src/internal-module-backgrounds.css */
body.cp04-module-screen-active .cp04-card [style*="background"] {
  background: linear-gradient(135deg, rgba(5,10,18,.32), rgba(5,10,18,.18)) !important;
  ...
}
```

El selector de atributo `[style*="background"]` coincide con **cualquier** elemento cuyo atributo HTML `style` contenga literalmente la palabra "background" — sin distinguir si es un `<div>` decorativo o un `<button>` con un fondo de marca intencional. Como el botón de Baja usa `style={{ background: T.accent, ... }}`, su atributo `style` renderizado en el DOM contiene la subcadena `"background"`, así que **ambas reglas lo capturaban** y sustituían su fondo lima por un degradado oscuro y translúcido, vía `!important` — imposible de ganar con un `style` normal de React (que no admite `!important`). El resultado: texto casi negro sobre un fondo ahora también oscuro — prácticamente invisible, exactamente el síntoma reportado.

Este es el mismo tipo de defecto (selector "catch-all" demasiado amplio) ya identificado y corregido puntualmente en el Paso 07K para el botón de Perfil y el botón "Iniciar sesión" — pero en este caso el origen es distinto (dos reglas ligadas a `.cp04-card [style*="background"]`, no a `button` genérico), por eso los fixes anteriores no lo cubrían.

## Solución aplicada

Se corrigió el selector en su origen, en vez de añadir otro parche puntual encima:

1. **`src/cp04-legibility-polish.css`** (línea ~71): se añadió `:not(button)` únicamente al lado `body.cp04-module-screen-active` del selector combinado — el lado `body.cp04-role-screen-active` (pantalla de login) se dejó exactamente igual, porque no es el que causaba este bug y no formaba parte del alcance de este paso.
2. **`src/internal-module-backgrounds.css`** (línea ~56): se añadió `:not(button)` al selector (aquí no hay variante role-screen-active, es un archivo específico de fondos de módulos internos).

Con `:not(button)` ningún `<button>` (sea cual sea su clase) puede volver a ser capturado por estas dos reglas de "cristal" — siguen aplicándose normalmente a divs/inputs/otros bloques internos con fondo propio dentro de una tarjeta, que es su propósito original.

## Por qué el fix es específico y no afecta a otros botones

- El cambio es una exclusión de **tipo de elemento** (`:not(button)`), no una regla nueva con un selector de clase/texto que pudiera coincidir con otra cosa por accidente (que es justo el tipo de bug que causó este problema y el de "Reprogramar reserva" en 07K).
- Ningún botón de la app dependía de recibir el fondo oscuro "de cristal" de estas dos reglas — el propósito original y documentado en el propio CSS es para bloques `div`/contenedores internos con fondo, no para botones de acción con su propio color de marca.
- No se tocó ningún componente JSX, ni el componente compartido `Btn`, ni la lógica de ningún formulario.
- No se tocó la variante `cp04-role-screen-active` de la regla en `cp04-legibility-polish.css` (pantalla de login), para no ampliar el alcance del cambio más allá de lo reportado.
- No se tocó la regla equivalente scoped a `cp04-module-admin` (Centro Técnico/Admin, en `cp04-legibility-polish.css` línea ~379) — Baja de Jugador es una pantalla `cp04-module-user`, no `cp04-module-admin`, así que esa regla no interviene en este bug y queda fuera del alcance de este paso.

## Roles validados por código/test

Sin cambios respecto a los pasos anteriores (07C/07I): `CP04_ROLE_PERMISSIONS` en `rbac.js` no se tocó.

- **PLAYER:** sigue sin `"baja_jugador"` en su lista de permisos — no ve el item del sidebar.
- **STAFF / ADMIN / SUPPORT:** siguen con acceso — y ahora el botón se ve correctamente.

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft. No se tocó `rbac.js`, ningún endpoint, ningún payload, ninguna validación, el componente compartido `Btn`, ni el botón "Iniciar sesión" (su fix de 07K sigue vigente e intacto — esta corrección es complementaria, no lo sustituye).

## Verificación de que nada se rompió

- **Alta de Jugador:** intacto — mismo componente, mismo formulario.
- **Baja de Jugador:** intacto en lógica/payload/endpoint — solo cambia que el botón ahora se ve correctamente.
- **Reprogramar Reserva (sidebar y pantalla):** intacto — no se tocó `cp04-two-buttons-fix.js` ni `Sidebar()` en este paso.
- **Login ("Iniciar sesión", ver contraseña, recuperar contraseña):** intacto — no se tocó `torcal-role-background.css` ni el flujo de autenticación.
- **Cierre Temporal de Pistas:** su botón usa el mismo patrón (`background: T.accent` inline dentro de un `.cp04-card`), así que además de no romperse, se beneficia igualmente de esta corrección de raíz (dejaba de estar expuesto al mismo riesgo, sin que esto cambie su apariencia ya validada).
- **Centro Técnico:** intacto — no se tocó la regla scoped a `cp04-module-admin`.

Confirmado ejecutando la suite completa: 330 tests frontend y 124 tests Worker, todos verdes (sin tests nuevos: cambio de selector CSS puro, sin lógica nueva testeable con `node --test`; este repositorio no tiene infraestructura de render de componentes React). Build y lint sin errores nuevos.

## Pendiente

Validación visual manual en `localhost:5175` tras este cambio: confirmar que el botón "Solicitar baja de jugador" se ve con texto claramente legible (fondo lima sólido, texto casi negro, borde de definición) en las cuentas STAFF, ADMIN y SUPPORT, y que PLAYER sigue sin ver el módulo.
