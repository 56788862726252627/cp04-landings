# 03 — Política de robots, privacidad y consentimiento

## robots.txt

- `respectRobots: true` por defecto (`--respect-robots=false` para
  desactivarlo explícitamente, nunca al revés).
- Se obtiene `${origin}/robots.txt` con las MISMAS protecciones SSRF que
  cualquier otra petición.
- Parser mínimo (`isPathAllowedByRobots`): reglas `Disallow` para el
  user-agent específico (`ClubPadel04-ResearchBot`) o para `*`.
- **Fail-open si no hay robots.txt** (404 u otro error al obtenerlo): es
  la convención estándar de la industria — ausencia de robots.txt no
  implica prohibición.
- Nunca se intenta evadir un `Disallow`: si la ruta está denegada, la
  auditoría marca esa evidencia como `"unavailable"` con
  `errorCode: "ROBOTS_DISALLOWED"` y continúa con el resto (no aborta
  toda la auditoría).

## Privacidad y datos personales

- El extractor (`htmlSignals.js`, reutilizado de Paso 12) busca señales
  ESTRUCTURALES públicas (viewport, formularios, encabezados, enlaces
  sociales, texto de contacto visible) — nunca intenta identificar
  personas, ni extrae listados de nombres/emails/teléfonos masivos.
- No se almacenan cookies ni se realiza ningún seguimiento de sesión.
- El cuerpo completo de la página SÍ se procesa en memoria durante la
  extracción, pero lo que se PERSISTE en `evidence.json`/`audit.json` es
  el `excerpt` acotado (≤500 caracteres) definido por
  `evidenceSchema.js` — no el HTML completo.
- Ninguna llamada de red incluye cabeceras de autenticación ni cookies.

## Base legal / consentimiento — responsabilidad del operador

Este proveedor **solo automatiza la obtención de contenido ya público**
(lo que cualquier navegador vería sin autenticación). Igual que con
cualquier herramienta de investigación pública, el operador que lo
ejecute contra un dominio de un tercero real debe:

- Tener una base legal o interés legítimo para la investigación (p.ej.
  auditoría propia, cliente que autoriza expresamente, o dominio de
  prueba reservado como `example.com`).
- Respetar los términos de servicio del sitio auditado.
- No usarlo para recopilar datos personales a escala ni para fines
  distintos de la auditoría de madurez digital declarada.
- Revisar el resultado antes de compartirlo con el propio negocio
  auditado o con terceros.

Este documento NO sustituye asesoría legal. La Fase 5 de este paso
(prueba real) se ejecutó exclusivamente contra `example.com`
(dominio reservado por IANA para documentación/pruebas, RFC 2606) — nunca
contra un competidor o negocio real de un tercero.

## Rate limiting

- `rateLimitMs: 500` (pausa entre páginas dentro de la MISMA auditoría,
  antes de cada página salvo la primera).
- `maxPages: 3` por defecto — límite estricto de páginas por ejecución,
  independiente de cuántas URLs se declaren.
- No hay reintentos automáticos agresivos: un fallo se registra y se
  continúa (no se golpea repetidamente el mismo servidor).
