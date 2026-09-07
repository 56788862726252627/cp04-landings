# Estado actual · cp04-landings/app

Última actualización: 2026-08-26 · Claude Code (Terminal) · sesión de cierre y merge del Context Hub a main.

Ver `PROJECTS/*.md` para el detalle de cada proyecto. Esta página es el resumen
de una sola pantalla.

## Context Hub — estado de integración en main

| Campo | Valor |
|---|---|
| **Fecha** | 2026-08-26 |
| **Estado** | 100 % integrado en `main` |
| **PR limpio** | #79 (`docs/context-hub-clean`) — mergeado |
| **PR obsoleto** | #78 (`docs/resultado-merge-pr52-66-20260727`) — cerrado sin merge |
| **Merge SHA** | `aaf0eb3f6988f6e2a615f35e6e0f5e3eedab3521` |
| **Contenido del merge** | exclusivamente `app/.ai-context/` — 10 archivos, 648 inserciones, 0 borrados |
| **Deploy** | NO |
| **Secretos incluidos** | NO |
| **Cambios de producción** | NO |

Certeza: VERIFICADO DIRECTAMENTE (2026-08-26).

## Repositorio

| Campo | Valor | Certeza |
|---|---|---|
| Directorio base | `/root/cp04-landings/app` | VERIFICADO DIRECTAMENTE |
| Rama actual | `docs/resultado-merge-pr52-66-20260727` | VERIFICADO DIRECTAMENTE |
| Remoto | `origin` → `github.com/56788862726252627/cp04-landings.git` | VERIFICADO DIRECTAMENTE |
| Estado vs. origin | en sincronía con origin (Context Hub ya en main vía PR #79) | VERIFICADO DIRECTAMENTE (2026-08-26) |
| Working tree | 23 archivos modificados sin commitear + numerosos untracked (factory-cli, saas-core/deliverables, saas-core/factory, docs/paso-21..24, docs/registro-maestro-50-flujos-20260801, `examples/`) — **pre-existentes a esta sesión**, ninguno tocado por el Context Hub | VERIFICADO DIRECTAMENTE (2026-08-26) |

## Últimos 5 commits (rama actual)

1. `d17bbc8` fix(reservas): single-flight + reintento acotado ante 429 de Airtable
2. `7fe0fde` fix(csp): permite en connect-src el origen del Worker
3. `046ff6d` fix(auth): centraliza los 7 endpoints de autenticación en la URL base del Worker
4. `12dbe90` fix(reservas): centraliza el endpoint público del Worker y amplía CORS a previews
5. `e2d60af` fix(reservas): commit dependencias faltantes para build reproducible de API Reservas

Certeza: VERIFICADO DIRECTAMENTE (`git log`, 2026-08-26).

## Proyectos activos

| Proyecto | Estado resumido | Detalle |
|---|---|---|
| **Club Pádel 04** | Producto en curso; reservas, auth, QR, GDPR y recuperación de contraseña con commits recientes de cierre a producción real | `PROJECTS/club-padel-04.md` |
| **Agencia IA / Fábrica** | `factory-cli` y `src/saas-core` con scripts `business:*` y `agency:*` operativos localmente (CLI); BPMN Maestro documentado como Artifact externo (no vive en el repo) | `PROJECTS/agencia-ia.md` |
| **Bot de Trading** | Sin archivos ni commits localizados en este repo; existe solo como vertical objetivo mencionada por el usuario | `PROJECTS/bot-trading.md` — **PENDIENTE DE SINCRONIZAR** |

## Integraciones externas mencionadas en el repo (sin verificar acceso real desde esta sesión)

Supabase, Airtable, Make, Cloudflare Workers, Google Drive OAuth. Ver
`TOOL_REGISTRY.md` para el detalle de qué consta como configurado según el
código/documentación local, frente a lo que esta sesión puede verificar en
vivo (nada: no hay credenciales cargadas en esta sesión).

## Bloqueadores conocidos (según evidencia local, no verificados en vivo)

- `factory-cli` marca las integraciones (Stripe, WhatsApp, Google Drive real)
  con estados `not_implemented` / `NOT_CONFIGURED` en varias auditorías
  previas registradas en la memoria del asistente (ver `DECISIONS.md`).
  Certeza: EVIDENCIA PREVIA.
- El BPMN Maestro de la Fábrica Agencia IA existe únicamente como Artifact
  publicado fuera de este repositorio; no hay copia local en
  `/root/cp04-landings/app`. Certeza: VERIFICADO DIRECTAMENTE (no se encontró
  el archivo al buscar).

## Siguiente paso sugerido

Mantener este Context Hub actualizado en cada sesión material (ver
`README.md` § Cómo debe usarse) antes de iniciar trabajo nuevo sobre
Club Pádel 04, la Fábrica Agencia IA o el Bot de Trading.
