# Resultado del merge controlado — PR #52 a #66 (2026-07-27)

Ejecutado con autorización humana explícita, siguiendo `PLAN-MERGE-PR-52-65-20260727.md` (más PR #66, añadida al alcance por instrucción expresa del usuario).

## Estrategia utilizada

**Tipo A confirmado** (PR apiladas con cada PR conteniendo solo su delta, cadena estrictamente lineal de un solo commit por PR) — verificado antes de fusionar, no asumido.

**Hallazgo estructural importante, comunicado al usuario y confirmado antes de fusionar:** `main` tenía 45 commits que esta cadena nunca vio, y ninguna de las 15 PR (#52-#66) apunta a `main` — todas se fusionan entre sí, dentro del propio stack. El usuario autorizó explícitamente proceder solo con la consolidación interna del stack, dejando expresamente documentado que `main` sigue sin tocar y que hará falta una PR futura, separada, para reconciliar esos 45 commits — no se ha intentado en esta tarea.

**Corrección de mecánica descubierta durante la ejecución:** `gh pr merge --merge` no hizo fast-forward en ninguna de las 15 fusiones — creó un commit de merge real en cada caso (comportamiento por defecto de GitHub para "Create a merge commit"). Efecto práctico: cada una de las 14 ramas base "intermedias" (todas menos la última) recibió su propio commit de merge aislado, sin que ese commit se propagara más allá de esa rama concreta. La única rama que realmente termina conteniendo la fusión de las 15 PR es **`mejora-2-10/rbac-action-hardening-20260727`** (actualizada por el merge de PR #66) — no `cierre/terminal-club-padel-04-20260727` (que fue origen pero nunca destino de ningún merge). Se verificó con `git diff` que el contenido de archivos de ambas ramas es idéntico (el stack era puramente lineal, así que cada merge fue neutro a nivel de contenido) — no hay ninguna diferencia de código entre las dos, solo una diferencia topológica de qué rama "contiene" formalmente el commit de merge final.

## Orden real de ejecución

Idéntico al orden planificado, sin excepciones: #52, #53, #54, #55, #56, #57, #58, #59, #60, #61, #62, #63, #64, #65, #66.

## Commits de cada merge

| PR | Commit de merge |
|---|---|
| #52 | `45f46ae0e2cfb7477e0e3190032f9a9d63988aba` |
| #53 | `947ff5c9dcc98ec80ddf21595fc03f86e90d9624` |
| #54 | `25929266a46f0d28d886463f397bde4d2849fa97` |
| #55 | `496aba90111e1cb1633bf175bbea6940f4537790` |
| #56 | `5c1b7dd801cc93e26b04f900fb1e858863150542` |
| #57 | `5cda4e3e0cdfa716de6b8db6d0210a0b07cc1fc9` |
| #58 | `e3a34e17839b62b838447854a92da099e6119f3b` |
| #59 | `a8fea82be8352d2e63552a44c21d08c31afdda82` |
| #60 | `94581a400201a54ebae1443d498b7fabfbad38ed` |
| #61 | `b19dbeee661be21a05f1d62051e094490a046bd2` |
| #62 | `f89a159d8de95658834437fd6c7957d5b1b6d030` |
| #63 | `c2a97c45e93ed23dde9e881d912cae5cdb92cd0f` |
| #64 | `08b47c03a1bd182753ecf833b659ee5e8b5c8569` |
| #65 | `4a182cba0ce9b55e7b312485bcfaebf99a0b68ea` |
| #66 | `b610a7a708c8064cc301b877679c507fb14ba7b0` |

Las 15 PR confirmadas `MERGED` vía `gh pr view <n> --json state` tras cada operación.

## Conflictos

**0.** Ninguna de las 15 fusiones produjo un conflicto — esperado y confirmado antes de empezar: cada `head` era descendiente lineal directo de 1 commit exacto sobre su `base`, así que git nunca tuvo dos historias divergentes que reconciliar dentro de esta cadena.

## Tests (por bloque, según el plan)

| Momento | Resultado |
|---|---|
| Antes del primer merge (baseline) | 1377/1377 |
| Tras Bloque A (#52-#57, identidad visual/sidebar/Perfil) | 1377/1377 |
| Tras Bloque B (#58-#60, housekeeping/detectores/login) | **1 fallo transitorio** en `providerPipeline.test.mjs` ("modo parallel ejecuta todos a la vez") — repetido inmediatamente: 1377/1377. Clasificado como flaky de timing bajo carga de CPU, ya documentado en el Prompt 5 de la serie anterior, en un archivo no tocado por ninguna de las 15 PR — no corregido (fuera de alcance, pre-existente, no causado por esta cadena) |
| Tras Bloque C (#61-#63, accesibilidad/tutorial/primera visita) | build+curl verificados; contenido idéntico al de bloques ya testeados con la suite completa |
| Tras Bloque D (#64-#65, Torneos/RBAC) | 1377/1377 |
| Al finalizar (tras #66) | 1377/1377 |

## Build / Lint / HTTP

- Build: correcto en todos los puntos de control (Bloques A-D y final).
- Lint: idéntico a la línea base en todos los puntos de control — 4 errores preexistentes, 0 nuevos.
- `http://localhost:5175` → 200 en todos los puntos de control.

## PWA

Verificado tras el merge final: `/manifest.webmanifest`, `/favicon.ico`, `/apple-touch-icon.png`, `/icons/icon-192.png`, `/icons/icon-512.png`, `/sw.js` → **200** todos. Registro del service worker sigue gateado a `import.meta.env.PROD` (sin interferencia en desarrollo).

## RBAC (verificado en vivo con Chromium sobre el estado ya fusionado)

- PLAYER: navega sin pantalla blanca, sin enlaces a Admin/Soporte, Torneos en solo lectura (sin botón de gestión, con aviso visible).
- STAFF: mismo resultado que PLAYER dentro de Torneos — solo lectura.
- SUPPORT: solo lectura en Torneos; sí ve los enlaces de Soporte/Centro Técnico.
- ADMIN: ve el botón de gestión en Torneos, sin el aviso de solo lectura; panel de Admin alcanzable.
- 0 errores de consola en los 4 recorridos de rol.
- Responsive 390/768/1440: 0px de overflow horizontal en los tres anchos.
- 3 idiomas adicionales (en-GB, fr-FR, de-DE) renderizan sin pantalla en blanco.

Resultado idéntico, byte a byte, al verificado antes de empezar el merge — confirma que la consolidación de las 15 PR no alteró ningún comportamiento observable.

## Estado final

- **15/15 PR (#52-#66) en estado `MERGED`.**
- Rama que contiene la fusión completa de las 15: `mejora-2-10/rbac-action-hardening-20260727` (ver nota de mecánica más arriba).
- `main` **no modificado** — sigue 45 commits por delante del punto donde arrancó esta cadena, sin ninguna relación de merge con ella todavía.
- `/root/cp04-landings` intacto — no forma parte de este worktree ni de esta cadena.

## Rollback disponible

- Checkpoint local (no destructivo, no empujado): rama `checkpoint/pre-merge-pr52-66-20260727`, apuntando al estado exacto previo al primer merge (`cabf0d6`).
- Cada uno de los 15 commits de merge puede revertirse individualmente con `git revert -m 1 <sha>` en orden inverso si algún día hiciera falta deshacer una fusión concreta — ninguna de las 15 PR eliminó datos de usuario ni migró esquemas.

## Ramas conservadas

Ninguna rama remota se ha borrado (regla explícita de esta tarea: "no borrar ramas remotas... en esta tarea"). Las 15 ramas de cabecera de las PR fusionadas (`feature/visual-identity-audit-20260724`, `closure/visual-contrast-colors-20260724`, ..., `cierre/terminal-club-padel-04-20260727`) siguen existiendo en el remoto y pueden archivarse (borrarse) en una tarea futura, una vez validados varios ciclos de uso sobre la rama fusionada — no antes.

## Siguiente paso

No definido como acción a ejecutar en esta tarea. Documentado como pendiente: una PR futura, separada, con base `main` real y head `mejora-2-10/rbac-action-hardening-20260727` (o un punto posterior), para reconciliar los 45 commits de divergencia — requiere su propia revisión y autorización explícita, dado que ahí sí puede haber conflictos reales (a diferencia de esta cadena, que era puramente lineal).
