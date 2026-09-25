// Paso 09 · Fase 5 — Terminología dinámica.
//
// Claves SEMÁNTICAS estables (customer, resource, appointment, staff,
// event, progress, organization) que nunca cambian, para que ningún
// componente futuro tenga que saber si está mostrando "jugador" o
// "paciente". Lo único que cambia por tenant/plantilla es la ETIQUETA
// asociada a cada clave. No sustituye ningún identificador interno de
// rbac.js/App.jsx (esos siguen siendo "reservas", "gestion", etc. como
// ids técnicos de sección).

export const TERMINOLOGY_KEYS = Object.freeze([
  "customer", // jugador → cliente, paciente, usuario, socio, propietario
  "resource", // pista → sala, consulta, recurso, cabina, despacho, instalación
  "appointment", // reserva → cita, sesión, turno
  "staff", // entrenador → profesional, terapeuta, especialista, abogado, estilista
  "event", // torneo → evento, campaña, actividad
  "progress", // ranking → seguimiento, progreso, clasificación
  "organization", // club → clínica, despacho, centro, salón, negocio
]);

/** @typedef {{singular: string, plural: string, short: string}} TermEntry */

// Terminología base = la que ya usa Club Pádel 04 hoy en producción.
export const BASE_TERMINOLOGY = Object.freeze({
  customer: Object.freeze({ singular: "jugador", plural: "jugadores", short: "Jugador" }),
  resource: Object.freeze({ singular: "pista", plural: "pistas", short: "Pista" }),
  appointment: Object.freeze({ singular: "reserva", plural: "reservas", short: "Reserva" }),
  staff: Object.freeze({ singular: "entrenador", plural: "entrenadores", short: "Entrenador" }),
  event: Object.freeze({ singular: "torneo", plural: "torneos", short: "Torneo" }),
  progress: Object.freeze({ singular: "ranking", plural: "rankings", short: "Ranking" }),
  organization: Object.freeze({ singular: "club", plural: "clubes", short: "Club" }),
});

function isTermEntry(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof value.singular === "string" &&
    typeof value.plural === "string" &&
    typeof value.short === "string"
  );
}

/**
 * Combina la terminología base con overrides parciales por clave semántica.
 * Ignora (no lanza) claves desconocidas para que un preset con un typo no
 * tumbe el arranque de un tenant; en su lugar, devuelve también la lista de
 * claves ignoradas para que herramientas de validación (tenant:validate)
 * puedan reportarlas.
 * @param {Partial<Record<string, Partial<TermEntry>>>} [overrides]
 */
export function buildTerminology(overrides = {}) {
  const dictionary = {};
  const ignoredKeys = [];

  for (const key of TERMINOLOGY_KEYS) {
    const base = BASE_TERMINOLOGY[key];
    const override = overrides[key];
    if (override === undefined) {
      dictionary[key] = { ...base };
      continue;
    }
    if (!isTermEntry({ ...base, ...override })) {
      ignoredKeys.push(key);
      dictionary[key] = { ...base };
      continue;
    }
    dictionary[key] = { ...base, ...override };
  }

  for (const key of Object.keys(overrides)) {
    if (!TERMINOLOGY_KEYS.includes(key)) ignoredKeys.push(key);
  }

  return { dictionary, ignoredKeys };
}

/**
 * Resuelve una clave semántica a la etiqueta visible, con fallback seguro
 * a la clave base de pádel si el diccionario no la define.
 * @param {Record<string, TermEntry>} dictionary
 * @param {string} key
 * @param {"singular"|"plural"|"short"} [form]
 */
export function resolveTerm(dictionary, key, form = "singular") {
  const entry = (dictionary && dictionary[key]) || BASE_TERMINOLOGY[key];
  if (!entry) return key;
  return entry[form] ?? entry.singular ?? key;
}

const SPORTS_WORDS_REGEX = /\b(p[aá]del|pista|pistas|torneo|torneos|ranking|jugador|jugadores|entrenador|entrenadores)\b/i;

/**
 * Verifica que un diccionario de terminología no filtre vocabulario de
 * pádel en un sector no deportivo. Devuelve la lista de claves que
 * incumplen la regla (vacía si todo bien) — no lanza, para uso en tests y
 * en tenant:validate.
 * @param {string} sector
 * @param {Record<string, TermEntry>} dictionary
 */
export function findLeakedSportsTerms(sector, dictionary) {
  if (sector === "padel" || sector === "sports") return [];
  const offenders = [];
  for (const key of TERMINOLOGY_KEYS) {
    const entry = dictionary[key];
    if (!entry) continue;
    for (const form of ["singular", "plural", "short"]) {
      if (SPORTS_WORDS_REGEX.test(String(entry[form] ?? ""))) {
        offenders.push(`${key}.${form}`);
      }
    }
  }
  return offenders;
}
