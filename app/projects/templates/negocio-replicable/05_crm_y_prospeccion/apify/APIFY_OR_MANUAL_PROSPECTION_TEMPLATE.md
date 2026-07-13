# Apify o Prospección Manual — Plantilla de decisión

**Uso**: decidir cómo generar la lista de leads de este sector/zona, priorizando siempre la opción de coste cero.

---

## 1. Cuándo usar Apify

- Solo si hay **crédito disponible confirmado** en la cuenta de Apify, o el coste se ha **validado explícitamente antes de ejecutar** (nunca lanzar un scraper "a ver qué sale").
- Cuando se necesita volumen alto de leads (>50) en una zona amplia y la búsqueda manual sería demasiado lenta para el plazo comercial.
- Cuando ya existe un actor de Apify probado y barato para el tipo de dato necesario (ej. listados de Google Maps por categoría+zona).

## 2. Cómo limitar resultados

- Fijar siempre un **límite máximo de resultados** en la configuración del actor antes de ejecutar (nunca dejar "sin límite").
- Acotar por zona geográfica concreta (municipio o radio de km), nunca "España" o "provincia" entera de golpe.
- Acotar por categoría/sector específica, no categorías amplias que devuelvan ruido (ej. "clínica dental Antequera", no "salud Antequera").

## 3. Cómo controlar coste

- Revisar el coste estimado por resultado del actor **antes** de lanzar (Apify muestra coste por unidad en la mayoría de actores).
- Ejecutar primero con un límite pequeño (10-15 resultados) de prueba, revisar calidad de datos, y solo entonces ampliar si compensa.
- Registrar el coste real de cada ejecución en las notas de este documento para no repetir gastos innecesarios en el mismo sector/zona.

## 4. Cómo hacerlo manualmente gratis (alternativa obligatoria)

1. Buscar en Google Maps `<sector> <municipio>` y recorrer los resultados manualmente.
2. Anotar cada negocio en `../CRM_TEMPLATE.md` con los campos disponibles (nombre, teléfono, web, redes desde la ficha de Google).
3. Revisar Instagram/Facebook del negocio para completar estilo visual observado y datos de contacto adicionales.
4. Usar el Colegio Profesional o directorio sectorial local si existe (ej. colegio de dentistas, colegio de abogados) para sectores regulados — suele dar listados públicos gratuitos.
5. Preguntar a clientes ya cerrados (ej. Club Pádel 04) por recomendaciones locales de otros negocios — prospección por referencia, coste cero y mayor tasa de conversión.

## 5. Qué campos extraer (mínimo)

- Nombre del negocio, municipio, teléfono, web (si tiene), redes sociales, sector exacto.
- Nota rápida de estado visual/digital (¿tiene web?, ¿tiene reservas online?, ¿solo redes?) para priorizar el lead.

## 6. Cómo validar datos antes de contactar

- Comprobar que el teléfono/email siguen activos (visitar la web o red social reciente, no datos de hace años).
- Confirmar que el negocio sigue abierto (reseñas recientes en Google, publicaciones recientes en redes).
- Descartar leads con información contradictoria o negocios claramente cerrados/traspasados.

## 7. Cómo separar resultados por negocio/sector

- Cada ejecución de Apify o sesión de búsqueda manual se guarda en su propio archivo/pestaña dentro de `05_crm_y_prospeccion/manual/` o como exportación fechada, antes de pasar los leads válidos al `CRM_TEMPLATE.md` de ese sector.
- Nunca pegar resultados de dos sectores en la misma hoja o el mismo archivo de origen.

## 8. Cómo no mezclar leads de sectores distintos

- El nombre del archivo/pestaña debe incluir siempre sector + zona (ej. `leads-clinica-dental-antequera-20260713.csv`).
- Antes de importar al CRM, comprobar que el campo "Sector" del CRM de destino coincide con el sector del archivo de origen.
- Si aparece un lead de un sector distinto durante una búsqueda (ej. buscando dentistas aparece una clínica veterinaria), moverlo a la carpeta/CRM del sector correcto, nunca dejarlo donde no corresponde.
