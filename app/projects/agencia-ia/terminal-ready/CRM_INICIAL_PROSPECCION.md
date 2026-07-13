# CRM Inicial de Prospección — Agencia IA

**Fecha**: 2026-07-13 · Documento de trabajo interno, no comercial. Complementa (no sustituye) a `docs/agencia-ia/comercial/MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`, que sigue siendo la fuente de verdad para el ranking, los tiempos y el precio recomendado por municipio. Este documento añade una ficha de negocio/contacto por registro, en el formato de campos pedido para esta fase, y sirve de base para el `.csv` hermano (`CRM_INICIAL_PROSPECCION.csv`).

> **Aviso**: todos los campos de contacto (nombre, teléfono, email, web, redes) están marcados como **"por localizar"** salvo el registro de Archidona (piloto ya cerrado). No son datos verificados — deben confirmarse antes de cualquier contacto real. Ningún dato de este documento debe tratarse como una base de datos de clientes real todavía.

---

## 1. Campos del registro

| Campo | Descripción |
|---|---|
| Municipio | Localidad objetivo |
| Sector | Tipo de negocio/institución |
| Negocio | Nombre de la instalación/entidad concreta, si se conoce |
| Contacto | Nombre y cargo de la persona de contacto, si se conoce |
| Teléfono | Teléfono directo, si se conoce |
| Email | Email directo, si se conoce |
| Web | Web oficial del municipio/negocio |
| Redes | Redes sociales relevantes (Facebook/Instagram del ayuntamiento o negocio) |
| Prioridad | P1/P2/P3, heredada de `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md` cuando aplica |
| Problema detectado | Hipótesis de problema a resolver (a confirmar en diagnóstico real) |
| Propuesta recomendada | Paquete recomendado según `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` |
| Estado | Sin contactar / Contactado / Demo agendada / Propuesta enviada / En negociación / Cerrado / Descartado |
| Próxima acción | Siguiente paso concreto, con responsable implícito (agencia) |
| Notas | Cualquier matiz relevante no cubierto por los campos anteriores |

---

## 2. Registros

### 2.1 Archidona (referencia — piloto ya cerrado, no prospección activa)

- **Sector**: Ayuntamiento / instalación deportiva municipal.
- **Negocio**: Pistas de pádel municipales de Archidona (Club Pádel 04).
- **Contacto**: Ayuntamiento de Archidona, Concejalía de Deportes (ya en relación comercial activa, sin necesidad de re-prospección).
- **Teléfono**: No aplica — canal ya establecido por el proyecto piloto.
- **Email**: No aplica — canal ya establecido por el proyecto piloto.
- **Web**: Web municipal de Archidona (ya conocida por el equipo, no repetida aquí por no ser dato de prospección).
- **Redes**: Página oficial del Ayuntamiento de Archidona (ya conocida).
- **Prioridad**: — (ya implantado, se usa como caso de éxito de referencia).
- **Problema detectado**: Resuelto — gestión manual de reservas sustituida por el sistema ya en producción.
- **Propuesta recomendada**: No aplica — cliente activo.
- **Estado**: Implantado.
- **Próxima acción**: Mantener como caso de éxito citable en cualquier propuesta nueva; no reabrir como prospección.
- **Notas**: Es el único registro de este CRM con datos de contacto reales, precisamente porque ya es cliente. El resto de registros son prospección pura.

### 2.2 Villanueva del Trabuco

- **Sector**: Ayuntamiento / instalación deportiva municipal (posible pádel a verificar).
- **Negocio**: Polideportivo o pistas municipales de Villanueva del Trabuco (por confirmar existencia exacta de pádel).
- **Contacto**: Por localizar — Concejalía de Deportes del Ayuntamiento de Villanueva del Trabuco.
- **Teléfono**: Por localizar (vía centralita del Ayuntamiento).
- **Email**: Por localizar (vía web municipal o registro general del Ayuntamiento).
- **Web**: Web oficial del Ayuntamiento de Villanueva del Trabuco (por localizar el enlace exacto).
- **Redes**: Por localizar (probable página de Facebook del Ayuntamiento).
- **Prioridad**: P1 (ranking #1 en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`).
- **Problema detectado (hipótesis)**: Gestión manual de reservas de pistas municipales, sin panel de control ni visibilidad de ocupación — a confirmar con diagnóstico previo a venta.
- **Propuesta recomendada**: Club Pádel 04 Piloto — 2.700 € + IVA setup / 250 €/mes + IVA mantenimiento (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §12; propuesta ya redactada en `docs/agencia-ia/comercial/PROPUESTA_VILLANUEVA_DEL_TRABUCO_CLUB_PADEL_04.md`).
- **Estado**: Sin contactar.
- **Próxima acción**: Localizar contacto real de Deportes y validar tiempo real en Google Maps antes de enviar el mensaje inicial del guion comercial.
- **Notas**: Candidato #1 para segunda venta real según el ranking existente; máxima prioridad de todo este CRM.

### 2.3 Villanueva del Rosario

- **Sector**: Ayuntamiento / instalación deportiva municipal (posible pádel a verificar).
- **Negocio**: Polideportivo o pistas municipales de Villanueva del Rosario (por confirmar existencia exacta de pádel).
- **Contacto**: Por localizar — Concejalía de Deportes del Ayuntamiento de Villanueva del Rosario.
- **Teléfono**: Por localizar (vía centralita del Ayuntamiento).
- **Email**: Por localizar (vía web municipal o registro general del Ayuntamiento).
- **Web**: Web oficial del Ayuntamiento de Villanueva del Rosario (por localizar el enlace exacto).
- **Redes**: Por localizar (probable página de Facebook del Ayuntamiento).
- **Prioridad**: P1 (ranking #2 en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`).
- **Problema detectado (hipótesis)**: Mismo perfil que Villanueva del Trabuco — gestión manual de reservas, sin panel de control.
- **Propuesta recomendada**: Club Pádel 04 Piloto — 2.500 € + IVA setup / 240 €/mes + IVA mantenimiento (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §12).
- **Estado**: Sin contactar.
- **Próxima acción**: Contactar justo después de Villanueva del Trabuco, salvo que este último se cierre antes y consuma la capacidad de implantación disponible.
- **Notas**: Comarca contigua a Trabuco; buen candidato para efecto cadena si Trabuco cierra bien.

### 2.4 Antequera

- **Sector**: Ayuntamiento / Patronato Municipal de Deportes (varias instalaciones).
- **Negocio**: Polideportivo municipal + posibles varias pistas de pádel (cabecera de comarca).
- **Contacto**: Por localizar — Patronato Municipal de Deportes de Antequera.
- **Teléfono**: Por localizar (vía centralita del Ayuntamiento/Patronato).
- **Email**: Por localizar (vía web municipal o registro general).
- **Web**: Web oficial del Ayuntamiento de Antequera (por localizar el enlace exacto).
- **Redes**: Por localizar (probable página de Facebook/Instagram del Patronato de Deportes).
- **Prioridad**: P1 (ranking #3 en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`).
- **Problema detectado (hipótesis)**: Gestión de varias instalaciones sin sistema unificado — mayor complejidad que un municipio pequeño, por eso mayor dificultad comercial (más trámite).
- **Propuesta recomendada**: Club Pádel 04 Piloto (cabecera de comarca) — 3.200 € + IVA setup / 320 €/mes + IVA mantenimiento (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §12).
- **Estado**: Sin contactar.
- **Próxima acción**: Buscar contacto directo en el Patronato de Deportes antes de intentar la vía genérica del Ayuntamiento, para evitar quedarse en registro general.
- **Notas**: Mayor valor de mantenimiento mensual y mayor efecto de caso de éxito para el resto de la comarca — prioridad alta pese al mayor trámite esperado.

### 2.5 Mollina

- **Sector**: Ayuntamiento / instalación deportiva municipal (posible pádel a verificar).
- **Negocio**: Pistas de pádel municipales de Mollina (por confirmar existencia exacta).
- **Contacto**: Por localizar — Concejalía de Deportes del Ayuntamiento de Mollina.
- **Teléfono**: Por localizar (vía centralita del Ayuntamiento).
- **Email**: Por localizar (vía web municipal o registro general).
- **Web**: Web oficial del Ayuntamiento de Mollina (por localizar el enlace exacto).
- **Redes**: Por localizar (probable página de Facebook del Ayuntamiento).
- **Prioridad**: P1 (ranking #4 en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`).
- **Problema detectado (hipótesis)**: Gestión manual de reservas; municipio con actividad turística (balneario), lo que puede implicar mayor uso estacional de instalaciones deportivas.
- **Propuesta recomendada**: Club Pádel 04 Piloto — 2.500 € + IVA setup / 240 €/mes + IVA mantenimiento (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §12).
- **Estado**: Sin contactar.
- **Próxima acción**: Validar si la actividad turística estacional es un argumento de venta adicional (más visitantes, más necesidad de reservas ordenadas) antes de preparar la propuesta.
- **Notas**: Buena probabilidad de tener ya infraestructura deportiva cuidada, según la valoración ya existente en el CRM de municipios.

### 2.6 Alameda

- **Sector**: Ayuntamiento / instalación deportiva municipal (posible pádel a verificar).
- **Negocio**: Instalación deportiva municipal de Alameda (por confirmar existencia exacta de pádel).
- **Contacto**: Por localizar — Concejalía de Deportes del Ayuntamiento de Alameda.
- **Teléfono**: Por localizar (vía centralita del Ayuntamiento).
- **Email**: Por localizar (vía web municipal o registro general).
- **Web**: Web oficial del Ayuntamiento de Alameda (por localizar el enlace exacto).
- **Redes**: Por localizar (probable página de Facebook del Ayuntamiento).
- **Prioridad**: P1 (ranking #5 en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`).
- **Problema detectado (hipótesis)**: Gestión manual de reservas, perfil de municipio pequeño muy similar al piloto ya cerrado en Archidona.
- **Propuesta recomendada**: Club Pádel 04 Piloto — 2.000 € + IVA setup / 200 €/mes + IVA mantenimiento (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §12).
- **Estado**: Sin contactar.
- **Próxima acción**: Usar la propuesta de Archidona como base directa de adaptación, dado el perfil casi idéntico de municipio.
- **Notas**: El registro con adaptación más rápida de toda esta lista, por similitud directa con el piloto ya cerrado.

---

## 3. Próximo paso recomendado

1. Verificar los datos de contacto reales de Villanueva del Trabuco en primer lugar (máxima prioridad), siguiendo el orden ya fijado en `MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md` §6.
2. Usar `GUION_COMERCIAL_FINAL_AGENCIA_IA.md` para el primer mensaje una vez localizado el contacto real.
3. Actualizar el campo "Estado" y "Próxima acción" de este documento (y del `.csv` hermano) tras cada interacción real, para no perder trazabilidad.
4. Mantener este CRM y el CRM de municipios (`MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md`) sincronizados: este documento no cambia el ranking ni los precios, solo añade la ficha de negocio/contacto que faltaba.
