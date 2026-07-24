# Corrección de ENOSPC ("System limit for number of file watchers reached") en Vite

## Contexto

Durante la validación de la Mejora 1 (sustitución del icono de la app,
PR #50), al iniciar `npm run dev` en Terminal 1 apareció:

```
Error: ENOSPC: System limit for number of file watchers reached
```

## Diagnóstico

### Lo que se verificó directamente en esta sesión

- `cat /proc/sys/fs/inotify/max_user_watches` → `524288` (límite
  generoso en el entorno donde se ejecutó este diagnóstico). Si el
  entorno real donde corre Terminal 1 tiene un límite distinto/menor
  (frecuente en configuraciones Android/Termux/PRoot, donde a veces es
  mucho más bajo por defecto), eso explicaría el ENOSPC directamente —
  no se ha podido leer ese valor exacto desde la terminal del usuario en
  esta sesión.
- Se midió el nº real de watchers de inotify que abre UN solo `vite dev`
  en este proyecto: **623** — una cifra modesta en aislamiento.
- Se encontró la causa raíz más probable y verificable: **5 worktrees de
  este proyecto comparten un único `node_modules` real mediante symlinks
  encadenados** (creados a lo largo de esta sesión de trabajo para no
  reinstalar dependencias en cada worktree nuevo):

  ```
  cp04-t-app-icon-branding/app/node_modules
    -> cp04-t-real-performance-provider/app/node_modules (real, ~4661 entradas/437 directorios)
  cp04-t-production-readiness-audit/app/node_modules -> (mismo real)
  cp04-t-visual-roi-commercial-platform/app/node_modules -> (mismo real)
  cp04-t-payments-messaging-adapters/app/node_modules -> (mismo real)
  ```

  Chokidar (el watcher que usa Vite) sigue symlinks por defecto
  (`followSymlinks: true`). Si varios de estos worktrees tienen
  `npm run dev` abierto a la vez (varias terminales, como sugiere el
  propio mensaje "Terminal 1"), cada uno puede llegar a vigilar el
  mismo árbol real de `node_modules` de forma redundante, multiplicando
  el recuento total de watchers del sistema por cada terminal abierta.

- El `vite.config.js` de este proyecto ya excluía `node_modules` de la
  vigilancia (`"**/node_modules/**"` en `ignored`), pero **no** excluía
  `checkpoints/**` (mencionado explícitamente por el usuario) ni tenía
  `followSymlinks: false`, que es la protección específica frente al
  problema de symlinks encadenados descrito arriba.

### Lo que no se ha podido verificar con certeza

- El valor exacto de `fs.inotify.max_user_watches` en el sistema/
  contenedor donde corre la Terminal 1 real del usuario (puede diferir
  del leído en esta sesión).
- Cuántas terminales/worktrees con `npm run dev` abierto tenía el
  usuario en el momento exacto del error.

## Solución aplicada (segura, sin sudo, sin reducir funcionalidad)

En `vite.config.js`:

1. **`followSymlinks: false`** en `server.watch` — el watcher deja de
   descender a través de symlinks (como el de `node_modules`
   compartido entre worktrees) y los trata como una única entrada, en
   vez de vigilar recursivamente el directorio real de destino. Esto
   elimina la multiplicación de watchers por worktree sin afectar en
   absoluto la recarga en caliente del código fuente real de la app
   (que nunca se accede vía symlink).
2. Se añadió **`"**/checkpoints/**"`** a la lista `ignored` — pedido
   explícitamente por el usuario.
3. Se añadió **`"**/.claude/**"`** a `ignored` — directorios de
   metadatos de sesión/worktree, nunca código de la app.

Ningún patrón de `ignored` existente se ha eliminado ni se ha reducido
ninguna carpeta de código fuente real vigilada — `src/`, `public/`,
`*-cli/`, `worker-reservas/` siguen vigilados exactamente igual, así que
la recarga en caliente de cualquier cambio de código sigue funcionando
sin cambios.

## Por qué esto es "permanente para este proyecto"

El cambio vive en `vite.config.js`, versionado en el repositorio — se
aplica automáticamente a cualquier persona que clone/actualice el
proyecto, en cualquier worktree, sin necesidad de configuración manual
por terminal ni de privilegios de root.

## Si el problema persiste tras este cambio

Si Terminal 1 sigue mostrando ENOSPC después de este cambio, la causa
más probable es que el **límite del sistema** (`fs.inotify.max_user_watches`)
sea genuinely bajo en ese entorno concreto — eso requiere una acción a
nivel de sistema operativo, fuera del alcance de este repositorio:

```bash
# Requiere privilegios de root/sudo — NO ejecutado en esta sesión,
# el usuario debe decidir y ejecutar esto explícitamente si hace falta:
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Como medida práctica inmediata (sin tocar nada del sistema): cerrar los
`npm run dev` de worktrees que no se estén usando activamente reduce de
inmediato el nº total de watchers en uso.

## Verificación realizada

- `npm test`: 1302/1302, sin cambios (este fix no toca código de la
  app).
- `npm run lint`: 4 errores + 1 warning, todos preexistentes.
- `npm run build`: correcto.
- `npm run dev -- --port 5175`: arranca correctamente, sin ENOSPC,
  verificado con `curl` (`200 OK` en `/`).
- Recuento de watchers de inotify del proceso vite (`/proc/<pid>/fdinfo/<fd>`):
  sin cambios (623) en este worktree aislado — la mejora real se
  observa al ejecutar varios `npm run dev` simultáneos entre worktrees
  con `node_modules` symlinked, que es precisamente el escenario que
  `followSymlinks: false` corrige.
