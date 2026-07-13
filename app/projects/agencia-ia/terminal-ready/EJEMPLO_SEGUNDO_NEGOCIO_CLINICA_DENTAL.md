# Ejemplo de Segundo Negocio — Clínica Dental

**Fecha**: 2026-07-13 · Documento de trabajo interno. Desarrolla en detalle el nicho "clínica dental" ya identificado en `docs/agencia-ia/comercial/PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §4 (buen ticket, motor de citas muy reutilizable) y en `docs/agencia-ia/sectores/MATRIZ_SECTORES_SAAS_AGENCIA_IA.md`, como ejemplo completo replicable de un vertical no deportivo. Sirve de plantilla para desarrollar cualquier otro sector nuevo con la misma estructura.

---

## 1. Brief

- **Cliente tipo**: clínica dental local o pequeña cadena de 1-3 centros, gestión familiar o de socios, sin sistema digital de citas propio o con un sistema básico (Excel, agenda en papel, o software genérico de gestión sin app de paciente).
- **Problema típico**: llamadas constantes para pedir/cambiar cita, huecos sin cubrir por cancelaciones tardías, falta de recordatorios automáticos, falta de visibilidad de agenda entre varios profesionales del mismo centro.
- **Objetivo del sistema**: que el paciente reserve/cambie cita desde el móvil, que la clínica tenga un panel de agenda por profesional/sillón, y que se reduzcan las llamadas y los huecos vacíos por no-shows.

---

## 2. Identidad visual

- Paleta recomendada: tonos claros y clínicos (blanco, azul suave o verde salud, acentos en un color de marca propio de la clínica) — evitar la estética deportiva de Club Pádel 04 (verdes intensos, iconografía de pádel).
- Logo: mantener el logo propio de la clínica si ya existe; si no existe, usar un logo tipográfico simple con el nombre de la clínica como placeholder hasta que el cliente aporte uno propio.
- Tono de comunicación: profesional, tranquilizador, cercano — nunca "gamificado" como puede permitirse el ranking/torneos de un club deportivo.

---

## 3. Oferta

- Reserva de citas online por paciente (equivalente al motor de reservas de pistas, adaptado a "cita con profesional" en vez de "pista y horario").
- Panel de agenda para la clínica, con vista por profesional/sillón y por día/semana.
- Recordatorio de cita (mismo mecanismo base que las notificaciones ya construidas para Club Pádel 04, adaptado de contenido).
- Ficha básica de paciente (nombre, contacto, próxima cita) — **sin** historial clínico ni datos de salud sensibles en esta fase (ver §9, diferencias).
- Mantenimiento mensual con las mismas reglas ya definidas en `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §10 (soporte básico, pequeñas correcciones, ajustes menores).

---

## 4. Landing

- Estructura equivalente a la landing de Club Pádel 04, sustituyendo:
  - "Reserva tu pista" → "Reserva tu cita".
  - Sección de torneos/ranking → sección de servicios/tratamientos ofrecidos por la clínica (contenido genérico de ejemplo, a sustituir por el real del cliente).
  - Testimonios de jugadores → testimonios de pacientes (placeholder hasta tener testimonios reales).
- Mensaje principal sugerido: "Pide cita en menos de un minuto, sin llamadas ni esperas. [Nombre de la clínica] ahora también online."
- Esta landing es un ejercicio de adaptación conceptual para esta fase documental — **no se ha creado el HTML/código de la landing real**, solo su estructura de contenido, siguiendo la restricción de no tocar código de producto en esta fase.

---

## 5. CRM

- Mismos campos que `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` (municipio → sustituir por "zona/barrio", sector = "clínica dental", negocio = nombre de la clínica).
- Ejemplo de registro tipo (ficticio, para ilustrar el formato, no un contacto real):

| Campo | Valor de ejemplo |
|---|---|
| Municipio/zona | Antequera (ejemplo de zona con posible demanda) |
| Sector | Clínica dental |
| Negocio | Clínica dental [nombre a determinar] |
| Contacto | Por localizar — dirección/gerencia de la clínica |
| Prioridad | P2 (a validar tras diagnóstico, no forma parte del ranking de municipios deportivos) |
| Problema detectado | Gestión de citas por llamada telefónica, sin recordatorio automático (hipótesis) |
| Propuesta recomendada | SaaS local para otro sector — 1.800-3.000 € + IVA / 180-300 €/mes + IVA (ver `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §3-4, fila "Clínica dental": 1.800-3.000 €, recomendado 2.200 €, mantenimiento 180-300 €/mes) |
| Estado | Sin contactar (ejemplo) |
| Próxima acción | Confirmar si existe una clínica dental real interesada antes de invertir tiempo comercial |

---

## 6. Diagnóstico

- Aplicar el mismo `DIAGNOSTICO_PREVIO_VENTA_AGENCIA_IA.md` ya existente, con estas señales específicas del sector:
  - **Señal verde**: más de un profesional atendiendo, volumen de pacientes suficiente para justificar reducir llamadas, responsable claro de la gestión administrativa.
  - **Señal roja**: clínica unipersonal con agenda muy simple que ya le funciona bien en papel/Excel (bajo margen de mejora percibido), o sin nadie que gestione la parte administrativa de forma constante.

---

## 7. Pricing

- Fila de referencia: `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §4, "Clínica dental" — mínimo 1.800 €, recomendado 2.200 €, máximo 3.000 €, mantenimiento 180-300 €/mes.
- No usar el precio piloto de Club Pádel 04 (2.700 €/250 €mes) para este sector — son matrices distintas; el pricing dental parte de su propia fila.
- Ajustar dentro del rango según el número de profesionales/sillones a gestionar (más profesionales → tender al máximo del rango, igual que en la regla general de `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §11).

---

## 8. Demo

- Adaptar el manual operativo interno de demo (`MANUAL_OPERATIVO_INTERNO_DEMO_CLUB_PADEL_04.md`) sustituyendo "reserva de pista" por "reserva de cita" y "torneos/ranking" por "gestión de agenda por profesional".
- Mostrar en la demo: reserva de cita desde el móvil (paciente), panel de agenda (clínica), recordatorio de cita — no mostrar módulos que no apliquen a este sector (torneos, ranking, perfil social deportivo).

---

## 9. Propuesta

- Usar `PROPUESTA_AYUNTAMIENTO_CLUB_PADEL_04.md` como plantilla de estructura (secciones: problema, solución, alcance, precio, siguiente paso), pero **no como contenido** — el destinatario aquí es una clínica privada, no un ayuntamiento, y el lenguaje debe ser comercial-privado, no institucional.
- Alcance a limitar explícitamente por escrito (igual que en cualquier propuesta): reserva + panel + recordatorio, sin historial clínico ni integraciones con software de gestión clínica existente en la fase 1.

---

## 10. Onboarding

- Mismos pasos base que `CHECKLIST_ONBOARDING_CLIENTE_CLUB_PADEL_04.md`, adaptando:
  - "Instalación deportiva" → "profesionales/sillones a dar de alta".
  - "Horario de pistas" → "horario de consulta por profesional".
  - Sin necesidad de módulo de torneos/ranking en el onboarding.

---

## 11. Soporte

- Mismas reglas de `PROCESO_INTERNO_ENTREGA_SOPORTE_AGENCIA_IA.md` y de mantenimiento mensual de `PRICING_MAESTRO_AGENCIA_IA_CLUB_PADEL_04.md` §10 — sin diferencias de proceso, solo de contenido (agenda clínica en vez de pistas deportivas).

---

## 12. Diferencias frente a Club Pádel 04

| Aspecto | Club Pádel 04 | Clínica dental |
|---|---|---|
| Unidad reservable | Pista y franja horaria | Cita con profesional concreto |
| Módulos deportivos (torneos, ranking, perfil social) | Incluidos como diferenciador | No aplican — no incluir en la oferta |
| Dato sensible del usuario | Bajo (nombre, reserva) | Potencialmente alto si se añadiera historial clínico — **no incluir en fase 1**, por eso el alcance se limita a ficha básica (§3) |
| Comprador típico | Ayuntamiento (institucional) | Negocio privado (gerencia/dirección de la clínica) |
| Ciclo de venta | Más largo (trámite municipal) | Potencialmente más corto (decisión privada, menos capas) |
| Pricing de referencia | Fila específica Club Pádel 04 (`PRICING_MAESTRO...` §5) | Fila "Clínica dental" (`PRICING_MAESTRO...` §4) — matrices separadas, no intercambiables |
| Efecto de caso de éxito | Replicable a municipios vecinos (efecto comarca) | Replicable a otras clínicas de la zona, pero sin efecto "vecino" institucional |

---

## 13. Próximo paso recomendado

1. Confirmar si existe ya un candidato real (clínica dental conocida en la zona) antes de invertir más tiempo en este vertical — hoy este documento es un ejercicio de preparación, no una prospección activa (ver bloqueo correspondiente en `BLOQUEOS_EXTERNOS_AGENCIA_IA.md`).
2. Si aparece un candidato real, usar el mensaje de `GUION_COMERCIAL_FINAL_AGENCIA_IA.md` §9 como primer contacto.
3. Si el vertical dental empieza a moverse de verdad, considerar crear una carpeta propia `docs/agencia-ia/verticales-no-deportivos/dental/` con la misma estructura que fisioterapia/peluquería/veterinaria (fuera del alcance de rutas permitidas en esta fase — quedaría para una fase posterior).
