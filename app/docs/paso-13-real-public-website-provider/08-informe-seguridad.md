# 08 — Informe de seguridad

## Superficie de ataque nueva

Este paso introduce la ÚNICA superficie de red saliente real de todo el
proyecto hasta ahora: peticiones HTTP/HTTPS a URLs potencialmente
proporcionadas por un operador humano. Toda la superficie está detrás de
`--allow-network`, nunca activa por defecto.

## Controles implementados (ver 02 para la matriz completa)

1. Validación de esquema/hostname estática (`classifyUrl`).
2. Validación de IP resuelta por DNS (`resolveHostnameSafely` +
   `classifyIpAddress`), cubriendo loopback, RFC1918, link-local/metadata,
   CGNAT, multicast, broadcast, reservado, documentación (TEST-NET-1/2/3),
   IPv6 equivalentes, e IPv4 mapeada en IPv6.
3. IP pinneada en la conexión real (mitigación razonable de DNS rebinding).
4. Revalidación completa (ambas capas) en cada salto de redirección.
5. Límite estricto de redirecciones, tamaño de descarga (aplicado en
   streaming, no tras descargar todo), tiempo de espera (con
   `AbortController` real).
6. Sin cookies, sin cabeceras de autenticación, sin ejecución de JS remoto.
7. Allowlist de tipos MIME.
8. robots.txt respetado por defecto.
9. Gate de doble bandera (modo + `allowNetwork` en tiempo de ejecución)
   + `--dry-run` que nunca hace red real pase lo que pase.

## Verificación (no solo diseño)

- 30 tests unitarios (sin red real) que ejercitan cada control anterior,
  incluyendo pruebas de bajo nivel contra un servidor HTTP local REAL
  (socket real) para timeout, tamaño máximo, ausencia de
  cookies/auth, y conexión rechazada.
- 4 tests opcionales con red real (`ALLOW_REAL_NETWORK_TESTS=1`) que
  confirman que el bloqueo SSRF sigue activo incluso con la red
  habilitada, y que un fallo real (404) se maneja sin lanzar.
- Prueba end-to-end real completa contra `example.com` con verificación
  de idempotencia (ver 06 y 07).

## Riesgos residuales conocidos (honestos)

| Riesgo | Severidad | Mitigación actual | Pendiente |
|---|---|---|---|
| DNS rebinding en el intervalo entre `resolveHostnameSafely` y la conexión pinneada | Baja (mitigada, no eliminada al 100%) | IP pinneada vía `lookup` personalizado | Un proxy de red dedicado o sandboxing a nivel de SO sería más robusto en producción a gran escala |
| Servidor remoto que redirige a través de MUCHOS saltos válidos antes de uno privado | Baja | `maxRedirects` acotado + revalidación en cada salto | — |
| Contenido HTML malicioso (XSS-like) al renderizarse en una futura UI | Media (fuera de alcance de este paso) | El HTML nunca se renderiza, solo se analiza como texto/regex (`htmlSignals.js`) | Si en el futuro se muestra el HTML crudo en una UI, sanitizar antes de renderizar |
| Abuso del operador (auditar sitios de terceros sin autorización) | Alta (organizativo, no técnico) | Documentado explícitamente (ver 03); `--max-pages`/`--fixtures` favorecen el uso comedido | Requiere política de uso a nivel de producto/comercial, no de código |
| Certificados TLS no verificados de forma reforzada (pinning) | Baja | Verificación TLS estándar de Node | Añadir pinning si se conecta a un dominio de alto riesgo conocido |

## Declaración de alcance de la prueba de penetración

No se ha realizado un pentest formal de este componente. Los controles
anteriores están verificados por tests automatizados y por una prueba
real contra un dominio inocuo — no por una auditoría de seguridad
independiente. Se recomienda una revisión de seguridad dedicada antes de
exponer este proveedor a auditar dominios de clientes reales en producción.
