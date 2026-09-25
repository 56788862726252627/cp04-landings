# Índice Maestro — Club Pádel 04

Fecha: 2026-07-13
Rama: `docs/club-padel-terminal-ready-2026-07-13`
Worktree: `worktrees/club-terminal-ready` (creado desde `origin/main`)
Alcance: documentación terminal-ready, sin tocar código funcional.

## 1. Estado actual (honesto)

Club Pádel 04 es un frontend Vite/React (`src/App.jsx`, 393 líneas) que actúa como
landing + demo comercial de un club de pádel, con un Worker de Cloudflare
(`worker-reservas/`) preparado como proxy de reservas hacia Make. Es el activo que
la Agencia IA usa como caso de estudio del sistema replicable.

Verificado en este repo (`app/docs/final-report.md`, `app/docs/auth-roles.md`,
`app/docs/integraciones.md`):

- `npm run lint` y `npm run build` pasan.
- No hay secretos reales expuestos en el repo.
- Los paneles de rol (PLAYER/STAFF/ADMIN/SUPPORT) son **demo visual**, sin
  autenticación real ni autorización server-side.
- Ninguna integración externa (Make, Airtable, Stripe, WhatsApp, Google
  Calendar, Google Drive) está conectada con credenciales reales.
- El dominio en `index.html` sigue siendo el placeholder
  `https://clubpadel04.example/`.
- El JSON-LD sigue teniendo `CONFIGURAR_ZONA_REAL` sin reemplazar.
- No se ha ejecutado QA E2E en navegador real dentro de este entorno.

En una frase: **landing y documentación de venta muy avanzadas y coherentes;
backend funcional (auth, reservas reales, integraciones) sigue en fase
"preparado", no "conectado".**

## 2. Documentos principales de esta fase

Creados en esta rama (`docs/club-padel-terminal-ready-2026-07-13`):

- `app/docs/club-padel-04/terminal-ready/INDICE_MAESTRO_CLUB_PADEL_04.md` (este documento)
- `app/docs/club-padel-04/terminal-ready/CHECKLIST_TERMINAL_READY_CLUB_PADEL_04.md`
- `app/docs/club-padel-04/terminal-ready/AUDITORIA_FINAL_ROLES_CLUB_PADEL_04.md`
- `app/docs/club-padel-04/terminal-ready/BLOQUEOS_EXTERNOS_CLUB_PADEL_04.md`
- `app/docs/club-padel-04/terminal-ready/INFORME_TERMINAL_READY_CLUB_PADEL_04.md`
- `app/projects/club-padel-04/terminal-ready/DEMO_COMERCIAL_CLUB_PADEL_04.md`

Documentos previos ya existentes en `main` que estos nuevos documentos
referencian y complementan (no se editan):

- `app/docs/final-report.md`
- `app/docs/production-checklist.md`
- `app/docs/auth-roles.md`
- `app/docs/integraciones.md`
- `app/docs/deployment.md`
- `app/docs/backend-reservas.md`
- `app/docs/gallery-assets.md`
- `app/docs/seo.md`
- `app/docs/phase-1-audit.md`
- `app/projects/club-padel-04/demo/README.md`
- `app/projects/club-padel-04/diagnostico/README.md`
- `app/projects/club-padel-04/pricing/README.md`
- `app/projects/club-padel-04/sales/README.md`
- `app/projects/club-padel-04/crm/README.md`
- `app/projects/club-padel-04/apify-prospeccion/APIFY_PROSPECCION_PLAN.md`

## 3. Landing

- Frontend Vite/React, responsive, con navegación móvil (drawer + overlay +
  Escape + scroll lock).
- Galería configurable por variables `VITE_CP04_PUBLIC_GALLERY_*` (corregida a
  modo honesto: sin fotos falsas, con fallback si no hay imagen real).
- Hero visual usado como recurso de marca (no como fotografía real del club).
- SEO técnico (metadatos, Open Graph, Twitter Card, JSON-LD) preparado pero con
  placeholders de dominio y zona pendientes de sustitución real.

## 4. App (funcionalidad)

- Flujo de reserva: validación de datos, estados pending/sending/success/error,
  prevención de doble envío. Envía a `/api/reservas` o al Worker.
- Paneles de rol visibles en modo demo: Inicio/Reservas/Ranking (PLAYER),
  Gestión (STAFF), Admin (ADMIN), Soporte (SUPPORT).
- No hay base de datos de usuarios real, ni reservas persistidas contra un
  backend productivo.

## 5. Flujos Make

- Flujo previsto: `Frontend -> /api/reservas o Worker -> Make -> Airtable /
  notificaciones`.
- El Worker (`worker-reservas/src/index.js`) está preparado para reenviar a un
  webhook de Make, pero el webhook real (`MAKE_RESERVAS_WEBHOOK`) no está
  configurado ni desplegado en este entorno.
- No se toca ni se audita el blueprint de Make en esta fase (fuera de alcance
  explícito del encargo).

## 6. Roles

Ver detalle completo en `AUDITORIA_FINAL_ROLES_CLUB_PADEL_04.md`. Resumen:

- PLAYER, STAFF, ADMIN, SUPPORT existen como panel visual.
- Ningún rol está protegido server-side todavía.
- Riesgo conocido y ya documentado en `app/docs/auth-roles.md` antes de esta
  fase: publicar así expondría paneles internos a cualquier visitante.

## 7. Demo

Ver `app/projects/club-padel-04/terminal-ready/DEMO_COMERCIAL_CLUB_PADEL_04.md`
para guiones de 10 y 30 minutos orientados a club privado y a ayuntamiento.

## 8. Bloqueos externos

Ver `BLOQUEOS_EXTERNOS_CLUB_PADEL_04.md` para el detalle de WhatsApp Business,
Stripe, Airtable, fotos reales, Drive manual, prospección Apify, deploy/dominio
y cliente piloto real.

## 9. Siguiente orden de ejecución recomendado

1. Cerrar `CHECKLIST_TERMINAL_READY_CLUB_PADEL_04.md` (este PR) como fuente de
   verdad de lo pendiente.
2. Resolver desde terminal lo marcado como "pendiente terminal" (placeholders,
   copy, checklist de QA manual, guiones de demo).
3. Priorizar auth real (server-side) antes de conectar cualquier integración
   con datos privados reales.
4. Sólo después, abordar bloqueos externos (WhatsApp, Stripe, Airtable, fotos,
   dominio, cliente piloto) fuera de esta sesión de terminal.

## 10. Qué está en `main`

- Landing + documentación Club Pádel 04.
- Sistema replicable (plantillas comerciales por sector).
- Base de conocimiento Agencia IA.
- Corrección de galería honesta (sin fotos falsas).
- Corrección de hero visual como recurso de marca (no fotografía real).

## 11. Qué queda fuera de esta fase terminal

- Cualquier integración real con Make, Airtable, Stripe, WhatsApp, Google
  Calendar o Google Drive.
- Autenticación real y autorización server-side.
- Deploy de frontend o Worker.
- Fotografías reales del club, dominio real, cliente piloto real.
- Prospección real vía Apify.

## 12. Qué no tocar sin permiso

- `app/src/App.jsx` y cualquier código fuente de la app.
- `worker-reservas/` (Worker, auth, reservas).
- Cualquier blueprint de Make, credencial de Airtable/Stripe/WhatsApp.
- `app/docs/agencia-ia/terminal-ready/` (si existiera).
- `app/projects/agencia-ia/`.
- `app/projects/templates/negocio-replicable/`.
- La carpeta principal `/root/cp04-landings/app` (esta fase trabaja solo en el
  worktree `worktrees/club-terminal-ready`).
