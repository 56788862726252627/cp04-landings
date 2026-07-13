# README — Proceso Replicable Nuevo Negocio (Agencia IA)

**Uso**: esta carpeta es la plantilla maestra para clonar el proceso comercial y técnico de Club Pádel 04 hacia cualquier otro sector (clínica dental, fisioterapia, veterinaria, gimnasio, peluquería/estética, abogados, clínica privada, clínica de fertilidad, negocio local genérico, otro club deportivo).

No es un proyecto en sí — es el molde. Cada negocio nuevo se crea copiando esta carpeta a `projects/<nombre-del-negocio>/` y rellenando sus documentos.

---

## 1. Qué se copia

- La **estructura de carpetas completa** (00 a 13).
- Los **documentos de proceso** (checklists, plantillas de diagnóstico, propuesta, onboarding, soporte, marketing, cierre) — son genéricos y funcionan para cualquier sector.
- La **lógica de pricing** (conecta siempre con `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` y `docs/agencia-ia/MATRIZ_PRECIOS_SERVICIOS_REPLICABLES.md` como referencia de precios — no se inventan cifras nuevas sin pasar por esa matriz).
- El **núcleo técnico reutilizable** de la app (motor de reservas/citas, roles, panel, autenticación) se referencia desde `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md` — no se duplica código aquí, solo se documenta cómo adaptarlo.

## 2. Qué se adapta obligatoriamente por negocio

- **Identidad visual completa** (ver regla visual obligatoria más abajo): colores, tipografía, tono, fotografía.
- **Copy de la landing**: lenguaje, ejemplos, objeciones, prueba social — adaptado al sector (salud, legal, deporte, estética, animales, servicios profesionales, negocio local).
- **Pricing final**: el rango sale de la matriz maestra, pero el número exacto se decide por sector, tamaño, urgencia y complejidad visual (ver `07_pricing/PRICING_TEMPLATE.md`).
- **CRM y prospección**: cada sector tiene su propia hoja de leads, nunca mezclada con otro sector ni con Club Pádel 04.
- **Mensajes de marketing**: tono y canal según el tipo de cliente objetivo.

## 3. Qué NO se toca nunca

- `projects/club-padel-04/` y `drive-export/club-padel-04/` (si existen) — son de otro negocio, no se editan ni se leen para copiar contenido salvo como referencia de proceso.
- Make, Airtable, Stripe, WhatsApp, blueprints de automatización y cualquier integración de pago — fuera de alcance de esta plantilla. Se documentan como "pendiente de conectar" hasta que el negocio real lo necesite.
- El código del núcleo (`src/`, `worker-reservas/`) — no se clona ni se bifurca aquí. Se referencia, no se copia.
- La estética visual de Club Pádel 04 (verde/negro deportivo) — no se reutiliza automáticamente en otro sector, salvo que el nuevo negocio sea también un club deportivo y la paleta tenga sentido para su marca real.

## 4. Documentos que hay que rellenar (orden exacto de trabajo)

1. `00_brief_inicial/BRIEF_NUEVO_NEGOCIO.md` — recoger todos los datos del negocio antes de tocar nada más.
2. `01_investigacion/` — investigar el sector y la competencia (crear notas libres a partir del brief; sin plantilla fija, cada sector es distinto).
3. `02_oferta_y_posicionamiento/` — definir qué se vende y cómo se diferencia (notas libres a partir del brief + investigación).
4. `03_identidad_visual/AUDITORIA_VISUAL_NEGOCIO_TEMPLATE.md` → luego `03_identidad_visual/BRAND_SYSTEM_TEMPLATE.md`.
5. `04_landing/figma/FIGMA_SPEC_TEMPLATE.md` → diseño en Figma → `04_landing/copy/LANDING_COPY_TEMPLATE.md` → implementación en `04_landing/src/`.
6. `05_crm_y_prospeccion/CRM_TEMPLATE.md` + `05_crm_y_prospeccion/apify/APIFY_OR_MANUAL_PROSPECTION_TEMPLATE.md`.
7. Contactar clientes (fuera de plantilla — es trabajo comercial directo).
8. `06_diagnostico/DIAGNOSTICO_TEMPLATE.md` por cada lead cualificado.
9. `07_pricing/PRICING_TEMPLATE.md` — calcular precio final conectado a la matriz maestra.
10. `08_propuesta/PROPUESTA_TEMPLATE.md`.
11. `09_demo/DEMO_CHECKLIST_TEMPLATE.md` antes de cada demo.
12. Cierre de venta (fuera de plantilla — negociación directa).
13. `10_onboarding/ONBOARDING_TEMPLATE.md`.
14. `11_entrega_soporte/SOPORTE_TEMPLATE.md`.
15. `12_marketing/MARKETING_TEMPLATE.md` (en paralelo, desde el punto 6 en adelante).
16. `13_cierre/CIERRE_TEMPLATE.md` al finalizar el proyecto o el contrato.

## 5. Cómo guardar en GitHub

- Cada negocio nuevo vive en `projects/<slug-del-negocio>/` (ej. `projects/clinica-dental-antequera/`), copiado desde esta plantilla.
- Un commit inicial por negocio: `chore: init <slug-del-negocio> desde plantilla negocio-replicable`.
- No mezclar commits de un negocio con otro. Si se trabaja en paralelo (varios terminales), cada terminal edita solo su carpeta de negocio, nunca la de otro.
- No hacer commit de plantillas rellenadas con datos reales de cliente en ramas compartidas sin revisar antes que no haya credenciales, teléfonos o datos personales sensibles expuestos innecesariamente.

## 6. Cómo copiar a Google Drive

- Ver `drive-export/README_GOOGLE_DRIVE_SYNC.md` y `drive-export/templates/README_EXPORT_TEMPLATES_NEGOCIO_REPLICABLE.md` para el detalle completo.
- Regla corta: el repo de GitHub es la fuente de verdad; Google Drive es una copia ordenada para compartir con el cliente o guardar backup, nunca al revés.

## 7. Cómo separar proyectos

- Ver `docs/agencia-ia/replicacion/GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md`.
- Regla corta: una carpeta por negocio, un nombre de carpeta = slug del negocio en minúsculas con guiones, nunca abreviaturas ambiguas.

## 8. Cómo mantener una identidad visual distinta por negocio

### Regla visual obligatoria

Si el nuevo negocio **no es Club Pádel 04**, no se copia automáticamente la estética verde/negro deportiva de Club Pádel 04.

Para cada negocio nuevo hay que crear o adaptar una identidad visual propia basada en:

- sector del negocio;
- colores reales del negocio existente (si los tiene);
- logo real (si existe);
- tipografía o estilo visual que ya use;
- tono de comunicación;
- tipo de cliente;
- nivel premium o local del servicio;
- fotografías o imágenes propias del sector;
- estilo de su web/redes actuales (si existen);
- imagen que el negocio ya transmite.

**Si el negocio ya tiene marca**: la prioridad es respetarla y adaptarla a formato landing SaaS, no sustituirla por un estilo genérico.

**Si el negocio no tiene marca**: se crea una propuesta visual nueva y documentada en `03_identidad_visual/BRAND_SYSTEM_TEMPLATE.md`, coherente con el sector. Referencia rápida de tono por sector:

| Sector | Paleta orientativa | Tono |
|---|---|---|
| Clínica dental | Blanco, azul, verde agua | Limpieza, confianza, salud, claridad |
| Clínica de fertilidad | Tonos suaves, pastel | Confianza, privacidad, calma, premium |
| Abogados/gestoría | Azul marino, gris, blanco | Seriedad, autoridad, confianza |
| Peluquería/estética | Tonos elegantes según marca | Belleza, cercanía, antes/después |
| Veterinaria | Verde, azul, tonos cálidos | Cercanía, animales, confianza familiar |
| Gimnasio | Negro/rojo/naranja/verde según marca | Energía, fuerza, movimiento |
| Club deportivo | Colores propios del club | Deportivo, dinámico, comunidad |
| Negocio local genérico | A definir en auditoría visual | Cercanía, confianza local |

Esta tabla es orientativa, no una regla cerrada — la auditoría visual del negocio real manda siempre sobre la tabla.

## 9. Coste cero adicional (restricciones obligatorias)

- Figma gratis para diseño.
- Claude Code para implementación en el repo.
- GitHub como almacenamiento principal.
- Google Drive como copia ordenada.
- Apify **solo** si hay crédito disponible o coste validado antes de usarlo — siempre con alternativa manual gratuita documentada (`05_crm_y_prospeccion/apify/APIFY_OR_MANUAL_PROSPECTION_TEMPLATE.md`).
- No usar APIs externas de pago sin permiso explícito.
- No tocar Make, Airtable, Stripe, WhatsApp, pagos ni blueprints desde esta plantilla.
- No hacer deploy ni push desde el trabajo de plantilla sin confirmación explícita.
