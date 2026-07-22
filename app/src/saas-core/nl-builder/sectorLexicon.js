// Paso 11 · Fase 6 — Catálogo sectorial de interpretación (10 sectores).
//
// Esto es conocimiento para INTERPRETAR lenguaje natural, distinto del
// catálogo de plantillas/presets de Paso 09 (templates.js/presets.js), que
// describe cómo CONSTRUIR un tenant. Un preset de este archivo nunca
// implementa lógica de negocio: es datos (keywords, roles, terminología,
// automatizaciones sugeridas) consumidos por motores genéricos
// (intentExtractor, requirementResolver, recommendationEngine...).
//
// `blueprintSector` referencia KNOWN_SECTORS de tenantSchema.js (Paso 09).
// Los 4 sectores que Paso 09 no cubría (restaurante, academia, taller,
// inmobiliaria) se añadieron de forma aditiva a KNOWN_SECTORS en este
// mismo Paso 11 — ver tenantSchema.js — porque blueprintToTenantConfig ya
// hace fallback seguro a la plantilla "local-service" para cualquier
// sector sin preset/plantilla dedicados, así que no hace falta más
// cambios en el núcleo de Paso 09 para que estos negocios se generen.

export const SECTOR_LEXICON = Object.freeze([
  {
    presetId: "padel-sports",
    label: "Club de pádel o centro deportivo",
    blueprintSector: "padel",
    sectorVariants: [{ blueprintSector: "sports", keywords: ["polideportivo", "centro deportivo", "club deportivo", "sports center"] }],
    keywords: ["pádel", "padel", "club de pádel", "pista de pádel", "padel club", "padel court"],
    actors: ["jugador", "recepción", "administración", "entrenador"],
    entities: ["pista", "reserva", "torneo", "ranking", "socio"],
    recommendedModules: ["citas", "recursos", "clientes", "pagos", "torneos", "ranking", "automatizaciones"],
    roles: ["jugador", "recepcion", "administracion", "soporte"],
    processes: ["reserva de pista", "inscripción a torneo", "pago de cuota"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "seguimiento", "fidelizacion"],
    metrics: ["ocupación de pistas", "reservas por semana", "jugadores activos"],
    risks: ["conflictos de horario en pistas compartidas"],
    optionalIntegrations: ["payments", "messaging"],
    terminologyOverrides: {},
    doNotAutoAdd: ["expedientes", "inventario", "facturacion_avanzada"],
  },
  {
    presetId: "dental",
    label: "Clínica dental",
    blueprintSector: "dental",
    keywords: ["clínica dental", "dentista", "odontolog", "dental"],
    actors: ["paciente", "recepción", "dentista", "dirección"],
    entities: ["paciente", "cita", "tratamiento", "expediente clínico"],
    recommendedModules: ["citas", "clientes", "profesionales", "servicios", "documentos", "pagos", "automatizaciones"],
    roles: ["paciente", "recepcion", "dentista", "direccion", "soporte"],
    processes: ["reserva de cita", "historial clínico", "presupuesto de tratamiento"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "seguimiento", "encuesta"],
    metrics: ["citas confirmadas", "no-shows", "tratamientos activos"],
    risks: ["datos de salud sujetos a normativa reforzada (expedientes clínicos)"],
    optionalIntegrations: ["messaging", "payments"],
    terminologyOverrides: { customer: { singular: "paciente", plural: "pacientes", short: "Paciente" }, staff: { singular: "dentista", plural: "dentistas", short: "Dentista" }, organization: { singular: "clínica", plural: "clínicas", short: "Clínica" } },
    doNotAutoAdd: ["inventario", "campanas"],
  },
  {
    presetId: "physiotherapy",
    label: "Clínica de fisioterapia",
    blueprintSector: "physiotherapy",
    keywords: ["fisioterapia", "fisioterapeuta", "fisio", "physiotherapy", "physical therapy"],
    actors: ["paciente", "recepción", "fisioterapeuta", "dirección"],
    entities: ["paciente", "cita", "sesión de tratamiento", "bono de sesiones"],
    recommendedModules: ["citas", "clientes", "profesionales", "servicios", "documentos", "pagos", "automatizaciones"],
    roles: ["paciente", "recepcion", "fisioterapeuta", "direccion", "soporte"],
    processes: ["reserva de sesión", "seguimiento de tratamiento", "venta de bonos"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "seguimiento", "recuperacion"],
    metrics: ["sesiones realizadas", "bonos activos", "adherencia al tratamiento"],
    risks: ["datos de salud sujetos a normativa reforzada"],
    optionalIntegrations: ["messaging", "payments"],
    terminologyOverrides: { customer: { singular: "paciente", plural: "pacientes", short: "Paciente" }, staff: { singular: "fisioterapeuta", plural: "fisioterapeutas", short: "Fisioterapeuta" }, organization: { singular: "clínica", plural: "clínicas", short: "Clínica" } },
    doNotAutoAdd: ["inventario", "campanas"],
  },
  {
    presetId: "veterinary",
    label: "Clínica veterinaria",
    blueprintSector: "veterinary",
    keywords: ["veterinari", "clínica veterinaria", "veterinary", "vet clinic"],
    actors: ["propietario", "recepción", "veterinario", "dirección"],
    entities: ["propietario", "mascota", "cita", "historial médico"],
    recommendedModules: ["citas", "clientes", "profesionales", "servicios", "documentos", "pagos", "automatizaciones"],
    roles: ["propietario", "recepcion", "veterinario", "direccion", "soporte"],
    processes: ["reserva de cita", "historial médico de la mascota", "recordatorio de vacunación"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "seguimiento"],
    metrics: ["citas realizadas", "vacunaciones pendientes"],
    risks: ["datos médicos de mascotas: normativa menos estricta que salud humana pero conviene cuidado"],
    optionalIntegrations: ["messaging", "payments"],
    terminologyOverrides: { customer: { singular: "propietario", plural: "propietarios", short: "Propietario" }, staff: { singular: "veterinario", plural: "veterinarios", short: "Veterinario" }, organization: { singular: "clínica", plural: "clínicas", short: "Clínica" } },
    doNotAutoAdd: ["inventario", "campanas"],
  },
  {
    presetId: "hair-beauty",
    label: "Peluquería o centro de estética",
    blueprintSector: "hair-salon",
    sectorVariants: [{ blueprintSector: "beauty", keywords: ["centro de estética", "salón de belleza", "estética", "beauty salon"] }],
    keywords: ["peluquería", "peluquero", "hair salon", "barbería"],
    actors: ["cliente", "recepción", "estilista", "dirección"],
    entities: ["cliente", "cita", "servicio", "producto"],
    recommendedModules: ["citas", "clientes", "profesionales", "servicios", "pagos", "automatizaciones"],
    roles: ["cliente", "recepcion", "estilista", "direccion", "soporte"],
    processes: ["reserva de cita", "venta de servicios/productos", "programa de fidelización"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "fidelizacion", "campana"],
    metrics: ["citas por estilista", "ticket medio", "clientes recurrentes"],
    risks: [],
    optionalIntegrations: ["messaging", "payments"],
    terminologyOverrides: { staff: { singular: "estilista", plural: "estilistas", short: "Estilista" }, organization: { singular: "salón", plural: "salones", short: "Salón" } },
    doNotAutoAdd: ["expedientes", "inventario"],
  },
  {
    presetId: "law",
    label: "Despacho de abogados",
    blueprintSector: "law",
    keywords: ["despacho de abogados", "abogad", "bufete", "jurídic", "law firm", "legal"],
    actors: ["cliente", "abogado", "administración", "dirección"],
    entities: ["cliente", "caso", "cita", "documento legal"],
    recommendedModules: ["citas", "clientes", "profesionales", "documentos", "pagos", "automatizaciones"],
    roles: ["cliente", "abogado", "administracion", "direccion", "soporte"],
    processes: ["consulta inicial", "gestión de casos", "facturación de honorarios"],
    automationHints: ["confirmacion", "recordatorio", "seguimiento", "documento", "impago"],
    metrics: ["casos activos", "horas facturables", "consultas agendadas"],
    risks: ["confidencialidad reforzada de documentos de clientes"],
    optionalIntegrations: ["payments"],
    terminologyOverrides: { staff: { singular: "abogado", plural: "abogados", short: "Abogado" }, organization: { singular: "despacho", plural: "despachos", short: "Despacho" } },
    doNotAutoAdd: ["inventario", "torneos", "ranking"],
  },
  {
    presetId: "restaurant",
    label: "Restaurante",
    blueprintSector: "restaurant",
    keywords: ["restaurante", "restaurant", "cafetería", "bar restaurante"],
    actors: ["cliente", "sala", "cocina", "dirección"],
    entities: ["cliente", "mesa", "reserva", "menú"],
    recommendedModules: ["citas", "recursos", "clientes", "servicios", "automatizaciones"],
    roles: ["cliente", "sala", "direccion", "soporte"],
    processes: ["reserva de mesa", "gestión de menú", "confirmación de reserva"],
    automationHints: ["confirmacion", "recordatorio", "cancelacion", "encuesta"],
    metrics: ["reservas por servicio", "ocupación de mesas", "no-shows"],
    risks: ["picos de demanda estacionales (sobre-reserva)"],
    optionalIntegrations: ["messaging"],
    terminologyOverrides: { customer: { singular: "comensal", plural: "comensales", short: "Comensal" }, resource: { singular: "mesa", plural: "mesas", short: "Mesa" }, organization: { singular: "restaurante", plural: "restaurantes", short: "Restaurante" } },
    doNotAutoAdd: ["expedientes", "inventario", "facturacion_avanzada"],
  },
  {
    presetId: "education",
    label: "Academia o centro de formación",
    blueprintSector: "education",
    keywords: ["academia", "centro de formación", "escuela", "education center", "training center"],
    actors: ["alumno", "profesor", "administración", "dirección"],
    entities: ["alumno", "curso", "clase", "matrícula"],
    recommendedModules: ["citas", "clientes", "profesionales", "servicios", "documentos", "pagos", "automatizaciones"],
    roles: ["alumno", "profesor", "administracion", "direccion", "soporte"],
    processes: ["matrícula", "reserva de clase", "seguimiento de progreso"],
    automationHints: ["alta_cliente", "confirmacion", "recordatorio", "seguimiento"],
    metrics: ["alumnos matriculados", "clases impartidas", "asistencia"],
    risks: ["si hay menores matriculados: consentimiento parental y protección de datos de menores"],
    optionalIntegrations: ["payments", "messaging"],
    terminologyOverrides: { customer: { singular: "alumno", plural: "alumnos", short: "Alumno" }, staff: { singular: "profesor", plural: "profesores", short: "Profesor" }, organization: { singular: "academia", plural: "academias", short: "Academia" } },
    doNotAutoAdd: ["inventario"],
  },
  {
    presetId: "automotive",
    label: "Taller mecánico",
    blueprintSector: "automotive",
    keywords: ["taller mecánico", "taller de coches", "auto repair", "mechanic workshop", "taller automoción"],
    actors: ["cliente", "mecánico", "recepción", "dirección"],
    entities: ["cliente", "vehículo", "cita", "presupuesto de reparación"],
    recommendedModules: ["citas", "clientes", "profesionales", "recursos", "servicios", "pagos", "automatizaciones"],
    roles: ["cliente", "recepcion", "mecanico", "direccion", "soporte"],
    processes: ["cita de revisión", "presupuesto de reparación", "entrega de vehículo"],
    automationHints: ["confirmacion", "recordatorio", "seguimiento", "impago"],
    metrics: ["vehículos en taller", "tiempo medio de reparación", "presupuestos aceptados"],
    risks: [],
    optionalIntegrations: ["payments", "messaging"],
    terminologyOverrides: { staff: { singular: "mecánico", plural: "mecánicos", short: "Mecánico" }, resource: { singular: "elevador", plural: "elevadores", short: "Elevador" }, organization: { singular: "taller", plural: "talleres", short: "Taller" } },
    doNotAutoAdd: ["expedientes", "torneos", "ranking"],
  },
  {
    presetId: "real-estate",
    label: "Inmobiliaria",
    blueprintSector: "real-estate",
    keywords: ["inmobiliaria", "real estate", "agencia inmobiliaria", "property agency"],
    actors: ["cliente", "agente", "administración", "dirección"],
    entities: ["cliente", "propiedad", "visita", "contrato"],
    recommendedModules: ["citas", "clientes", "profesionales", "documentos", "automatizaciones"],
    roles: ["cliente", "agente", "direccion", "soporte"],
    processes: ["visita a propiedad", "gestión de leads", "cierre de contrato"],
    automationHints: ["alta_cliente", "seguimiento", "documento", "recuperacion"],
    metrics: ["propiedades activas", "visitas agendadas", "leads convertidos"],
    risks: [],
    optionalIntegrations: ["messaging"],
    terminologyOverrides: { staff: { singular: "agente", plural: "agentes", short: "Agente" }, resource: { singular: "propiedad", plural: "propiedades", short: "Propiedad" }, organization: { singular: "inmobiliaria", plural: "inmobiliarias", short: "Inmobiliaria" } },
    doNotAutoAdd: ["expedientes", "inventario", "torneos"],
  },
]);

export const GENERIC_SECTOR_PRESET = Object.freeze({
  presetId: "generic-local-service",
  label: "Negocio local genérico",
  blueprintSector: "generic-local-service",
  keywords: [],
  actors: ["cliente", "recepción", "administración"],
  entities: ["cliente", "cita", "servicio"],
  recommendedModules: ["citas", "clientes", "servicios", "automatizaciones"],
  roles: ["cliente", "recepcion", "administracion", "soporte"],
  processes: ["reserva de cita"],
  automationHints: ["confirmacion", "recordatorio"],
  metrics: ["citas realizadas"],
  risks: [],
  optionalIntegrations: ["messaging"],
  terminologyOverrides: {},
  doNotAutoAdd: ["expedientes", "inventario", "torneos", "ranking"],
});

export const SECTOR_PRESET_IDS = Object.freeze(SECTOR_LEXICON.map((p) => p.presetId));

/** Busca el sector con más coincidencias de keyword en el texto (normalizado en minúsculas). Empates: primer preset declarado gana. */
export function matchSectorPreset(lowerText) {
  let best = null;
  let bestScore = 0;
  for (const preset of SECTOR_LEXICON) {
    const allKeywords = [...preset.keywords, ...(preset.sectorVariants || []).flatMap((v) => v.keywords)];
    const score = allKeywords.reduce((acc, kw) => (lowerText.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      best = preset;
      bestScore = score;
    }
  }
  if (!best) return { preset: GENERIC_SECTOR_PRESET, blueprintSector: GENERIC_SECTOR_PRESET.blueprintSector, matchedKeywords: 0 };

  let blueprintSector = best.blueprintSector;
  if (best.sectorVariants) {
    for (const variant of best.sectorVariants) {
      if (variant.keywords.some((kw) => lowerText.includes(kw))) {
        blueprintSector = variant.blueprintSector;
        break;
      }
    }
  }
  return { preset: best, blueprintSector, matchedKeywords: bestScore };
}

export function getSectorPresetById(presetId) {
  return SECTOR_LEXICON.find((p) => p.presetId === presetId) || (presetId === GENERIC_SECTOR_PRESET.presetId ? GENERIC_SECTOR_PRESET : null);
}
