# Guía de Separación de Proyectos — GitHub y Google Drive

**Uso**: reglas concretas para que ningún negocio nuevo mezcle carpetas, archivos o historial con Club Pádel 04 u otro negocio, tanto en GitHub como en Google Drive.

---

## 1. Cómo separar Club Pádel 04

- Club Pádel 04 vive en `projects/club-padel-04/` (si se migra al nuevo esquema) y en su copia `drive-export/club-padel-04/`.
- El código de la app actual (`src/`, `worker-reservas/`, etc., en la raíz del repo `app/`) sigue siendo el núcleo técnico de Club Pádel 04 y la base reutilizable — no se mueve ni se duplica al crear negocios nuevos.
- Ningún negocio nuevo escribe dentro de `projects/club-padel-04/` ni `drive-export/club-padel-04/`. Si se necesita referenciar algo de Club Pádel 04, se enlaza o se cita, no se copia el archivo dentro de la carpeta del nuevo negocio sin adaptar antes.

## 2. Cómo crear carpeta para una clínica dental

1. Copiar `projects/templates/negocio-replicable/` → `projects/clinica-dental-<nombre-o-zona>/` (ej. `projects/clinica-dental-antequera/`).
2. Rellenar `00_brief_inicial` con los datos reales de esa clínica.
3. En `03_identidad_visual`, aplicar la paleta orientativa de salud (blanco, azul, verde agua) solo si la clínica no tiene marca propia — si la tiene, respetarla.
4. Seguir el resto del proceso igual que cualquier otro negocio.

## 3. Cómo crear carpeta para un abogado

1. Copiar plantilla → `projects/abogado-<nombre-o-despacho>/`.
2. Paleta orientativa: azul marino, gris, blanco — tono serio y de autoridad.
3. Prestar especial atención al copy legal (`LANDING_COPY_TEMPLATE.md`, fila "Legal") — evitar jerga excesiva y promesas de resultado en casos.

## 4. Cómo crear carpeta para una peluquería

1. Copiar plantilla → `projects/peluqueria-<nombre-o-zona>/`.
2. Paleta orientativa: tonos elegantes según marca (femenino/masculino/neutro según el negocio real) — nunca asumir un estilo sin ver el negocio real primero.
3. Priorizar banco de imágenes de calidad y, si existen, fotos reales de antes/después con permiso explícito del cliente.

## 5. Cómo crear carpeta para un veterinario

1. Copiar plantilla → `projects/veterinaria-<nombre-o-zona>/`.
2. Paleta orientativa: verde, azul, tonos cálidos — tono cercano y familiar.
3. Motor técnico de citas reutilizado del núcleo de reservas (mismo patrón que fisioterapia/dental).

## 6. Cómo copiar a Google Drive

- Cada negocio nuevo tiene su carpeta espejo en `drive-export/<slug-del-negocio>/` (o, si se sigue la convención de Club Pádel 04, `drive-export/templates/` para las plantillas base y una carpeta específica por negocio cuando exista cliente real).
- Ver `drive-export/README_GOOGLE_DRIVE_SYNC.md` para el procedimiento exacto de copia manual.
- La copia a Drive es **posterior** al trabajo en GitHub, nunca al revés — GitHub es la fuente de verdad.

## 7. Qué no mezclar nunca

- Leads de un sector en el CRM de otro sector.
- Identidad visual de un negocio aplicada a otro (aunque sean del mismo sector).
- Pricing final de un cliente copiado literalmente a la propuesta de otro (el rango de la matriz sí se comparte, la cifra final no).
- Credenciales, tokens o datos de integración de un negocio en la carpeta de otro.
- Commits de dos negocios distintos mezclados en el mismo mensaje de commit.

## 8. Cómo nombrar carpetas y archivos

- Carpetas de negocio: `<sector>-<nombre-o-zona>` en minúsculas con guiones (ej. `clinica-dental-antequera`, `veterinaria-archidona`, `club-padel-villanueva`).
- Sin tildes, sin espacios, sin mayúsculas en nombres de carpeta.
- Archivos de leads/exportaciones: incluir sector y fecha (ej. `leads-fisioterapia-antequera-20260713.csv`).
- Documentos Markdown de plantilla: mantener el sufijo `_TEMPLATE.md` en la plantilla genérica; al rellenar para un negocio real, puede quitarse el sufijo o mantenerse según convenga, pero nunca debe quedar ambigüedad sobre si el archivo es la plantilla vacía o el documento ya rellenado de un cliente real.

## 9. Checklist rápido antes de crear un negocio nuevo

- [ ] ¿Existe ya una carpeta con nombre similar? (revisar `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md`)
- [ ] ¿El nombre de carpeta sigue la convención `<sector>-<nombre-o-zona>`?
- [ ] ¿Se ha copiado la plantilla completa, no solo algunos archivos sueltos?
- [ ] ¿Se ha confirmado que no se va a tocar `projects/club-padel-04/` ni `drive-export/club-padel-04/`?
