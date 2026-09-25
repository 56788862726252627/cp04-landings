# Fix definitivo — botón "Solicitar baja de jugador" en SUPPORT (Paso 07M)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07L (`docs/paso-07l-fix-boton-baja-jugador/`), que corrigió el mismo síntoma para `cp04-module-screen-active` genérico, pero no cubría el caso específico de SUPPORT.

---

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `e39abd1` (Paso 07L)

## Problema detectado en SUPPORT

Tras el Paso 07L, el botón "Solicitar baja de jugador" seguía viéndose ilegible **específicamente al iniciar sesión como SUPPORT** (login, Reprogramar reserva, título/subtítulo dinámico, sidebar y permisos ya eran correctos para los 3 roles).

## Causa raíz real

**No era el estado `disabled` del formulario** (el botón se ve mal incluso con el formulario habilitado), **no era herencia de rol a nivel de permisos**, y **no era el mismo selector corregido en 07L** (ese ya excluía `button` correctamente para `cp04-module-screen-active`). Era una **tercera variante del mismo defecto de diseño**, en una regla distinta:

```css
/* src/cp04-legibility-polish.css, antes del fix */
body.cp04-module-admin .cp04-card,
body.cp04-module-admin .cp04-card [style*="background"] {
  background: linear-gradient(135deg, rgba(3,8,15,.62), rgba(5,12,22,.42)) !important;
  ...
}
```

Esta regla estaba pensada para pantallas de Admin/Centro Técnico (`cp04-module-admin`). El Paso 07L la dejó fuera de alcance a propósito, asumiendo que Baja de Jugador nunca recibiría esa clase. Pero `src/internal-background-detector.js` clasifica el `<body>` así:

```js
const isAdminOrTechnical =
  text.includes('centro tecnico') || ... || text.includes('soporte tecnico');
const isUserOrReservations =
  text.includes('alta de jugador') || ...;

if (isAdminOrTechnical) {
  document.body.classList.add('cp04-module-admin');   // ← se comprueba primero y gana
} else if (isUserOrReservations) {
  document.body.classList.add('cp04-module-user');
}
```

`isAdminOrTechnical` se comprueba **antes** que `isUserOrReservations` y gana si ambas son verdaderas. El sidebar de **SUPPORT** siempre muestra el item **"Centro técnico"** (única sección `flujos_make`, exclusiva de SUPPORT según `rbac.js`) — ese texto está en `document.body.innerText` en **cualquier página** que SUPPORT esté viendo, incluida Baja de Jugador. Por eso, para SUPPORT (y solo para SUPPORT, ya que STAFF/ADMIN no tienen "Centro técnico" ni "Soporte técnico" en su sidebar), el `<body>` recibe `cp04-module-admin` en vez de `cp04-module-user` sin importar qué página esté viendo — y la regla de arriba, con el mismo defecto de selector demasiado amplio (`[style*="background"]` capturando también botones) que ya se corrigió en 07L para su variante `cp04-module-screen-active`, volvía a anular el fondo lima del botón.

## Solución aplicada

### 1. Corrección de raíz (mismo patrón que 07L)

En `src/cp04-legibility-polish.css`, se añadió `:not(button)` al segundo selector de la regla `cp04-module-admin`:

```css
body.cp04-module-admin .cp04-card,
body.cp04-module-admin .cp04-card [style*="background"]:not(button) {
```

### 2. Red de seguridad definitiva (clase dedicada)

Dado que este mismo defecto de diseño (selectores globales `[style*="background"]` demasiado amplios) ya ha reaparecido **3 veces** bajo distintas variantes (`button` genérico en 07H/07K, `.cp04-card [style*="background"]` para `cp04-module-screen-active` en 07L, su variante `cp04-module-admin` en este paso), se añadió además una clase dedicada `cp04-offboarding-submit-button` con CSS de máxima especificidad, para no depender de seguir encontrando variantes del mismo problema una por una:

- Se extendió el componente compartido `Btn()` (`src/App.jsx`) para aceptar un `className` opcional (por defecto vacío — comportamiento idéntico al de antes para cualquier otro llamador que no lo use).
- Se aplicó `className="cp04-offboarding-submit-button"` únicamente al botón de Baja de Jugador.
- Se añadió una regla CSS nueva en `cp04-legibility-polish.css` que fuerza el degradado lima/menta de marca y el texto oscuro con `!important`, en estado normal, hover, focus y active — y también en `:disabled`, con `opacity:.72` (atenuado pero claramente legible, nunca "casi invisible").

## Por qué no afecta lógica ni permisos

- El cambio de `Btn()` es aditivo y retrocompatible: un `className` opcional que, sin usarlo, deja el comportamiento exactamente igual para Alta de Jugador, Cierre Temporal y cualquier otro botón existente.
- La clase `cp04-offboarding-submit-button` es exclusiva de este botón — no coincide con ningún otro elemento de la app.
- No se tocó `submitBaja`, el payload, el endpoint (`POST /api/jugadores/baja`), ni `rbac.js`/`CP04_ROLE_PERMISSIONS`.
- La corrección de raíz (`:not(button)`) sigue exactamente el mismo patrón ya validado en 07L, aplicado solo al selector `cp04-module-admin`.

## Roles validados

Sin cambios de permisos respecto a 07C/07I — `CP04_ROLE_PERMISSIONS` no se tocó:

- **SUPPORT:** ve "Baja de jugador" y ahora el botón "Solicitar baja de jugador" se ve correctamente.
- **STAFF / ADMIN:** siguen viendo "Baja de jugador"; su botón ya se veía bien desde el Paso 07L (sus sidebars no tienen "Centro técnico" ni "Soporte técnico", así que nunca recibían `cp04-module-admin` en esta pantalla) y ahora además cuentan con la misma red de seguridad definitiva.
- **PLAYER:** sigue sin `"baja_jugador"` en su lista de permisos — no ve el módulo.

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft. No se tocó `rbac.js`, ningún endpoint, ningún payload, la lógica de envío, el login, `Sidebar()`, `cp04-two-buttons-fix.js` (fix de Reprogramar reserva del Paso 07K), ni `torcal-role-background.css` (fix de login del Paso 07K).

## Verificación de que nada se rompió

- **Alta de Jugador:** intacto — el `Btn` compartido sigue con el mismo comportamiento por defecto sin `className`.
- **Baja de Jugador:** intacto en lógica/payload/endpoint.
- **Reprogramar Reserva:** intacto — no se tocó `cp04-two-buttons-fix.js` ni `Sidebar()`.
- **Login:** intacto — no se tocó `torcal-role-background.css`.
- **Cierre Temporal de Pistas:** intacto — su botón usa el mismo patrón de fondo sólido y también se beneficia de la corrección de raíz `cp04-module-admin`, sin cambiar su apariencia ya validada.
- **Centro Técnico:** intacto — la regla `cp04-module-admin` para tarjetas (`.cp04-card` sin el atributo de fondo) sigue igual; solo se excluyeron los `button` del segundo selector.

Confirmado ejecutando la suite completa: 330 tests frontend y 124 tests Worker, todos verdes (sin tests nuevos: cambio de CSS/prop opcional, sin lógica nueva testeable con `node --test`; este repositorio no tiene infraestructura de render de componentes React). Build y lint sin errores nuevos.

## Pendiente

Validación visual manual final en `localhost:5175`: confirmar que el botón "Solicitar baja de jugador" se ve con texto claramente legible en las 3 cuentas — **SUPPORT** (el caso reportado), **STAFF** y **ADMIN** — tanto en estado normal como con el formulario incompleto (disabled).
