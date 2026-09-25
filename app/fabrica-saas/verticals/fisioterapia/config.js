/**
 * VERTICAL · Fisioterapia · Configuración de sector
 * Reglas de negocio: intenciones, restricciones clínicas, centros, profesionales, bonos.
 * Sin secretos, sin llamadas externas, sin diagnósticos ni promesas de resultado clínico.
 */

export const FISIO_VERTICAL = {
  id: 'fisioterapia',
  nombre_sector: 'Fisioterapia',
  terminologia: {
    cliente: 'Paciente',
    servicio: 'Sesión',
    cita: 'Sesión',
    lead: 'Paciente potencial',
    sede: 'Centro',
  },

  intenciones: [
    {
      id: 'primera_valoracion',
      label: 'Primera valoración',
      emoji: '🩺',
      descripcion: 'Evaluación inicial gratuita. Sin compromiso.',
      mostrar_bonos: false,
      sensible: false,
      color: 'blue',
    },
    {
      id: 'dolor_lumbar',
      label: 'Dolor lumbar / espalda',
      emoji: '🦴',
      descripcion: 'Lumbalgia, cervicalgia, contracturas musculares',
      mostrar_bonos: false,
      sensible: true,
      color: 'yellow',
      mensaje_derivacion_especifico:
        'El dolor lumbar puede tener múltiples causas. Nuestro equipo te realizará una valoración funcional personalizada. No te damos diagnósticos por aquí.',
    },
    {
      id: 'rehabilitacion_deportiva',
      label: 'Rehabilitación deportiva',
      emoji: '🏃',
      descripcion: 'Lesiones de rodilla, hombro, tobillo; vuelta al deporte',
      mostrar_bonos: false,
      sensible: false,
      color: 'green',
    },
    {
      id: 'postoperatorio',
      label: 'Recuperación postoperatoria',
      emoji: '🏥',
      descripcion: 'Tras cirugía: prótesis, ligamentos, columna, cadera',
      mostrar_bonos: false,
      sensible: true,
      color: 'indigo',
      mensaje_derivacion_especifico:
        'La recuperación postoperatoria requiere coordinación con tu cirujano. Nuestros fisioterapeutas trabajarán siguiendo el informe médico.',
    },
    {
      id: 'suelo_pelvico',
      label: 'Suelo pélvico',
      emoji: '💜',
      descripcion: 'Incontinencia, postparto, prolapso, disfunción sexual',
      mostrar_bonos: false,
      sensible: true,
      color: 'purple',
      mensaje_derivacion_especifico:
        'Esta área requiere una valoración específica. Contamos con fisioterapeutas especializadas en suelo pélvico. Todo con máxima confidencialidad.',
    },
    {
      id: 'precio_bonos',
      label: 'Precios y bonos de sesiones',
      emoji: '💰',
      descripcion: 'Consulta tarifas individuales y bonos con descuento',
      mostrar_bonos: true,
      sensible: false,
      color: 'gray',
    },
    {
      id: 'cambio_cancelacion',
      label: 'Cambiar / Cancelar cita',
      emoji: '🔄',
      descripcion: 'Gestionar tu sesión ya reservada',
      mostrar_bonos: false,
      sensible: false,
      color: 'gray',
      flujo_corto: true,
      mensaje_flujo_corto:
        'Para modificar o cancelar una sesión existente, contacta con nosotros directamente. Puedes llamar al Centro Principal o escribir por nuestro chat interno (demo ficticia — sin contacto real).',
    },
  ],

  seguridad_clinica: {
    diagnostico: false,
    prescripcion: false,
    consejo_medico: false,
    promesa_resultado: false,
    derivar_si_sensible: true,
    mensaje_derivacion:
      'Esta información es solo orientativa. Para cualquier valoración, diagnóstico funcional o plan de tratamiento individualizado, consulta siempre con un profesional de nuestro equipo fisioterapéutico cualificado.',
    keywords_sensibles: [
      'fractura', 'rotura', 'parálisis', 'tumor', 'cáncer', 'fiebre',
      'infección', 'sangrado', 'sangre', 'embolia', 'trombosis',
      'accidente', 'traumatismo severo', 'incapacidad total', 'quiste',
      'hernia grave', 'neuroma', 'compresión medular', 'urgencia',
    ],
  },

  centros: [
    { id: 'principal', nombre: 'Centro Principal', horario: 'L–V 09:00–20:00', horario_inicio: 9, horario_fin: 20 },
    { id: 'norte',     nombre: 'Centro Norte',     horario: 'L–V 10:00–19:00', horario_inicio: 10, horario_fin: 19 },
    { id: 'domicilio', nombre: 'Servicio a domicilio', horario: 'L–V 09:00–18:00', horario_inicio: 9, horario_fin: 18 },
  ],

  profesionales: [
    { id: 'prof1', nombre: 'Dra. García (ficticia)',    especialidad: 'Deporte y neurológica',          disponible: true },
    { id: 'prof2', nombre: 'Dr. Martínez (ficticio)',   especialidad: 'Lumbalgia y columna vertebral',  disponible: true },
    { id: 'prof3', nombre: 'Dra. López (ficticia)',     especialidad: 'Suelo pélvico y postparto',      disponible: true },
    { id: 'cualquiera', nombre: 'Disponibilidad libre', especialidad: 'El próximo fisioterapeuta libre', disponible: true },
  ],

  franjas_horarias: [
    { id: 'manana', label: 'Mañana (09:00–13:00)' },
    { id: 'tarde',  label: 'Tarde (15:00–20:00)'  },
    { id: 'sabado', label: 'Sábado mañana'         },
  ],

  bonos: [
    { id: 'sesion_1',  label: 'Sesión individual', precio: '45 € (ficticio)',  descripcion: '1 sesión de 60 min · Sin caducidad' },
    { id: 'bono_5',    label: 'Bono 5 sesiones',   precio: '200 € (ficticio)', descripcion: 'Ahorra ~11% · Válido 3 meses' },
    { id: 'bono_10',   label: 'Bono 10 sesiones',  precio: '370 € (ficticio)', descripcion: 'Ahorra ~18% · Válido 6 meses' },
    { id: 'primera_v', label: 'Primera valoración', precio: 'Gratuita (ficticio)', descripcion: 'Evaluación inicial sin compromiso' },
  ],
};

export function detectaSensibleFisio(texto) {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return FISIO_VERTICAL.seguridad_clinica.keywords_sensibles.some(kw => t.includes(kw));
}

export function getIntencionFisio(id) {
  return FISIO_VERTICAL.intenciones.find(i => i.id === id) ?? null;
}

export function getCentro(id) {
  return FISIO_VERTICAL.centros.find(c => c.id === id) ?? null;
}

export function getProfesional(id) {
  return FISIO_VERTICAL.profesionales.find(p => p.id === id) ?? null;
}

export function estaEnHorarioFisio(centro, hour) {
  if (!centro) return true;
  return hour >= centro.horario_inicio && hour < centro.horario_fin;
}
