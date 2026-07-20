# Checklist de ejecución rápida — pruebas post-Airtable 429 (Paso 07Q)

**Usar este documento el día que Airtable renueve cuota.** Es el resumen operativo del runbook completo (`runbook-pruebas-reales-post-airtable.md`, mismo directorio) — consultar ahí el detalle de cada payload/criterio.

---

## 1. Preparación

- [ ] Confirmar Airtable sin 429 (sondeo de solo lectura).
- [ ] `git status -sb` limpio en `/root/cp04-t-frontend-fixes`.
- [ ] PR #36 sigue `draft` (`gh pr view 36 --json isDraft`).
- [ ] `localhost:5175` responde 200.
- [ ] Autorización explícita del propietario para esta ventana de pruebas.
- [ ] Acceso de lectura a Make/Airtable disponible para verificar manualmente cada prueba.

## 2. Pruebas críticas (orden fijo)

- [ ] 1. Health/check disponibilidad (solo lectura).
- [ ] 2. Crear reserva QA (`QA_CP04_TEST_NO_BORRAR` / `QA_CP04_ELIMINAR`).
- [ ] 3. Consultar la reserva creada.
- [ ] 4. Reprogramar la reserva QA.
- [ ] 5. Cancelar la reserva QA.
- [ ] 6. Alta de jugador QA.
- [ ] 7. Baja de jugador QA (503 seguro es un resultado válido si falta el webhook).
- [ ] 8. Cierre temporal de pista QA (503 seguro es un resultado válido si falta el webhook).

En cada paso: **si aparece 429 o 401/403, parar inmediatamente** (ver criterios de parada en el runbook, sección E) y no continuar con el resto de la lista.

## 3. Pruebas por rol

- [ ] **PLAYER:** confirmar sidebar limpio, sin acceso a ningún módulo de gestión (ni por navegación directa).
- [ ] **STAFF:** ejecutar pruebas 2-8 + revisión visual de Lista de espera, Control QR/Accesos, Pistas libres y recordatorios, Comunicaciones y ciclo de socio, Calendario y disponibilidad.
- [ ] **ADMIN:** repetir STAFF + revisión visual de Dashboard KPI y NPS, Backups y seguridad, Facturación y pagos, Automatizaciones y bots (sin ejecutar acciones reales de pago/mensaje).
- [ ] **SUPPORT:** repetir ADMIN + Centro Técnico (confirmar Panel A3 refleja evidencia real) + Soporte (confirmar logs sin secretos).

## 4. Pruebas por módulo (23 módulos)

Marcar cada uno como "OK visual" o "OK real" según corresponda (ver matriz completa en el runbook, sección H):

- [ ] Inicio (carga sin error, 4 roles)
- [ ] Reservar / Reservas (real: pruebas 2-4)
- [ ] Alta de jugador (real: prueba 6)
- [ ] Baja de jugador (real: prueba 7)
- [ ] Reprogramar reserva (real: prueba 4)
- [ ] Cancelar reserva (real: prueba 5)
- [ ] Cierre temporal (real: prueba 8)
- [ ] Lista de espera (solo visual)
- [ ] Control QR / Accesos (solo visual)
- [ ] Pistas libres y recordatorios (solo visual)
- [ ] Comunicaciones y ciclo de socio (solo visual)
- [ ] Calendario y disponibilidad (solo visual)
- [ ] Torneos (fuera de alcance)
- [ ] Ranking (fuera de alcance)
- [ ] Comunidad (fuera de alcance)
- [ ] Admin (solo lectura)
- [ ] Dashboard KPI y NPS (solo visual)
- [ ] Backups y seguridad (solo visual)
- [ ] Facturación y pagos (solo visual, sin Stripe real)
- [ ] Automatizaciones y bots (solo visual, sin WhatsApp/Telegram real)
- [ ] Centro Técnico (solo lectura, tras las pruebas reales)
- [ ] Soporte (solo lectura)
- [ ] Perfil y ajustes (carga sin error, 4 roles)

## 5. Validación de logs

- [ ] Ningún log del Worker expone webhooks completos, tokens ni credenciales.
- [ ] Ningún log expone datos personales más allá de los fixtures QA usados.
- [ ] Los mensajes de error mostrados en la UI son seguros y coherentes con la respuesta real (nunca un éxito genérico ante un error real).

## 6. Limpieza de datos QA

- [ ] Identificar todos los registros creados con prefijo `QA_CP04_TEST_NO_BORRAR` / `QA_CP04_ELIMINAR` en Airtable.
- [ ] Confirmar con el propietario del proyecto si se conservan como fixtures de referencia (`NO_BORRAR`) o se eliminan (`ELIMINAR`).
- [ ] Eliminar únicamente los marcados `ELIMINAR`, verificando dos veces el email/clave antes de borrar.
- [ ] Confirmar en Make que no quedó ninguna ejecución "colgada" o repetida derivada de las pruebas.

## 7. Decisión final

- [ ] Todos los criterios de éxito del runbook (sección D) se cumplieron.
- [ ] Ningún criterio de parada (sección E) se activó sin resolver.
- [ ] `estadoVerificacion` en `makeInventory.js` se actualiza **solo** para los escenarios realmente probados, con la evidencia real documentada — nunca por defecto ni para los que no se tocaron en esta sesión.
- [ ] Documentar en un nuevo paso (siguiente numeración, p. ej. 07R) el resultado real de esta sesión de pruebas, con evidencia (capturas de Make/Airtable, IDs de ejecución).

**Resultado:** [ ] LISTO para continuar validando el resto del roadmap · [ ] NO LISTO — motivo: ___________________
