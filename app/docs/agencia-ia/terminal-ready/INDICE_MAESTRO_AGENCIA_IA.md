# Índice Maestro — Agencia IA (Terminal-Ready)

**Fecha**: 2026-07-13 · Documento de referencia interna. Punto de entrada único a todo lo que existe hoy en la Agencia IA, organizado por bloque funcional, con la ruta exacta de cada documento y el siguiente paso recomendado. No sustituye a ningún documento existente — los enlaza y los ordena.

> **Nota de alcance**: esta fase se ha trabajado en un worktree separado (`worktrees/agency-terminal-ready`, rama `docs/agencia-ia-terminal-ready-2026-07-13`), sin tocar `app/docs/club-padel-04/terminal-ready/`, `app/projects/club-padel-04/terminal-ready/` ni ningún código funcional (Make, Airtable, Stripe, WhatsApp, Worker, App.jsx, auth, reservas, APIs externas). Es documentación pura.

---

## 1. Estado actual

- **Estimación de partida de esta fase (aportada por el usuario)**: Agencia IA ≈ **94,8% global**.
- **Última auto-evaluación documentada antes de esta fase**: [`CIERRE_FINAL_TRABAJO_TERMINAL_AGENCIA_IA.md`](../CIERRE_FINAL_TRABAJO_TERMINAL_AGENCIA_IA.md) situaba el trabajo de terminal en 100% (para esa fase) y el global en ~92%, con el resto dependiendo de ejecución comercial real y validaciones externas.
- **Lectura de la diferencia**: entre esa foto (2026-07-11/12) y hoy se han sumado piezas nuevas — verticales no deportivas (fisioterapia, peluquería/estética, veterinaria), matriz de sectores, consolidación comercial maestra, plantillas replicables y mapa de módulos reutilizables — lo que justifica el avance hacia ~94,8%. El detalle de qué falta para el máximo alcanzable solo desde terminal está en [`INFORME_TERMINAL_READY_AGENCIA_IA.md`](INFORME_TERMINAL_READY_AGENCIA_IA.md).
- Esta fase (2026-07-13) **no re-audita código ni cifras técnicas**: consolida navegación, cierra huecos comerciales que faltaban (CRM ampliado a 6 municipios con notas de contacto, guion comercial completo con seguimiento y objeciones, segundo ejemplo de negocio no deportivo) y deja constancia explícita de qué sigue bloqueado fuera de terminal.

---

## 2. Documentos existentes (mapa por bloque)

### 2.1 Producto base y arquitectura replicable
| Documento | Ruta |
|---|---|
| Arquitectura núcleo vs. vertical | `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md` |
| Base de conocimiento Drive/IA/skills/prompts | `docs/agencia-ia/BASE_CONOCIMIENTO_DRIVE_IA_SKILLS_PROMPTS.md` |
| Sistema replicable de nuevo negocio | `docs/agencia-ia/replicacion/SISTEMA_REPLICABLE_NUEVO_NEGOCIO_AGENCIA_IA.md` |
| Guía de separación de proyectos GitHub/Drive | `docs/agencia-ia/replicacion/GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md` |
| Mapa de módulos reutilizables CP04 | `docs/agencia-ia/plantillas-replicables/MAPA_MODULOS_REUTILIZABLES_CP04.md` |
| Matriz de reutilización SaaS | `docs/agencia-ia/plantillas-replicables/MATRIZ_REUTILIZACION_SAAS.md` |
| Mapa de plantilla deportiva clonable | `docs/agencia-ia/plantilla-deportiva-clonable/MAPA_PLANTILLA_DEPORTIVA_CLONABLE.md` |
| Roadmap Agencia IA replicable | `docs/agencia-ia/roadmap/ROADMAP_AGENCIA_IA_REPLICABLE.md` |

### 2.2 Sectores y verticales
| Documento | Ruta |
|---|---|
| Matriz de sectores SaaS | `docs/agencia-ia/sectores/MATRIZ_SECTORES_SAAS_AGENCIA_IA.md` |
| Vertical fisioterapia | `docs/agencia-ia/verticales-no-deportivos/fisioterapia/MAPA_VERTICAL_FISIOTERAPIA.md` (+ `cliente-demo/`, `comercial/`, `contacto/`, `demo/`) |
| Vertical peluquería/estética | `docs/agencia-ia/verticales-no-deportivos/peluqueria-estetica/MAPA_VERTICAL_PELUQUERIA_ESTETICA.md` (+ subcarpetas equivalentes) |
| Vertical veterinaria | `docs/agencia-ia/verticales-no-deportivos/veterinaria/MAPA_VERTICAL_VETERINARIA.md` (+ subcarpetas equivalentes) |
| **Nuevo en esta fase**: ejemplo de segundo negocio (clínica dental, sin carpeta vertical propia todavía) | `projects/agencia-ia/terminal-ready/EJEMPLO_SEGUNDO_NEGOCIO_CLINICA_DENTAL.md` |

### 2.3 Oferta y servicios
| Documento | Ruta |
|---|---|
| Plan de producto vendible | `docs/agencia-ia/productos/PLAN_PRODUCTO_VENDIBLE_AGENCIA_IA.md` |
| Paquetes comerciales | `docs/agencia-ia/comercial/PAQUETES_COMERCIALES_AGENCIA_IA.md` |
| Roadmap comercial por fases | `docs/agencia-ia/comercial/ROADMAP_COMERCIAL_POR_FASES.md` |

### 2.4 Pricing
| Documento | Ruta |
|---|---|
| **Pricing maestro (referencia canónica)** | `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` |
| Matriz maestra de precios (11 sectores) | `audit/comercial-plan-maestro-agencia-20260711/01_MATRIZ_MAESTRA_PRECIOS_REPLICABLES_AGENCIA_IA.md` |

> Regla vigente: ante cualquier contradicción de cifras entre documentos, manda el pricing maestro (`PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md`). Este índice no introduce precios nuevos.

### 2.5 Diagnóstico previo a venta
| Documento | Ruta |
|---|---|
| Diagnóstico previo a venta | `docs/agencia-ia/comercial/DIAGNOSTICO_PREVIO_VENTA_AGENCIA_IA.md` |

### 2.6 CRM y prospección
| Documento | Ruta |
|---|---|
| CRM municipios Málaga (radio Archidona, 36 registros) | `docs/agencia-ia/comercial/MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md` |
| **Nuevo en esta fase**: CRM inicial ampliado con ficha de negocio, contacto y notas por municipio (6 ejemplos: Archidona, Villanueva del Trabuco, Villanueva del Rosario, Antequera, Mollina, Alameda) | `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` + `.csv` |
| Apify/manual como método de prospección | Ver [`BLOQUEOS_EXTERNOS_AGENCIA_IA.md`](BLOQUEOS_EXTERNOS_AGENCIA_IA.md) §Apify real — el uso manual ya está integrado como criterio de captura de datos en el CRM ampliado de esta fase; el uso automatizado con Apify real sigue pendiente de ejecución externa |

### 2.7 Propuesta y mensajes comerciales
| Documento | Ruta |
|---|---|
| Propuesta Ayuntamiento (base genérica) | `docs/comercial-club-padel-04/PROPUESTA_AYUNTAMIENTO_CLUB_PADEL_04.md` |
| Propuesta Villanueva del Trabuco (segundo cliente objetivo) | `docs/agencia-ia/comercial/PROPUESTA_VILLANUEVA_DEL_TRABUCO_CLUB_PADEL_04.md` |
| Plantillas comerciales por sector | `docs/agencia-ia/comercial/PLANTILLAS_COMERCIALES_POR_SECTOR_AGENCIA_IA.md` |
| **Nuevo en esta fase**: guion comercial final (WhatsApp, email, llamada, seguimientos día 2/5, objeciones, cierre, mensajes por tipo de cliente) | `projects/agencia-ia/terminal-ready/GUION_COMERCIAL_FINAL_AGENCIA_IA.md` |

### 2.8 Demo
| Documento | Ruta |
|---|---|
| Manual de demo comercial | `docs/comercial-club-padel-04/MANUAL_DEMO_AYUNTAMIENTO_CLUB_PADEL_04.md` |
| Manual operativo interno de demo | `docs/comercial-club-padel-04/MANUAL_OPERATIVO_INTERNO_DEMO_CLUB_PADEL_04.md` |

### 2.9 Onboarding, entrega y soporte
| Documento | Ruta |
|---|---|
| Checklist de onboarding de cliente | `docs/agencia-ia/comercial/CHECKLIST_ONBOARDING_CLIENTE_CLUB_PADEL_04.md` |
| Checklist de adaptación a nuevo cliente | `docs/agencia-ia/operaciones/CHECKLIST_ADAPTACION_NUEVO_CLIENTE.md` |
| Proceso interno de entrega y soporte | `docs/agencia-ia/operaciones/PROCESO_INTERNO_ENTREGA_SOPORTE_AGENCIA_IA.md` |
| Checklist "no duplicar antes de crear" | `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md` |

### 2.10 Landing, marketing y captación
| Documento | Ruta |
|---|---|
| Landing, contenidos orgánicos y Meta Ads base | `docs/agencia-ia/marketing/LANDING_CONTENIDOS_META_ADS_BASE_AGENCIA_IA.md` |
| Landing/documentación Club Pádel 04 (producto de referencia, fuera de scope de esta fase) | `docs/club-padel-04/` (no editado en esta fase) |

### 2.11 Google Drive y GitHub (organización externa)
| Documento | Ruta |
|---|---|
| Guía de separación de proyectos GitHub/Drive | `docs/agencia-ia/replicacion/GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md` |
| Base de conocimiento Drive/IA/skills/prompts | `docs/agencia-ia/BASE_CONOCIMIENTO_DRIVE_IA_SKILLS_PROMPTS.md` |

### 2.12 Consolidación comercial maestra
| Documento | Ruta |
|---|---|
| Informe comercial maestro | `audit/comercial-plan-maestro-agencia-20260711/00_INFORME_COMERCIAL_MAESTRO_AGENCIA_IA.md` |
| Matriz maestra de precios replicables | `audit/comercial-plan-maestro-agencia-20260711/01_MATRIZ_MAESTRA_PRECIOS_REPLICABLES_AGENCIA_IA.md` |
| Consolidación (acciones, checklists, decisión, mensajes operativos, roadmap, seguimiento, verticales) | `docs/agencia-ia/consolidacion/` |

### 2.13 Cierre y bloqueos
| Documento | Ruta |
|---|---|
| Cierre final del trabajo de terminal (fase anterior) | `docs/agencia-ia/CIERRE_FINAL_TRABAJO_TERMINAL_AGENCIA_IA.md` |
| **Nuevo en esta fase**: checklist comercial terminal-ready | `terminal-ready/CHECKLIST_COMERCIAL_TERMINAL_READY_AGENCIA_IA.md` |
| **Nuevo en esta fase**: bloqueos externos Agencia IA | `terminal-ready/BLOQUEOS_EXTERNOS_AGENCIA_IA.md` |
| **Nuevo en esta fase**: informe terminal-ready final | `terminal-ready/INFORME_TERMINAL_READY_AGENCIA_IA.md` |

---

## 3. Documentos nuevos creados en esta fase (2026-07-13)

| # | Documento | Ruta | Tipo |
|---|---|---|---|
| 1 | Índice maestro Agencia IA (este documento) | `docs/agencia-ia/terminal-ready/INDICE_MAESTRO_AGENCIA_IA.md` | Navegación |
| 2 | Checklist comercial terminal-ready | `docs/agencia-ia/terminal-ready/CHECKLIST_COMERCIAL_TERMINAL_READY_AGENCIA_IA.md` | Checklist |
| 3 | CRM inicial de prospección (Markdown) | `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` | CRM |
| 4 | CRM inicial de prospección (CSV) | `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.csv` | CRM |
| 5 | Guion comercial final | `projects/agencia-ia/terminal-ready/GUION_COMERCIAL_FINAL_AGENCIA_IA.md` | Guion comercial |
| 6 | Ejemplo de segundo negocio (clínica dental) | `projects/agencia-ia/terminal-ready/EJEMPLO_SEGUNDO_NEGOCIO_CLINICA_DENTAL.md` | Vertical/ejemplo |
| 7 | Bloqueos externos Agencia IA | `docs/agencia-ia/terminal-ready/BLOQUEOS_EXTERNOS_AGENCIA_IA.md` | Bloqueos |
| 8 | Informe terminal-ready final | `docs/agencia-ia/terminal-ready/INFORME_TERMINAL_READY_AGENCIA_IA.md` | Informe de cierre |

---

## 4. Siguiente orden de ejecución

1. Leer [`INFORME_TERMINAL_READY_AGENCIA_IA.md`](INFORME_TERMINAL_READY_AGENCIA_IA.md) para el porcentaje actualizado y el máximo alcanzable solo desde terminal.
2. Repasar [`CHECKLIST_COMERCIAL_TERMINAL_READY_AGENCIA_IA.md`](CHECKLIST_COMERCIAL_TERMINAL_READY_AGENCIA_IA.md) antes de cualquier contacto comercial nuevo.
3. Abrir `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` (o el `.csv`) y elegir el primer registro con estado "Sin contactar" y prioridad más alta (Villanueva del Trabuco, según el orden ya fijado en el CRM de municipios existente).
4. Usar `projects/agencia-ia/terminal-ready/GUION_COMERCIAL_FINAL_AGENCIA_IA.md` para el primer mensaje (WhatsApp o email, según el canal disponible para ese contacto).
5. Si el sector de interés no es deportivo, usar `EJEMPLO_SEGUNDO_NEGOCIO_CLINICA_DENTAL.md` como plantilla de adaptación antes de preparar la propuesta.
6. Antes de prometer nada fuera de lo documentado, revisar [`BLOQUEOS_EXTERNOS_AGENCIA_IA.md`](BLOQUEOS_EXTERNOS_AGENCIA_IA.md) para no dar por resuelto lo que sigue dependiendo de ejecución real fuera de terminal.
7. Registrar cualquier avance real (respuesta, reunión, propuesta enviada) directamente en el CRM ampliado de esta fase, y trasladarlo también al CRM de municipios existente si aplica, para no mantener dos fuentes de verdad divergentes.

---

## 5. Regla de no duplicación

Este índice **no reemplaza** `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md`. Antes de crear cualquier documento nuevo de Agencia IA fuera de esta fase, consultar primero ese checklist y este índice para evitar duplicar contenido ya existente en `docs/agencia-ia/comercial/`, `docs/agencia-ia/operaciones/` o `audit/comercial-plan-maestro-agencia-20260711/`.
