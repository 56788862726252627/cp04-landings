# Ajuste UI: botón Baja + sidebar Reprogramar + login correo personal (Paso 07K)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07J (`docs/paso-07j-titulo-dinamico-alta-baja-jugador/`).

---

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `9cec80f` (Paso 07J)

**Nota de continuidad:** este paso se retomó tras un corte de conexión ("API Error: Stream idle timeout") ocurrido durante la fase de investigación de un primer intento. Se verificó antes de empezar que ese intento no había dejado ningún cambio a medias: `git status -sb` limpio, sin diffs, HEAD seguía en `9cec80f`. Se partió de un estado limpio confirmado.

---

## 1. Botón "Solicitar baja de jugador"

### Problema detectado

El botón ya había recibido un primer refuerzo de contraste en el Paso 07J (fondo sólido `T.accent` en vez del degradado por defecto), pero se pidió reforzarlo más para garantizar legibilidad clara en STAFF/ADMIN/SUPPORT.

### Solución aplicada

En `AltaJugador()` (`src/App.jsx`), al `style` override ya existente del botón se le añadió un borde explícito de definición (`border: "2px solid rgba(6,16,10,.45)"`), manteniendo el resto del refuerzo ya aplicado en 07J (fondo sólido `T.accent`, texto `#06100a`, `fontSize:"1rem"`, anillo de sombra, ancho completo). Este formulario vive dentro de la app autenticada (no en la pantalla de login/rol), por lo que no le afecta ninguna regla CSS de `cp04-role-screen-active`.

**Texto sin cambios:** "Solicitar baja de jugador" / "Enviando…". **Sin cambios** en `submitBaja`, el payload, el endpoint (`POST /api/jugadores/baja`) ni el criterio de "nunca confirmar sin respuesta real".

## 2. Sidebar "Reprogramar reserva"

### Problema detectado (causa raíz real, no solo apariencia)

El item del sidebar "Reprogramar reserva" ya usaba exactamente la misma lógica de color activo/hover que el resto de items (`Sidebar()` en `src/App.jsx` no tiene ningún caso especial para este id). El problema real estaba en `src/cp04-two-buttons-fix.js`, un script legado que recorre **todos** los `<button>` del DOM y, si el texto normalizado del botón **incluye** "reprogramar reserva", le fuerza `color:#ffffff !important` (pensado originalmente para un botón de acción en la pantalla Inicio). Como el item del sidebar tiene exactamente ese mismo texto literal, el script también lo capturaba: cuando el item estaba activo (fondo degradado lima/menta, pensado para texto oscuro `#061006` según la regla CSS de estado activo), el texto se forzaba a blanco por encima, rompiendo la coherencia visual con el resto de items del sidebar (que sí muestran texto oscuro sobre el fondo verde cuando están activos).

### Solución aplicada

En `fixSelectedCp04ButtonsOnly()` (`src/cp04-two-buttons-fix.js`), se añadió una guarda al principio del bucle: `if (button.closest('.cp04-sidebar')) return;`. Esto excluye cualquier botón dentro del sidebar de este fix heredado (pensado para botones de la pantalla Inicio, ninguno de los cuales vive dentro de `.cp04-sidebar`), sin tocar el resto de su lógica ni los otros 5 patrones de texto que reconoce (`reservar pista`, `ir a reservas`, `dar de alta`, `pista 1`, `consultar reservas`).

**No se tocó** `Sidebar()`, `CP04_ROLE_PERMISSIONS`, la navegación (`navigate()`) ni ningún permiso.

## 3. Login con correo personal — botón "Iniciar sesión"

### Problema detectado (causa raíz real)

El formulario "Entrar con correo personal" (con el botón "Iniciar sesión") se renderiza en la misma pantalla que las 4 tarjetas de rol (Jugador/cliente, Staff/recepción, Administrador/jefe, Soporte técnico). El detector `role-background-detector.js` activa `body.cp04-role-screen-active` en esa pantalla, y una regla genérica ya existente en `torcal-role-background.css`:

```css
body.cp04-role-screen-active .cp04-card .cp04-card,
body.cp04-role-screen-active button,
body.cp04-role-screen-active [role="button"] {
  background-color: rgba(5, 10, 18, 0.22) !important;
  background-image: none !important;
  ...
}
```

anulaba con `!important` el fondo lima (`background:T.accent`) que el botón ya tenía definido inline, dejándolo con un fondo casi transparente sobre el fondo oscuro — prácticamente invisible. Un estilo `style` de React normal (sin `!important`) nunca puede ganarle a un `!important` de hoja de estilos, así que el problema no podía corregirse solo con el inline style existente. Se descartó además un script legado (`cp04-login-enter-white-final.js`) que buscaba un botón con texto exacto "Entrar" — el botón real dice "Iniciar sesión" desde hace tiempo, así que ese script nunca llegaba a aplicarse a este botón (dead code inofensivo, no se tocó).

### Solución aplicada

1. Se añadió la clase `cp04-login-submit-btn` al botón "Iniciar sesión" (`src/App.jsx`), junto a la ya existente `cp04-menu-button`.
2. Se añadió una nueva sección al final de `torcal-role-background.css`, con el mismo patrón ya usado para el botón de Perfil (mayor especificidad + `!important` para ganarle a la regla genérica): fuerza el degradado lima/menta de marca (`linear-gradient(135deg, #b6ff00 0%, #2df5a3 100%)`), texto `#06100a`, borde y sombra de definición, en estado normal, hover, focus y active; y mantiene `opacity: .55` en `:disabled`.

**No se tocó** el flujo de autenticación (`handleUniversalLogin`), la validación de email/contraseña, "Ver contraseña"/"Ocultar contraseña", "Recuperar contraseña", ni ningún selector de rol.

## Roles afectados

Ninguno de los 3 cambios toca `rbac.js` ni `CP04_ROLE_PERMISSIONS` — son correcciones puramente visuales:

- **Botón Baja:** visible para STAFF/ADMIN/SUPPORT (los únicos con acceso a Baja de Jugador, sin cambios de permisos).
- **Sidebar Reprogramar:** visible para los mismos roles que ya lo tenían (sin cambios de permisos).
- **Login "Iniciar sesión":** visible para cualquier usuario que use el formulario de correo personal (sin relación con roles internos).

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft. No se tocó `rbac.js`, ningún endpoint, ningún payload, la lógica de autenticación, ni el componente compartido `Btn`.

## Verificación de que nada se rompió

- **Alta de Jugador:** intacto.
- **Baja de Jugador:** intacto — mismo payload/endpoint; solo el borde añadido al botón.
- **Reprogramar Reserva (pantalla y flujo):** intacto — el cambio solo afecta al ítem del sidebar, no al componente `ReprogramarReserva()`.
- **Cancelar Reserva:** intacto — no se tocó.
- **Cierre Temporal de Pistas:** intacto.
- **Centro Técnico:** intacto.
- **Login por roles, ver contraseña, recuperar contraseña:** intactos — ninguno de los 3 cambios toca esa lógica ni esos botones (los botones "Ver contraseña" y "¿Olvidaste tu contraseña?" son `type="button"` con estilo transparente propio, no `cp04-menu-button`, y no coinciden con ninguno de los selectores nuevos).

Confirmado ejecutando la suite completa: 330 tests frontend y 124 tests Worker, todos verdes (sin tests nuevos: los 3 cambios son CSS/JS de estilo/DOM sin lógica pura nueva testeable con `node --test`; este repositorio no tiene infraestructura de render de componentes React, mismo límite ya documentado en pasos anteriores). Build y lint sin errores nuevos.

## Pendiente

Validación visual manual en `localhost:5175` tras este cambio:
- Botón "Solicitar baja de jugador" con STAFF, ADMIN y SUPPORT.
- Item "Reprogramar reserva" en el sidebar, comprobando que al estar activo/seleccionado se ve igual de coherente (texto oscuro sobre fondo verde) que "Alta de jugador", "Baja de jugador", "Cierre temporal", etc.
- Botón "Iniciar sesión" en la pantalla de login, con correo personal y contraseña escritos, confirmando que no desaparece ni queda apagado, y que "Ver contraseña" y "Recuperar contraseña" siguen funcionando igual.
