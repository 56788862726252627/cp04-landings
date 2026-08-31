/**
 * FisioNova Premium V2 Pilot — Mock Data
 * Decision Engine: clinical-premium preset
 * Palette: primary #0369a1, accent #10b981, surface #f0f9ff
 * Demo comercial · Datos 100% ficticios · NO producción
 */

export const BRANDING_V2 = {
  nombre: 'FisioNova',
  tagline: 'Fisioterapia de excelencia',
  slogan: 'Tu recuperación, nuestra misión',
  inicial: 'FN',
  primaryColor: '#0369a1',
  accentColor: '#10b981',
  surfaceColor: '#f0f9ff',
  bgColor: '#f8faff',
  textPrimary: '#0c1b33',
  textSecondary: '#4a5568',
  preset: 'clinical-premium',
  version: 'V2-pilot',
};

export const HERO_METRICS_V2 = [
  { valor: '94%', label: 'Pacientes satisfechos', icon: '⭐' },
  { valor: '+2.400', label: 'Tratamientos realizados', icon: '🩺' },
  { valor: '12 años', label: 'De experiencia clínica', icon: '🏅' },
  { valor: '48h', label: 'Primera cita disponible', icon: '📅' },
];

export const TRUST_BADGES = [
  { texto: 'Colegiados Nº 3421', icon: '🏥' },
  { texto: 'Certificado ISO 9001', icon: '✅' },
  { texto: 'RGPD Cumplimiento', icon: '🔒' },
  { texto: 'Seguros aceptados', icon: '💳' },
];

export const SERVICIOS_V2 = [
  {
    id: 'manual', nombre: 'Fisioterapia Manual', precio: 'desde 55€',
    descripcion: 'Técnicas manuales avanzadas para alivio inmediato del dolor.',
    duracion: '45 min', icono: '🤲', popular: true,
    beneficios: ['Alivio dolor agudo', 'Movilidad articular', 'Técnicas avaladas'],
  },
  {
    id: 'deportiva', nombre: 'Fisioterapia Deportiva', precio: 'desde 60€',
    descripcion: 'Recuperación y prevención de lesiones para deportistas.',
    duracion: '50 min', icono: '🏃', popular: false,
    beneficios: ['Recuperación lesiones', 'Prevención recaídas', 'Rendimiento óptimo'],
  },
  {
    id: 'neurologica', nombre: 'Fisio Neurológica', precio: 'desde 70€',
    descripcion: 'Rehabilitación especializada en patologías del sistema nervioso.',
    duracion: '60 min', icono: '🧠', popular: false,
    beneficios: ['Ictus y parkinson', 'Neurorehabilitación', 'Equipo especializado'],
  },
  {
    id: 'respiratoria', nombre: 'Fisio Respiratoria', precio: 'desde 55€',
    descripcion: 'Técnicas de rehabilitación pulmonar y drenaje.',
    duracion: '45 min', icono: '🫁', popular: false,
    beneficios: ['EPOC y asma', 'Post-COVID', 'Drenaje bronquial'],
  },
  {
    id: 'suelo-pelvico', nombre: 'Suelo Pélvico', precio: 'desde 65€',
    descripcion: 'Tratamiento especializado de disfunciones pélvicas.',
    duracion: '50 min', icono: '💙', popular: true,
    beneficios: ['Incontinencia', 'Embarazo y posparto', 'Dolor pélvico'],
  },
  {
    id: 'emc', nombre: 'Electroterapia', precio: 'desde 40€',
    descripcion: 'TENS, ultrasonidos y diatermia para dolor crónico.',
    duracion: '30 min', icono: '⚡', popular: false,
    beneficios: ['Dolor crónico', 'Inflamación', 'Combinable con manual'],
  },
];

export const PROCESO_PASOS = [
  { paso: 1, titulo: 'Evaluación inicial', desc: 'Valoración postural completa y análisis de movimiento.', icon: '📋' },
  { paso: 2, titulo: 'Plan personalizado', desc: 'Diseñamos un protocolo adaptado a tu patología y objetivos.', icon: '🗺️' },
  { paso: 3, titulo: 'Tratamiento activo', desc: 'Sesiones con seguimiento continuo y ajuste del plan.', icon: '🩺' },
  { paso: 4, titulo: 'Alta y prevención', desc: 'Ejercicios de mantenimiento para evitar recaídas.', icon: '🏆' },
];

export const TESTIMONIOS_V2 = [
  {
    nombre: 'Carmen L.', avatar: '👩', rating: 5,
    texto: 'Llevaba 3 años con dolor lumbar y en 8 sesiones conseguí volver a correr. El equipo es increíble.',
    tratamiento: 'Fisioterapia Manual',
  },
  {
    nombre: 'Alejandro M.', avatar: '🧑', rating: 5,
    texto: 'Me operaron de la rodilla y FisioNova fue clave en la recuperación. Superé las expectativas del cirujano.',
    tratamiento: 'Fisio Deportiva',
  },
  {
    nombre: 'Lucía P.', avatar: '👩‍🦱', rating: 5,
    texto: 'El tratamiento de suelo pélvico postparto fue un antes y un después. Muy profesionales y cercanas.',
    tratamiento: 'Suelo Pélvico',
  },
  {
    nombre: 'Roberto S.', avatar: '👨‍🦳', rating: 4,
    texto: 'Con la fibromialgia pensé que no habría solución. Con fisio respiratoria y manual mejoré mucho.',
    tratamiento: 'Fisio Respiratoria',
  },
];

export const PROFESIONALES_V2 = [
  {
    nombre: 'Dra. Ana García', especialidad: 'Fisio Neurológica', foto: '👩‍⚕️',
    colegiado: 'Nº 3421', años: 14, bio: 'Especialista en neurorehabilitación post-ictus.',
    pacientes: 847, valoracion: 4.9,
  },
  {
    nombre: 'Dr. Javier Ruiz', especialidad: 'Fisio Deportiva', foto: '🧑‍⚕️',
    colegiado: 'Nº 5103', años: 9, bio: 'Ex fisioterapeuta del Atlético de Madrid filial.',
    pacientes: 612, valoracion: 4.8,
  },
  {
    nombre: 'Dra. Marta López', especialidad: 'Suelo Pélvico', foto: '👩‍⚕️',
    colegiado: 'Nº 7892', años: 11, bio: 'Máster en uroginecología y posparto.',
    pacientes: 534, valoracion: 5.0,
  },
];

export const AGENDA_MOCK = [
  { id: 'A1', hora: '09:00', paciente: 'Carmen L.', tratamiento: 'Manual - Lumbar', sala: 1, estado: 'confirmada', duracion: 45 },
  { id: 'A2', hora: '10:00', paciente: 'Alejandro M.', tratamiento: 'Deportiva - Rodilla', sala: 2, estado: 'confirmada', duracion: 50 },
  { id: 'A3', hora: '11:00', paciente: 'Lucía P.', tratamiento: 'Suelo Pélvico', sala: 3, estado: 'pendiente', duracion: 50 },
  { id: 'A4', hora: '12:00', paciente: 'Roberto S.', tratamiento: 'Respiratoria - EPOC', sala: 1, estado: 'confirmada', duracion: 45 },
  { id: 'A5', hora: '13:00', paciente: 'María T.', tratamiento: 'Electroterapia', sala: 2, estado: 'confirmada', duracion: 30 },
  { id: 'A6', hora: '16:00', paciente: 'Carlos B.', tratamiento: 'Manual - Cervical', sala: 1, estado: 'pendiente', duracion: 45 },
  { id: 'A7', hora: '17:00', paciente: 'Elena F.', tratamiento: 'Deportiva - Hombro', sala: 2, estado: 'cancelada', duracion: 50 },
];

export const DASHBOARD_STATS = [
  { label: 'Citas hoy', valor: 12, delta: '+2 vs ayer', color: '#0369a1', icon: '📅' },
  { label: 'Ingresos mes', valor: '4.820€', delta: '+18% vs anterior', color: '#10b981', icon: '💰' },
  { label: 'Pacientes activos', valor: 87, delta: '+5 nuevos', color: '#7c3aed', icon: '👥' },
  { label: 'Satisfacción', valor: '94%', delta: '↑ 2 puntos', color: '#f59e0b', icon: '⭐' },
];

export const PACIENTES_MOCK = [
  { id: 'P1', nombre: 'Carmen López', edad: 42, ultima: '2026-08-28', estado: 'activo', sesiones: 8, diagnostico: 'Lumbalgia crónica', foto: '👩' },
  { id: 'P2', nombre: 'Alejandro Martín', edad: 28, ultima: '2026-08-27', estado: 'activo', sesiones: 12, diagnostico: 'Lesión LCA post-op', foto: '🧑' },
  { id: 'P3', nombre: 'Lucía Pérez', edad: 35, ultima: '2026-08-26', estado: 'activo', sesiones: 5, diagnostico: 'Disfunción suelo pélvico', foto: '👩‍🦱' },
  { id: 'P4', nombre: 'Roberto Sánchez', edad: 61, ultima: '2026-08-25', estado: 'activo', sesiones: 20, diagnostico: 'Fibromialgia + EPOC leve', foto: '👨‍🦳' },
  { id: 'P5', nombre: 'María Torres', edad: 54, ultima: '2026-08-20', estado: 'alta', sesiones: 10, diagnostico: 'Cervicalgia tensional', foto: '👩‍🦳' },
  { id: 'P6', nombre: 'Carlos Blanco', edad: 33, ultima: '2026-08-15', estado: 'activo', sesiones: 3, diagnostico: 'Tendinitis manguito rotador', foto: '👨' },
];

export const EVOLUCION_MOCK = {
  paciente: 'Carmen López',
  diagnostico: 'Lumbalgia crónica',
  inicio: '2026-07-10',
  sesiones: [
    { num: 1, fecha: '2026-07-10', dolor: 8, movilidad: 40, funcional: 30, nota: 'Contractura severa lumbar' },
    { num: 2, fecha: '2026-07-17', dolor: 7, movilidad: 50, funcional: 40, nota: 'Mejora movilidad flexión' },
    { num: 3, fecha: '2026-07-24', dolor: 6, movilidad: 58, funcional: 50, nota: 'Técnica miofascial aplicada' },
    { num: 4, fecha: '2026-07-31', dolor: 5, movilidad: 65, funcional: 60, nota: 'Incorpora ejercicios domiciliarios' },
    { num: 5, fecha: '2026-08-07', dolor: 4, movilidad: 72, funcional: 68, nota: 'Progresión excelente' },
    { num: 6, fecha: '2026-08-14', dolor: 3, movilidad: 78, funcional: 75, nota: 'Asintomática en reposo' },
    { num: 7, fecha: '2026-08-21', dolor: 2, movilidad: 85, funcional: 82, nota: 'Actividad laboral normalizada' },
    { num: 8, fecha: '2026-08-28', dolor: 1, movilidad: 92, funcional: 90, nota: 'Prepare alta con plan prevención' },
  ],
};

export const EJERCICIOS_MOCK = [
  {
    id: 'EJ1', nombre: 'Estiramiento isquiotibiales', categoria: 'flexibilidad',
    nivel: 'básico', duracion: '60s × 3', icono: '🧘',
    descripcion: 'Tumbado, lleva rodilla al pecho y extiende la pierna.',
    musculos: ['isquiotibiales', 'glúteo'],
  },
  {
    id: 'EJ2', nombre: 'Bird-Dog', categoria: 'estabilidad',
    nivel: 'básico', duracion: '10 rep × 3', icono: '🐕',
    descripcion: 'A 4 patas, extiende brazo y pierna contralateral.',
    musculos: ['lumbar', 'glúteo', 'core'],
  },
  {
    id: 'EJ3', nombre: 'Puente de glúteos', categoria: 'fuerza',
    nivel: 'básico', duracion: '15 rep × 3', icono: '🌉',
    descripcion: 'Tumbado boca arriba, eleva caderas manteniendo tensión.',
    musculos: ['glúteo mayor', 'isquiotibiales', 'lumbar'],
  },
  {
    id: 'EJ4', nombre: 'Plancha frontal', categoria: 'core',
    nivel: 'intermedio', duracion: '30s × 4', icono: '🏋️',
    descripcion: 'Cuerpo en línea recta apoyado en antebrazos y pies.',
    musculos: ['core', 'transverso', 'oblicuos'],
  },
  {
    id: 'EJ5', nombre: 'Sentadilla funcional', categoria: 'fuerza',
    nivel: 'intermedio', duracion: '12 rep × 3', icono: '🦵',
    descripcion: 'Rodillas a 90°, espalda recta, mirada al frente.',
    musculos: ['cuádriceps', 'glúteo', 'core'],
  },
  {
    id: 'EJ6', nombre: 'Respiración diafragmática', categoria: 'respiratorio',
    nivel: 'básico', duracion: '5 min × 2', icono: '🫁',
    descripcion: 'Mano en abdomen, inhala 4s, exhala 6s, activa diafragma.',
    musculos: ['diafragma', 'intercostales'],
  },
];

export const FAQ_V2 = [
  {
    pregunta: '¿Necesito derivación médica para empezar?',
    respuesta: 'No es obligatorio. Puedes venir directamente con o sin volante médico. Nuestros fisioterapeutas realizarán una evaluación completa.',
  },
  {
    pregunta: '¿Cuántas sesiones necesitaré?',
    respuesta: 'Depende de la patología y el estado inicial. En la primera visita te daremos un plan estimado. La mayoría de procesos agudos se resuelven en 4-8 sesiones.',
  },
  {
    pregunta: '¿Aceptáis seguros médicos?',
    respuesta: 'Sí, trabajamos con Mapfre, Adeslas, Sanitas y Asisa. Consulta con tu aseguradora el número de sesiones cubiertas.',
  },
  {
    pregunta: '¿Qué debo llevar a la primera cita?',
    respuesta: 'DNI, historial médico si lo tienes, ropa cómoda y calzado deportivo. Te prepararemos para la sesión desde el primer momento.',
  },
];
