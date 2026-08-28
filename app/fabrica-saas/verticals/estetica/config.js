/**
 * VERTICAL · Estética / Medicina Estética · Configuración de sector
 * Reglas de negocio: tratamientos, zonas, centros, profesionales, packs.
 * Sin secretos, sin llamadas externas, sin diagnósticos médicos ni promesas de resultado.
 */

export const ESTETICA_VERTICAL = {
  id: 'estetica',
  nombre_sector: 'Estética / Medicina Estética',
  terminologia: {
    cliente: 'Cliente',
    servicio: 'Tratamiento',
    cita: 'Sesión',
    lead: 'Cliente potencial',
    sede: 'Centro',
  },

  intenciones: [
    {
      id: 'consulta_inicial',
      label: 'Primera consulta gratuita',
      emoji: '✨',
      descripcion: 'Valoración personalizada sin compromiso',
      mostrar_pack: false,
      sensible: false,
      flujo_corto: false,
      color: 'blue',
    },
    {
      id: 'depilacion_laser',
      label: 'Depilación láser',
      emoji: '💡',
      descripcion: 'Láser diodo — zonas facial, axilas, piernas, ingles...',
      mostrar_pack: true,
      sensible: false,
      flujo_corto: false,
      mostrar_zona: true,
      color: 'purple',
    },
    {
      id: 'tratamiento_facial',
      label: 'Tratamiento facial',
      emoji: '🧖',
      descripcion: 'Hidratación, antiedad, peeling, radiofrecuencia facial',
      mostrar_pack: true,
      sensible: false,
      flujo_corto: false,
      color: 'pink',
    },
    {
      id: 'reduccion_corporal',
      label: 'Reducción corporal',
      emoji: '💪',
      descripcion: 'Reducción de volumen, celulitis, electroestimulación',
      mostrar_pack: true,
      sensible: false,
      flujo_corto: false,
      color: 'green',
    },
    {
      id: 'eliminacion_manchas',
      label: 'Tratamiento de manchas / cicatrices',
      emoji: '🔬',
      descripcion: 'Manchas solares, cicatrices, rojeces y tono irregular',
      mostrar_pack: false,
      sensible: true,
      flujo_corto: false,
      color: 'orange',
      mensaje_derivacion_especifico:
        'Antes de cualquier tratamiento de manchas te recomendamos una revisión dermatológica previa. Nuestro equipo no realiza diagnósticos médicos ni valora lesiones cutáneas sospechosas.',
    },
    {
      id: 'lifting_sin_cirugia',
      label: 'Lifting sin cirugía (HIFU / Radiofrecuencia)',
      emoji: '⚡',
      descripcion: 'HIFU, radiofrecuencia, tensor facial no invasivo',
      mostrar_pack: false,
      sensible: false,
      flujo_corto: false,
      color: 'indigo',
    },
    {
      id: 'precio_pack',
      label: 'Ver packs y precios',
      emoji: '🎁',
      descripcion: 'Consulta nuestros bonos y packs de sesiones',
      mostrar_pack: true,
      sensible: false,
      flujo_corto: true,
      mensaje_flujo_corto: 'Aquí tienes nuestros packs de sesiones vigentes (precios ficticios · demo interna). Para contratarlos habla con nuestro equipo.',
      color: 'yellow',
    },
    {
      id: 'cambio_cancelacion',
      label: 'Cambiar o cancelar cita',
      emoji: '📅',
      descripcion: 'Gestionar una cita existente',
      mostrar_pack: false,
      sensible: false,
      flujo_corto: true,
      mensaje_flujo_corto: 'Para cambiar o cancelar tu cita contacta con nosotros directamente. Nuestro equipo te atenderá en menos de 2 horas en horario de apertura.',
      color: 'gray',
    },
  ],

  seguridad_clinica: {
    diagnostico: false,
    prescripcion: false,
    consejo_medico: false,
    promesa_resultado: false,
    derivar_a_dermatologo_si_sensible: true,
    consentimiento_demo: true,
    mensaje_derivacion:
      'Para este tipo de consulta te recomendamos contactar directamente con nuestro equipo de especialistas en estética.',
    keywords_sensibles: [
      'melanoma', 'cancer de piel', 'cáncer de piel', 'biopsia',
      'tumor', 'lesion sospechosa', 'lesión sospechosa',
      'alergia severa', 'reaccion alergica grave', 'reacción alérgica grave',
      'anafilaxia', 'anestesia general', 'cirugia', 'cirugía',
      'prescripcion medica', 'prescripción médica', 'receta medica',
      'botox medico', 'bótox médico', 'acido hialuronico medico',
      'infeccion', 'infección', 'absceso', 'necrosis',
    ],
  },

  zonas_depilacion: [
    { id: 'axilas',      label: 'Axilas',             sesiones_estimadas: 6 },
    { id: 'ingles',      label: 'Ingles',              sesiones_estimadas: 8 },
    { id: 'piernas',     label: 'Piernas completas',   sesiones_estimadas: 8 },
    { id: 'facial',      label: 'Zona facial',          sesiones_estimadas: 6 },
    { id: 'brazos',      label: 'Brazos',              sesiones_estimadas: 6 },
    { id: 'zona_bikini', label: 'Zona bikini',         sesiones_estimadas: 8 },
  ],

  centros: [
    {
      id: 'principal',
      nombre: 'Centro Principal (ficticio)',
      horario: 'L–V 10:00–20:00 · S 10:00–14:00',
      horario_inicio: 10,
      horario_fin: 20,
    },
    {
      id: 'salon_norte',
      nombre: 'Salón Norte (ficticio)',
      horario: 'L–V 09:00–19:00',
      horario_inicio: 9,
      horario_fin: 19,
    },
  ],

  profesionales: [
    {
      id: 'est1',
      nombre: 'Ana García (ficticia)',
      especialidad: 'Tratamientos faciales y antiedad',
      disponible: true,
    },
    {
      id: 'est2',
      nombre: 'María López (ficticia)',
      especialidad: 'Depilación láser y corporales',
      disponible: true,
    },
    {
      id: 'cualquiera',
      nombre: 'Primera disponibilidad',
      especialidad: 'Cualquier profesional disponible',
      disponible: true,
    },
  ],

  franjas_horarias: [
    { id: 'manana',  label: 'Mañana',  rango: '10:00–14:00', hora_ref: 10 },
    { id: 'tarde',   label: 'Tarde',   rango: '16:00–20:00', hora_ref: 16 },
    { id: 'sabado',  label: 'Sábado',  rango: '10:00–14:00', hora_ref: 10 },
  ],

  packs: [
    {
      id: 'sesion_1',
      label: 'Sesión individual',
      precio: '60 € (ficticio)',
      sesiones: 1,
      descripcion: 'Una sesión de cualquier tratamiento',
      destacado: false,
    },
    {
      id: 'pack_3',
      label: 'Pack 3 sesiones',
      precio: '165 € (ficticio)',
      sesiones: 3,
      descripcion: 'Ahorro del 8% sobre precio individual',
      destacado: false,
    },
    {
      id: 'pack_6',
      label: 'Pack 6 sesiones',
      precio: '300 € (ficticio)',
      sesiones: 6,
      descripcion: 'Ideal para depilación láser · Ahorro del 16%',
      destacado: true,
    },
    {
      id: 'pack_bienvenida',
      label: 'Pack Bienvenida',
      precio: '45 € (ficticio)',
      sesiones: 1,
      descripcion: 'Consulta + tratamiento facial de prueba para nuevas clientas',
      destacado: false,
    },
  ],

  campanas: [
    {
      id: 'camp_sept',
      titulo: 'Vuelta al verano',
      descripcion: 'Depilación láser piernas completas con 20% de descuento (ficticio)',
      activa: true,
      leads_generados: 12,
    },
    {
      id: 'camp_facial',
      titulo: 'Mes del facial',
      descripcion: 'Pack 3 faciales al precio de 2 para nuevas clientas (ficticio)',
      activa: true,
      leads_generados: 8,
    },
    {
      id: 'camp_black',
      titulo: 'Black Friday (ficticia)',
      descripcion: '30% en packs de 6 sesiones · Solo 48h (ficticio)',
      activa: false,
      leads_generados: 0,
    },
  ],
};

export function detectaSensibleEstetica(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const t = texto.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  return ESTETICA_VERTICAL.seguridad_clinica.keywords_sensibles.some(kw => {
    const k = kw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t.includes(k);
  });
}

export function getIntencionEstetica(id) {
  return ESTETICA_VERTICAL.intenciones.find(i => i.id === id) ?? null;
}

export function getCentroEstetica(id) {
  return ESTETICA_VERTICAL.centros.find(c => c.id === id) ?? null;
}

export function getProfesionalEstetica(id) {
  return ESTETICA_VERTICAL.profesionales.find(p => p.id === id) ?? null;
}

export function estaEnHorarioEstetica(centro, hour) {
  const c = getCentroEstetica(centro);
  if (!c) return false;
  return hour >= c.horario_inicio && hour < c.horario_fin;
}
