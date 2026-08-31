/**
 * Module Planner — Phase 7
 * Produces a detailed module plan from a business profile + vertical resolution.
 * Avoids redundant modules. Classifies CORE / VERTICAL / CLIENT / OPTIONAL.
 */

export const MODULE_PLANNER_VERSION = '1.0.0';

const MODULE_META = Object.freeze({
  dashboard:      { name: 'Dashboard',        purpose: 'KPI overview and quick actions', priority: 1 },
  auth:           { name: 'Auth',             purpose: 'Authentication and session management', priority: 1 },
  roles:          { name: 'RBAC',             purpose: 'Role-based access control', priority: 1 },
  notifications:  { name: 'Notifications',    purpose: 'In-app alerts and reminders', priority: 2 },
  analytics:      { name: 'Analytics',        purpose: 'Usage and business metrics', priority: 2 },
  settings:       { name: 'Settings',         purpose: 'Configuration and preferences', priority: 3 },
  support:        { name: 'Support',          purpose: 'Help and chat support', priority: 3 },
  booking:        { name: 'Citas / Reservas', purpose: 'Appointment booking flow', priority: 1 },
  calendar:       { name: 'Calendario',       purpose: 'Schedule visualization', priority: 2 },
  patients:       { name: 'Pacientes',        purpose: 'Patient records management', priority: 1 },
  clients:        { name: 'Clientes',         purpose: 'Client CRM and records', priority: 1 },
  history:        { name: 'Historial',        purpose: 'Clinical or interaction history', priority: 1 },
  treatments:     { name: 'Tratamientos',     purpose: 'Treatment plans and execution', priority: 2 },
  vaccinations:   { name: 'Vacunas',          purpose: 'Vaccination records and schedule', priority: 2 },
  reminders:      { name: 'Recordatorios',    purpose: 'Automated appointment reminders', priority: 2 },
  chatbot:        { name: 'Chatbot IA',       purpose: 'AI-powered conversational assistant', priority: 2 },
  payments:       { name: 'Pagos',            purpose: 'Payment processing (demo)', priority: 2 },
  inventory:      { name: 'Inventario',       purpose: 'Stock and resource management', priority: 3 },
  reports:        { name: 'Informes',         purpose: 'Business reporting and exports', priority: 3 },
  documents:      { name: 'Documentos',       purpose: 'Document storage and management', priority: 3 },
  gallery:        { name: 'Galería',          purpose: 'Image and media gallery', priority: 3 },
  crm:            { name: 'CRM',             purpose: 'Lead and pipeline management', priority: 2 },
  loyalty:        { name: 'Fidelización',     purpose: 'Loyalty points and programs', priority: 3 },
  ecommerce:      { name: 'Tienda',           purpose: 'Product catalog and orders', priority: 2 },
  pets:           { name: 'Mascotas',         purpose: 'Pet profiles and records', priority: 1 },
  owners:         { name: 'Propietarios',     purpose: 'Pet owner management', priority: 1 },
  'medical-history':{ name: 'Historial Médico', purpose: 'Full medical record per patient/pet', priority: 1 },
  students:       { name: 'Alumnos',          purpose: 'Student enrollment and tracking', priority: 1 },
  courses:        { name: 'Cursos',           purpose: 'Course catalog and management', priority: 1 },
  cases:          { name: 'Expedientes',      purpose: 'Legal case management', priority: 1 },
  sessions:       { name: 'Sesiones',         purpose: 'Treatment session tracking', priority: 2 },
  exercises:      { name: 'Ejercicios',       purpose: 'Exercise library and plans', priority: 3 },
  evolution:      { name: 'Evolución',        purpose: 'Patient progress tracking', priority: 2 },
  budget:         { name: 'Presupuestos',     purpose: 'Cost estimates and quotes', priority: 3 },
});

const CORE_MODULE_IDS = new Set(['auth','roles','dashboard','notifications','analytics','settings','support']);

function classifyModule(moduleId, verticalModules, clientModules) {
  if (CORE_MODULE_IDS.has(moduleId)) return 'CORE_MODULE';
  if (verticalModules.includes(moduleId)) return 'VERTICAL_MODULE';
  if (clientModules.includes(moduleId)) return 'CLIENT_MODULE';
  return 'OPTIONAL_MODULE';
}

function resolveDataDeps(moduleId) {
  const deps = {
    booking:    ['clients', 'calendar'],
    patients:   ['history', 'treatments'],
    pets:       ['owners', 'medical-history', 'vaccinations'],
    owners:     ['pets'],
    chatbot:    [],
    payments:   ['clients', 'booking'],
    reminders:  ['booking', 'clients'],
    reports:    ['analytics', 'dashboard'],
    vaccinations:['pets', 'medical-history'],
  };
  return deps[moduleId] ?? [];
}

function resolveAutomationDeps(moduleId, automationNeeds) {
  const depsMap = {
    reminders:  ['booking-confirmation', 'appointment-reminder'],
    booking:    ['booking-confirmation'],
    chatbot:    ['conversation-log'],
    payments:   ['payment-confirmation'],
  };
  const potential = depsMap[moduleId] ?? [];
  return potential.filter(a => automationNeeds.includes(a) || automationNeeds.length === 0);
}

/**
 * Build a detailed module plan.
 * @param {Object} profile   - businessProfile from analyzer
 * @param {Object} resolution - verticalResolution
 * @param {Object} brief     - validated brief
 * @returns {Object} modulePlan
 */
export function planModules(profile = {}, resolution = {}, brief = {}) {
  const verticalMods = resolution.layers?.VERTICAL?.modules ?? [];
  const clientMods   = resolution.layers?.CLIENT?.modules   ?? [];
  const allModuleIds = resolution.allModules ?? [];

  const modules = allModuleIds.map(id => {
    const meta        = MODULE_META[id] ?? { name: id, purpose: `${id} module`, priority: 3 };
    const classification = classifyModule(id, verticalMods, clientMods);
    const dataDeps    = resolveDataDeps(id);
    const automationDeps = resolveAutomationDeps(id, brief.automationNeeds ?? []);
    const aiDeps      = (brief.aiNeeds ?? []).includes(id) ? ['ai-router'] : [];

    const rolesWithAccess = (brief.roles ?? ['admin', 'client']).filter(r => {
      if (classification === 'CORE_MODULE') return true;
      if (r === 'admin') return true;
      if (r === 'client' && ['booking', 'chatbot', 'dashboard'].includes(id)) return true;
      return !['auth', 'roles', 'settings'].includes(id) && r !== 'client';
    });

    return {
      moduleId:         id,
      name:             meta.name,
      purpose:          meta.purpose,
      classification,
      priority:         meta.priority,
      roles:            rolesWithAccess,
      dataDependencies: dataDeps,
      automationDependencies: automationDeps,
      aiDependencies:   aiDeps,
      status:           'planned',
    };
  });

  // Sort by priority
  modules.sort((a, b) => a.priority - b.priority);

  const byClass = {
    CORE_MODULE:     modules.filter(m => m.classification === 'CORE_MODULE'),
    VERTICAL_MODULE: modules.filter(m => m.classification === 'VERTICAL_MODULE'),
    CLIENT_MODULE:   modules.filter(m => m.classification === 'CLIENT_MODULE'),
    OPTIONAL_MODULE: modules.filter(m => m.classification === 'OPTIONAL_MODULE'),
  };

  return {
    total:         modules.length,
    modules,
    byClassification: byClass,
    coreCount:     byClass.CORE_MODULE.length,
    verticalCount: byClass.VERTICAL_MODULE.length,
    clientCount:   byClass.CLIENT_MODULE.length,
    optionalCount: byClass.OPTIONAL_MODULE.length,
    sector:        profile.sector ?? brief.sector ?? resolution.requestedSector ?? 'default',
    plannerVersion: MODULE_PLANNER_VERSION,
  };
}
