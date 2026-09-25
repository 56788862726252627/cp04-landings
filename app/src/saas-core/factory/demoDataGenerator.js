// Paso 10 · Fase 7 — Datos demo sintéticos por sector, reproducibles por seed.
//
// Genera registros (no solo conteos, a diferencia de Paso 09) para
// clientes/pacientes, profesionales, servicios, recursos, horarios, citas,
// comunicaciones, automatizaciones, métricas e incidencias — todos
// marcados `isDemoData: true`. Ningún dato es real: nombres tomados de un
// banco de nombres genéricos, no de personas reales.

import { createCustomer, createStaffMember, createService, createResource, createAppointment, createCommunication, createAutomation } from "../domain/genericDomain.js";

// Mulberry32: PRNG determinista, sin dependencias, suficiente para datos
// demo (no criptográfico). Misma seed -> misma secuencia siempre.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToInt(seed) {
  if (typeof seed === "number") return Math.floor(seed) >>> 0;
  const str = String(seed ?? "cp04-factory-default-seed");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

const FIRST_NAMES = Object.freeze(["Ana", "Luis", "María", "Carlos", "Sofía", "Javier", "Lucía", "Pablo", "Elena", "Marcos", "Nuria", "Diego", "Carmen", "Álvaro", "Laura", "Sergio", "Irene", "Hugo", "Marta", "Adrián"]);
const LAST_NAMES = Object.freeze(["García", "Martínez", "Rodríguez", "López", "Sánchez", "Pérez", "Gómez", "Fernández", "Ruiz", "Díaz", "Moreno", "Álvarez", "Romero", "Navarro", "Vidal"]);

function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

function pickMany(rng, list, count) {
  const copy = [...list];
  const out = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length) % copy.length;
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function fakeFullName(rng, usedNames) {
  let name;
  let attempts = 0;
  do {
    name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)} (demo)`;
    attempts++;
  } while (usedNames.has(name) && attempts < 20);
  usedNames.add(name);
  return name;
}

const WEEKDAY_LABELS = Object.freeze(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]);
const HOUR_SLOTS = Object.freeze(["09:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00", "19:00"]);
const APPOINTMENT_STATUSES = Object.freeze(["confirmada", "pendiente", "completada", "cancelada"]);
const INCIDENT_TYPES = Object.freeze([
  { kind: "retraso_confirmacion", description: "Confirmación automática tardó más de lo esperado (dato demo)" },
  { kind: "cancelacion_tardia", description: "Cancelación fuera de la ventana permitida (dato demo)" },
  { kind: "recordatorio_no_entregado", description: "Recordatorio marcado como no entregado por el proveedor mock (dato demo)" },
]);

/**
 * Genera un dataset demo completo y referencialmente consistente para un
 * negocio. Determinista: misma entrada (sector, terminología, sizes, seed)
 * produce siempre el mismo resultado — no usa Math.random ni Date.now().
 * @param {{sector: string, terminology: object, commonServices?: string[], resourceLabel?: string, seed?: string|number, sizes?: object}} params
 */
export function generateDemoDataset({ sector, terminology, commonServices = [], seed = "cp04-factory-default-seed", sizes = {} }) {
  const rng = mulberry32(seedToInt(seed));
  const usedNames = new Set();

  const sizeCustomers = sizes.customers ?? 12;
  const sizeProfessionals = sizes.professionals ?? 3;
  const sizeAppointments = sizes.appointments ?? Math.max(sizeCustomers, 15);
  const sizeIncidents = sizes.incidents ?? 3;

  const customers = Array.from({ length: sizeCustomers }, () =>
    createCustomer({
      displayName: fakeFullName(rng, usedNames),
      tags: ["demo"],
      metrics: { visitsCount: Math.floor(rng() * 10) },
      contact: { email: null, phone: null },
    }),
  ).map((c) => ({ ...c, isDemoData: true }));

  const professionalRoleLabel = terminology?.staff?.singular || "profesional";
  const professionals = Array.from({ length: sizeProfessionals }, () =>
    createStaffMember({ displayName: fakeFullName(rng, usedNames), role: professionalRoleLabel, functions: [] }),
  ).map((p) => ({ ...p, isDemoData: true }));

  const servicesSource = commonServices.length > 0 ? commonServices : ["Servicio estándar"];
  const services = servicesSource.map((name) =>
    ({ ...createService({ name, durationMinutes: 30 + Math.floor(rng() * 4) * 15 }), isDemoData: true }),
  );

  const resourceLabel = terminology?.resource?.singular || "recurso";
  const resourceCount = sizes.resources ?? Math.max(2, Math.min(sizeProfessionals, 4));
  const resources = Array.from({ length: resourceCount }, (_, i) =>
    ({ ...createResource({ label: `${resourceLabel[0].toUpperCase()}${resourceLabel.slice(1)} ${i + 1}`, kind: "generic" }), isDemoData: true }),
  );

  const schedules = WEEKDAY_LABELS.map((day) => ({
    entity: "ScheduleDay",
    day,
    slots: pickMany(rng, HOUR_SLOTS, 4).sort(),
    isDemoData: true,
  }));

  const appointments = Array.from({ length: sizeAppointments }, (_, i) => {
    const customer = pick(rng, customers);
    const resource = pick(rng, resources);
    const staff = pick(rng, professionals);
    const day = pick(rng, WEEKDAY_LABELS);
    const time = pick(rng, HOUR_SLOTS);
    return {
      ...createAppointment({
        id: `appt_demo_${i + 1}`,
        customerId: customer.id,
        resourceId: resource.id,
        staffId: staff?.id ?? null,
        dateLabel: day,
        timeLabel: time,
        kind: pick(rng, servicesSource),
        status: pick(rng, APPOINTMENT_STATUSES),
      }),
      isDemoData: true,
    };
  });

  const communications = appointments.slice(0, Math.min(appointments.length, 10)).map((appt, i) => ({
    ...createCommunication({ id: `comm_demo_${i + 1}`, channel: pick(rng, ["whatsapp", "email"]), template: "recordatorio_cita", status: pick(rng, ["queued_mock", "sent_mock", "not_sent"]) }),
    relatedAppointmentId: appt.id,
    isDemoData: true,
  }));

  const automations = ["alta_cliente", "confirmacion", "recordatorio"].map((capability, i) => ({
    ...createAutomation({ id: `auto_demo_${i + 1}`, capability, provider: null, status: "not_connected" }),
    isDemoData: true,
  }));

  const confirmedCount = appointments.filter((a) => a.status === "confirmada" || a.status === "completada").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelada").length;
  const metrics = {
    entity: "DemoMetricsSnapshot",
    isDemoData: true,
    totalCustomers: customers.length,
    totalAppointments: appointments.length,
    confirmedAppointments: confirmedCount,
    cancelledAppointments: cancelledCount,
    occupancyRateHint: appointments.length === 0 ? 0 : Math.round((confirmedCount / appointments.length) * 100) / 100,
  };

  const incidents = Array.from({ length: sizeIncidents }, (_, i) => {
    const type = pick(rng, INCIDENT_TYPES);
    return {
      entity: "DemoIncident",
      id: `incident_demo_${i + 1}`,
      kind: type.kind,
      description: type.description,
      relatedAppointmentId: appointments.length > 0 ? pick(rng, appointments).id : null,
      isDemoData: true,
    };
  });

  return {
    sector,
    seed: String(seed),
    isDemoData: true,
    customers,
    professionals,
    services,
    resources,
    schedules,
    appointments,
    communications,
    automations,
    metrics,
    incidents,
  };
}

/** Comprueba consistencia referencial básica del dataset (útil en tests y en business:doctor). */
export function checkDatasetReferentialIntegrity(dataset) {
  const problems = [];
  const customerIds = new Set(dataset.customers.map((c) => c.id));
  const resourceIds = new Set(dataset.resources.map((r) => r.id));
  const staffIds = new Set(dataset.professionals.map((p) => p.id));
  const appointmentIds = new Set(dataset.appointments.map((a) => a.id));

  for (const appt of dataset.appointments) {
    if (!customerIds.has(appt.customerId)) problems.push(`appointment ${appt.id} referencia customerId inexistente: ${appt.customerId}`);
    if (!resourceIds.has(appt.resourceId)) problems.push(`appointment ${appt.id} referencia resourceId inexistente: ${appt.resourceId}`);
    if (appt.staffId && !staffIds.has(appt.staffId)) problems.push(`appointment ${appt.id} referencia staffId inexistente: ${appt.staffId}`);
  }
  for (const comm of dataset.communications) {
    if (comm.relatedAppointmentId && !appointmentIds.has(comm.relatedAppointmentId)) {
      problems.push(`communication ${comm.id} referencia relatedAppointmentId inexistente: ${comm.relatedAppointmentId}`);
    }
  }
  for (const incident of dataset.incidents) {
    if (incident.relatedAppointmentId && !appointmentIds.has(incident.relatedAppointmentId)) {
      problems.push(`incident ${incident.id} referencia relatedAppointmentId inexistente: ${incident.relatedAppointmentId}`);
    }
  }
  return { consistent: problems.length === 0, problems };
}
