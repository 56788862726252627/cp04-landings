# PROGRESS — Fase 3B: Datos reales + QA final

## Estado: EN CURSO (2026-09-21)

### Etapa 0 — Protección previa ✓
- Backups verificados: backup-5175-pre-ux-20260921-0259 (GitHub) · f7085ac Fase 1 ·
  595e70d + cp04-factory-capabilities-20260921-0552 Fase 3A · Factory d79c88e Fase 2.
- Working trees limpios en ambos repos. Sin reset/push/deploy.

### Datos reales autorizados (propietario)
- Instagram: https://www.instagram.com/clubpadel04?stkn=d2k2bWFndW8ybWt5
- Facebook: https://www.facebook.com/share/18N64j8e4P/
- YouTube: https://youtube.com/@clubpadel04?si=sGW0rDo7pDA6N_70
- LinkedIn: https://www.linkedin.com/company/club-padel-04/
- Dirección: Calle Ciudad de Cuenca, Antequera, España, 29200
- NO activar: whatsapp, tiktok, x, email, phone (sin datos reales).

### Plan:
1. socialChannels.js: 4 canales reales (instagram, facebook, youtube, linkedin).
2. PhysicalLocation nativo CP04: sección "Dónde encontrarnos" con dirección real
   + enlace "Cómo llegar" (búsqueda de Google Maps por URL textual — determinista,
   sin claves, sin iframe) — sin coordenadas inventadas.
3. i18n: claves dónde encontrarnos/cómo llegar (es-ES, en-GB, en-US).
4. QA local 5175 (DOM), tests, build.
5. QA Factory + dry runs A/B.
6. Informes + commit/tag.

### Siguiente: configurar socialChannels.js
