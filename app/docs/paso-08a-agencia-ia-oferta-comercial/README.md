# Paso 08A — Agencia IA · Oferta comercial Club Pádel 04

Documentación comercial base para vender Club Pádel 04 como primer producto SaaS + automatizaciones de la Agencia IA. **No modifica ni sustituye la documentación técnica de los Pasos 07A-07R** — las cifras de estado técnico citadas aquí (40/50 flujos, Airtable 429, PR #36 en draft) se toman de `app/docs/paso-07r-estado-global/estado-global-07a-07q.md`.

## Documentos de esta carpeta

- **`oferta-comercial-club-padel-04.md`** — propuesta de valor completa: qué es el producto, a quién se vende, qué lo diferencia de la competencia (Playtomic/Excel/WhatsApp manual), estado real y condiciones para venderlo como demo/piloto/producción.
- **`paquetes-y-precios.md`** — 3 paquetes (Inicial/Demo, Profesional, Premium) con precio de setup, cuota mensual, qué incluye/no incluye cada uno, y rango de precios orientativo (mínimo/medio/alto). Incluye advertencia explícita de que los precios están pendientes de validar con mercado real.
- **`demo-vendible-guion.md`** — guion de demo de 10-15 minutos con frases exactas para usar en una reunión con un club, cubriendo las 4 vistas de rol (PLAYER/STAFF/ADMIN/SUPPORT) y cierre comercial.
- **`onboarding-cliente-club.md`** — qué datos pedir a un club nuevo (pistas, horarios, tarifas, socios, usuarios internos, integraciones, reglas de reserva/cancelación) y checklist de configuración inicial.
- **`limites-y-riesgos-actuales.md`** — documento de referencia obligatoria antes de cualquier conversación comercial: qué se puede prometer hoy y qué no (Airtable 429, Stripe/WhatsApp/Calendar pendientes, PR #36 en draft, 10/50 flujos sin representar).
- **`roadmap-comercial-agencia-ia.md`** — cómo Club Pádel 04 conecta con la Agencia IA a más largo plazo: Fase 1 (clubes de pádel) → Fase 2 (replicar a más clubes) → Fase 3 (adaptar a otros sectores: clínicas, fisioterapia, abogados, veterinarios, peluquerías, academias, gimnasios), con qué partes son reutilizables y cuáles específicas de pádel.

## Cómo usar esta carpeta

1. Antes de cualquier reunión comercial, releer `limites-y-riesgos-actuales.md` — es el filtro de honestidad que evita prometer algo que la app no hace todavía.
2. Usar `demo-vendible-guion.md` como script en vivo sobre `localhost:5175`.
3. Usar `paquetes-y-precios.md` como punto de partida de negociación, no como tarifa cerrada.
4. Si se firma un piloto/instalación real, seguir `onboarding-cliente-club.md` para la configuración inicial — **solo después** de que el runbook técnico post-Airtable 429 (`app/docs/paso-07q-pruebas-post-airtable-429/`) se haya ejecutado con resultado positivo para flujos de escritura reales.
