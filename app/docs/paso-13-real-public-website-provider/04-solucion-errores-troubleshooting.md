# 04 — Errores y troubleshooting

## Taxonomía de errores (`FETCH_ERROR_CODES`)

| Código | Cuándo ocurre | Qué hace la auditoría |
|---|---|---|
| `INVALID_URL` | URL malformada o esquema no http/https | Evidencia `error`, no bloquea el resto |
| `SSRF_BLOCKED` | Hostname/IP literal o resuelta por DNS es privada/peligrosa | Evidencia `error` (o `PolicyViolationError` si se detecta antes, en `evaluatePolicy`) |
| `DNS_ERROR` | La resolución DNS falla (`ENOTFOUND`, etc.) | Evidencia `error` |
| `TIMEOUT` | La petición supera `timeoutMs` | Evidencia `error` |
| `TLS_ERROR` | Fallo de handshake TLS | Evidencia `error` |
| `INSECURE_REDIRECT` | Cabecera `Location` malformada | Evidencia `error` |
| `TOO_MANY_REDIRECTS` | Se supera `maxRedirects` | Evidencia `error` |
| `CONTENT_TOO_LARGE` | La respuesta supera `maxBytes` (verificado en streaming) | Evidencia `error` |
| `UNSUPPORTED_MIME` | El `Content-Type` no está en la allowlist | Evidencia `unavailable` |
| `HTTP_4XX` / `HTTP_5XX` | Código de estado HTTP de error | Evidencia `error`, incluye `httpStatus` |
| `ROBOTS_DISALLOWED` | robots.txt deniega la ruta | Evidencia `unavailable` |
| `RATE_LIMITED` | Reservado para un futuro 429 explícito (actualmente cae en `HTTP_4XX`) | — |
| `CONNECTION_REFUSED` | El servidor rechaza la conexión o hay otro error de red | Evidencia `error` |

Todos los mensajes son **estructurados y sanitizados**: nunca incluyen
stack traces internos ni cabeceras/secretos — solo `{code, reason, url,
redirectChain, fetchedAt}`.

## Comportamiento fail-soft de la auditoría completa

Un fallo en UNA URL (de las hasta `maxPages` declaradas) **nunca aborta**
el resto de la auditoría: se registra como limitación y como evidencia
`unavailable`/`error`, y el pipeline continúa con dimensiones/scoring
sobre lo que sí se obtuvo.

## Problemas comunes

- **"Bloqueado por política (SSRF)" antes de intentar nada** → la URL
  falla ya en `evaluatePolicy` (capa de política de Paso 12), antes de
  llegar al fetcher. Es la defensa MÁS temprana; revisa si la URL apunta
  a una IP/hostname privado.
- **"el request pide un modo con red... pero falta --allow-network"** →
  pasaste `--mode=public-web` pero no `--allow-network` en ESTA
  ejecución. Añade el flag explícitamente.
- **`--dry-run` con `--allow-network` no consulta nada** → es el
  comportamiento correcto y buscado: dry-run nunca hace red real.
- **Auditoría real no es idempotente** → si ves archivos "actualizados"
  en una segunda ejecución idéntica, revisa que no se haya añadido un
  campo con timestamp real a `evidence.metadata` (ver la nota de
  idempotencia en `providers/publicWebsiteFetcher.js`): `fetchedAt` se
  mantiene deliberadamente FUERA de la Evidence persistida.
- **`research:doctor` marca `public_website_fetcher_provider_loaded` en
  FAIL** → el módulo no se pudo importar; revisa la ruta o un error de
  sintaxis introducido después de este paso.
