# FINAL REPORT — Fase 1: Elevación UX 5175

**Fecha:** 2026-09-21 · **Repo:** /root/cp04-landings · **Branch:** docs/resultado-merge-pr52-66-20260727

## Backup pre-upgrade (verificado y en GitHub)

- Commit: 0972aef · Tag: backup-5175-pre-ux-20260921-0259
- Push: branch + tag OK a github.com/56788862726252627/cp04-landings
- Detalle: docs/upgrade-5175/BACKUP.md

## Commit final local

(ver hash abajo — commit local, SIN segundo push)

## Archivos modificados (3)

1. **src/components/landing/Landing.jsx** — fix typo badge plan Club (p.descacado→destacado, el badge "más elegido" nunca se mostraba); nueva sección COMPARATIVA manual vs CP04 (4 filas: reservas, pista cancelada, acceso, informes; check/cross; columna CP04 con acento lima); footer enriquecido (marca+tagline / navegación con las 5 secciones / acceso clientes + solicitar demo / línea legal RGPD); Integraciones pasa de --dark a --integraciones para romper franjas oscuras consecutivas.
2. **src/clients/club-padel-04/landingExperience.css** — .cp04-section--comparativa (gradiente sutil sin imagen — respeta la regla de no repetir A-E) y .cp04-section--integraciones (padding propio, responsive).
3. **src/i18n/translations.js** — PRODUCT_NINETEENTH_TRANSLATIONS: claves comparativa.* y footer.* en es-ES/en-GB/en-US con fallback es-ES.

## Qué NO se tocó

Identidad visual (negro/grafito, lima/turquesa, T tokens), hero, nav, problemas, LandingMedia (vídeos), producto (6 cards), automatizaciones, seguridad, testimonios (badge DEMO honesto), planes, FAQ, CTA final, selector de idioma de la app, auth/RBAC, Worker, Make, Airtable, Supabase, Cloudflare, secrets, webhooks, Stripe, WhatsApp, Telegram. Cero dependencias nuevas.

## Pruebas

- Build: PASS (8.02s)
- Tests: 2600 pass / 23 fail — los 23 son PREEXISTENTES (diff baseline vs cambios = vacío, verificado con stash): makeInventory/makeAppIntegrationMap/makeArchitectureMatrix/agencyApiRouter/fixtures de fecha. CERO regresiones nuevas.
- HMR 5175 verificado: el módulo servido contiene comparativa + fix destacado.

## Limitaciones

- La comparativa usa textos es-EN/GB/US; resto de idiomas caen al fallback es-ES (comportamiento estándar del proyecto).
- El badge del plan Club requiere verificación visual humana (ahora se renderiza; antes nunca).
- Verificación visual completa en tablet/móvil pendiente de revisión humana (checklist abajo).

## Checklist visual para revisión humana (tablet)

- [ ] Hero: titular + 2 CTAs visibles sin scroll (tablet vertical 768px)
- [ ] Comparativa: 3 columnas legibles sin overflow horizontal en 768px y 1024px
- [ ] Plan Club: badge "más elegido" visible sobre la card
- [ ] Footer: 3 columnas no se solapan en 768px; enlaces navegan
- [ ] Integraciones: franja con más aire que antes (no pegada a Seguridad)
- [ ] Menú móvil: hamburguesa abre/cierra, Escape cierra, foco visible
- [ ] FAQ: acordeón abre/cierra con teclado
- [ ] Sin CLS visible al cargar; sin scroll horizontal en 360px

## Rollback exacto

```
cd /root/cp04-landings
git checkout docs/resultado-merge-pr52-66-20260727
git reset --hard backup-5175-pre-ux-20260921-0259
```

(El backup está también en GitHub: branch + tag empujados.)
