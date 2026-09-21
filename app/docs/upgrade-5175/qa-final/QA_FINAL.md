# QA FINAL — Club Pádel 04 5175 (Fase 3B)

**Fecha:** 2026-09-21 · **Base:** Fase 1 (f7085ac) + Fase 3A (595e70d) + Fase 3B (este commit)

## Redes activadas (datos reales del propietario)

| Canal | URL | Verificación |
|---|---|---|
| Instagram | https://www.instagram.com/clubpadel04?stkn=d2k2bWFndW8ybWt5 | PASS — URL intacta |
| Facebook | https://www.facebook.com/share/18N64j8e4P/ | PASS |
| YouTube | https://youtube.com/@clubpadel04?si=sGW0rDo7pDA6N_70 | PASS |
| LinkedIn | https://www.linkedin.com/company/club-padel-04/ | PASS |

Renderizadas en sección "Contacto y redes" + footer compacto (placement both). 13/13 checks PASS (resolveCp04SocialChannels): exactamente 4 canales, URLs sin alterar.

## Redes ocultas (sin dato real)

- WhatsApp = OCULTO por falta de dato real ✓
- TikTok = OCULTO por falta de dato real ✓
- X = OCULTO por falta de dato real ✓
- email = OCULTO por falta de dato real ✓
- teléfono = OCULTO por falta de dato real ✓

## Ubicación

- Dirección real: **Calle Ciudad de Cuenca, Antequera, España, 29200** — sección "Dónde encontrarnos" activada.
- Sin coordenadas inventadas, sin portal, sin teléfono/horarios/parking no confirmados.
- Mapa: SIN iframe/embed (no existe embedUrl real). Enlace "Cómo llegar" = búsqueda pública de Google Maps construida determinísticamente desde la dirección textual (sin claves, sin API, sin llamada desde la app). target=_blank + rel=noopener noreferrer.

## QA de fases previas (regresión visual)

- Identidad conservada (tokens T, negro/grafito, lima, glass) ✓
- Comparativa (Fase 1) ✓ · Cómo empezar (3A) ✓ · Ver disponibilidad (3A) ✓ · Plan badge (1) ✓
- Footer enriquecido con FooterSocial compacto (4 iconos, sin duplicar sección completa) ✓
- Hero, nav, vídeos, planes, FAQ, CTA final, login — intactos ✓

## Accesibilidad

aria-label por canal · rel=noopener noreferrer en externos · touch targets ≥32px · foco visible (LandingBtn/a nativos) · address semántica · teclado funcional (enlaces nativos).

## Responsive

Grids auto-fit (canales flex-wrap, ubicación min 260px) · media query 720px · prioridad Samsung Galaxy Tab pendiente de revisión humana (checklist abajo).

## i18n

Claves nuevas landing.donde.* (eyebrow/title/como_llegar) en es-ES, en-GB, en-US. Sin cadenas hardcodeadas.

## Pruebas

- Verificación canales/dirección: 13/13 PASS
- Build: PASS (5.47s)
- Tests: 22 fail = 22 preexistentes idénticos al baseline de Fase 1/3A (diff vacío). CERO regresiones nuevas.
- HMR 5175: módulos sirven canales reales (14 menciones) + dirección/maps (PhysicalLocation).
- Cero llamadas Airtable/Make/Stripe/WhatsApp, cero efectos externos.

## Rollback

```
git reset --hard cp04-real-social-location-<TAG>~1   # vuelve a Fase 3A
git reset --hard cp04-factory-capabilities-20260921-0552  # Fase 3A
git reset --hard backup-5175-pre-ux-20260921-0259    # original pre-Fase 1
```

## Pendientes externos / revisión humana

- [ ] Revisión visual del propietario en tablet (Samsung Galaxy Tab): contacto/redes, dónde encontrarnos, cómo empezar, hero con 3 CTAs, footer social, 360/390/768/1024/desktop
- [ ] Confirmar visualmente que los 4 enlaces sociales abren los perfiles correctos
- [ ] Enlace "Cómo llegar" abre Google Maps con la dirección correcta
- NO VERIFICABLE EXTERNAMENTE desde esta sesión: apertura real de perfiles (requiere navegador del propietario)
