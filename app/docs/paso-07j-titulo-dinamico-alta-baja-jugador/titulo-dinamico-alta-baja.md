# Título dinámico Alta/Baja de Jugador + coherencia visual (Paso 07J)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07I (`docs/paso-07i-sidebar-baja-jugador/`, acceso directo en sidebar para Baja de Jugador).

---

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `cab351e` (Paso 07I)

## Problema detectado

En la validación visual manual en `localhost:5175` tras el Paso 07I se confirmó que el control de acceso por roles funcionaba correctamente (PLAYER no ve "Baja de jugador"; STAFF/ADMIN/SUPPORT sí, y el formulario correcto se abre al pulsarlo). Sin embargo, la cabecera superior del módulo (`SectionTitle`) quedaba **fija en "Alta de jugador"** independientemente de si el usuario:

- entraba desde el sidebar directamente en "Baja de jugador" (`modules.baja_jugador`, Paso 07I), o
- cambiaba manualmente de pestaña dentro del módulo (botones "Alta de jugador" / "Baja de jugador").

Esto generaba confusión visual: el usuario veía el formulario de baja correcto, pero el título seguía diciendo "Alta de jugador".

## Solución aplicada

Componente: `AltaJugador()` en `src/App.jsx` (el mismo componente reutilizado desde el Paso 07C/07I, sin duplicar nada).

Se añadieron 3 variables derivadas del estado `modo` ya existente (el mismo que controlan los botones de pestaña):

```js
const isBajaMode = modo === "baja";
const playerFormTitle = isBajaMode ? "Baja de jugador" : tx("alta.title");
const playerFormSubtitle = isBajaMode
  ? "Solicita la baja de un jugador del club."
  : tx("alta.desc");
```

Y se sustituyó el `<SectionTitle title={tx("alta.title")} desc={tx("alta.desc")} />` estático por `<SectionTitle title={playerFormTitle} desc={playerFormSubtitle} />`, que ahora lee el mismo estado `modo` que ya gobierna qué formulario se muestra. Al ser una variable derivada del render (no un `useEffect` ni estado adicional), se actualiza automáticamente en cualquier situación en la que `modo` cambie: al entrar desde el sidebar con `initialModo="baja"` (Paso 07I) o al pulsar cualquiera de las dos pestañas.

El `eyebrow` ("Jugadores") se mantiene igual en ambos modos, por ser una etiqueta de categoría, no específica de alta/baja.

**No se creó ningún estado nuevo, ningún efecto, ningún componente adicional.** Es una derivación pura a partir del `modo` que ya existía desde el Paso 07C.

## Comportamiento esperado — Alta

- **Título:** "Alta de jugador" (`tx("alta.title")`)
- **Subtítulo:** "Añade un jugador al club." (`tx("alta.desc")`)
- **Pestaña activa:** Alta de jugador

## Comportamiento esperado — Baja

- **Título:** "Baja de jugador"
- **Subtítulo:** "Solicita la baja de un jugador del club."
- **Pestaña activa:** Baja de jugador

Ambos se cumplen tanto entrando desde el sidebar (`alta_jugador` → modo inicial "alta"; `baja_jugador` → modo inicial "baja", ver Paso 07I) como cambiando de pestaña manualmente dentro del módulo.

## Botón de Baja de Jugador — contraste

Se detectó que el botón "Solicitar baja de jugador" tenía el mismo problema de contraste ya corregido en el Paso 07H para el botón de Cierre Temporal de Pistas (ambos usaban el estilo `primary` por defecto del componente compartido `Btn`: degradado lima→menta con texto casi negro). Se aplicó exactamente el mismo ajuste, aislado a este botón mediante `style` override:

- Fondo sólido `T.accent` (lima puro) en vez del degradado.
- Texto `#06100a` a `1rem`.
- Anillo de sombra oscuro (`boxShadow`) para definición.
- Ancho completo (`width: "100%"`).

**Texto del botón sin cambios:** "Solicitar baja de jugador" / "Enviando…". **No se tocó** la lógica de envío (`submitBaja`), el payload, ni el endpoint (`POST /api/jugadores/baja`). El componente compartido `Btn` tampoco se modificó — el resto de botones de la app (Alta, Cancelar, etc.) no cambian.

## Roles afectados

Sin cambios respecto al Paso 07I — este paso es puramente de coherencia visual (título/subtítulo/contraste), no toca `rbac.js` ni `CP04_ROLE_PERMISSIONS`:

- **PLAYER:** sigue sin ver "Baja de jugador" en el sidebar.
- **STAFF / ADMIN / SUPPORT:** siguen viendo "Baja de jugador" y pudiendo abrir el formulario, ahora con el título correcto.

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft. No se tocó `rbac.js`, el endpoint `/api/jugadores/baja`, el payload, ni el componente compartido `Btn`.

## Verificación de que nada se rompió

- **Alta de Jugador:** intacto — mismo formulario, mismo endpoint; el título dinámico usa exactamente los mismos textos i18n (`tx("alta.title")`/`tx("alta.desc")`) que ya se mostraban antes en modo alta.
- **Baja de Jugador:** intacto — mismo payload/endpoint/criterio defensivo; solo cambia el título mostrado y el contraste del botón.
- **Cierre Temporal de Pistas (Paso 07G/07H):** intacto — no se tocó `CierreTemporalPista()`.
- **Centro Técnico:** intacto — sin cambios.

Confirmado ejecutando la suite completa: 330 tests frontend y 124 tests Worker, todos verdes (sin tests nuevos: cambio puramente de JSX derivado, sin lógica nueva testeable con `node --test`; este repositorio no tiene infraestructura de render de componentes React, mismo límite ya documentado en los Pasos 07C/07E/07H). Las garantías de rol (PLAYER no ve Baja, STAFF/ADMIN/SUPPORT sí) siguen cubiertas por los tests de `rbac.test.mjs` añadidos en el Paso 07I, sin cambios en este paso.

## Pendiente

Validación visual manual tras este cambio en `localhost:5175`: confirmar que el título cambia correctamente en los 4 escenarios (entrada desde sidebar en Alta, entrada desde sidebar en Baja, cambio de pestaña a Alta, cambio de pestaña a Baja) y que el botón de Baja de Jugador se lee con el mismo contraste reforzado que el de Cierre Temporal de Pistas.
