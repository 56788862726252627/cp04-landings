# Roadmap comercial — de Club Pádel 04 a Agencia IA (Paso 08A)

Cómo Club Pádel 04 se convierte en el primer producto de un catálogo más amplio de SaaS + automatizaciones vendido por la Agencia IA.

---

## Fase 1 — Vender a clubes de pádel/deportivos

- Cerrar la validación técnica pendiente (runbook post-Airtable 429).
- Conseguir el primer club piloto real (posiblemente con condiciones preferentes, como caso de referencia).
- Documentar el resultado real (no proyectado) de ese piloto: qué funcionó, qué costó más de lo esperado, qué pidió el cliente que no estaba en el catálogo.
- Usar ese piloto como demo vendible para el siguiente cliente (testimonios reales, no solo la demo técnica).

## Fase 2 — Replicar a otros clubes de pádel

- Con el piloto validado, estandarizar el proceso de onboarding (`onboarding-cliente-club.md`) para que cada nuevo club tarde menos en configurarse.
- Empezar a vender los 3 paquetes (`paquetes-y-precios.md`) con precios ya contrastados contra al menos un cliente real, no solo orientativos.
- Evaluar si conviene una versión multi-tenant (varios clubes sobre la misma infraestructura) en vez de una instalación por cliente — decisión técnica que excede el alcance de este documento comercial.

## Fase 3 — Adaptar a negocios locales fuera de pádel

Club Pádel 04 no es solo "una app de pádel" — es una plantilla de gestión (reservas/citas + jugadores/clientes + comunicaciones + automatizaciones + backoffice por rol) que se puede adaptar a otros sectores con necesidades similares.

### Sectores futuros candidatos

- Clínicas dentales (citas, pacientes, recordatorios, listas de espera para cancelaciones).
- Fisioterapia (sesiones recurrentes, bonos, recordatorios).
- Despachos de abogados (citas de consulta, gestión de clientes, comunicaciones).
- Clínicas de fertilidad (citas de seguimiento sensibles, alta necesidad de confidencialidad — requeriría revisión legal específica antes de replicar).
- Veterinarios (citas, fichas de mascotas, recordatorios de vacunación).
- Peluquerías/estética (citas, bonos, campañas).
- Academias (clases, alumnos, listas de espera).
- Gimnasios (reservas de clase, altas/bajas de socio, control de acceso).

## Qué partes son reutilizables

- El motor de reservas/citas con control de solapamiento y disponibilidad (`src/utils/availability.js`) — genérico, no específico de pádel.
- El patrón de roles y permisos (PLAYER→cliente, STAFF→recepción, ADMIN→dirección, SUPPORT→soporte técnico) — el nombre cambia, la estructura no.
- El patrón de "módulo visual preparado, sin Worker hasta validar" para automatizaciones (Grupo B del mapa de integración) — reutilizable para cualquier vertical que también dependa de Make/Airtable.
- El patrón de checklist de onboarding y runbook de pruebas post-bloqueo externo.
- Los componentes de UI (Card, SectionTitle, PanelList, Btn) y el sistema de diseño premium.

## Qué partes son específicas de pádel

- Terminología: "pista", "modalidad" (individual/dobles), "nivel de juego".
- Torneos con formato de cruces/brackets de pádel.
- Ranking específico del deporte.
- Cualquier integración específica de plataformas de pádel (si se añadiera en el futuro).

## Próximos pasos comerciales

1. Cerrar el primer piloto real de pádel (Fase 1) antes de intentar replicar a otro sector.
2. Con datos reales de ese piloto, revisar y ajustar `paquetes-y-precios.md` (que hoy es orientativo).
3. Documentar el esfuerzo real de adaptación a un segundo club de pádel (Fase 2) para calibrar cuánto costaría adaptar a un sector distinto (Fase 3).
4. Elegir un sector de Fase 3 con menor sensibilidad legal (p. ej. peluquerías/gimnasios antes que clínicas de fertilidad) para la primera réplica fuera de pádel, minimizando riesgo regulatorio mientras el proceso de adaptación aún no está probado.
