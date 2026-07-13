// CLIENT CONFIG DEFAULT — Club Pádel 04
// Ver docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md para la definición
// completa de capas. Este archivo es la capa CLIENT CONFIG DEFAULT: los
// valores concretos de recursos/horario/modalidades/niveles que hoy usa
// Club Pádel 04, extraídos como fuente única de verdad (antes vivían como
// const sueltas al inicio de App.jsx).
//
// CORE PLATFORM (no vive aquí): src/utils/availability.js
// (evaluateSlotAvailability) es la capacidad genérica de disponibilidad
// por franjas horarias — no sabe qué es una "pista", solo consume
// allowedStartTimes/allowedDurations como datos.
//
// VERTICAL (todavía NO_EXISTE como capa propia, ver
// AGENCY_VERTICALIZATION_STRATEGY.md): BOOKING_MODALITIES_DEFAULT y
// BOOKING_LEVELS_DEFAULT son, en realidad, vocabulario del vertical
// "deportivo de raqueta" (pádel/tenis) más que de un cliente concreto —
// es razonable esperar que la mayoría de clubes de pádel compartan estas
// mismas 4 modalidades y 4 niveles. Candidatos a promoverse a un futuro
// src/data/verticalConfig.padel.js el día que exista un segundo cliente
// del mismo vertical y se confirme empíricamente que sí se repiten (no se
// promueve especulativamente ahora, mismo criterio ya aplicado en
// AGENCY_PRODUCTIZATION_ROADMAP.md). COURTS_DEFAULT y
// BOOKING_HOURS_DEFAULT sí son genuinamente de CLIENT: cada club tiene su
// propio número de pistas, tipos de superficie, precios y horario.
//
// Valores idénticos a los que existían en App.jsx — no se inventa ni se
// cambia ninguna pista, horario, modalidad, nivel ni precio.

export const COURTS_DEFAULT = Object.freeze([
  Object.freeze({ id: 1, name: "Pista 1", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 }),
  Object.freeze({ id: 2, name: "Pista 2", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 }),
  Object.freeze({ id: 3, name: "Pista 3", type: "Cristal Central", price60: 12, price90: 20, price120: 26 }),
  Object.freeze({ id: 4, name: "Pista 4", type: "Cristal Central", price60: 12, price90: 20, price120: 26 }),
]);

export const BOOKING_HOURS_DEFAULT = Object.freeze([
  "08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
]);

export const BOOKING_MODALITIES_DEFAULT = Object.freeze(["libre", "partido", "clase", "torneo"]);

export const BOOKING_LEVELS_DEFAULT = Object.freeze(["iniciacion", "intermedio", "avanzado", "competicion"]);

// Forma agregada, alineada con los nombres de campo de
// config/client-config.schema.json (courts/bookingHours) para que un
// futuro loader real de client_config pueda sustituir este objeto sin
// cambiar la forma que ya consume evaluateSlotAvailability/App.jsx.
// bookingModalities/bookingLevels no están todavía en el schema v1 (no se
// pidieron como mínimo en esa tarea) — quedan documentados aquí como
// pendientes de una v2 del schema si se confirma que varían por cliente.
export const CLIENT_CONFIG_DEFAULT = Object.freeze({
  courts: COURTS_DEFAULT,
  bookingHours: BOOKING_HOURS_DEFAULT,
  bookingModalities: BOOKING_MODALITIES_DEFAULT,
  bookingLevels: BOOKING_LEVELS_DEFAULT,
});
