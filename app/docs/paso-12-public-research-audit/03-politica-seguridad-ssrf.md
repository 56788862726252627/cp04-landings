# 03 — Política de seguridad, ética y protección SSRF/rutas

## `urlSafety.js` — protección SSRF

`classifyUrl(rawUrl)` evalúa, sin resolver DNS ni abrir ningún socket:

- Esquema: solo `http:`/`https:` (rechaza `file:`, `javascript:`, `data:`, `ftp:`...).
- Credenciales embebidas (`user:pass@host`): rechazadas.
- Hostnames peligrosos: `localhost`, `0.0.0.0`, `metadata.google.internal`,
  sufijos `.local`/`.internal`/`.localhost`.
- IPv4 privada/reservada: loopback (127.x), RFC1918 (10.x, 172.16-31.x,
  192.168.x), link-local/metadata (169.254.x, incluyendo explícitamente
  **169.254.169.254**, el servicio de metadatos de nube), CGNAT (100.64.0.0/10).
- IPv6 loopback/ULA/link-local (`::1`, `fe80:`, `fc00:`/`fd00:`).

`resolveSafeLocalPath(baseDir, requestedPath)` — protección path
traversal: resuelve la ruta y verifica que el resultado permanece DENTRO
de `baseDir` (rechaza `../` que escapen, rutas absolutas fuera de base,
bytes nulos). Usado por los 3 adaptadores que leen del disco
(`LOCAL_HTML_ADAPTER`, `LOCAL_JSON_ADAPTER`, `LOCAL_MARKDOWN_ADAPTER`).

16 tests en `urlSafety.test.mjs` cubren cada caso anterior de forma
explícita (no solo "no lanza": cada test verifica `safe: true/false` con
el motivo correcto).

## `researchPolicy.js` — política versionada, evaluada en código

`evaluatePolicy(request)` decide, para cada input, `accept`/`reject` con
motivo — fail-closed ante cualquier duda:

1. Pasa por `classifyUrl` primero (SSRF).
2. Denylist explícita de dominios (`sourcePolicy.denyDomains`).
3. Allowlist explícita si se declaró (`sourcePolicy.allowDomains`).
4. Patrones de perfil individual bloqueados por defecto (ej. URLs de
   `facebook.com/<usuario>/profile.php`) — nunca perfilado individual.
5. **Modo offline (por defecto): ninguna URL se ejecuta**, aunque pase
   todas las comprobaciones anteriores — se registra la decisión con el
   motivo explícito.
6. Límite de número de fuentes (`maxSources`) — viola política si se supera.

`FORBIDDEN_ACTIONS` documenta explícitamente en código las acciones
prohibidas del enunciado: `authentication, captcha_bypass,
robots_txt_bypass, paywall_bypass, mass_extraction, individual_profiling,
facial_recognition, sensitive_data_collection, person_geolocation,
bulk_email_or_phone_harvesting, account_access, message_sending,
site_modification, publication, real_credentials`. Ninguna de estas
acciones tiene código que las ejecute en este repositorio — la lista
existe para que un futuro adaptador real las respete y para que
`research:doctor`/tests puedan verificarla.

## Modo offline por defecto — verificado, no solo documentado

- `buildResearchRequest` por defecto construye `mode: "offline"`.
- `evaluatePolicy` en modo offline rechaza **toda** URL, incluso una que
  pase SSRF/allowlist — no hay forma de que una URL declarada dispare una
  conexión real desde este código.
- `auditOrchestrator.js` nunca contiene una llamada `fetch()`/`http.request()`
  a un host arbitrario: las URLs declaradas producen evidencia
  `classification: "unavailable"` con el mensaje explícito de que la
  obtención real no está implementada (ver `publicWebsiteFetcher` en
  `factory/extensionPoints.js`).
- Verificado además con `grep -rn "fetch(\|http.request\|https.request"
  src/saas-core/research research-cli` → 0 resultados (ver 11-calidad).

## Límites declarativos

`RESEARCH_LIMITS_POLICY`: `maxSources=20, maxDepth=2,
maxContentLengthBytes=200000, timeoutMs=5000, rateLimitPerMinute=30` —
sobreescribibles por request dentro de rangos numéricos positivos
(validados por el schema).
