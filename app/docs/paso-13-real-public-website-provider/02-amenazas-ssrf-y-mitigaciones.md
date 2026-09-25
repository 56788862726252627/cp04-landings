# 02 — Matriz de amenazas SSRF y mitigaciones

| # | Amenaza | Mitigación | Dónde | Verificado por |
|---|---|---|---|---|
| 1 | URL con esquema peligroso (`file:`, `javascript:`, `data:`, `ftp:`, `chrome:`, `about:`) | Allowlist estricta: solo `http:`/`https:` | `classifyUrl` (Paso 12) | test |
| 2 | Credenciales embebidas en URL (`user:pass@host`) | Rechazadas explícitamente | `classifyUrl` | test |
| 3 | Hostname `localhost`/`0.0.0.0`/sufijos `.local`/`.internal`/`.localhost` | Bloqueados por nombre | `classifyUrl` | test |
| 4 | IP literal privada/loopback en la URL (127.x, 10.x, 192.168.x, 172.16-31.x) | Bloqueada por rango | `classifyUrl` → `classifyIpAddress` | test |
| 5 | Servicio de metadatos de nube (`169.254.169.254`) | Bloqueado explícitamente | `classifyUrl`/`classifyIpAddress` | test |
| 6 | Multicast (224-239.x), broadcast (255.255.255.255), reservado (240-254.x) | Bloqueados (Paso 13, ampliación) | `classifyIpAddress` | test |
| 7 | Rangos de documentación (TEST-NET-1/2/3, IETF 192.0.0.0/24) | Bloqueados (Paso 13, ampliación) | `classifyIpAddress` | test |
| 8 | IPv6 loopback/ULA/link-local/multicast | Bloqueados | `classifyIpAddress` | test |
| 9 | IPv4 mapeada en IPv6 (`::ffff:127.0.0.1`) usada para eludir el filtro IPv4 | Reevaluada con las mismas reglas IPv4 | `classifyIpAddress` | test |
| 10 | **Hostname "público" que resuelve por DNS a una IP privada** (SSRF clásico vía DNS) | `resolveHostnameSafely()`: resuelve DNS real y valida TODAS las IPs devueltas | Capa 2, tras la Capa 1 | test (DNS inyectado) |
| 11 | **DNS rebinding** (la IP cambia entre la validación y la conexión real) | La conexión TCP/TLS se fuerza ("pin") a la IP YA validada mediante una función `lookup` personalizada — nunca se vuelve a resolver DNS al conectar | `performPinnedRequest` (`pinnedLookup`) | diseño + test de mecanismo |
| 12 | Redirección hacia una URL/IP privada | Cada salto de redirección se revalida por las DOS capas antes de seguirse | `fetchPublicWebsite` (bucle de redirección) | test (redirección a `192.168.1.50` rechazada) |
| 13 | Redirecciones infinitas / excesivas | Límite estricto `maxRedirects` (por defecto 3) | `fetchPublicWebsite` | test |
| 14 | Descarga de contenido excesivamente grande (DoS de memoria) | Límite `maxBytes` aplicado en streaming (se destruye el socket al superarlo, no se acumula todo antes de comprobar) | `performPinnedRequest` | test real (servidor local, 5000 bytes con límite 1000) |
| 15 | Servidor que nunca responde (cuelgue) | Timeout real vía `AbortController`, `signal` pasado a `http.request`/`https.request` | `performPinnedRequest` | test real (servidor que nunca hace `res.end()`) |
| 16 | Tipo MIME no esperado (binarios, ejecutables) | Allowlist de MIME (`text/html`, `text/plain`, `application/xhtml+xml`); cualquier otro se rechaza SIN leer más cuerpo | `fetchPublicWebsite` | test |
| 17 | Envío accidental de cookies/cabeceras de autenticación a un tercero | Nunca se establecen: no existe cookie jar, no se reenvían cabeceras `Authorization`/`Cookie` del proceso | `performPinnedRequest` (cabeceras explícitas y mínimas) | test real (servidor que reporta si las recibió: no) |
| 18 | Ejecución de JavaScript remoto | No hay motor de renderizado/JS: solo se lee el HTML como texto | Diseño (sin Playwright/puppeteer) | — |
| 19 | Bypass de robots.txt / paywalls / CAPTCHAs | Nunca se intenta: robots.txt se respeta por defecto (`respectRobots: true`); no hay lógica de evasión de ningún tipo | `checkRobotsPermission` | test |
| 20 | Activación accidental de red sin autorización explícita | `allowNetwork` es una bandera de tiempo de ejecución, nunca inferida del modo guardado ni activada por `--dry-run` | `auditOrchestrator.js` | test (2 casos: modo sin flag, dry-run con flag) |
| 21 | Rutas locales (`--local-file`) fuera del directorio permitido | Reutiliza `resolveSafeLocalPath` (Paso 12), sin cambios | `urlSafety.js` (ya existente) | test (heredado) |

## Qué NO se implementó (limitación honesta)

- No hay resolución DNS "doble verificación" a nivel de socket TCP nativo
  (algunas mitigaciones de rebinding de nivel productivo usan un proxy o
  sandboxing de red dedicado); aquí se usa el mecanismo razonable
  disponible en Node (`lookup` personalizado que fija la IP ya validada),
  suficiente para este entorno pero no una garantía criptográfica.
- No hay lista de bloqueo dinámica de dominios maliciosos conocidos
  (fuera del alcance: eso sería un proveedor de threat-intel aparte).
- No se valida el certificado TLS más allá de lo que ya hace Node por
  defecto (no se ha añadido pinning de certificados).
