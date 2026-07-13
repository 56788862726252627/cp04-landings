# Plan de prospección con Apify · Club Pádel 04

Apify se usa **solo como apoyo puntual de prospección comercial** (búsqueda de clubes/instalaciones potenciales), nunca como dependencia de la landing ni del producto. La landing funciona igual con o sin Apify. Este documento es un plan, no una ejecución: no se ha lanzado ningún scraping todavía.

---

## 1. Cuándo usar Apify

- Cuando la lista manual de contactos ya trabajada (ver `docs/comercial-club-padel-04/clubes-objetivo/` y `docs/comercial-club-padel-04/cartera-comercial-consolidada/`) se agota y hace falta ampliar el volumen de candidatos en una comarca nueva.
- Cuando se necesita un listado inicial de clubes/polideportivos de una zona que todavía no se ha mapeado a mano.
- **Nunca** como primera opción: la alternativa manual gratuita (§6) siempre se agota primero, porque no tiene coste y ya ha validado el proceso comercial actual (Villanueva del Trabuco y alrededores, ver `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md`).

## 2. Qué buscar

- Clubes de pádel privados (con o sin web propia).
- Polideportivos y complejos deportivos municipales con pistas de pádel.
- Ayuntamientos de municipios pequeños/medianos con instalaciones deportivas municipales (contacto: área de deportes).
- Gimnasios/clubes multideporte que incluyan pádel entre sus instalaciones.

Excluir explícitamente: academias sin pistas propias, tiendas de material de pádel, clubes ya identificados como clientes o en proceso comercial activo (evitar duplicar contacto — cruzar siempre primero contra el CRM existente).

## 3. Municipios prioritarios

Seguir el mismo criterio de cercanía y tamaño ya validado en el pricing maestro (§4 de `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md`): priorizar municipios pequeños/medianos de la comarca de Antequera y alrededores antes de expandir a otras provincias, replicando el orden de contacto ya usado (Villanueva del Trabuco → Villanueva del Rosario → Villanueva de Tapia → Villanueva de Algaidas → Cuevas Bajas → Cuevas de San Marcos). Ampliar a nuevas comarcas solo después de agotar el cupo de precio piloto en la comarca actual (regla de escalado ya documentada en el pricing maestro).

## 4. Campos a extraer

| Campo | Uso |
|---|---|
| Nombre del club/instalación | Identificación |
| Ciudad/municipio | Priorización geográfica |
| Teléfono | Contacto directo |
| Email (si disponible) | Contacto directo |
| Web (si tiene) | Cualificación rápida (nivel de digitalización actual) |
| Número aproximado de pistas (si es visible en la web/ficha) | Señal de tamaño/ICP |
| Tipo (privado / municipal / multideporte) | Segmentación, alinear con `agency-commercial-system/02_ICP_AND_SEGMENTATION.md` |
| Fuente del dato | Trazabilidad (saber si vino de Apify o de prospección manual) |

## 5. Cómo evitar costes innecesarios

- Apify tiene un plan gratuito con créditos limitados mensuales: **revisar el saldo de créditos antes de cada ejecución**, nunca lanzar un scraper sin comprobar el coste estimado que muestra la plataforma antes de confirmar.
- Limitar cada ejecución a un municipio o comarca concreta (no lanzar búsquedas nacionales/genéricas que consuman créditos en resultados irrelevantes).
- Preferir actors gratuitos o de bajo coste por resultado (p. ej. scrapers de Google Maps/directorios) antes que actors de pago por uso intensivo.
- Fijar un límite máximo de resultados por ejecución (`maxItems` o equivalente) antes de lanzar, nunca dejarlo sin límite.
- Si el saldo gratuito no alcanza para la comarca objetivo, **detenerse y usar la alternativa manual (§6)** en lugar de añadir una tarjeta de pago.

## 6. Alternativa manual 100% gratuita

- Búsqueda directa en Google Maps del término "pádel" + nombre del municipio, revisando manualmente resultados (nombre, teléfono, web) — sin coste, ya es el método usado para construir `docs/comercial-club-padel-04/clubes-objetivo/`.
- Consulta directa en la web del Ayuntamiento del municipio (sección "Deportes"/"Instalaciones municipales") para identificar el responsable y el listado de instalaciones.
- Búsqueda en redes sociales locales (Facebook/Instagram de ayuntamientos y clubes) para encontrar clubes activos que no tengan web propia.
- Este método manual es el que ya ha producido los contactos reales trabajados hasta ahora (ver `docs/comercial-club-padel-04/contacto-real/` y `embudo-comercial/`) — Apify solo debe usarse para escalar volumen cuando el manual ya no dé abasto, no para sustituirlo.

## 7. Cómo importar resultados al CRM

1. Exportar el resultado de Apify (o el listado manual) como CSV/JSON.
2. Revisar y limpiar duplicados contra los contactos ya existentes en `projects/club-padel-04/crm/` y en `docs/comercial-club-padel-04/cartera-comercial-consolidada/` **antes** de importar (evitar contactar dos veces al mismo club).
3. Añadir cada contacto nuevo al sistema de scoring de leads ya definido (`audit/agency-growth-marketing-system/09_CRM_LEAD_SCORING.md` si existe, o el proceso de cualificación manual vigente) con el campo "Fuente: Apify" o "Fuente: manual" para trazabilidad.
4. No enviar ninguna comunicación masiva automatizada a los contactos importados — el contacto inicial sigue el proceso ya validado (mensaje personalizado, no campaña masiva), coherente con `docs/comercial-club-padel-04/mensajes-contacto/`.

## 8. Advertencia de coste

**Antes de ejecutar cualquier scraping en Apify:**
- Comprobar el saldo de créditos disponible en la cuenta.
- Comprobar el coste estimado por resultado del actor elegido.
- Fijar un límite explícito de resultados.
- Si hay cualquier duda sobre si la ejecución superará el plan gratuito, no ejecutar sin confirmación expresa del usuario — nunca asumir autorización para gastar en una cuenta de pago.
