# Club Pádel 04 · Checklist de riesgo técnico del piloto

## Objetivo

Evitar que una demo o piloto comercial se convierta accidentalmente en producción real sin control.

## Riesgos principales

### 1. Reservas reales

- Riesgo: crear, cambiar o cancelar reservas reales por error.
- Estado permitido: solo simulación.
- Control: usar datos ficticios.

### 2. Pagos reales

- Riesgo: cobrar a usuarios o clientes antes de validar el sistema.
- Estado permitido: no activar pagos reales.
- Control: mantener Stripe o pasarela de pago en modo no productivo hasta autorización formal.

### 3. WhatsApp real

- Riesgo: enviar mensajes reales a jugadores o socios sin permiso.
- Estado permitido: no conectar WhatsApp Business real.
- Control: usar solo explicación comercial o entorno de prueba.

### 4. Correos reales

- Riesgo: enviar emails reales a jugadores del club.
- Estado permitido: no enviar comunicaciones masivas reales.
- Control: usar email propio o emails de prueba.

### 5. Base de datos real

- Riesgo: mezclar datos ficticios con datos reales del club.
- Estado permitido: no conectar base real del cliente.
- Control: separar demo, piloto y producción.

### 6. Webhooks reales

- Riesgo: que una prueba lance automatizaciones reales.
- Estado permitido: no activar webhooks de producción del cliente.
- Control: revisar URLs, escenarios Make y endpoints antes de cualquier prueba.

### 7. Dominio y DNS

- Riesgo: conectar dominio definitivo antes de estar preparado.
- Estado permitido: no modificar DNS sin decisión final.
- Control: mantener preview Cloudflare Pages como entorno seguro.

### 8. Promesas comerciales excesivas

- Riesgo: prometer integraciones, soporte o módulos no incluidos.
- Estado permitido: presentar fases claras.
- Control: usar alcance, condiciones y límites comerciales documentados.

## Resultado esperado

El piloto debe mantenerse como una demostración controlada, sin impacto real sobre clientes, reservas, pagos, comunicaciones o datos sensibles.
