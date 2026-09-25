/**
 * VERTICAL · Despacho de Abogados / Servicios Jurídicos
 * Reglas de negocio: áreas, intenciones, profesionales, expedientes, honorarios.
 * Sin secretos, sin llamadas externas, sin asesoramiento jurídico real.
 * NO emite dictámenes. NO garantiza resultados. Solo simulación demo.
 */

export const ABOGADOS_VERTICAL = {
  id: 'abogados',
  nombre_sector: 'Despacho de Abogados / Servicios Jurídicos',
  terminologia: {
    cliente:  'Cliente',
    servicio: 'Consulta jurídica',
    cita:     'Consulta',
    lead:     'Potencial cliente',
    sede:     'Despacho',
  },

  intenciones: [
    {
      id:               'consulta_inicial',
      label:            'Consulta inicial general',
      emoji:            '⚖️',
      descripcion:      'Primera toma de contacto para evaluar tu caso. Sin compromiso.',
      area_practica:    null,
      urgencia_default: 'media',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'blue',
    },
    {
      id:               'derecho_laboral',
      label:            'Derecho laboral',
      emoji:            '👷',
      descripcion:      'Despido, ERE, nóminas, accidente laboral, reclamaciones',
      area_practica:    'laboral',
      urgencia_default: 'media',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'yellow',
    },
    {
      id:               'derecho_familia',
      label:            'Derecho de familia',
      emoji:            '👨‍👩‍👧',
      descripcion:      'Divorcio, custodia, pensiones, herencias, testamentos',
      area_practica:    'familia',
      urgencia_default: 'media',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'pink',
    },
    {
      id:               'derecho_civil',
      label:            'Derecho civil',
      emoji:            '📄',
      descripcion:      'Contratos, deudas, reclamaciones, responsabilidad civil',
      area_practica:    'civil',
      urgencia_default: 'baja',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'green',
    },
    {
      id:               'derecho_penal',
      label:            'Derecho penal',
      emoji:            '🚔',
      descripcion:      'Defensa penal, denuncia, víctimas, juicio rápido',
      area_practica:    'penal',
      urgencia_default: 'alta',
      sensible:         true,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'red',
      mensaje_derivacion_especifico:
        'Los asuntos penales requieren atención inmediata de un abogado especializado. No podemos ofrecer asesoramiento jurídico por este canal. Te derivamos urgentemente a nuestro equipo penal.',
    },
    {
      id:               'derecho_mercantil',
      label:            'Derecho mercantil / empresas',
      emoji:            '🏢',
      descripcion:      'Contratos mercantiles, concurso de acreedores, sociedades',
      area_practica:    'mercantil',
      urgencia_default: 'media',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'indigo',
    },
    {
      id:               'derecho_administrativo',
      label:            'Derecho administrativo',
      emoji:            '🏛️',
      descripcion:      'Multas, recursos, sanciones, licencias, expropiaciones',
      area_practica:    'administrativo',
      urgencia_default: 'media',
      sensible:         false,
      flujo_corto:      false,
      mostrar_honorarios: false,
      color:            'teal',
    },
    {
      id:               'presupuesto_honorarios',
      label:            'Consultar honorarios',
      emoji:            '💶',
      descripcion:      'Tarifas orientativas según tipo de asunto (precios ficticios)',
      area_practica:    null,
      urgencia_default: 'baja',
      sensible:         false,
      flujo_corto:      true,
      mostrar_honorarios: true,
      mensaje_flujo_corto:
        'Nuestras tarifas son orientativas y dependen de la complejidad del caso. Los precios indicados son ficticios y solo para demostración. Contacta con nosotros para un presupuesto personalizado.',
      color:            'gray',
    },
    {
      id:               'cambio_cancelacion',
      label:            'Cambiar o cancelar consulta',
      emoji:            '📅',
      descripcion:      'Gestionar una cita existente',
      area_practica:    null,
      urgencia_default: 'baja',
      sensible:         false,
      flujo_corto:      true,
      mostrar_honorarios: false,
      mensaje_flujo_corto:
        'Para modificar o cancelar tu consulta contacta con el despacho directamente. Te atendemos en menos de 2 horas en horario de apertura.',
      color:            'gray',
    },
  ],

  seguridad_juridica: {
    asesoramiento_real:               false,
    dictamen:                         false,
    garantia_resultado:               false,
    conflicto_intereses_demo:         true,
    derivar_a_abogado_especialista:   true,
    aviso_demo:
      'Este asistente NO ofrece asesoramiento jurídico real. No emite dictámenes ni garantiza resultados. Solo orienta y facilita la reserva de consulta con un abogado especializado.',
    keywords_sensibles: [
      'soy inocente', 'me van a condenar', 'me detienen',
      'me han detenido', 'orden de arresto', 'orden judicial urgente',
      'libertad provisional', 'prisión preventiva', 'ingreso en prisión',
      'declarar ante el juez hoy', 'juicio mañana', 'fianza',
      'medida cautelar urgente', 'violencia de género urgente',
      'protección inmediata', 'alejamiento urgente',
    ],
  },

  areas_practica: [
    { id: 'civil',           label: 'Civil',           emoji: '📄', descripcion: 'Contratos, deudas, responsabilidad' },
    { id: 'laboral',         label: 'Laboral',         emoji: '👷', descripcion: 'Despidos, nóminas, accidentes' },
    { id: 'mercantil',       label: 'Mercantil',       emoji: '🏢', descripcion: 'Empresas, sociedades, concursos' },
    { id: 'familia',         label: 'Familia',         emoji: '👨‍👩‍👧', descripcion: 'Divorcios, herencias, menores' },
    { id: 'penal',           label: 'Penal',           emoji: '🚔', descripcion: 'Defensa, víctimas, denuncias' },
    { id: 'administrativo',  label: 'Administrativo',  emoji: '🏛️', descripcion: 'Recursos, sanciones, licencias' },
  ],

  despachos: [
    {
      id: 'central',
      nombre: 'Despacho Central (ficticio)',
      horario: 'L–V 09:00–19:00',
      horario_inicio: 9,
      horario_fin: 19,
    },
    {
      id: 'sucursal_norte',
      nombre: 'Sucursal Norte (ficticio)',
      horario: 'L–J 09:00–18:00',
      horario_inicio: 9,
      horario_fin: 18,
    },
  ],

  abogados: [
    {
      id:          'abg1',
      nombre:      'Dra. Martínez García (ficticia)',
      area:        'laboral',
      area_label:  'Derecho Laboral',
      disponible:  true,
    },
    {
      id:          'abg2',
      nombre:      'D. Rodríguez Pérez (ficticio)',
      area:        'penal',
      area_label:  'Derecho Penal',
      disponible:  true,
    },
    {
      id:          'abg3',
      nombre:      'Dra. López Sánchez (ficticia)',
      area:        'familia',
      area_label:  'Derecho de Familia',
      disponible:  true,
    },
    {
      id:          'abg4',
      nombre:      'D. Fernández Ruiz (ficticio)',
      area:        'civil_mercantil',
      area_label:  'Civil y Mercantil',
      disponible:  true,
    },
    {
      id:          'cualquiera',
      nombre:      'Primer abogado disponible',
      area:        null,
      area_label:  'Disponibilidad libre',
      disponible:  true,
    },
  ],

  franjas_horarias: [
    { id: 'manana_temprano', label: 'Mañana temprano', rango: '09:00–11:00', hora_ref: 9  },
    { id: 'manana',          label: 'Mañana',          rango: '11:00–14:00', hora_ref: 11 },
    { id: 'tarde',           label: 'Tarde',           rango: '16:00–19:00', hora_ref: 16 },
  ],

  honorarios_demo: [
    {
      id:           'consulta_1h',
      label:        'Consulta inicial (1 h)',
      precio:       '150 € (ficticio)',
      descripcion:  'Primera evaluación del caso con abogado especialista',
      destacado:    false,
    },
    {
      id:           'seguimiento_mensual',
      label:        'Seguimiento mensual de expediente',
      precio:       'Desde 200 €/mes (ficticio)',
      descripcion:  'Gestión activa del expediente, comunicaciones y actuaciones',
      destacado:    true,
    },
    {
      id:           'asunto_simple',
      label:        'Asunto simple (estimado)',
      precio:       'Desde 500 € (ficticio)',
      descripcion:  'Carta, contrato simple, reclamación sencilla',
      destacado:    false,
    },
    {
      id:           'procedimiento_judicial',
      label:        'Procedimiento judicial completo',
      precio:       'Desde 1.200 € (ficticio)',
      descripcion:  'Incluye preparación, representación y seguimiento',
      destacado:    false,
    },
  ],

  fases_expediente: [
    { id: 'consulta_inicial',       label: 'Consulta inicial',       orden: 1 },
    { id: 'investigacion',          label: 'Investigación / análisis', orden: 2 },
    { id: 'negociacion',            label: 'Negociación extrajudicial', orden: 3 },
    { id: 'procedimiento_judicial', label: 'Procedimiento judicial',  orden: 4 },
    { id: 'resolucion',             label: 'Resolución / sentencia',  orden: 5 },
    { id: 'archivado',              label: 'Archivado',               orden: 6 },
  ],

  campanas: [
    {
      id:              'camp_laboral',
      titulo:          'Consulta laboral gratuita',
      descripcion:     'Primera consulta gratis para despidos en 2026 (ficticio)',
      activa:          true,
      leads_generados: 14,
    },
    {
      id:              'camp_familia',
      titulo:          'Divorcio de mutuo acuerdo exprés',
      descripcion:     'Tramitación rápida con honorarios cerrados (ficticio)',
      activa:          true,
      leads_generados: 9,
    },
    {
      id:              'camp_digital',
      titulo:          'Derechos digitales y privacidad',
      descripcion:     'Asesoría en vulneraciones LOPD/RGPD (ficticio)',
      activa:          false,
      leads_generados: 0,
    },
  ],
};

export function detectaSensibleAbogados(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return ABOGADOS_VERTICAL.seguridad_juridica.keywords_sensibles.some(kw => {
    const k = kw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t.includes(k);
  });
}

export function getIntencionAbogados(id) {
  return ABOGADOS_VERTICAL.intenciones.find(i => i.id === id) ?? null;
}

export function getAbogadoPorArea(area) {
  return ABOGADOS_VERTICAL.abogados.find(a => a.area === area && a.disponible) ?? null;
}

export function getDespacho(id) {
  return ABOGADOS_VERTICAL.despachos.find(d => d.id === id) ?? null;
}
