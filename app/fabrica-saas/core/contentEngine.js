/**
 * Content Engine — Phase 14
 * Generates coherent DEMO content: headlines, microcopy, empty states, CTAs.
 * No real persons. No real emails. No real phones. No real NIF/IDs.
 */

export const CONTENT_ENGINE_VERSION = '1.0.0';

// ─── Demo Data Generators ─────────────────────────────────────────────────────

const DEMO_FIRST_NAMES = ['María', 'Carlos', 'Ana', 'Luis', 'Elena', 'David', 'Laura', 'Pedro', 'Sofía', 'Miguel'];
const DEMO_LAST_NAMES  = ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Sánchez', 'Pérez'];
const DEMO_PET_NAMES   = ['Luna', 'Max', 'Bella', 'Buddy', 'Rocky', 'Nala', 'Thor', 'Mochi', 'Loki', 'Coco'];
const DEMO_PET_BREEDS  = { dog: ['Labrador', 'Golden Retriever', 'Bulldog', 'Beagle', 'Husky'], cat: ['Europeo', 'Persa', 'Maine Coon', 'Siamés'] };

function demoName(seed = 0) {
  const first = DEMO_FIRST_NAMES[seed % DEMO_FIRST_NAMES.length];
  const last  = DEMO_LAST_NAMES[(seed + 3) % DEMO_LAST_NAMES.length];
  return `${first} ${last}`;
}

function demoEmail(name) {
  const clean = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.');
  return `${clean}@demo.test`;
}

function demoPhone(seed = 0) {
  const nums = ['612 345 678', '623 456 789', '634 567 890', '645 678 901', '656 789 012'];
  return nums[seed % nums.length];
}

// ─── Sector Microcopy ─────────────────────────────────────────────────────────

const SECTOR_MICROCOPY = Object.freeze({
  dental: {
    emptyAppointments: 'No hay citas programadas para hoy',
    emptyPatients: 'No hay pacientes registrados aún',
    loadingText: 'Cargando historial clínico…',
    successBooking: '¡Cita confirmada! Te enviamos la confirmación por email.',
    errorBooking: 'No ha sido posible confirmar la cita. Prueba de nuevo o llámanos.',
  },
  fisio: {
    emptyAppointments: 'Sin citas en la agenda para hoy',
    emptyPatients: 'No hay pacientes activos en este momento',
    loadingText: 'Cargando historial de fisioterapia…',
    successBooking: '¡Primera valoración confirmada! Te esperamos.',
    errorBooking: 'No se pudo confirmar la cita. Contacta con el centro.',
  },
  estetica: {
    emptyAppointments: 'Tu agenda está libre hoy ✨',
    emptyPatients: 'Aún no tienes clientes registradas',
    loadingText: 'Cargando tu perfil de belleza…',
    successBooking: '¡Cita reservada! Hasta pronto 💫',
    errorBooking: 'No se pudo reservar. Escríbenos por WhatsApp.',
  },
  educacion: {
    emptyAppointments: 'No hay clases programadas',
    emptyPatients: 'No hay alumnos matriculados todavía',
    loadingText: 'Cargando materiales del curso…',
    successBooking: '¡Matrícula realizada! Bienvenido al curso.',
    errorBooking: 'No se pudo completar la matrícula. Contacta con secretaría.',
  },
  legal: {
    emptyAppointments: 'Sin consultas programadas para hoy',
    emptyPatients: 'No hay expedientes activos',
    loadingText: 'Cargando expedientes…',
    successBooking: '¡Consulta confirmada! Te esperamos.',
    errorBooking: 'No se pudo confirmar la consulta. Llámenos directamente.',
  },
  veterinary: {
    emptyAppointments: 'No hay citas veterinarias para hoy 🐾',
    emptyPatients: 'No hay mascotas registradas todavía',
    loadingText: 'Cargando historial veterinario…',
    successBooking: '¡Cita confirmada! Trae a tu mascota descansada y sin ayuno (salvo indicación).',
    errorBooking: 'No se pudo confirmar la cita. Llámanos o escríbenos.',
    emptyVaccinations: 'No hay vacunas pendientes próximamente',
  },
  default: {
    emptyAppointments: 'No hay citas programadas',
    emptyPatients: 'No hay registros todavía',
    loadingText: 'Cargando…',
    successBooking: '¡Solicitud confirmada!',
    errorBooking: 'Error al confirmar. Inténtalo de nuevo.',
  },
});

// ─── Landing Content ──────────────────────────────────────────────────────────

const SECTOR_LANDING = Object.freeze({
  dental: {
    heroHeadline: 'Tu sonrisa merece el mejor cuidado',
    heroSub: 'Equipo especializado, tecnología de vanguardia y un trato cercano para toda la familia.',
    proof: ['Más de 1.000 pacientes satisfechos', 'Tecnología digital 3D', 'Atención en el mismo día'],
    services: ['Ortodoncia invisible', 'Implantes dentales', 'Estética dental', 'Odontología familiar'],
  },
  fisio: {
    heroHeadline: 'Recupera tu movimiento, recupera tu vida',
    heroSub: 'Fisioterapeutas especializados que te acompañan en cada paso de tu recuperación.',
    proof: ['Más de 500 pacientes recuperados este año', 'Técnicas validadas clínicamente', 'Cita en 24h'],
    services: ['Fisioterapia deportiva', 'Rehabilitación postquirúrgica', 'Suelo pélvico', 'Pilates terapéutico'],
  },
  estetica: {
    heroHeadline: 'Tu mejor versión te espera',
    heroSub: 'Tratamientos exclusivos de estética avanzada para un resultado natural y duradero.',
    proof: ['Productos de primera línea', 'Estética sin bisturí', 'Resultados visibles desde la primera sesión'],
    services: ['Radiofrecuencia', 'Medicina estética', 'Tratamientos faciales', 'Corporales'],
  },
  educacion: {
    heroHeadline: 'Aprendizaje que transforma tu futuro',
    heroSub: 'Formación de calidad adaptada a tus necesidades, con docentes expertos en cada área.',
    proof: ['98% de satisfacción del alumnado', 'Certificaciones reconocidas', 'Clases reducidas'],
    services: ['Cursos presenciales', 'Formación online', 'Tutorías personalizadas', 'Preparación de exámenes'],
  },
  legal: {
    heroHeadline: 'Defensa legal experta cuando más lo necesitas',
    heroSub: 'Abogados especializados con experiencia probada. Tu caso, nuestra prioridad.',
    proof: ['15 años de experiencia', 'Consulta inicial gratuita', 'Atención personalizada'],
    services: ['Derecho laboral', 'Derecho civil', 'Derecho penal', 'Derecho de familia'],
  },
  veterinary: {
    heroHeadline: 'Cuidamos a quienes más quieres',
    heroSub: 'Atención veterinaria integral para tu mascota: prevención, diagnóstico y tratamiento con cariño.',
    proof: ['Más de 2.000 mascotas atendidas', 'Equipo veterinario especializado', 'Servicio urgencias 24h disponible'],
    services: ['Consulta general', 'Vacunación y desparasitación', 'Cirugía veterinaria', 'Nutrición y bienestar'],
  },
  default: {
    heroHeadline: 'Servicios profesionales para tus necesidades',
    heroSub: 'Calidad y confianza en cada servicio que ofrecemos.',
    proof: ['Profesionales certificados', 'Atención personalizada', 'Satisfacción garantizada'],
    services: ['Consulta', 'Seguimiento', 'Asesoramiento', 'Soporte'],
  },
});

// ─── Demo Data ────────────────────────────────────────────────────────────────

function generateDemoClients(count, sector) {
  return Array.from({ length: count }, (_, i) => {
    const name  = demoName(i);
    const email = demoEmail(name);
    const phone = demoPhone(i);
    const base  = { id: `demo-client-${i + 1}`, nombre: name, email, telefono: phone };

    if (sector === 'veterinary') {
      const petName  = DEMO_PET_NAMES[i % DEMO_PET_NAMES.length];
      const species  = i % 3 === 0 ? 'cat' : 'dog';
      const breeds   = DEMO_PET_BREEDS[species];
      const breed    = breeds[i % breeds.length];
      return {
        ...base,
        mascota: { nombre: petName, especie: species === 'dog' ? 'Perro' : 'Gato', raza: breed, edad: `${(i % 10) + 1} años` },
      };
    }
    return base;
  });
}

/**
 * Generate full content package for a business.
 * @param {Object} brief    - validated brief
 * @param {Object} branding - branding from brand engine
 * @param {Object} profile  - business profile
 * @returns {Object} content
 */
export function generateContent(brief = {}, branding = {}, profile = {}) {
  const sector    = brief.sector ?? 'default';
  const name      = brief.businessName ?? 'Business';
  const language  = brief.language ?? 'es';
  const microcopy = SECTOR_MICROCOPY[sector] ?? SECTOR_MICROCOPY.default;
  const landing   = SECTOR_LANDING[sector]   ?? SECTOR_LANDING.default;
  const services  = brief.services?.length > 0 ? brief.services : landing.services;
  const demoClients = generateDemoClients(8, sector);
  const brandTagline = branding.tagline ?? null;

  return {
    businessName:   name,
    language,
    landing: {
      heroHeadline: landing.heroHeadline,
      heroSubline:  brandTagline ?? landing.heroSub,
      socialProof:  landing.proof,
      services,
      primaryCta:   profile.conversionNeeds?.primaryCta ?? 'Solicitar cita',
      secondaryCta: profile.conversionNeeds?.secondaryCta ?? 'Ver servicios',
    },
    microcopy: {
      ...microcopy,
      helpText: `Si tienes dudas, contacta con ${name} directamente.`,
      notificationTemplates: {
        bookingCreated:    `Tu cita en ${name} ha sido confirmada.`,
        bookingReminder:   `Recuerda tu cita mañana en ${name}.`,
        bookingCancelled:  `Tu cita en ${name} ha sido cancelada.`,
      },
    },
    demoData: {
      clients: demoClients,
      disclaimer: 'DEMO DATA ONLY — All names, emails, phones and IDs are fictitious.',
      noRealPersons: true,
      noRealContacts: true,
      noRealIds: true,
    },
    contentVersion: CONTENT_ENGINE_VERSION,
  };
}
