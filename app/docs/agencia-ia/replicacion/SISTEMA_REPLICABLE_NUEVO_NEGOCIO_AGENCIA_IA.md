# Sistema Replicable para Nuevo Negocio — Agencia IA

**Uso**: documento maestro que explica cómo pasar de Club Pádel 04 a un negocio en cualquier otro sector, usando la plantilla `projects/templates/negocio-replicable/`. Este documento no sustituye a la plantilla — la explica y la conecta con el resto de referencias de la agencia.

Referencias relacionadas: `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`, `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md`, `docs/agencia-ia/MATRIZ_PRECIOS_SERVICIOS_REPLICABLES.md`, `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md`, `projects/templates/negocio-replicable/README_PROCESO_REPLICABLE.md`.

---

## 1. Objetivo

Permitir que la Agencia IA cree un segundo (o tercer, o décimo) negocio replicando el proceso ya validado con Club Pádel 04, sin mezclar información, sin repetir estética visual sin justificación, y sin reinventar el proceso comercial cada vez.

Club Pádel 04 es el **caso de origen** — el sistema técnico y comercial nació ahí. Este documento explica cómo extraer ese aprendizaje sin arrastrar la identidad, los datos ni el código específico de Club Pádel 04 a un negocio distinto.

## 2. Proceso completo (orden de carpetas)

El proceso sigue el orden numérico de `projects/templates/negocio-replicable/`:

1. **00_brief_inicial** — recoger todos los datos del negocio nuevo.
2. **01_investigacion** — investigar sector y competencia (carpeta libre).
3. **02_oferta_y_posicionamiento** — definir qué se vende (carpeta libre).
4. **03_identidad_visual** — auditar la imagen actual y crear/adaptar el sistema visual.
5. **04_landing** — diseñar en Figma, escribir el copy, implementar el código.
6. **05_crm_y_prospeccion** — construir la lista de leads (Apify si hay crédito, manual si no).
7. Contacto comercial directo (fuera de plantilla).
8. **06_diagnostico** — por cada lead cualificado.
9. **07_pricing** — calcular precio conectado a la matriz maestra.
10. **08_propuesta** — documento final para el cliente.
11. **09_demo** — checklist antes de cada demo.
12. Cierre de venta (fuera de plantilla, negociación directa).
13. **10_onboarding** — arranque técnico y operativo.
14. **11_entrega_soporte** — mantenimiento continuo.
15. **12_marketing** — en paralelo desde el punto 6.
16. **13_cierre** — al finalizar el proyecto o revisar si merece la pena repetir el sector.

## 3. Qué se rellena vs. qué se reutiliza

**Se reutiliza sin cambios** (es el "motor" común de la agencia):
- La secuencia de fases y el orden de trabajo.
- La lógica de pricing (matriz maestra) — los rangos, no las cifras finales de cada cliente.
- El núcleo técnico documentado en `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`.
- Los checklists de proceso (onboarding, soporte, demo) en su estructura.

**Se rellena/adapta obligatoriamente por negocio**:
- Todo el contenido de `00_brief_inicial` hasta `03_identidad_visual` — es 100% específico del negocio.
- El copy de la landing y los mensajes de marketing — lenguaje adaptado al sector.
- El precio final (dentro del rango de la matriz, ajustado por las variables de `07_pricing/PRICING_TEMPLATE.md`).
- El CRM y los leads — cada sector con su propia hoja.

## 4. Cómo no mezclar proyectos

- Un negocio = una carpeta `projects/<slug-del-negocio>/`, creada copiando `projects/templates/negocio-replicable/`.
- Nunca editar `projects/club-padel-04/` desde el trabajo de otro negocio, ni al revés.
- Nunca compartir CRM, identidad visual, copy o pricing final entre dos negocios distintos, aunque sean del mismo sector.
- Ver detalle completo en `GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md` (mismo directorio).

## 5. Cómo analizar identidad visual existente

Seguir `projects/templates/negocio-replicable/03_identidad_visual/AUDITORIA_VISUAL_NEGOCIO_TEMPLATE.md`: colores, logo, tipografía, estilo fotográfico, tono, nivel premium/local, coherencia, puntos fuertes/débiles. La auditoría decide si se **respeta** la marca existente o se **crea** una nueva — nunca se decide a priori.

## 6. Cómo crear estética visual nueva si no existe

Seguir `projects/templates/negocio-replicable/03_identidad_visual/BRAND_SYSTEM_TEMPLATE.md`, apoyándose en la tabla de referencia por sector (paleta y tono orientativos) incluida en `README_PROCESO_REPLICABLE.md` §8. La estética nueva siempre se documenta — no se improvisa directamente en Figma sin dejar constancia de las decisiones de color/tipografía.

**Regla dura**: no copiar la estética verde/negro de Club Pádel 04 a otro negocio salvo que también sea un club deportivo y la paleta tenga sentido para su marca real.

## 7. Cómo pasar de Club Pádel 04 a un nuevo sector (resumen operativo)

1. Copiar `projects/templates/negocio-replicable/` a `projects/<slug-del-negocio>/`.
2. Rellenar el brief inicial con el nuevo negocio (nunca reutilizar datos de Club Pádel 04).
3. Ejecutar auditoría e identidad visual propia — punto de máxima atención, es donde más se nota si un negocio "se copió" de otro.
4. Adaptar copy de landing al lenguaje del sector (tabla en `LANDING_COPY_TEMPLATE.md`).
5. Referenciar (no copiar) el núcleo técnico para reservas/citas/roles desde `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`.
6. Seguir el resto del proceso (CRM → diagnóstico → pricing → propuesta → demo → cierre → onboarding → soporte) igual que con Club Pádel 04.

## 8. Cómo preparar una segunda venta (mismo sector, distinta zona/cliente)

- Reutilizar identidad visual solo si el nuevo cliente es el **mismo negocio** en otra sede — nunca reutilizar la marca de un cliente para vender a otro cliente distinto del mismo sector.
- Sí se reutiliza: el copy base adaptado (`LANDING_COPY_TEMPLATE.md` ya trabajado para ese sector), el diagnóstico y pricing ya calibrados, y el testimonio del primer cliente como prueba social (con su permiso explícito).
- Actualizar `13_cierre/CIERRE_TEMPLATE.md` del primer cliente del sector antes de lanzar la prospección del segundo — ahí queda documentado qué ajustar.

## 9. Cómo medir si el negocio (sector) merece la pena

Ver `projects/templates/negocio-replicable/13_cierre/CIERRE_TEMPLATE.md` §4: tiempo invertido vs. ingreso, facilidad de cierre, repetibilidad como caso de referencia, fricción técnica de adaptar el núcleo a ese sector. Un sector con alta fricción técnica y bajo ticket (ej. peluquería según la matriz maestra) se prioriza distinto a uno con ticket alto y núcleo muy reutilizable (ej. clínica dental, club deportivo).

## 10. Restricciones que aplican siempre

- Coste cero adicional: Figma gratis, Claude Code, GitHub, Google Drive, Apify solo con crédito validado.
- No usar APIs externas de pago sin permiso.
- No tocar Make, Airtable, Stripe, WhatsApp, pagos ni blueprints desde este sistema replicable — son integraciones de Club Pádel 04, fuera de alcance hasta que un negocio nuevo las necesite y se apruebe explícitamente.
- No hacer deploy ni push sin confirmación explícita del responsable.
