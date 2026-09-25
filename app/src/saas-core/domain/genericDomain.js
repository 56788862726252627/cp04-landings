// Paso 09 · Fase 7 — Modelo de dominio genérico + adaptadores CP04.
//
// Entidades genéricas puras (sin I/O, sin React) que cualquier vertical
// puede usar. Los adaptadores jugador↔Customer / entrenador↔StaffMember /
// pista↔Resource / reserva↔Appointment son funciones de solo
// transformación: NO migran datos reales, NO tocan src/data/cp04DemoData.js
// ni ningún estado de la app. Las formas de entrada/salida de los
// adaptadores están tomadas literalmente de src/data/cp04DemoData.js para
// que la conversión sea honesta y verificable, no inventada.

function makeId(prefix, seed) {
  const safeSeed = String(seed ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${prefix}_${safeSeed || "unknown"}`;
}

// --- Entidades genéricas (factories con valores por defecto seguros) ---

export function createCustomer({ id, displayName, tags = [], metrics = {}, contact = {} } = {}) {
  return { entity: "Customer", id: id || makeId("customer", displayName), displayName: displayName || "", tags, metrics, contact };
}

export function createStaffMember({ id, displayName, role = "", functions = [] } = {}) {
  return { entity: "StaffMember", id: id || makeId("staff", displayName), displayName: displayName || "", role, functions };
}

export function createService({ id, name, durationMinutes = null, priceHint = null } = {}) {
  return { entity: "Service", id: id || makeId("service", name), name: name || "", durationMinutes, priceHint };
}

export function createResource({ id, label, kind = "generic" } = {}) {
  return { entity: "Resource", id: id || makeId("resource", label), label: label || "", kind };
}

export function createAppointment({ id, customerId, resourceId, staffId = null, dateLabel, timeLabel, kind = "", status = "pending" } = {}) {
  return { entity: "Appointment", id: id || makeId("appt", `${customerId}-${dateLabel}-${timeLabel}`), customerId, resourceId, staffId, dateLabel, timeLabel, kind, status };
}

export function createLocation({ id, name, address = null } = {}) {
  return { entity: "Location", id: id || makeId("location", name), name: name || "", address };
}

export function createCommunication({ id, channel, template, status = "not_sent" } = {}) {
  return { entity: "Communication", id: id || makeId("comm", `${channel}-${template}`), channel, template, status };
}

export function createPaymentIntent({ id, amount = null, currency = "EUR", status = "not_configured" } = {}) {
  return { entity: "PaymentIntent", id: id || makeId("pay", Math.random()), amount, currency, status };
}

export function createAutomation({ id, capability, provider = null, status = "not_connected" } = {}) {
  return { entity: "Automation", id: id || makeId("auto", capability), capability, provider, status };
}

export function createFormDefinition({ id, name, fields = [] } = {}) {
  return { entity: "FormDefinition", id: id || makeId("form", name), name: name || "", fields };
}

export function createDocumentReference({ id, name, kind = "generic" } = {}) {
  return { entity: "DocumentReference", id: id || makeId("doc", name), name: name || "", kind };
}

export function createAuditEvent({ id, action, actorRole = "unknown", occurredAt = null } = {}) {
  return { entity: "AuditEvent", id: id || makeId("audit", `${action}-${actorRole}`), action, actorRole, occurredAt };
}

// --- Adaptadores CP04 (jugador ↔ Customer, entrenador ↔ StaffMember, pista ↔ Resource, reserva ↔ Appointment) ---

/** jugador (src/data/cp04DemoData.js) → Customer genérico */
export function playerToCustomer(jugador) {
  return createCustomer({
    displayName: jugador.nombre,
    tags: jugador.nivel ? [jugador.nivel] : [],
    metrics: { ranking: jugador.ranking ?? null, puntos: jugador.puntos ?? null },
  });
}

/** Customer genérico → forma "jugador" de CP04 */
export function customerToPlayer(customer) {
  return {
    nombre: customer.displayName,
    nivel: customer.tags?.[0] ?? null,
    ranking: customer.metrics?.ranking ?? null,
    puntos: customer.metrics?.puntos ?? null,
  };
}

/** entrenador/staff CP04 → StaffMember genérico */
export function staffToStaffMember(staff) {
  return createStaffMember({ displayName: staff.nombre, role: staff.rol, functions: staff.funciones || [] });
}

/** StaffMember genérico → forma "staff" de CP04 */
export function staffMemberToStaff(staffMember) {
  return { nombre: staffMember.displayName, rol: staffMember.role, funciones: staffMember.functions };
}

/** etiqueta de pista CP04 ("Pista 1") → Resource genérico */
export function courtToResource(pistaLabel) {
  return createResource({ label: pistaLabel, kind: "court" });
}

/** Resource genérico (kind "court") → etiqueta de pista CP04 */
export function resourceToCourt(resource) {
  return resource.label;
}

/** reserva CP04 → Appointment genérico (referencia por nombre, no por id real) */
export function reservationToAppointment(reserva) {
  return createAppointment({
    customerId: makeId("customer", reserva.jugador),
    resourceId: makeId("resource", reserva.pista),
    dateLabel: reserva.dia,
    timeLabel: reserva.hora,
    kind: reserva.modalidad,
    status: reserva.estado,
  });
}

/** Appointment genérico → forma "reserva" de CP04 (requiere nombres legibles) */
export function appointmentToReservation(appointment, { customerName, resourceLabel }) {
  return {
    jugador: customerName,
    pista: resourceLabel,
    dia: appointment.dateLabel,
    hora: appointment.timeLabel,
    modalidad: appointment.kind,
    estado: appointment.status,
  };
}
