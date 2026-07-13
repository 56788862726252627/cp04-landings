# Export a Google Drive · Club Pádel 04

Esta carpeta es la copia organizada pensada para subir manualmente a Google Drive. Claude Code no ha asumido acceso directo a Drive: no hay ninguna carpeta de Drive montada localmente en este entorno, así que esta carpeta es el paquete a copiar/subir a mano.

**Regla de separación de negocios:** esta carpeta contiene exclusivamente material de Club Pádel 04. Si en el futuro se trabaja en otro negocio (p. ej. una clínica dental), debe crearse una carpeta hermana `drive-export/<nombre-negocio>/` completamente separada — nunca mezclar archivos de negocios distintos dentro de `drive-export/club-padel-04/`.

---

## 1. Qué contiene ya esta carpeta (copiado en esta sesión)

```
drive-export/club-padel-04/
├── README_EXPORT_CLUB_PADEL_04.md          ← este archivo
├── landing/
│   ├── README_LANDING_CLUB_PADEL_04.md     ← índice de toda la landing
│   ├── figma/
│   │   ├── BRAND_SYSTEM_CLUB_PADEL_04.md
│   │   └── FIGMA_LANDING_SPEC_CLUB_PADEL_04.md
│   └── copy/
│       └── LANDING_COPY_CLUB_PADEL_04.md
└── apify-prospeccion/
    └── APIFY_PROSPECCION_PLAN.md
```

Son documentos de texto (Markdown), pensados para leerse/imprimirse o convertirse a Google Docs — no incluyen el código de la landing (ver §3, por qué).

## 2. Qué carpetas copiar a Google Drive

1. **Esta carpeta completa** (`drive-export/club-padel-04/`) → subir tal cual a una carpeta de Drive llamada "Club Pádel 04" o similar. Es el paquete ya organizado y listo.
2. Opcionalmente, si se quiere tener también en Drive el material comercial ya existente (no incluido aquí para no duplicar binarios/documentos grandes innecesariamente), copiar manualmente desde el repo:
   - `docs/comercial-club-padel-04/` — propuestas, manuales, cartera comercial, capturas de demo.
   - `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` — pricing maestro.
   - `audit/agency-growth-marketing-system/` — marca, redes, Meta Ads, funnel.

## 3. Qué archivos pertenecen a cada categoría

| Categoría | Ruta en el repo | ¿Copiado ya en `drive-export/`? |
|---|---|---|
| **Landing — diseño visual** | `projects/club-padel-04/landing/figma/` | Sí |
| **Landing — copy** | `projects/club-padel-04/landing/copy/` | Sí |
| **Landing — código (HTML/CSS/JS/React)** | `projects/club-padel-04/landing/src/` | No — el código vive solo en GitHub, no se duplica en Drive (Drive no es un buen lugar para versionar código; usar el repo como fuente de verdad del código) |
| **Landing — imágenes reutilizadas** | `projects/club-padel-04/landing/assets/` | No — mismo motivo que el código; las imágenes originales ya están en `public/gallery/cp04/` del repo |
| **Landing — documentación índice** | `projects/club-padel-04/landing/docs/` | Sí |
| **Ventas / propuestas comerciales** | `docs/comercial-club-padel-04/` | No — ya existe y es voluminoso; copiar manualmente si se desea (ver §2.2) |
| **CRM / prospección** | `docs/comercial-club-padel-04/contacto-real/`, `cartera-comercial-consolidada/` | No — copiar manualmente si se desea |
| **Diagnóstico / pricing** | `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` | No — copiar manualmente si se desea |
| **Prospección con Apify** | `projects/club-padel-04/apify-prospeccion/` | Sí |

## 4. Cómo mantener una segunda carpeta separada para otro negocio

- Estructura recomendada en Drive: una carpeta raíz por negocio, replicando el mismo esqueleto (`landing/figma`, `landing/copy`, `landing/docs`, `apify-prospeccion`, etc.).
- No compartir subcarpetas entre negocios distintos, ni siquiera para elementos aparentemente genéricos (brand system, copy, pricing) — cada negocio tiene su propia identidad y condiciones comerciales.
- Si se generaliza esta landing como plantilla replicable para otros sectores, esa generalización se hace en `projects/templates/negocio-replicable/` y `drive-export/templates/` (fuera del alcance de esta tarea), nunca reescribiendo directamente esta carpeta de Club Pádel 04.

## 5. Cómo subir esto a Google Drive (proceso manual)

1. Abrir Google Drive en el navegador.
2. Crear (si no existe) una carpeta raíz "Club Pádel 04".
3. Arrastrar la carpeta local `drive-export/club-padel-04/` completa dentro de esa carpeta de Drive (Drive respeta la estructura de subcarpetas al arrastrar una carpeta completa).
4. Si se añade el material comercial adicional del §2.2, crear las subcarpetas correspondientes en Drive con los mismos nombres que en el repo para que la navegación sea consistente entre GitHub y Drive.

No se ha ejecutado ninguna subida real: esta carpeta solo prepara el contenido localmente, tal como pide la instrucción de no asumir Drive montado.
