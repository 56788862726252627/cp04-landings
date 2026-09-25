# Paso 09 · Fase 12 y 14 — Seguridad, privacidad, límites actuales, checklist de producción, migración futura

## Seguridad y privacidad por diseño (Fase 12)

Implementado en `app/src/saas-core/security/privacyChecklist.js`:

- `PRIVACY_CHECKLIST`: 8 controles técnicos (mínimos privilegios, guard de
  rutas por rol+módulo, no-secretos-en-repo, datos demo sintéticos,
  saneamiento de identificadores, separación tenant/proveedor, logging sin
  datos sensibles, bandera de sector regulado).
- `MODULE_SENSITIVITY`: clasificación por módulo (`pagos`, `clientes`,
  `documentos`, `formularios`, `configuracion`, `control_acceso`,
  `centro_tecnico` → sensibilidad alta).
- `SECTORS_REQUIRING_REGULATORY_REVIEW`: dental, physiotherapy,
  speech-therapy, psychology, law, fertility, veterinary.
  `buildRegulatoryNotice(sector)` genera un aviso que **nunca afirma
  cumplimiento** — solo exige revisión humana especializada antes de
  producción real. Verificado con test: los 7 presets de estos sectores
  producen un aviso no nulo; `hair-salon` y `padel` no.

**Explícitamente NO se afirma**: cumplimiento RGPD, sanitario, PCI-DSS, o
de cualquier marco legal. Este núcleo da visibilidad y estructura; la
certificación real requiere auditoría profesional específica por sector y
jurisdicción.

## Límites actuales (honestos)

1. **No hay integración en vivo con `App.jsx`**: el motor de módulos se
   verifica por equivalencia de test contra `rbac.js`, no sustituye el
   import estático que usa la app hoy. Conectar `App.jsx` a un tenant
   activo real es trabajo futuro (mismo patrón que la capa
   `tenant-runtime` de sesiones anteriores, documentada en memoria del
   proyecto como "no integrada en App.jsx").
2. **Ningún proveedor externo real está conectado**: los 8 adaptadores son
   mocks en memoria. Ninguna llamada de red se realiza desde este paso.
3. **El resultado de `tenant:create` es configuración, no un negocio
   operando**: no hay base de datos por tenant, no hay despliegue, no hay
   dominio propio.
4. **Los datos demo son sintéticos y mínimos** (números en `demoData`, sin
   registros reales generados) — no hay un dataset de ejemplo poblado por
   sector, solo el conteo recomendado.
5. **Autenticación/autorización reales no cambian**: siguen gobernadas por
   el Worker (`worker-reservas/auth/authorization.js`) y las cookies
   HttpOnly de sesión — este paso no las toca ni las sustituye.
6. **Sectores regulados requieren revisión normativa especializada** antes
   de cualquier dato real (ver aviso automático).

## Checklist de puesta en producción (para un tenant real, no demo)

- [ ] `tenant:validate` en verde.
- [ ] Revisión normativa completada si `policies.regulatedSector === true`.
- [ ] `env.example` rellenado con valores reales **fuera del repositorio** (gestor de secretos, nunca commit).
- [ ] Adaptador real implementado detrás de cada interfaz de proveedor usada (sustituye el mock, mismo contrato).
- [ ] Datos demo desactivados (`demoData.enabled = false`) o sustituidos por datos reales del cliente.
- [ ] Conexión real de navegación/rutas (`App.jsx` o su sucesor) al tenant activo — pendiente, ver límite 1.
- [ ] Prueba E2E de al menos un flujo de automatización antes de marcar cualquier integración como "conectada".
- [ ] Copia de seguridad / plan de recuperación definido para los datos del tenant.

## Estrategia de migración futura a backend multi-tenant real

El esquema de tenant (Fase 3) ya está pensado para eso: `tenantId`/`slug`
como clave de partición, `schemaVersion` para migraciones futuras del
propio esquema, `integrations[...].status` como máquina de estados
explícita (`not_configured → mock → configured_untested → connected`).

Pasos previstos, en orden, cuando se decida construir el backend real:

1. Mover `tenant.config.json` de archivo estático a un registro en base de
   datos (una tabla `tenants` con las mismas columnas del esquema).
2. Sustituir los imports estáticos de `rbac.js`/`App.jsx` por una lectura
   del tenant activo (vía contexto de React o middleware del Worker),
   usando `moduleRegistry.js` como motor — sin reescribir la UI.
3. Implementar un adaptador real por interfaz (Fase 8) cuando exista
   necesidad comercial concreta, empezando por el proveedor que ya está
   más avanzado (Make/Airtable, según memoria del proyecto: "configured_untested" en CP04 hoy).
4. Migrar los tenants demo generados en este paso a tenants reales
   cambiando `meta.generatedBy`/`demoData.enabled`, sin tocar su
   `tenantId` si ya se usó en comunicaciones con el cliente.
5. Añadir aislamiento de datos real (fila por tenant o base de datos por
   tenant, decisión pendiente de volumen esperado) — fuera de alcance de
   este paso, que es solo de configuración/presentación.
