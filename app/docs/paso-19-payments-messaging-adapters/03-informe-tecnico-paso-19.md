# 03 — Informe técnico del Paso 19

## Resumen

Construye dos adaptadores AISLADOS, sin credenciales reales:
`stripeAdapter.js` (7 funciones: crear/consultar Checkout Session,
reembolsar, verificar/parsear webhook) y `whatsappAdapter.js` (8
funciones: enviar plantilla/texto, gestionar consentimiento, verificar/
parsear webhook), en `src/saas-core/commercial/`. Ninguno se conecta a
ningún flujo comercial existente — no hay tal flujo en esta rama.
`NOT_CONFIGURED` es el estado por defecto y el único posible en esta
sesión: cero llamadas de red reales a Stripe/Meta en todo el paso.

## Precheck (Fase 1)

- Base confirmada: commit `6194ca8` (Paso 18), branch
  `feature/real-performance-provider-20260723`.
- PR previa confirmada abierta, mergeable y sin tocar: #46 (base
  `feature/real-accessibility-provider-20260723`); #40-45 no
  re-verificadas en esta sesión (sin motivo para sospechar cambios,
  ninguna acción de este paso las toca).
- Baseline verificado en el nuevo worktree antes de tocar nada:
  1101/1101 tests, lint con 4 errores + 1 warning preexistentes, build
  correcto.
- Rama nueva desde `6194ca8`: `feature/payments-messaging-adapters-20260723`.
- Worktree aislado: `/root/cp04-t-payments-messaging-adapters`
  (`node_modules` symlinked desde el worktree hermano tras confirmar
  `package-lock.json` idéntico byte a byte — evita una reinstalación
  de ~2200 archivos).
- Otro worktree/rama con trabajo comercial preexistente
  (`parallel/t8-commercial`, `/root/cp04-t8-commercial`) **verificado y
  NO TOCADO** — se comprobó su `git status`/HEAD antes y después de este
  paso, sin cambios atribuibles a esta sesión.
- 1 checkpoint local creado tras completar los adaptadores + tests
  (Fases 2-6), antes de escribir la documentación.

## Decisión de alcance (registrada, no una desviación silenciosa)

El "Paso 19" proyectado en el informe de Paso 18 era "conectar
pagos/mensajería REALES al flujo comercial". Antes de escribir código,
se preguntó explícitamente al usuario si debía: (a) construir
adaptadores aislados sin credenciales, (b) detenerse a pedir
credenciales primero, o (c) redefinir el paso hacia un quinto proveedor
técnico. El usuario eligió (a), apilado igualmente sobre PR #46. Esta
elección está documentada en `PROGRESS.md` y en el documento 00 de este
mismo directorio.

## Verificación ejecutada

```
$ npm test          → 1150/1150 tests (1101 preexistentes + 49 nuevos), 0 fallos
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes; 0 introducidos
$ npm run build      → correcto, mismo aviso preexistente de chunk >500kB
$ grep de patrones de claves reales (sk_live_/sk_test_/EAA.../whsec_ con
   longitud plausible) en el diff → sin coincidencias fuera de las
   constantes FIXTURE_* (marcadas explícitamente como fixture en su
   propio nombre e importadas solo desde archivos .test.mjs)
$ find -type l (symlinks) en el diff → ninguno
$ tamaño de archivos nuevos → ninguno >1MB
$ comprobación "fetchImpl nunca se invoca sin configurar" → 6 tests
   dedicados (createCheckoutSession/retrieveCheckoutSession/createRefund/
   sendTemplateMessage/sendTextMessage), cada uno con un fetchImpl que
   lanza si se le llama
$ comprobación "ningún mensaje sin consentimiento" → 2 tests dedicados,
   incluso con credenciales configuradas
```

### Validación realizada (equivalente a la "Fase 9" de pasos anteriores)

1. **Configuración ausente**: cada función de escritura de ambos
   adaptadores devuelve `not_configured` sin tocar `fetchImpl` —
   verificado individualmente por función.
2. **Modo LIVE sin permiso explícito**: `createCheckoutSession`/
   `retrieveCheckoutSession`/`createRefund` con una clave `sk_live_`
   devuelven `blocked_live_mode` sin `allowLiveMode: true` — verificado
   por test.
3. **Consentimiento**: `sendTemplateMessage`/`sendTextMessage` sin
   consentimiento registrado devuelven `consent_not_recorded` INCLUSO
   con credenciales configuradas — orden de gates verificado
   explícitamente (params → consentimiento → configuración).
4. **Construcción de la petición real**: con un `fetchImpl` falso que
   captura la URL/cabeceras/cuerpo, se confirma que
   `createCheckoutSession` llama a `https://api.stripe.com/v1/checkout/sessions`
   con `Authorization: Bearer <clave>` e `Idempotency-Key`, y que
   `sendTemplateMessage` llama a
   `https://graph.facebook.com/v20.0/<phoneNumberId>/messages` con el
   cuerpo JSON esperado.
5. **Idempotencia**: la misma llamada (mismos params) produce la MISMA
   `Idempotency-Key` — verificado por test explícito.
6. **Verificación de firma de webhook — la única pieza probada de
   extremo a extremo de forma realista**: firmas calculadas con el
   mismo HMAC-SHA256 que usa el código de verificación (nunca una firma
   "de ejemplo" pegada a mano), para Stripe (`t=...,v1=...`) y para Meta
   (`sha256=...`) — incluyendo casos de secreto incorrecto, payload
   alterado, cabecera mal formada y (solo Stripe) tolerancia de
   timestamp.
7. **Errores del proveedor propagados sin inventar éxito**: un
   `fetchImpl` que simula una respuesta `ok: false` (tarjeta rechazada /
   plantilla no aprobada) se propaga como `stripe_error`/
   `whatsapp_error` con el `httpStatus` y el cuerpo de error real.
8. **Nunca se instala un SDK de terceros**: ambos adaptadores usan
   `fetch` nativo (Node 24) — verificado por inspección directa de los
   imports, sin ninguna dependencia añadida a `package.json`.

No hubo NINGUNA validación de red real en este paso (a diferencia de
Pasos 16-18, que sí validaron contra `example.com`) — sin credenciales,
no hay nada real contra lo que validar más allá de lo ya cubierto
(construcción de petición + verificación de firma, ambas con fixtures
deterministas).

## Alcance y honestidad

- **Nunca se afirma que este paso "conecta pagos/mensajería reales"**:
  el objetivo original se redefinió explícitamente con el usuario antes
  de empezar, y esa redefinición queda documentada, no oculta.
- **`sendTextMessage` no valida la ventana de sesión de 24h de WhatsApp**
  por sí mismo — declarado como limitación explícita (ver documento 01).
- **El "consent store" es solo un contrato** — no hay ninguna
  implementación real conectada a un sistema de datos persistente.
- **Ninguna de las 4 llamadas de red reales (crear sesión, consultar
  sesión, reembolsar, enviar mensaje) se ha probado contra un servidor
  real** — solo la construcción de la petición, vía `fetchImpl` falso.
- No se ejecutaron acciones irreversibles, ni merge, ni cambios directos
  sobre `main`, ni se tocó ningún otro worktree ni PR ajena (verificado
  explícitamente para `parallel/t8-commercial`, dado que es el
  candidato más obvio a confundirse con el alcance de este paso).

## Tiempo

**Nota de honestidad**: sin acceso a timestamps de herramienta para una
medición formal de reloj real — mismo límite que en informes anteriores.

| | |
|---|---|
| Estimación inicial del encargo (mensaje del usuario) | No se dio una estimación explícita de tiempo en el mensaje de Paso 19; se usa como referencia la estimación propia de 4h proyectada informalmente al cierre de Paso 18 para "un paso comercial" |
| Trabajo realizado | Aclaración de alcance con el usuario (2 preguntas), worktree aislado, 2 módulos de adaptador (15 funciones en total) + 2 módulos de soporte (shared/schemas) + fixtures con firmas de webhook reales, 49 tests nuevos, 1 checkpoint local, 4 documentos |
| Estimación real de tiempo de ingeniería | **~2.5-3.5 horas** — menor que Pasos 16-18 porque no hay validación de red real contra un dominio, no hay perfiles sectoriales, no hay CLI, y el alcance se acotó explícitamente antes de empezar (menos ambigüedad que resolver sobre la marcha) |
| Diferencia frente a la proyección de Paso 18 | La proyección de "20-40h" en el informe de Paso 18 asumía un Paso 19 con credenciales reales y conexión a un flujo comercial completo — al redefinirse el alcance a adaptadores aislados, el trabajo real fue sustancialmente menor; la proyección de 20-40h sigue siendo válida para el día en que se complete la integración real descrita en el runbook (documento 02) |
