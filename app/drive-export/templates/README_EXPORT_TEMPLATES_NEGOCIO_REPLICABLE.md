# README — Exportación de Plantillas Negocio Replicable a Google Drive

**Uso**: detalla cómo llevar la plantilla `projects/templates/negocio-replicable/` a Google Drive como copia accesible, para que cualquier persona de la agencia pueda arrancar un negocio nuevo sin necesidad de clonar el repositorio de GitHub.

---

## 1. Qué copiar

- Todos los documentos `_TEMPLATE.md` de `projects/templates/negocio-replicable/` (00 a 13), convertidos a Google Docs para facilitar el rellenado colaborativo sin git.
- `projects/templates/negocio-replicable/README_PROCESO_REPLICABLE.md` como documento guía principal, colocado en la raíz de la carpeta de Drive de plantillas.
- Los README de las carpetas libres (`01_investigacion/README.md`, `02_oferta_y_posicionamiento/README.md`, etc.) para que quede claro qué hacer aunque no haya plantilla cerrada.

## 2. Qué NO copiar

- Carpetas vacías de ejemplo (`04_landing/src/`, `04_landing/assets/`) — no tienen contenido que exportar, solo instrucciones ya cubiertas en su README.
- Cualquier plantilla ya rellenada con datos de un cliente real — eso va a la carpeta del negocio específico en Drive, no a `templates/`.

## 3. Estructura recomendada en Drive

```
Google Drive/
  Agencia IA/
    templates/
      README_PROCESO_REPLICABLE
      00_brief_inicial/
        BRIEF_NUEVO_NEGOCIO
      03_identidad_visual/
        AUDITORIA_VISUAL_NEGOCIO_TEMPLATE
        BRAND_SYSTEM_TEMPLATE
      04_landing/
        FIGMA_SPEC_TEMPLATE
        LANDING_COPY_TEMPLATE
      05_crm_y_prospeccion/
        CRM_TEMPLATE
        APIFY_OR_MANUAL_PROSPECTION_TEMPLATE
      06_diagnostico/
        DIAGNOSTICO_TEMPLATE
      07_pricing/
        PRICING_TEMPLATE
      08_propuesta/
        PROPUESTA_TEMPLATE
      09_demo/
        DEMO_CHECKLIST_TEMPLATE
      10_onboarding/
        ONBOARDING_TEMPLATE
      11_entrega_soporte/
        SOPORTE_TEMPLATE
      12_marketing/
        MARKETING_TEMPLATE
      13_cierre/
        CIERRE_TEMPLATE
```

## 4. Cómo mantener el repo como fuente principal

- Cualquier mejora a una plantilla (nuevo campo, checklist ajustado) se hace primero en `projects/templates/negocio-replicable/` dentro de GitHub, y **después** se replica en Drive — nunca al revés.
- Marcar en el propio nombre del documento de Drive o en una nota superior la fecha de la última sincronización con GitHub, para detectar plantillas de Drive desactualizadas.

## 5. Cómo hacer la copia manual

1. Copiar el contenido Markdown del archivo `_TEMPLATE.md`.
2. Crear/actualizar el Google Doc correspondiente en la carpeta `templates/` de Drive, pegando el contenido (Google Docs interpreta bien encabezados y listas Markdown al pegar como texto).
3. Revisar que las tablas se mantengan legibles (Google Docs no soporta Markdown de tablas nativamente — convertir a tabla nativa de Docs si el formato se rompe).
4. Confirmar que el documento en Drive queda como **plantilla en blanco**, no con datos de ejemplo de un cliente real.

## 6. Qué revisar antes de compartir

- Que ningún documento de plantilla arrastre accidentalmente datos de Club Pádel 04 u otro cliente (revisar que no queden ejemplos rellenados por error).
- Permisos de la carpeta `templates/`: acceso interno de agencia, no público, salvo que se decida compartir el proceso como material comercial propio.

## 7. Cómo no duplicar carpetas

- Antes de crear la carpeta `templates/` en Drive, comprobar que no existe ya una versión antigua con otro nombre (ej. "plantillas", "molde negocio", "base replicable") — consolidar en una sola carpeta con el nombre `templates/` para que coincida con `drive-export/templates/` del repo.

## 8. Cómo separar Club Pádel 04 de nuevos negocios

- Esta carpeta de plantillas es neutra (no pertenece a ningún negocio) y vive al mismo nivel que `club-padel-04/`, nunca dentro de ella.
- Al crear un negocio nuevo, se copia esta plantilla a una carpeta de negocio nueva en Drive — la carpeta `templates/` en sí nunca se rellena con datos reales de ningún cliente.
