/**
 * OUTPUT GENERADO · Lumen Dental (Demo) · Datos mock
 * Generado por Fábrica SaaS V1.8 · demo/lumen-dental-factory-e2e
 * ⚠️ DATOS 100% FICTICIOS — NO representan personas, negocios ni casos reales.
 * No usar en producción. No contiene datos personales reales. No conectado a sistemas externos.
 */

// ─── Perfil de cliente ────────────────────────────────────────────────────────
export const CLIENT_PROFILE = {
  clientId: 'lumen-dental-demo',
  tenant: 'lumen-dental-malaga',
  nombre: 'Lumen Dental',
  sector: 'clinica-dental',
  localidad: 'Málaga, España (demo)',
  tagline: 'Tu sonrisa, nuestra misión',
  taglineAlt: 'Clínica dental moderna. Cuidado profesional y humano.',
  propuestaValor: 'Tecnología dental de vanguardia con el trato cercano que mereces. Sin esperas, sin letra pequeña, con financiación real.',
  personalidadMarca: 'Experta, accesible, moderna, cálida, transparente',
  tonoDeLaVoz: 'Cercano y profesional. Nunca hospitalario. Siempre claro.',
  website: 'https://lumendental.es (demo - no real)',
  email: 'hola@lumendental.demo (ficticio)',
  telefono: '+34 951 000 001 (ficticio)',
  isReal: false,
};

// ─── Branding ─────────────────────────────────────────────────────────────────
export const BRANDING = {
  nombre: 'Lumen Dental',
  inicial: 'L',
  primaryColor: '#0369A1',
  secondaryColor: '#0EA5E9',
  accentColor: '#F59E0B',
  successColor: '#10B981',
  bgLight: '#F0F9FF',
  bgDark: '#0B1426',
  textDark: '#0F172A',
  textMuted: '#64748B',
  fontDisplay: "'Syne', 'DM Sans', sans-serif",
  fontBody: "'DM Sans', 'Inter', system-ui, sans-serif",
  tagline: 'Tu sonrisa, nuestra misión',
  logoSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="10" fill="#0369A1"/>
    <path d="M14 20c0-5.5 4.5-10 10-10s10 4.5 10 10c0 3-1.2 7-3 10.5C29.2 34 27 38 24 38c-3 0-5.2-4-7-7.5C15.2 27 14 24 14 20z" fill="white" opacity="0.95"/>
    <circle cx="36" cy="12" r="5" fill="#F59E0B"/>
    <circle cx="36" cy="12" r="2.5" fill="white" opacity="0.8"/>
  </svg>`,
  tokens: {
    borderRadius: '12px',
    shadow: '0 4px 24px rgba(3,105,161,0.12)',
    transitionSpeed: '0.18s',
    spacingUnit: '8px',
  },
  mensajesPrincipales: [
    'Primera visita gratuita — Sin compromiso',
    'Financiación sin intereses hasta 24 meses',
    'Tecnología de diagnóstico 3D',
    'Resultados garantizados por escrito',
  ],
  mensajesSecundarios: [
    'Clínica aclimatada y accesible',
    'Aparcamiento gratuito para pacientes',
    'Atención en horario continuo L-V',
    'Urgencias atendidas el mismo día',
  ],
  ctas: [
    'Pide tu cita gratis',
    'Primera visita gratuita',
    'Ver financiación',
    'Llamar ahora',
  ],
};

// ─── Servicios ────────────────────────────────────────────────────────────────
export const SERVICIOS = [
  { id: 'sv-01', nombre: 'Revisión Dental', icono: '🔍', categoria: 'General',       precioDesde: '0 € (1ª visita gratis)', duracion: '45 min', destacado: true,  desc: 'Diagnóstico bucodental completo con radiografías digitales incluidas.' },
  { id: 'sv-02', nombre: 'Higiene Dental',  icono: '🪥', categoria: 'Preventivo',    precioDesde: '45 €',                   duracion: '45 min', destacado: true,  desc: 'Limpieza profesional ultrasónica y revisión periodontal.' },
  { id: 'sv-03', nombre: 'Ortodoncia',       icono: '😁', categoria: 'Ortodoncia',    precioDesde: '1.800 €',                duracion: '18-24 m',destacado: true,  desc: 'Brackets metálicos y estéticos. Tratamiento para todas las edades.' },
  { id: 'sv-04', nombre: 'Invisalign',       icono: '✨', categoria: 'Ortodoncia',    precioDesde: '2.900 €',                duracion: '12-18 m',destacado: true,  desc: 'Ortodoncia invisible con alineadores termoformados a medida.' },
  { id: 'sv-05', nombre: 'Implantes',        icono: '🔩', categoria: 'Implantología', precioDesde: '1.200 €',                duracion: '3-6 m',  destacado: true,  desc: 'Implantes de titanio grado médico con garantía de por vida.' },
  { id: 'sv-06', nombre: 'Estética Dental',  icono: '💎', categoria: 'Estética',      precioDesde: '150 €',                  duracion: '60 min', destacado: true,  desc: 'Diseño de sonrisa digital, carillas de porcelana y composites.' },
  { id: 'sv-07', nombre: 'Blanqueamiento',   icono: '⭐', categoria: 'Estética',      precioDesde: '250 €',                  duracion: '90 min', destacado: false, desc: 'Blanqueamiento LED en clínica. Resultados visibles en 1 sesión.' },
  { id: 'sv-08', nombre: 'Odontopediatría',  icono: '🧒', categoria: 'Infantil',      precioDesde: '30 €',                   duracion: '30 min', destacado: false, desc: 'Atención especializada para niños desde los 3 años. Selladores.' },
  { id: 'sv-09', nombre: 'Urgencias',        icono: '🚨', categoria: 'Urgencias',     precioDesde: '60 €',                   duracion: 'Inmediato',destacado:false, desc: 'Atención de urgencias el mismo día. Dolor agudo, fractura, absceso.' },
];

// ─── Profesionales (ficticios) ────────────────────────────────────────────────
export const PROFESIONALES = [
  { id: 'prof-01', nombre: 'Dra. Clara Vidal Soler (ficticio)',   especialidad: 'Ortodoncia e Invisalign',  avatar: '👩‍⚕️', colegiado: 'Col. 12.345 (ficticio)', idiomas: ['ES','EN'] },
  { id: 'prof-02', nombre: 'Dr. Marcos Rueda Bernal (ficticio)',  especialidad: 'Implantología y Cirugía', avatar: '👨‍⚕️', colegiado: 'Col. 23.456 (ficticio)', idiomas: ['ES','FR'] },
  { id: 'prof-03', nombre: 'Dra. Elena Pons Castro (ficticio)',   especialidad: 'Estética Dental',          avatar: '👩‍⚕️', colegiado: 'Col. 34.567 (ficticio)', idiomas: ['ES','EN','CA'] },
  { id: 'prof-04', nombre: 'Dr. Javier Mora Leal (ficticio)',     especialidad: 'Odontopediatría',          avatar: '👨‍⚕️', colegiado: 'Col. 45.678 (ficticio)', idiomas: ['ES'] },
];

// ─── Pacientes demo ──────────────────────────────────────────────────────────
export const PACIENTES = [
  { id: 'pac-001', nombre: 'Ana Gómez Pérez (ficticio)',       email: 'ana@demo.ficticio',     tel: '+34 600 000 001 (demo)', estado: 'activo',         tratamiento: 'Invisalign',    origen: 'web',      hc: 'HC-001', fechaAlta: '2026-01-15 (ficticio)' },
  { id: 'pac-002', nombre: 'Luis Martínez Font (ficticio)',    email: 'luis@demo.ficticio',    tel: '+34 600 000 002 (demo)', estado: 'en_tratamiento', tratamiento: 'Implante x2',   origen: 'referido', hc: 'HC-002', fechaAlta: '2026-02-10 (ficticio)' },
  { id: 'pac-003', nombre: 'Rosa Fernández Gil (ficticio)',    email: 'rosa@demo.ficticio',    tel: '+34 600 000 003 (demo)', estado: 'alta',           tratamiento: 'Blanqueamiento', origen: 'google',  hc: 'HC-003', fechaAlta: '2026-03-05 (ficticio)' },
  { id: 'pac-004', nombre: 'Carlos Díaz Ramos (ficticio)',     email: 'carlos@demo.ficticio',  tel: '+34 600 000 004 (demo)', estado: 'activo',         tratamiento: 'Ortodoncia',    origen: 'instagram',hc: 'HC-004', fechaAlta: '2026-04-20 (ficticio)' },
  { id: 'pac-005', nombre: 'María López Torres (ficticio)',    email: 'maria@demo.ficticio',   tel: '+34 600 000 005 (demo)', estado: 'nuevo',          tratamiento: 'Revisión',      origen: 'web',      hc: 'HC-005', fechaAlta: '2026-08-30 (ficticio)' },
  { id: 'pac-006', nombre: 'Javier Blanco Vera (ficticio)',    email: 'javier@demo.ficticio',  tel: '+34 600 000 006 (demo)', estado: 'en_tratamiento', tratamiento: 'Carillas x6',   origen: 'referido', hc: 'HC-006', fechaAlta: '2026-05-12 (ficticio)' },
  { id: 'pac-007', nombre: 'Sandra Ruiz Moya (ficticio)',      email: 'sandra@demo.ficticio',  tel: '+34 600 000 007 (demo)', estado: 'activo',         tratamiento: 'Higiene',       origen: 'google',  hc: 'HC-007', fechaAlta: '2026-06-01 (ficticio)' },
  { id: 'pac-008', nombre: 'Pedro Castro Nava (ficticio)',     email: 'pedro@demo.ficticio',   tel: '+34 600 000 008 (demo)', estado: 'pendiente',      tratamiento: 'Implante x1',   origen: 'web',      hc: 'HC-008', fechaAlta: '2026-07-18 (ficticio)' },
];

// ─── Agenda demo ─────────────────────────────────────────────────────────────
export const AGENDA_HOY = [
  { id: 'cita-01', hora: '09:00', paciente: 'Ana Gómez Pérez (ficticio)',    tratamiento: 'Control Invisalign',   prof: 'Dra. Vidal',  duracion: '30m', estado: 'confirmada' },
  { id: 'cita-02', hora: '09:30', paciente: 'Nuevo paciente (demo)',          tratamiento: 'Primera visita gratis', prof: 'Dra. Vidal',  duracion: '45m', estado: 'confirmada' },
  { id: 'cita-03', hora: '10:30', paciente: 'Luis Martínez Font (ficticio)', tratamiento: 'Colocación implante F2', prof: 'Dr. Rueda',   duracion: '90m', estado: 'confirmada' },
  { id: 'cita-04', hora: '12:00', paciente: 'Rosa Fernández Gil (ficticio)', tratamiento: 'Blanqueamiento LED',    prof: 'Dra. Pons',   duracion: '90m', estado: 'confirmada' },
  { id: 'cita-05', hora: '13:00', paciente: 'Nuevo paciente (demo)',          tratamiento: 'Urgencia dolor molar', prof: 'Dr. Mora',    duracion: '30m', estado: 'urgente'   },
  { id: 'cita-06', hora: '15:00', paciente: 'Carlos Díaz Ramos (ficticio)',   tratamiento: 'Ajuste brackets',      prof: 'Dra. Vidal',  duracion: '30m', estado: 'pendiente' },
  { id: 'cita-07', hora: '16:00', paciente: 'María López Torres (ficticio)', tratamiento: 'Revisión + higiene',   prof: 'Dra. Pons',   duracion: '60m', estado: 'confirmada' },
  { id: 'cita-08', hora: '17:30', paciente: 'Sandra Ruiz Moya (ficticio)',   tratamiento: 'Higiene semestral',    prof: 'Dra. Pons',   duracion: '45m', estado: 'confirmada' },
];

// ─── Presupuestos demo ────────────────────────────────────────────────────────
export const PRESUPUESTOS = [
  { id: 'pres-01', paciente: 'Luis Martínez Font (ficticio)',  tratamiento: 'Implante x2 + corona cerámica', importe: '2.800 €', estado: 'aceptado',  fecha: '2026-08-28' },
  { id: 'pres-02', paciente: 'Javier Blanco Vera (ficticio)', tratamiento: 'Carillas de porcelana x6',       importe: '3.200 €', estado: 'enviado',   fecha: '2026-08-30' },
  { id: 'pres-03', paciente: 'Ana Gómez Pérez (ficticio)',    tratamiento: 'Invisalign Full',                importe: '3.100 €', estado: 'aceptado',  fecha: '2026-07-20' },
  { id: 'pres-04', paciente: 'Pedro Castro Nava (ficticio)',  tratamiento: 'Implante unitario titanio',      importe: '1.400 €', estado: 'borrador',  fecha: '2026-09-01' },
  { id: 'pres-05', paciente: 'Carlos Díaz Ramos (ficticio)',  tratamiento: 'Ortodoncia brackets metálicos',  importe: '2.100 €', estado: 'firmado',   fecha: '2026-04-22' },
  { id: 'pres-06', paciente: 'Rosa Fernández Gil (ficticio)', tratamiento: 'Blanqueamiento + mantenimiento', importe: '320 €',   estado: 'completado',fecha: '2026-07-10' },
];

// ─── Leads demo ──────────────────────────────────────────────────────────────
export const LEADS = [
  { id: 'lead-01', nombre: 'Lead Demo Uno (ficticio)',    email: 'lead1@demo.ficticio', tratamiento: 'Invisalign',    diasInactivo: 3,  fuente: 'instagram', accion: 'Enviar info de financiación' },
  { id: 'lead-02', nombre: 'Lead Demo Dos (ficticio)',    email: 'lead2@demo.ficticio', tratamiento: 'Implante',      diasInactivo: 8,  fuente: 'google',    accion: 'Recordatorio con oferta' },
  { id: 'lead-03', nombre: 'Lead Demo Tres (ficticio)',   email: 'lead3@demo.ficticio', tratamiento: 'Ortodoncia',    diasInactivo: 15, fuente: 'web',       accion: 'Llamada personalizada urgente' },
  { id: 'lead-04', nombre: 'Lead Demo Cuatro (ficticio)', email: 'lead4@demo.ficticio', tratamiento: 'Blanqueamiento',diasInactivo: 1,  fuente: 'referido',  accion: 'Primera cita gratis' },
  { id: 'lead-05', nombre: 'Lead Demo Cinco (ficticio)',  email: 'lead5@demo.ficticio', tratamiento: 'Carillas',      diasInactivo: 22, fuente: 'facebook',  accion: 'Recuperación con descuento' },
];

// ─── KPIs demo ───────────────────────────────────────────────────────────────
export const METRICAS = {
  consultasMes: 184,
  tasaConversion: 72,
  valorPipeline: '52.400 €',
  ingresosMes: '31.800 €',
  citasHoy: 8,
  nuevosPacientes: 12,
  ticketMedio: '1.250 €',
  satisfaccion: 4.8,
  netPromoterScore: 72,
  lead_a_cita: '64%',
};

// ─── Automatizaciones (20 flujos) ─────────────────────────────────────────────
export const AUTOMATIZACIONES = [
  { id: 'auto-01', nombre: 'Nuevo Lead Web',             trigger: 'Formulario web',           acciones: ['CRM registro','Email bienvenida','Asignar a comercial'],           estado: 'MOCK', plataformas: ['Make','Airtable','Email'] },
  { id: 'auto-02', nombre: 'Solicitud de Cita',          trigger: 'Chatbot / formulario cita',acciones: ['Verificar disponibilidad','Confirmar slot','Notificar staff'],      estado: 'MOCK', plataformas: ['Make','Google Calendar','WhatsApp'] },
  { id: 'auto-03', nombre: 'Confirmación de Cita',       trigger: '24h antes de cita',        acciones: ['WhatsApp confirmación','Email recordatorio','Actualizar CRM'],       estado: 'MOCK', plataformas: ['Make','WhatsApp','Airtable'] },
  { id: 'auto-04', nombre: 'Recordatorio de Cita',       trigger: '2h antes de cita',         acciones: ['SMS/WhatsApp recordatorio','Parking info'],                          estado: 'MOCK', plataformas: ['Make','WhatsApp'] },
  { id: 'auto-05', nombre: 'Reprogramación',             trigger: 'Cancelación de paciente',  acciones: ['Liberar slot','Ofrecer alternativas','Notificar staff'],             estado: 'DESIGNED', plataformas: ['Make','Google Calendar'] },
  { id: 'auto-06', nombre: 'Cancelación',                trigger: 'Solicitud cancelación',    acciones: ['Confirmar cancelación','Lista espera check','Analytics'],            estado: 'DESIGNED', plataformas: ['Make','Airtable'] },
  { id: 'auto-07', nombre: 'Seguimiento Postconsulta',   trigger: '24h después cita',         acciones: ['Email personalizado','Encuesta satisfacción','Próxima cita'],        estado: 'MOCK', plataformas: ['Make','Email','Typeform'] },
  { id: 'auto-08', nombre: 'Solicitud de Reseña',        trigger: '48h después tratamiento',  acciones: ['WhatsApp con link','Email alternativo si no abre'],                  estado: 'DESIGNED', plataformas: ['Make','WhatsApp','Google My Business'] },
  { id: 'auto-09', nombre: 'Lead Sin Respuesta',         trigger: '48h sin actividad',        acciones: ['Email seguimiento','WhatsApp suave','Flag en CRM'],                  estado: 'MOCK', plataformas: ['Make','Email','Airtable'] },
  { id: 'auto-10', nombre: 'Presupuesto Pendiente',      trigger: '72h sin respuesta',        acciones: ['Recordatorio email','Llamada sugerida','Oferta financiación'],       estado: 'DESIGNED', plataformas: ['Make','Email'] },
  { id: 'auto-11', nombre: 'Recuperación de Lead Frío',  trigger: '21 días inactivo',         acciones: ['Email con caso de éxito','Oferta especial','Re-segmentación'],       estado: 'MOCK', plataformas: ['Make','Email','Airtable'] },
  { id: 'auto-12', nombre: 'Informe Diario',             trigger: 'Diario 20:00',             acciones: ['Resumen citas','Ingresos del día','Leads nuevos → Email dirección'], estado: 'DESIGNED', plataformas: ['Make','Airtable','Email'] },
  { id: 'auto-13', nombre: 'Informe Semanal',            trigger: 'Lunes 08:00',              acciones: ['KPIs semana','Pipeline','Agenda próxima semana'],                    estado: 'DESIGNED', plataformas: ['Make','Airtable','Email'] },
  { id: 'auto-14', nombre: 'Alerta Crítica',             trigger: 'Umbral KPI roto',          acciones: ['Email urgente dirección','WhatsApp responsable'],                    estado: 'DESIGNED', plataformas: ['Make','Email','WhatsApp'] },
  { id: 'auto-15', nombre: 'Backup Datos',               trigger: 'Diario 03:00',             acciones: ['Export Airtable','Drive backup','Log confirmación'],                  estado: 'DESIGNED', plataformas: ['Make','Google Drive','Airtable'] },
  { id: 'auto-16', nombre: 'Cumplimiento GDPR',          trigger: 'Solicitud paciente',       acciones: ['Export datos','Confirmación','Anonimización si baja'],               estado: 'DESIGNED', plataformas: ['Make','Airtable','Email'] },
  { id: 'auto-17', nombre: 'Soporte Técnico',            trigger: 'Error sistema',            acciones: ['Alert Slack/email','Incidencia log','Escalado si P0'],               estado: 'DESIGNED', plataformas: ['Make','Email'] },
  { id: 'auto-18', nombre: 'Captación Activa',           trigger: 'Campaña activa',           acciones: ['Lead scoring','Segmentación','Asignación automática'],               estado: 'DESIGNED', plataformas: ['Make','Airtable','Meta Ads'] },
  { id: 'auto-19', nombre: 'Publicación Redes Sociales', trigger: 'Calendario editorial',     acciones: ['Post Instagram','Facebook','LinkedIn programado'],                   estado: 'DESIGNED', plataformas: ['Make','Buffer/Meta'] },
  { id: 'auto-20', nombre: 'Email Marketing',            trigger: 'Campaña mensual',          acciones: ['Segmentación','Personalización','Envío','Analytics'],                estado: 'DESIGNED', plataformas: ['Make','Mailchimp/Brevo'] },
];

// ─── Agentes IA (9) ──────────────────────────────────────────────────────────
export const AGENTES_IA = [
  { id: 'agent-01', nombre: 'LumenBot Recepción',   rol: 'Recepcionista IA',    mision: 'Primera atención, clasificación y routing de consultas entrantes.', herramientas: ['Chatbot web','WhatsApp','FAQ'], guardrail: 'Sin diagnóstico médico. Sin compromisos de precio sin validar.', escalado: 'Siempre que consulta supere su árbol de decisión.' },
  { id: 'agent-02', nombre: 'LumenBot Captación',   rol: 'Agente de Captación', mision: 'Calificar leads, presentar servicios y guiar a primera cita.', herramientas: ['CRM','Email','Chatbot'], guardrail: 'No revelar precios finales sin revisión humana.', escalado: 'Lead caliente → comercial humano en <2h.' },
  { id: 'agent-03', nombre: 'LumenBot Atención',    rol: 'CS Automatizado',     mision: 'Gestionar dudas post-cita, incidencias y satisfacción.', herramientas: ['Email','WhatsApp','CRM'], guardrail: 'Sin promesas de tratamiento ni garantías.', escalado: 'Queja grave → director clínica.' },
  { id: 'agent-04', nombre: 'LumenBot Seguimiento', rol: 'Seguimiento Activo',  mision: 'Seguimiento proactivo de pipeline y presupuestos pendientes.', herramientas: ['CRM','Email','WhatsApp'], guardrail: 'Máximo 3 contactos por lead sin respuesta.', escalado: 'Lead inactivo >21 días → estrategia humana.' },
  { id: 'agent-05', nombre: 'LumenBot Marketing',   rol: 'Asistente Marketing', mision: 'Generación de contenido, ideas de campaña y análisis de performance.', herramientas: ['Social Media','Email','Analytics'], guardrail: 'Contenido médico revisado por odontólogo antes de publicar.', escalado: 'Campaña >500€/mes → aprobación dirección.' },
  { id: 'agent-06', nombre: 'LumenBot Contenidos',  rol: 'Redactor Dental',     mision: 'Redacción de posts, artículos SEO y emails en tono Lumen Dental.', herramientas: ['CMS','Social','SEO'], guardrail: 'Sin afirmaciones clínicas no avaladas por especialistas.', escalado: 'Artículo médico → revisión por dentista antes de publicar.' },
  { id: 'agent-07', nombre: 'LumenBot Reporting',   rol: 'Analista Automático', mision: 'Generación automática de informes diarios, semanales y de campaña.', herramientas: ['Airtable','Analytics','Email'], guardrail: 'Datos siempre contrastados con fuente primaria.', escalado: 'Anomalía KPI → alerta dirección inmediata.' },
  { id: 'agent-08', nombre: 'LumenBot Soporte',     rol: 'Soporte IT Interno',  mision: 'Monitoreo de sistemas, alertas de fallos y primer diagnóstico técnico.', herramientas: ['Health Dashboard','Logs','Email'], guardrail: 'Sin acceso a datos de pacientes. Solo métricas agregadas.', escalado: 'Fallo P0 → escalado humano en <15 min.' },
  { id: 'agent-09', nombre: 'LumenBot QA',          rol: 'Control de Calidad',  mision: 'Auditoría continua de procesos, flujos y calidad de outputs.', herramientas: ['Test Runner','Analytics','Logs'], guardrail: 'Nunca aprueba automáticamente cambios en producción.', escalado: 'QA fallido → bloqueo de deploy + notificación.' },
];

// ─── Contenido Social Media ──────────────────────────────────────────────────
export const SOCIAL_POSTS = [
  { id: 'post-01', red: 'Instagram', tipo: 'Carrusel', tema: 'Invisalign antes/después',      copy: '¿Sabías que puedes corregir tu sonrisa sin que nadie lo note? 😁 El tratamiento Invisalign de Lumen Dental es invisible, cómodo y con resultados en tiempo récord. ⬇️ Desliza para ver cómo funciona. · Demo — no datos reales', hashtags: '#Invisalign #LumenDental #Ortodoncia #SonrisaPerfecta', cta: 'Pide tu valoración gratuita ✉️' },
  { id: 'post-02', red: 'Instagram', tipo: 'Reel',    tema: 'Tour clínica 30seg',             copy: '✨ Así es Lumen Dental por dentro. Tecnología de última generación y el equipo más cercano de Málaga. 📍 Estamos esperándote. · Demo', hashtags: '#ClinicaDental #Malaga #LumenDental', cta: 'Reserva primera visita gratis 🔗' },
  { id: 'post-03', red: 'Facebook',  tipo: 'Post',    tema: 'Miedo al dentista — solución',   copy: '¿Te da miedo el dentista? En Lumen Dental trabajamos con anestesia sin dolor y sedación consciente para que tu experiencia sea tranquila y cómoda. 💙 Primera visita gratuita. · Demo', hashtags: '#DentalAnsiedad #SinMiedoAlDentista', cta: 'Llámanos ahora mismo 📞' },
  { id: 'post-04', red: 'LinkedIn',  tipo: 'Artículo',tema: 'Tecnología dental 2026',         copy: 'La tecnología dental ha avanzado más en los últimos 5 años que en las 3 décadas anteriores. En Lumen Dental implementamos escáner intraoral 3D, diseño digital de sonrisa y planificación implantológica guiada por IA. · Demo', hashtags: '#DentalTech #Salud #Innovacion', cta: 'Conoce más sobre nuestra tecnología' },
  { id: 'post-05', red: 'Instagram', tipo: 'Story',   tema: 'Encuesta: tu mayor preocupación',copy: '¿Cuál es tu mayor duda sobre visitar al dentista? A) El dolor B) El precio C) El tiempo. Vota 👇 · Demo', hashtags: '#Poll #Encuesta', cta: '' },
  { id: 'post-06', red: 'Instagram', tipo: 'Carrusel',tema: 'Financiación explicada',         copy: '💳 "No puedo permitírmelo" ya no es una excusa. En Lumen Dental ofrecemos financiación hasta 24 meses sin intereses. Desliza para entender cómo funciona. · Demo', hashtags: '#Financiacion #Dental #Malaga', cta: 'Calcula tu cuota 🔗' },
  { id: 'post-07', red: 'Instagram', tipo: 'Reel',    tema: 'Blanqueamiento en 90 min',       copy: '⭐ En 90 minutos transformamos tu sonrisa. Mira nuestro proceso de blanqueamiento LED en Lumen Dental. Sin sensibilidad. Resultados visibles al instante. · Demo', hashtags: '#Blanqueamiento #DentalWhitening', cta: 'Reserva ya 🦷' },
  { id: 'post-08', red: 'Facebook',  tipo: 'Post',    tema: 'Odontopediatría familiar',       copy: '👶 Los niños merecen la mejor atención dental desde el primer diente. Nuestro especialista en odontopediatría hace que la visita al dentista sea una aventura. 🎈 Cita desde los 3 años. · Demo', hashtags: '#Odontopediatria #DentalInfantil', cta: 'Pide cita para tu hijo/a' },
  { id: 'post-09', red: 'Instagram', tipo: 'Post',    tema: 'Testimonio demo paciente',       copy: '"Llevaba 10 años sin ir al dentista por miedo. El equipo de Lumen Dental me puso a gusto desde el primer momento. Ahora tengo los implantes y una sonrisa nueva" — Ana G. (Demo, datos ficticios) · Demo', hashtags: '#Testimonio #LumenDental', cta: '¿Tu próxima historia de éxito? 💙' },
  { id: 'post-10', red: 'LinkedIn',  tipo: 'Post',    tema: 'Apertura clínica expandida',     copy: 'Lumen Dental amplía horario hasta las 20:30 para adaptarse a quienes trabajan. La salud bucal no debería ser un lujo de quienes pueden ir en horario de mañana. · Demo ficticio', hashtags: '#ClinicaDental #Malaga #HorarioAmpliadoo', cta: 'Reserva tu horario preferido' },
];

// ─── Email Templates ──────────────────────────────────────────────────────────
export const EMAIL_TEMPLATES = [
  { id: 'em-01', nombre: 'Bienvenida',             asunto: '¡Bienvenido/a a Lumen Dental! 💙',       resumen: 'Email de primera visita con propuesta de valor, equipo y pasos a seguir.' },
  { id: 'em-02', nombre: 'Confirmación Cita',      asunto: 'Cita confirmada el [fecha] a las [hora]', resumen: 'Detalle de cita, profesional, dirección y consejos previos. CTA: añadir a calendario.' },
  { id: 'em-03', nombre: 'Recordatorio 24h',       asunto: 'Mañana tienes cita en Lumen Dental 🦷',   resumen: 'Recordatorio 24h antes con info práctica: parking, qué traer, confirmación.' },
  { id: 'em-04', nombre: 'Seguimiento Postcita',   asunto: '¿Cómo estás después de tu visita?',       resumen: 'Email 24h post-consulta con cuidados, preguntas frecuentes y enlace a próxima cita.' },
  { id: 'em-05', nombre: 'Solicitud Reseña',       asunto: 'Tu opinión vale mucho para nosotros ⭐',   resumen: 'Email 48h post-tratamiento con enlace directo a Google My Business (demo).' },
  { id: 'em-06', nombre: 'Recuperación Lead',      asunto: 'Todavía estamos aquí para ti 💙',          resumen: 'Email de recuperación a lead inactivo con oferta de primera cita + info financiación.' },
  { id: 'em-07', nombre: 'Presupuesto Pendiente',  asunto: 'Tu presupuesto personalizado te espera',   resumen: 'Recordatorio de presupuesto con opciones de financiación y contacto directo.' },
  { id: 'em-08', nombre: 'Newsletter Mensual',     asunto: 'Novedades Lumen Dental — [Mes]',           resumen: 'Newsletter con consejos de salud bucal, novedades clínica y casos de éxito demo.' },
  { id: 'em-09', nombre: 'Campaña Estética',       asunto: 'Diseña la sonrisa que siempre has soñado ✨', resumen: 'Campaña enfocada a estética dental con antes/después (demo) y CTA urgente.' },
  { id: 'em-10', nombre: 'Campaña Ortodoncia',     asunto: 'Invisalign: empieza este mes sin intereses', resumen: 'Campaña específica Invisalign con financiación, proceso y testimonios demo.' },
];

// ─── SEO Local ───────────────────────────────────────────────────────────────
export const SEO_DATA = {
  keywords_principales: [
    { keyword: 'dentista málaga', volumen: '2.400/m', dificultad: 'Alta', intención: 'Transaccional' },
    { keyword: 'clínica dental málaga', volumen: '1.600/m', dificultad: 'Alta', intención: 'Transaccional' },
    { keyword: 'invisalign málaga', volumen: '880/m', dificultad: 'Media', intención: 'Transaccional' },
    { keyword: 'implantes dentales málaga', volumen: '720/m', dificultad: 'Media', intención: 'Transaccional' },
    { keyword: 'ortodoncia invisible málaga', volumen: '480/m', dificultad: 'Media', intención: 'Transaccional' },
    { keyword: 'blanqueamiento dental málaga', volumen: '390/m', dificultad: 'Baja', intención: 'Transaccional' },
    { keyword: 'dentista urgencias málaga', volumen: '320/m', dificultad: 'Baja', intención: 'Urgente' },
    { keyword: 'primera visita dentista gratis málaga', volumen: '210/m', dificultad: 'Baja', intención: 'Transaccional' },
    { keyword: 'dentista sin dolor málaga', volumen: '180/m', dificultad: 'Baja', intención: 'Informacional' },
    { keyword: 'precio implante dental málaga', volumen: '420/m', dificultad: 'Media', intención: 'Informacional' },
  ],
  articulos_propuestos: [
    '¿Cuánto cuesta un implante dental en Málaga? Guía de precios 2026',
    'Invisalign vs Brackets: ¿cuál elegir? Todo lo que nadie te cuenta',
    'Primera visita al dentista: qué esperar y cómo prepararla',
    'Blanqueamiento dental: tipos, precios y cuánto dura el resultado',
    'Odontopediatría: cuándo llevar al niño al dentista por primera vez',
  ],
  articulo_1: {
    titulo: '¿Cuánto cuesta un implante dental en Málaga? Guía 2026',
    slug: '/blog/cuanto-cuesta-implante-dental-malaga',
    metaDesc: 'Guía completa de precios de implantes dentales en Málaga. Tipos, factores que influyen en el precio y opciones de financiación. Información de Lumen Dental.',
    introduccion: 'El precio de un implante dental en Málaga varía entre 900 € y 2.500 € por implante, dependiendo del tipo de implante, la marca, el profesional y la clínica. En este artículo te explicamos todo lo que debes saber para tomar una decisión informada. (DEMO — datos orientativos ficticios)',
    secciones: ['¿Qué factores influyen en el precio?','Tipos de implantes y su coste','Opciones de financiación en Málaga','¿Por qué elegir Lumen Dental?','Preguntas frecuentes'],
  },
};

// ─── Health Dashboard ─────────────────────────────────────────────────────────
export const HEALTH_SNAPSHOT = {
  clientId: 'lumen-dental-demo',
  timestamp: new Date().toISOString(),
  overallStatus: 'HEALTHY',
  productionReady: false,
  productionReadinessNote: 'Demo mode — no real integrations connected',
  score: 87,
  dimensiones: [
    { nombre: 'SaaS App',          estado: 'HEALTHY',  score: 95, nota: 'Build PASS, todos los módulos operativos (demo)' },
    { nombre: 'Landing',           estado: 'HEALTHY',  score: 94, nota: 'Responsive, SEO metadata, accesibilidad OK' },
    { nombre: 'Automatizaciones',  estado: 'WARNING',  score: 72, nota: '20 flujos diseñados, 7 en modo MOCK, 13 requieren credenciales reales' },
    { nombre: 'Agentes IA',        estado: 'WARNING',  score: 68, nota: '9 agentes definidos, guardrails activos, sin LLM real conectado' },
    { nombre: 'CRM / Datos',       estado: 'HEALTHY',  score: 90, nota: 'Schema completo, datos demo coherentes, sin Airtable real' },
    { nombre: 'Email',             estado: 'WARNING',  score: 75, nota: '10 templates diseñados, sin proveedor de email real configurado' },
    { nombre: 'Social Media',      estado: 'HEALTHY',  score: 88, nota: 'Estrategia + 10 piezas generadas, sin publicación real' },
    { nombre: 'SEO',               estado: 'HEALTHY',  score: 82, nota: 'Keywords + 2 artículos, sin Google Search Console real' },
    { nombre: 'Seguridad',         estado: 'HEALTHY',  score: 96, nota: 'GDPR demo, sin datos reales, sin secretos expuestos' },
    { nombre: 'Backups',           estado: 'WARNING',  score: 70, nota: 'Estrategia definida, sin backup real activo (demo)' },
    { nombre: 'Observabilidad',    estado: 'WARNING',  score: 65, nota: 'Adapters de health activos, sin logs reales de producción' },
  ],
  isReal: false,
};

// ─── Plataformas ──────────────────────────────────────────────────────────────
export const PLATAFORMAS = [
  { nombre: 'React + Vite',        status: 'AVAILABLE',           usada: true,  modo: 'REAL',  artefacto: 'SaaS App + Showcase', manual: false },
  { nombre: 'Fábrica SaaS V1.8',   status: 'AVAILABLE',           usada: true,  modo: 'REAL',  artefacto: 'Todos los módulos generados', manual: false },
  { nombre: 'Make (Automatizaciones)',status:'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK', artefacto: 'Blueprints + specs de 20 flujos', manual: true },
  { nombre: 'Airtable (CRM)',       status: 'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK',  artefacto: 'Schema + mock data completo', manual: true },
  { nombre: 'Google Calendar',      status: 'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK',  artefacto: 'Agenda demo + slots', manual: true },
  { nombre: 'WhatsApp Business',    status: 'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK',  artefacto: 'Templates de 20 mensajes', manual: true },
  { nombre: 'Stripe',               status: 'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK',  artefacto: 'Pricing + flow de pago diseñado', manual: true },
  { nombre: 'Email (Brevo/Mailchimp)',status:'REQUIRES_REAL_CREDS', usada: false, modo: 'MOCK', artefacto: '10 templates HTML diseñados', manual: true },
  { nombre: 'Instagram / Meta Ads', status: 'MOCKABLE',            usada: false, modo: 'MOCK',  artefacto: '10 posts + estrategia 30d', manual: true },
  { nombre: 'Google My Business',   status: 'MOCKABLE',            usada: false, modo: 'MOCK',  artefacto: 'Perfil GMB completo diseñado', manual: true },
  { nombre: 'Buffer / Hootsuite',   status: 'MOCKABLE',            usada: false, modo: 'MOCK',  artefacto: 'Calendario editorial 30 días', manual: true },
  { nombre: 'Cloudflare Pages',     status: 'AVAILABLE',           usada: false, modo: 'MOCK',  artefacto: 'Deploy checklist completo', manual: true },
  { nombre: 'Health Dashboard ADV-20', status: 'AVAILABLE',        usada: true,  modo: 'REAL',  artefacto: 'Snapshot de salud del cliente', manual: false },
  { nombre: 'Factory Registry v4.5.0', status: 'AVAILABLE',        usada: true,  modo: 'REAL',  artefacto: 'Integridad del ciclo ADV-01…ADV-21', manual: false },
];

// ─── Paquetes comerciales demo ────────────────────────────────────────────────
export const PAQUETES_COMERCIALES = [
  {
    id: 'pkg-starter',
    nombre: 'Lumen Starter',
    precio: '890 € / mes (demo orientativo)',
    setup: '2.500 € (demo)',
    descripcion: 'Ideal para clínicas que empiezan su transformación digital.',
    incluye: ['Landing web responsive','SaaS básico (agenda + CRM)','5 automatizaciones esenciales','2 agentes IA','Email básico','Soporte mensual 4h'],
  },
  {
    id: 'pkg-professional',
    nombre: 'Lumen Pro',
    precio: '1.690 € / mes (demo orientativo)',
    setup: '4.500 € (demo)',
    descripcion: 'El stack completo para clínicas en crecimiento.',
    incluye: ['Todo en Starter','SaaS completo (15 módulos)','20 automatizaciones Make','9 agentes IA','Social media + email marketing','SEO local 10 keywords','Reporting mensual','Soporte 8h/mes'],
    destacado: true,
  },
  {
    id: 'pkg-enterprise',
    nombre: 'Lumen Enterprise',
    precio: 'Personalizado (demo)',
    setup: 'Personalizado (demo)',
    descripcion: 'Para grupos de clínicas y expansiones multi-sede.',
    incluye: ['Todo en Pro','Multi-sede + multi-equipo','Agentes IA avanzados','Integraciones custom','SLA garantizado','Soporte prioritario 24h/48h'],
  },
];

// ─── Métricas de la fábrica ──────────────────────────────────────────────────
export const FACTORY_METRICS = {
  versionFabrica: '1.8',
  registryVersion: '4.5.0',
  advCiclo: 'ADV-01…ADV-21 (100%)',
  totalTestsFactory: 6277,
  testsDemoCliente: 0, // se ejecutan al final
  archivosGenerados: 18,
  modulosGenerados: 32,
  paginasLanding: 12,
  componentesUI: 47,
  automatizacionesDiseñadas: 20,
  agentesIADefinidos: 9,
  emailsTemplates: 10,
  piezasSocial: 28,
  documentosGenerados: 14,
  artefactosTotales: 140,
  codigoReutilizado: '73%',
  codigoNuevo: '27%',
  tiempoGeneracion: '~22 min',
  timeToNewClient: '4-6 horas de parametrización',
  isReal: false,
};
