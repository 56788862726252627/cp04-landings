# Paso 09 · Fase 1 — Auditoría de acoplamiento y replicabilidad

Rama: `frontend/saas-core-replicable-20260720` · Worktree: `/root/cp04-t-saas-core`
Checkpoint: tag `saas-core-checkpoint-20260721` sobre `71ddb72`.

Auditoría programática (grep + lectura dirigida) del código real en `app/src` y
`app/worker-reservas` a fecha 2026-07-21. Objetivo: inventariar los puntos de
acoplamiento a "Club Pádel 04" y clasificarlos para decidir qué se convierte en
configuración de tenant y qué permanece como identificador técnico.

## Método

- `grep -rli` de términos de dominio (pádel, jugador, pista, entrenador,
  torneo, ranking, socio, recepción) sobre `src/**/*.{js,jsx}`.
- `grep -rl` de nombres de proveedor (Make, Airtable, Stripe, WhatsApp, Gmail,
  Calendar) sobre el mismo árbol.
- Lectura directa de `src/utils/rbac.js` (única fuente de verdad de
  navegación/roles), `src/theme.js` (tokens visuales), `src/auth/authTypes.js`
  (tipos de sesión) y `src/data/makeInventory.js` (matriz de 50 flujos).

## Inventario clasificado

| Elemento | Dónde vive hoy | Clasificación | Decisión para el núcleo SaaS |
|---|---|---|---|
| `CP04_ROLES` (`PLAYER/STAFF/ADMIN/SUPPORT`) | `rbac.js` | **núcleo común** (roles genéricos con nombre de dominio) | Se abstrae como roles configurables por tenant; CP04 mantiene estos 4 nombres como su propio tenant config |
| `CP04_ROLE_PERMISSIONS` (24 secciones) | `rbac.js` | **núcleo común + config por tenant** | Motor de módulos (`moduleRegistry.js`) generaliza la forma; CP04 se representa como un tenant con estos módulos habilitados, probado para producir el mismo resultado |
| Secciones `torneos`, `ranking`, `cierre_pistas`, `lista_espera`, `control_qr`, `pistas_recordatorios` | `rbac.js`, `App.jsx` | **vertical sectorial (pádel/deporte)** | Módulos opcionales, desactivados por defecto fuera de plantillas deportivas |
| Secciones `reservas`, `alta_jugador`/`baja_jugador`, `reprogramar`, `cancelar`, `gestion`, `comunicaciones_socio`, `calendario_disponibilidad`, `facturacion_pagos`, `automatizaciones_bots`, `dashboard_kpi`, `backups_seguridad`, `admin`, `inicio`, `perfil`, `comunidad` | `rbac.js` | **núcleo común**, con etiqueta visible dependiente de terminología | Se mapean 1:1 a módulos genéricos (agenda/citas, clientes, pagos, automatizaciones, informes, configuración, comunidad, perfil) |
| `flujos_make`, `soporte` (Centro Técnico) | `rbac.js` | **módulo opcional / interno de agencia**, no de cliente final | Se mantiene como módulo `technical_center`, deshabilitado por defecto en plantillas de cliente |
| Palabras "jugador", "pista", "entrenador", "torneo", "ranking", "club" en JSX/UI | `App.jsx`, `CentroTecnico.jsx`, `ComunidadDemo.jsx`, `CP04GuidedTutorial.jsx`, tutoriales | **terminología visible** | Capa `terminology.js`; no se tocan estos componentes en este paso (evitar reescritura total), pero quedan documentados como consumidores futuros |
| `src/theme.js` (`T.bg`, `T.accent`, fuentes Syne/DM Sans, "Club Pádel 04" en comentarios) | `theme.js` | **branding** | Se representa como `tenant.branding` (colores/fuentes) en el esquema; CP04 usa estos valores como default |
| `public/images`, `public/gallery`, `favicon.svg`, `og-image.svg`, `manifest.webmanifest` | `public/` | **branding** | Fuera de alcance de este paso (activos estáticos reales); el esquema deja `branding.logoUrl`/`branding.ogImageUrl` como referencias configurables, no se generan assets nuevos |
| `src/data/cp04DemoData.js`, `demoSafeDataset.js`, `comunidadDemoData.js` (227 líneas) | `src/data/` | **datos demo** | No se tocan; el esquema de tenant define `demoData: {enabled, source}` como flag, sin migrar estos datasets |
| `src/data/makeInventory.js` (50 flujos), `makeArchitectureMatrix.js`, `makeAppIntegrationMap.js` | `src/data/` | **integración externa (Make) + deuda a preservar intacta** | Fase 11 exige conservarla íntegra: se añade una capa de capacidades genéricas que la referencia, sin copiarla ni modificarla |
| Menciones a Make (12 archivos), Airtable (9), Stripe (6), WhatsApp (8), Gmail (2), Calendar (5) | varios | **integración externa** | Se definen adaptadores desacoplados (`DataRepository`, `PaymentProvider`, `MessagingProvider`, etc.) con mocks locales; no se llama a ningún servicio real |
| `worker-reservas/auth/authorization.js` | Worker | **identificador técnico que no debe cambiarse** | Autoridad real de autorización de mutaciones; el núcleo SaaS no la sustituye, solo la documenta como adaptador futuro |
| `CP04_SESSION_ROLES`, `Cp04AuthUser`, tokens de sesión (cookies HttpOnly, Lote A7) | `auth/authTypes.js`, Worker | **identificador técnico que no debe cambiarse** | Fuera de alcance; el núcleo SaaS no reemplaza autenticación real |
| `CP04_ENFORCE_ROLE_GATES` (flag Worker) | Worker | **deuda técnica documentada en memoria** | No se toca en este paso; mencionado solo como antecedente |
| Rutas/URLs de webhooks Make (`makeLiveClient.js`) | `utils/makeLiveClient.js` | **integración externa + identificador técnico** | No se modifica; el `AutomationProvider` mock es un contrato paralelo, no sustituye al cliente real |
| Nombre "Club Pádel 04" en textos de UI, `README.md`, comentarios | múltiples | **branding + terminología visible** | Queda como tenant por defecto (`legalName`/`displayName`); no se buscan-y-reemplazan ocurrencias de texto libre en este paso |

## Conclusión de la Fase 1

- El **núcleo común real** (roles, permisos por sección, ciclo agenda/citas,
  clientes, profesionales, pagos abstractos, automatizaciones, informes) ya
  existe de forma implícita en `rbac.js` y `App.jsx`, pero mezclado con
  terminología y verticalidad de pádel.
- No hay ningún archivo que sea "solo pádel" en el núcleo de permisos: es
  todo un único árbol de 24 secciones. Por eso la Fase 6 no puede limitarse a
  "quitar módulos de pádel"; necesita una tabla de metadatos por módulo
  (`vertical: "sports" | "core" | ...`) para saber qué ocultar por plantilla.
- La matriz de 50 flujos de Make (`makeInventory.js`) es la pieza de mayor
  riesgo de romper si se toca: se trata como **solo lectura** en todo este
  paso, verificado con un test explícito (`50 flows intactos`).
- El sistema de autenticación real (Worker + cookies HttpOnly) es un
  identificador técnico fuera de alcance: el núcleo SaaS de este paso es una
  capa de **configuración y presentación**, no reemplaza autorización real.
- Con esta base, la arquitectura de la Fase 2 se implementa como una carpeta
  nueva (`app/src/saas-core/`) que **no mueve ni reescribe** ninguno de los
  archivos de arriba, y se conecta a `App.jsx`/`rbac.js` solo mediante un
  test de equivalencia (Fase 6), no mediante integración en vivo — evitando
  el riesgo de romper la app de Club Pádel 04 que otro terminal (T4) puede
  seguir modificando en paralelo en otro worktree.
