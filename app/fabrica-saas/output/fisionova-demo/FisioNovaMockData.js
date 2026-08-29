/**
 * OUTPUT GENERADO · FisioNova (Demo) · Mock Data V1.7
 * Generado por Fábrica SaaS V1.7 · Dynamic Experience Engine
 * Datos 100% FICTICIOS. Sin información clínica real.
 * NO usar en producción.
 */

// ─── Branding ─────────────────────────────────────────────────────────────────

export const BRANDING = {
  nombre:          'FisioNova',
  nombre_visible:  'FisioNova · Clínica de Fisioterapia',
  tagline:         'Muévete mejor, vive sin dolor',
  initial:         'FN',
  primaryColor:    '#4338ca',
  secondaryColor:  '#059669',
  accentColor:     '#7c3aed',
  bgColor:         '#eef2ff',
  version:         'V1.7 · Demo',
};

// ─── Métricas de hero ─────────────────────────────────────────────────────────

export const HERO_METRICS = [
  { valor: '1.200+', label: 'Pacientes recuperados', icon: '🏃' },
  { valor: '98%',    label: 'Tasa de recuperación',  icon: '✅' },
  { valor: '4.9/5',  label: 'Valoración media',      icon: '⭐' },
  { valor: '8 años', label: 'Experiencia clínica',   icon: '🏥' },
];

// ─── Servicios ────────────────────────────────────────────────────────────────

export const SERVICIOS = [
  {
    id: 'deportiva', icono: '🏃',
    nombre: 'Fisioterapia Deportiva',
    desc: 'Tratamiento y prevención de lesiones musculoesqueléticas en deportistas de todos los niveles.',
    duracion: '45 min', precio: '65€',
    tags: ['deporte', 'lesiones', 'prevención'],
    popular: true,
  },
  {
    id: 'rehabilitacion', icono: '🦾',
    nombre: 'Rehabilitación',
    desc: 'Recuperación tras cirugías, fracturas o lesiones graves con protocolo personalizado.',
    duracion: '60 min', precio: '70€',
    tags: ['cirugía', 'recuperación', 'postoperatorio'],
    popular: true,
  },
  {
    id: 'terapia-manual', icono: '🙌',
    nombre: 'Terapia Manual',
    desc: 'Movilización articular, manipulación vertebral y técnicas miofasciales para el dolor crónico.',
    duracion: '45 min', precio: '60€',
    tags: ['manual', 'articulación', 'columna'],
    popular: false,
  },
  {
    id: 'ejercicio', icono: '💪',
    nombre: 'Ejercicio Terapéutico',
    desc: 'Plan de ejercicios personalizados supervisados por fisioterapeuta para reforzar tu recuperación.',
    duracion: '60 min', precio: '55€',
    tags: ['ejercicio', 'fortalecimiento', 'prevención'],
    popular: false,
  },
  {
    id: 'readaptacion', icono: '🎯',
    nombre: 'Readaptación Deportiva',
    desc: 'Vuelta al deporte progresiva y segura tras una lesión, con pruebas funcionales de alta.',
    duracion: '60 min', precio: '75€',
    tags: ['deporte', 'vuelta', 'funcional'],
    popular: false,
  },
  {
    id: 'suelo-pelvico', icono: '🌸',
    nombre: 'Suelo Pélvico',
    desc: 'Fisioterapia especializada del suelo pélvico: incontinencia, postparto, disfunciones pélvicas.',
    duracion: '45 min', precio: '65€',
    tags: ['pélvico', 'postparto', 'incontinencia'],
    popular: false,
  },
  {
    id: 'neurologica', icono: '🧠',
    nombre: 'Fisioterapia Neurológica',
    desc: 'Rehabilitación de pacientes con ictus, esclerosis múltiple, Parkinson y otras patologías neurológicas.',
    duracion: '60 min', precio: '80€',
    tags: ['neurológica', 'ictus', 'neurorehabilitación'],
    popular: false,
  },
  {
    id: 'dolor-cronico', icono: '🩹',
    nombre: 'Dolor Crónico',
    desc: 'Abordaje multidisciplinar del dolor crónico: lumbalgia, fibromialgia, cefaleas tensionales.',
    duracion: '45 min', precio: '60€',
    tags: ['dolor', 'crónico', 'lumbar'],
    popular: false,
  },
];

// ─── Equipo / Profesionales ───────────────────────────────────────────────────

export const PROFESIONALES = [
  {
    id: 'p1', nombre: 'Dra. Elena Morales', iniciales: 'EM',
    especialidad: 'Fisioterapia Deportiva', experiencia: '8 años',
    titulo: 'Grado en Fisioterapia · Máster Deporte y Rendimiento',
    idiomas: ['Español', 'Inglés'],
    disponibilidad: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    valoracion: 4.9, sesiones: 420,
    color: '#4338ca',
  },
  {
    id: 'p2', nombre: 'Dr. Javier Ruiz', iniciales: 'JR',
    especialidad: 'Terapia Manual · Dolor Crónico', experiencia: '11 años',
    titulo: 'Grado en Fisioterapia · Osteópata DO · Cert. Punción Seca',
    idiomas: ['Español', 'Francés'],
    disponibilidad: ['Lun', 'Mié', 'Jue', 'Vie'],
    valoracion: 4.8, sesiones: 650,
    color: '#059669',
  },
  {
    id: 'p3', nombre: 'Laura Vega', iniciales: 'LV',
    especialidad: 'Suelo Pélvico · Fisioterapia Obstétrica', experiencia: '6 años',
    titulo: 'Grado en Fisioterapia · Experta en Suelo Pélvico',
    idiomas: ['Español', 'Catalán'],
    disponibilidad: ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    valoracion: 5.0, sesiones: 310,
    color: '#7c3aed',
  },
  {
    id: 'p4', nombre: 'Carlos Pérez', iniciales: 'CP',
    especialidad: 'Neurorrehabilitación · Readaptación', experiencia: '5 años',
    titulo: 'Grado en Fisioterapia · Máster Neurorehabilitación',
    idiomas: ['Español', 'Inglés'],
    disponibilidad: ['Lun', 'Mar', 'Jue', 'Vie'],
    valoracion: 4.7, sesiones: 280,
    color: '#dc2626',
  },
];

// ─── Agenda / Citas ───────────────────────────────────────────────────────────

export const ESTADOS_CITA = {
  confirmada:    { label: 'Confirmada',    color: '#059669', bg: '#d1fae5' },
  pendiente:     { label: 'Pendiente',     color: '#d97706', bg: '#fef3c7' },
  cancelada:     { label: 'Cancelada',     color: '#dc2626', bg: '#fee2e2' },
  completada:    { label: 'Completada',    color: '#4338ca', bg: '#e0e7ff' },
  noShow:        { label: 'No presentado', color: '#94a3b8', bg: '#f1f5f9' },
};

export const CITAS_HOY = [
  { id: 'c1', hora: '09:00', paciente: 'María García López', servicio: 'Fisioterapia Deportiva', profesional: 'p1', duracion: 45, estado: 'confirmada', sala: 'Sala 1' },
  { id: 'c2', hora: '09:30', paciente: 'Luis Martínez Sanz', servicio: 'Rehabilitación', profesional: 'p2', duracion: 60, estado: 'confirmada', sala: 'Sala 2' },
  { id: 'c3', hora: '10:00', paciente: 'Ana Torres Ruiz', servicio: 'Suelo Pélvico', profesional: 'p3', duracion: 45, estado: 'pendiente', sala: 'Sala 3' },
  { id: 'c4', hora: '10:30', paciente: 'Pedro Alonso Gil', servicio: 'Terapia Manual', profesional: 'p2', duracion: 45, estado: 'confirmada', sala: 'Sala 2' },
  { id: 'c5', hora: '11:00', paciente: 'Sofía Herrero Díaz', servicio: 'Ejercicio Terapéutico', profesional: 'p4', duracion: 60, estado: 'confirmada', sala: 'Sala 4' },
  { id: 'c6', hora: '11:30', paciente: 'Carlos Fernández Blanco', servicio: 'Fisioterapia Deportiva', profesional: 'p1', duracion: 45, estado: 'completada', sala: 'Sala 1' },
  { id: 'c7', hora: '12:00', paciente: 'Isabel Gómez Mora', servicio: 'Dolor Crónico', profesional: 'p2', duracion: 45, estado: 'noShow', sala: 'Sala 2' },
  { id: 'c8', hora: '12:30', paciente: 'Roberto Jiménez Cruz', servicio: 'Readaptación Deportiva', profesional: 'p1', duracion: 60, estado: 'confirmada', sala: 'Sala 1' },
  { id: 'c9', hora: '16:00', paciente: 'Carmen Navarro Vidal', servicio: 'Fisioterapia Neurológica', profesional: 'p4', duracion: 60, estado: 'confirmada', sala: 'Sala 3' },
  { id: 'c10', hora: '17:00', paciente: 'Alejandro Serrano Pons', servicio: 'Terapia Manual', profesional: 'p2', duracion: 45, estado: 'pendiente', sala: 'Sala 2' },
];

// ─── Pacientes ────────────────────────────────────────────────────────────────

export const PACIENTES = [
  { id: 'pa1', nombre: 'María García López', edad: 34, telefono: '6XX XXX XX1 (demo)', email: 'demo1@example.local', tratamiento: 'Fisioterapia Deportiva', profesional: 'p1', sesiones: 12, ultimaSesion: '2026-08-25', proximaCita: '2026-08-28', estado: 'activo', evolucion: 85, dolor: 2 },
  { id: 'pa2', nombre: 'Luis Martínez Sanz', edad: 52, telefono: '6XX XXX XX2 (demo)', email: 'demo2@example.local', tratamiento: 'Rehabilitación', profesional: 'p2', sesiones: 8, ultimaSesion: '2026-08-24', proximaCita: '2026-08-28', estado: 'activo', evolucion: 60, dolor: 4 },
  { id: 'pa3', nombre: 'Ana Torres Ruiz', edad: 28, telefono: '6XX XXX XX3 (demo)', email: 'demo3@example.local', tratamiento: 'Suelo Pélvico', profesional: 'p3', sesiones: 6, ultimaSesion: '2026-08-22', proximaCita: '2026-08-28', estado: 'activo', evolucion: 70, dolor: 3 },
  { id: 'pa4', nombre: 'Pedro Alonso Gil', edad: 45, telefono: '6XX XXX XX4 (demo)', email: 'demo4@example.local', tratamiento: 'Dolor Crónico', profesional: 'p2', sesiones: 20, ultimaSesion: '2026-08-23', proximaCita: '2026-08-28', estado: 'activo', evolucion: 55, dolor: 5 },
  { id: 'pa5', nombre: 'Sofía Herrero Díaz', edad: 31, telefono: '6XX XXX XX5 (demo)', email: 'demo5@example.local', tratamiento: 'Ejercicio Terapéutico', profesional: 'p4', sesiones: 15, ultimaSesion: '2026-08-26', proximaCita: '2026-08-28', estado: 'activo', evolucion: 90, dolor: 1 },
  { id: 'pa6', nombre: 'Carlos Fernández Blanco', edad: 26, telefono: '6XX XXX XX6 (demo)', email: 'demo6@example.local', tratamiento: 'Readaptación Deportiva', profesional: 'p1', sesiones: 4, ultimaSesion: '2026-08-27', proximaCita: '2026-09-01', estado: 'activo', evolucion: 40, dolor: 4 },
  { id: 'pa7', nombre: 'Carmen Navarro Vidal', edad: 67, telefono: '6XX XXX XX7 (demo)', email: 'demo7@example.local', tratamiento: 'Fisioterapia Neurológica', profesional: 'p4', sesiones: 24, ultimaSesion: '2026-08-21', proximaCita: '2026-08-28', estado: 'activo', evolucion: 45, dolor: 6 },
  { id: 'pa8', nombre: 'Roberto Jiménez Cruz', edad: 38, telefono: '6XX XXX XX8 (demo)', email: 'demo8@example.local', tratamiento: 'Fisioterapia Deportiva', profesional: 'p1', sesiones: 9, ultimaSesion: '2026-08-26', proximaCita: '2026-08-28', estado: 'activo', evolucion: 78, dolor: 2 },
  { id: 'pa9', nombre: 'Isabel Gómez Mora', edad: 55, telefono: '6XX XXX XX9 (demo)', email: 'demo9@example.local', tratamiento: 'Terapia Manual', profesional: 'p2', sesiones: 5, ultimaSesion: '2026-08-20', proximaCita: '2026-09-03', estado: 'pausado', evolucion: 30, dolor: 7 },
  { id: 'pa10', nombre: 'Alejandro Serrano Pons', edad: 22, telefono: '6XX XXX X10 (demo)', email: 'demo10@example.local', tratamiento: 'Terapia Manual', profesional: 'p2', sesiones: 3, ultimaSesion: '2026-08-18', proximaCita: '2026-08-28', estado: 'activo', evolucion: 25, dolor: 6 },
  { id: 'pa11', nombre: 'Natalia Soria Perea', edad: 41, telefono: '6XX XXX X11 (demo)', email: 'demo11@example.local', tratamiento: 'Suelo Pélvico', profesional: 'p3', sesiones: 10, ultimaSesion: '2026-08-14', proximaCita: '2026-09-05', estado: 'alta', evolucion: 100, dolor: 0 },
  { id: 'pa12', nombre: 'Fernando Blasco Ortiz', edad: 48, telefono: '6XX XXX X12 (demo)', email: 'demo12@example.local', tratamiento: 'Rehabilitación', profesional: 'p2', sesiones: 18, ultimaSesion: '2026-08-27', proximaCita: '2026-08-29', estado: 'activo', evolucion: 72, dolor: 3 },
];

// ─── Ejercicios ───────────────────────────────────────────────────────────────

export const EJERCICIOS = [
  { id: 'e1', nombre: 'Sentadilla asistida', zona: 'Tren inferior', nivel: 'Básico', objetivo: 'Fuerza de cuádriceps', series: 3, reps: '12-15', duracion: '5 min', tags: ['rodilla', 'fuerza', 'funcional'] },
  { id: 'e2', nombre: 'Puente de glúteos', zona: 'Glúteos · Core', nivel: 'Básico', objetivo: 'Activación glútea y estabilización pélvica', series: 3, reps: '15', duracion: '4 min', tags: ['glúteo', 'core', 'lumbar'] },
  { id: 'e3', nombre: 'Plank lateral', zona: 'Core lateral', nivel: 'Intermedio', objetivo: 'Estabilidad de columna y cadera', series: 3, reps: '30s', duracion: '3 min', tags: ['core', 'columna', 'estabilidad'] },
  { id: 'e4', nombre: 'Theraband de hombro', zona: 'Hombro', nivel: 'Básico', objetivo: 'Rotadores del manguito rotador', series: 3, reps: '15', duracion: '4 min', tags: ['hombro', 'manguito', 'banda elástica'] },
  { id: 'e5', nombre: 'Bicicleta supino', zona: 'Core · Cadera', nivel: 'Intermedio', objetivo: 'Control lumbar y activación abdominal', series: 3, reps: '20', duracion: '5 min', tags: ['core', 'lumbar', 'abdominal'] },
  { id: 'e6', nombre: 'Marcha con rodillas altas', zona: 'Tren inferior', nivel: 'Básico', objetivo: 'Patrón de marcha y propiocepción', series: 2, reps: '10m', duracion: '3 min', tags: ['marcha', 'propiocepción', 'neurológico'] },
  { id: 'e7', nombre: 'Estiramiento de isquios', zona: 'Posterior de muslo', nivel: 'Básico', objetivo: 'Flexibilidad de la cadena posterior', series: 3, reps: '30s', duracion: '3 min', tags: ['estiramiento', 'isquio', 'flexibilidad'] },
  { id: 'e8', nombre: 'Dead bug', zona: 'Core profundo', nivel: 'Avanzado', objetivo: 'Estabilización lumbopélvica', series: 3, reps: '8 por lado', duracion: '5 min', tags: ['core', 'estabilización', 'lumbar'] },
  { id: 'e9', nombre: 'Flexión de codo con theraband', zona: 'Brazo', nivel: 'Básico', objetivo: 'Fuerza de bíceps tras inmovilización', series: 3, reps: '15', duracion: '4 min', tags: ['brazo', 'rehabilitación', 'bíceps'] },
  { id: 'e10', nombre: 'Propiocepción en puntillas', zona: 'Tobillo · Pie', nivel: 'Intermedio', objetivo: 'Equilibrio y propiocepción de tobillo', series: 3, reps: '30s', duracion: '4 min', tags: ['tobillo', 'equilibrio', 'propiocepción'] },
  { id: 'e11', nombre: 'Rotación de cadera en decúbito', zona: 'Cadera · Glúteo', nivel: 'Básico', objetivo: 'Movilidad de la articulación coxofemoral', series: 2, reps: '10 por lado', duracion: '4 min', tags: ['cadera', 'movilidad', 'suelo pélvico'] },
  { id: 'e12', nombre: 'Pallof press', zona: 'Core anti-rotacional', nivel: 'Avanzado', objetivo: 'Estabilidad rotacional del tronco', series: 3, reps: '12 por lado', duracion: '5 min', tags: ['core', 'anti-rotación', 'avanzado'] },
];

// ─── Testimonios ──────────────────────────────────────────────────────────────

export const TESTIMONIOS = [
  {
    id: 't1', nombre: 'Marc R.', edad: 28, tratamiento: 'Fisioterapia Deportiva',
    texto: 'Tenía una rotura de ligamento de tobillo y pensé que no volvería a correr. Tres meses después corrí mi primera media maratón. El equipo de FisioNova es excepcional.',
    estrellas: 5, demo: true,
  },
  {
    id: 't2', nombre: 'Teresa M.', edad: 52, tratamiento: 'Terapia Manual',
    texto: 'Llevaba 2 años con dolor de espalda crónico. Tras 10 sesiones de terapia manual con Javier, puedo volver a hacer vida normal. Recomiendo FisioNova al 100%.',
    estrellas: 5, demo: true,
  },
  {
    id: 't3', nombre: 'Ainhoa P.', edad: 31, tratamiento: 'Suelo Pélvico',
    texto: 'Tras el parto tenía mucha incontinencia. Laura me trató con mucho respeto y profesionalidad. En 8 sesiones recuperé el control y la confianza. Gracias.',
    estrellas: 5, demo: true,
  },
  {
    id: 't4', nombre: 'Gonzalo S.', edad: 45, tratamiento: 'Rehabilitación',
    texto: 'Prótesis de rodilla a los 45 años. El protocolo de rehabilitación de FisioNova fue clave para mi recuperación. Volví a jugar al golf antes de lo previsto.',
    estrellas: 5, demo: true,
  },
];

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  citasHoy:        { valor: 10, meta: 12 },
  pacientesActivos: { valor: 89, meta: 100 },
  ocupacionSemana: { valor: 82, meta: 90 },
  ingresosDemo:    { valor: '3.840€', label: 'Esta semana (demo)' },
  tasaRecuperacion: { valor: 98, label: '%' },
  nuevosPacientes: { valor: 6, label: 'Esta semana' },
  cancelaciones:   { valor: 3, label: 'Esta semana' },
  leadsNuevos:     { valor: 14, label: 'Pendientes' },
};

// ─── Leads ───────────────────────────────────────────────────────────────────

export const LEADS = [
  { id: 'l1', nombre: 'David Molina', via: 'web', motivo: 'Dolor de espalda', fecha: '2026-08-27', estado: 'pendiente', prioridad: 'alta', profesional: null },
  { id: 'l2', nombre: 'Patricia Iglesias', via: 'instagram', motivo: 'Fisio deportiva corredor', fecha: '2026-08-26', estado: 'contactado', prioridad: 'media', profesional: 'p1' },
  { id: 'l3', nombre: 'Antonio Cano', via: 'google', motivo: 'Postoperatorio rodilla', fecha: '2026-08-26', estado: 'pendiente', prioridad: 'alta', profesional: null },
  { id: 'l4', nombre: 'Marta Pons', via: 'web', motivo: 'Suelo pélvico postparto', fecha: '2026-08-25', estado: 'citado', prioridad: 'media', profesional: 'p3' },
  { id: 'l5', nombre: 'Óscar Reina', via: 'referido', motivo: 'Tendinitis codo', fecha: '2026-08-25', estado: 'contactado', prioridad: 'baja', profesional: 'p2' },
  { id: 'l6', nombre: 'Raquel Sanz', via: 'web', motivo: 'Fibromialgia', fecha: '2026-08-24', estado: 'pendiente', prioridad: 'alta', profesional: null },
  { id: 'l7', nombre: 'Jorge Esteban', via: 'google', motivo: 'Readaptación fútbol', fecha: '2026-08-23', estado: 'citado', prioridad: 'media', profesional: 'p1' },
  { id: 'l8', nombre: 'Lucía Castro', via: 'instagram', motivo: 'Pilates terapéutico', fecha: '2026-08-22', estado: 'perdido', prioridad: 'baja', profesional: null },
];

// ─── Presupuestos / Bonos ─────────────────────────────────────────────────────

export const BONOS = [
  { id: 'b1', nombre: 'Bono 5 sesiones', precio: 290, ahorro: '13%', sesiones: 5, validez: '90 días', tipo: 'bono' },
  { id: 'b2', nombre: 'Bono 10 sesiones', precio: 540, ahorro: '17%', sesiones: 10, validez: '180 días', tipo: 'bono' },
  { id: 'b3', nombre: 'Pack Deportista', precio: 350, ahorro: '12%', sesiones: 6, validez: '90 días', tipo: 'pack', desc: 'Fisio deportiva + valoración funcional + plan de ejercicios personalizado' },
  { id: 'b4', nombre: 'Plan Recuperación Total', precio: 499, ahorro: '20%', sesiones: 8, validez: '120 días', tipo: 'pack', desc: 'Postoperatorio: rehabilitación + ejercicio terapéutico + revisión mensual' },
  { id: 'b5', nombre: 'Sesión individual', precio: 65, sesiones: 1, validez: 'Sin caducidad', tipo: 'individual' },
];

// ─── Actividad reciente (Dashboard) ──────────────────────────────────────────

export const ACTIVIDAD_RECIENTE = [
  { tipo: 'cita', texto: 'Sofía Herrero completó sesión de Ejercicio Terapéutico', hace: '12 min', icon: '✅' },
  { tipo: 'lead', texto: 'Nuevo lead web: David Molina — dolor de espalda', hace: '35 min', icon: '🔔' },
  { tipo: 'alta', texto: 'Natalia Soria recibe el alta — recuperación al 100%', hace: '1h', icon: '🎉' },
  { tipo: 'bono', texto: 'Carlos Fernández activó Bono 5 sesiones (demo)', hace: '2h', icon: '💼' },
  { tipo: 'cita', texto: 'Cancelación: Isabel Gómez — no presentado', hace: '3h', icon: '❌' },
  { tipo: 'lead', texto: 'Nuevo lead Instagram: Patricia Iglesias — corredor', hace: '4h', icon: '📱' },
];
