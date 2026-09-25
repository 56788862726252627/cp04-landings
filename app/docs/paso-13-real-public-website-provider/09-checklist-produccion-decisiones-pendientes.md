# 09 — Checklist de preparación para producción y decisiones pendientes

## Checklist antes de comercializar/usar contra clientes reales

- [x] Proveedor real funcional con protección SSRF en 2 capas
- [x] Red desactivada por defecto; requiere doble bandera explícita
- [x] `--dry-run` nunca hace red real
- [x] Redirecciones acotadas y revalidadas
- [x] Timeout/tamaño/MIME/robots controlados
- [x] Sin cookies/autenticación enviadas
- [x] Idempotencia verificada con datos reales
- [x] Degradación controlada ante fallo (probada con un 404 real)
- [x] Tests unitarios sin dependencia de red real (30) + tests de integración real opcionales (4)
- [ ] **Pendiente**: revisión de seguridad independiente (pentest) antes de auditar dominios de terceros reales
- [ ] **Pendiente**: política de uso/consentimiento formalizada a nivel comercial (quién puede auditar qué dominio y con qué autorización)
- [ ] **Pendiente**: límites de cuota/rate-limit a nivel de cuenta/tenant (hoy el límite es solo por ejecución, no por día/cliente)
- [ ] **Pendiente**: alertas/observabilidad si el proveedor real empieza a fallar sistemáticamente (hoy solo se registra en `limitations`)
- [ ] **Pendiente**: decidir si se necesita un mecanismo de allowlist obligatoria de dominios por cliente (hoy `sourcePolicy.allowDomains` existe pero es opcional)
- [ ] **Pendiente**: conectar el resto de proveedores reales (búsqueda, mapas, reseñas, Lighthouse, accesibilidad, SEO, fingerprinting) — siguen siendo mocks/contrato
- [ ] **Pendiente**: decidir si el pinning de IP debe reforzarse con una capa de red dedicada para un volumen alto de auditorías

## Decisiones ya tomadas (y por qué)

- **`allowNetwork` nunca se persiste**: para que un `research-request.json`
  compartido o reproducido no pueda disparar red real sin que quien lo
  ejecute lo autorice explícitamente cada vez.
- **`--dry-run` gana siempre sobre `--allow-network`**: seguridad por
  encima de conveniencia.
- **robots.txt fail-open**: convención estándar; se documenta
  explícitamente para que el operador lo tenga en cuenta.
- **Sin Playwright/dependencias pesadas**: se usó `node:http`/`node:https`
  nativos, evitando una dependencia grande no estrictamente necesaria
  para "obtener HTML como texto".

## Siguiente paso recomendado

Conectar un segundo proveedor real detrás de un contrato ya declarado
(candidato natural: `lighthouseProvider` o `seoProvider`, reutilizando el
mismo patrón de esta implementación: validación reutilizada, gate de
`allowNetwork`, tests sin red real + opcionales con red real), y/o
iniciar la revisión de seguridad independiente antes de cualquier uso
comercial contra dominios de clientes reales.
