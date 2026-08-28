/**
 * VERTICAL · Dental · Configuración de sector
 * Reglas de negocio: intenciones, restricciones clínicas, sedes, financiación.
 * Sin secretos, sin llamadas externas, sin diagnósticos ni consejos médicos.
 */

export const DENTAL_VERTICAL = {
  id: 'dental',
  nombre_sector: 'Clínica Dental',
  terminologia: {
    cliente: 'Paciente',
    servicio: 'Tratamiento',
    cita: 'Cita',
    lead: 'Paciente potencial',
  },
  intenciones: [
    {
      id: 'primera_visita',
      label: 'Primera visita',
      emoji: '👋',
      descripcion: 'Consulta de valoración gratuita para nuevos pacientes',
      financiacion: false,
      sensible: false,
      color: 'blue',
    },
    {
      id: 'implantes_cirugia',
      label: 'Implantes / Cirugía',
      emoji: '🦷',
      descripcion: 'Implantes dentales, extracciones complejas, cirugía oral',
      financiacion: true,
      rango_precio: '800 – 4.500 € (ficticio)',
      sensible: false,
      color: 'indigo',
    },
    {
      id: 'ortodoncia',
      label: 'Ortodoncia',
      emoji: '✨',
      descripcion: 'Brackets, alineadores invisibles, corrección dental',
      financiacion: true,
      rango_precio: '1.500 – 3.500 € (ficticio)',
      sensible: false,
      color: 'purple',
    },
    {
      id: 'estetica',
      label: 'Estética dental',
      emoji: '😁',
      descripcion: 'Blanqueamiento, carillas, diseño de sonrisa',
      financiacion: true,
      rango_precio: '300 – 2.000 € (ficticio)',
      sensible: false,
      color: 'green',
    },
    {
      id: 'urgencia',
      label: 'Urgencia',
      emoji: '🚨',
      descripcion: 'Dolor agudo, fractura, pérdida de pieza, sangrado',
      financiacion: false,
      sensible: true,
      color: 'red',
      mensaje_urgencia:
        'Para urgencias con dolor intenso, te recomendamos llamar directamente a la clínica. Nuestro equipo te atenderá con prioridad.',
    },
    {
      id: 'consulta_general',
      label: 'Consulta general',
      emoji: '💬',
      descripcion: 'Revisión anual, limpieza, dudas generales sobre tratamientos',
      financiacion: false,
      sensible: false,
      color: 'gray',
    },
  ],

  seguridad_clinica: {
    diagnostico: false,
    prescripcion: false,
    consejo_medico: false,
    derivar_si_sensible: true,
    mensaje_derivacion:
      'Esta información es solo orientativa. Para cualquier diagnóstico, decisión clínica o recomendación de tratamiento, consulta siempre con un profesional de nuestro equipo médico cualificado.',
    keywords_sensibles: [
      'dolor', 'sangre', 'sangrado', 'infección', 'antibiótico',
      'anestesia', 'riesgo', 'complicación', 'alergia', 'medicamento',
      'fiebre', 'hinchazón', 'hichazón', 'nervio', 'tumor',
    ],
  },

  sedes: [
    { id: 'centro', nombre: 'Sede Centro', horario: 'L–V 09:00–20:00', horario_inicio: 9, horario_fin: 20 },
    { id: 'norte',  nombre: 'Sede Norte',  horario: 'L–V 10:00–21:00', horario_inicio: 10, horario_fin: 21 },
    { id: 'playa',  nombre: 'Sede Playa',  horario: 'L–S 09:00–18:00', horario_inicio: 9, horario_fin: 18 },
  ],

  franjas_horarias: [
    { id: 'manana', label: 'Mañana (09:00–13:00)' },
    { id: 'tarde',  label: 'Tarde (15:00–20:00)' },
    { id: 'sabado', label: 'Sábado mañana' },
  ],

  opciones_financiacion: [
    { id: 'contado',   label: 'Pago único',              descripcion: 'Sin intereses (ficticio)' },
    { id: 'meses_6',   label: '6 meses sin intereses',   descripcion: 'Cuotas desde X €/mes (ficticio)' },
    { id: 'meses_12',  label: '12 meses sin intereses',  descripcion: 'Cuotas desde X €/mes (ficticio)' },
    { id: 'meses_24',  label: '24 meses financiado',     descripcion: 'TAE de ejemplo (ficticio)' },
  ],
};

export function detectaSensible(texto) {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return DENTAL_VERTICAL.seguridad_clinica.keywords_sensibles.some(kw => t.includes(kw));
}

export function getIntencion(id) {
  return DENTAL_VERTICAL.intenciones.find(i => i.id === id) ?? null;
}

export function getSede(id) {
  return DENTAL_VERTICAL.sedes.find(s => s.id === id) ?? null;
}

export function estaEnHorario(sede, hour) {
  if (!sede) return true;
  return hour >= sede.horario_inicio && hour < sede.horario_fin;
}
