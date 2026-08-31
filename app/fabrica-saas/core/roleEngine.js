/**
 * Role Engine — Phase 8
 * Generates roles + permissions from brief + sector.
 * No insecure defaults. Principle of least privilege.
 */

export const ROLE_ENGINE_VERSION = '1.0.0';

// ─── Role Archetypes ──────────────────────────────────────────────────────────

const ROLE_ARCHETYPES = Object.freeze({
  admin: {
    label: 'Administrador', icon: '🔧',
    defaultPermissions: ['read:all', 'write:all', 'delete:own', 'manage:roles', 'manage:settings'],
    navPattern: 'full-sidebar',
  },
  staff: {
    label: 'Personal', icon: '👤',
    defaultPermissions: ['read:clients', 'write:appointments', 'read:reports'],
    navPattern: 'limited-sidebar',
  },
  professional: {
    label: 'Profesional', icon: '⚕️',
    defaultPermissions: ['read:patients', 'write:treatments', 'write:notes', 'read:appointments'],
    navPattern: 'professional-sidebar',
  },
  client: {
    label: 'Cliente', icon: '👥',
    defaultPermissions: ['read:own', 'write:own:appointments', 'read:own:history'],
    navPattern: 'client-minimal',
  },
  support: {
    label: 'Soporte', icon: '🎧',
    defaultPermissions: ['read:clients', 'read:appointments', 'write:notes'],
    navPattern: 'support-sidebar',
  },
  reception: {
    label: 'Recepción', icon: '🗄️',
    defaultPermissions: ['read:clients', 'write:appointments', 'read:schedule'],
    navPattern: 'reception-sidebar',
  },
  teacher: {
    label: 'Docente', icon: '🎓',
    defaultPermissions: ['read:students', 'write:grades', 'write:attendance', 'read:courses'],
    navPattern: 'teacher-sidebar',
  },
  student: {
    label: 'Alumno', icon: '📚',
    defaultPermissions: ['read:own:courses', 'read:own:grades'],
    navPattern: 'student-minimal',
  },
  veterinarian: {
    label: 'Veterinario', icon: '🩺',
    defaultPermissions: ['read:pets', 'write:medical-history', 'write:treatments', 'write:vaccinations', 'read:appointments'],
    navPattern: 'professional-sidebar',
  },
  owner: {
    label: 'Propietario de mascota', icon: '🐾',
    defaultPermissions: ['read:own:pets', 'write:own:appointments', 'read:own:history'],
    navPattern: 'client-minimal',
  },
  lawyer: {
    label: 'Abogado', icon: '⚖️',
    defaultPermissions: ['read:cases', 'write:documents', 'read:clients', 'write:billing'],
    navPattern: 'professional-sidebar',
  },
  family: {
    label: 'Familiar', icon: '👨‍👩‍👧',
    defaultPermissions: ['read:own:family', 'write:own:appointments'],
    navPattern: 'client-minimal',
  },
});

const SECTOR_DEFAULT_ROLES = Object.freeze({
  dental:     ['admin', 'reception', 'professional', 'client'],
  salud:      ['admin', 'reception', 'professional', 'client'],
  fisio:      ['admin', 'reception', 'professional', 'client'],
  estetica:   ['admin', 'staff', 'client'],
  spa:        ['admin', 'staff', 'client'],
  padel:      ['admin', 'staff', 'client'],
  fitness:    ['admin', 'staff', 'client'],
  tech:       ['admin', 'staff', 'client', 'support'],
  educacion:  ['admin', 'teacher', 'student', 'family'],
  legal:      ['admin', 'lawyer', 'client'],
  consultoria:['admin', 'professional', 'client'],
  restaurante:['admin', 'staff', 'client'],
  comercio:   ['admin', 'staff', 'client'],
  veterinary: ['admin', 'reception', 'veterinarian', 'owner'],
  portfolio:  ['admin', 'client'],
  analytics:  ['admin', 'staff', 'client'],
  default:    ['admin', 'staff', 'client'],
});

function resolveVisibleModules(roleId, allModules, brief) {
  const role = ROLE_ARCHETYPES[roleId];
  if (!role) return allModules.slice(0, 3);

  if (roleId === 'admin') return allModules;

  const clientAllowed = ['dashboard', 'booking', 'chatbot', 'history', 'medical-history'];
  const briefRequired = brief.requiredModules ?? [];
  const clientRoles = new Set(['client', 'student', 'owner', 'family']);
  if (clientRoles.has(roleId)) {
    return allModules.filter(m => clientAllowed.includes(m) || briefRequired.includes(m));
  }

  const restrictedFromAll = new Set(['auth', 'roles', 'settings', 'analytics']);
  return allModules.filter(m => !restrictedFromAll.has(m));
}

function resolveRestrictedModules(roleId, allModules) {
  const clientRoles = new Set(['client', 'student', 'owner', 'family']);
  const adminOnly   = new Set(['auth', 'roles', 'settings', 'analytics', 'reports']);
  if (roleId === 'admin') return [];
  if (clientRoles.has(roleId)) return allModules.filter(m => !['dashboard', 'booking', 'chatbot', 'history', 'medical-history'].includes(m));
  return [...adminOnly];
}

/**
 * Generate roles for a business.
 * @param {Object} brief      - validated brief
 * @param {Object} modulePlan - module plan
 * @returns {Object} rolePlan
 */
export function planRoles(brief = {}, modulePlan = {}) {
  const sector       = brief.sector ?? 'default';
  const briefRoles   = brief.roles ?? [];
  const sectorRoles  = SECTOR_DEFAULT_ROLES[sector] ?? SECTOR_DEFAULT_ROLES.default;
  const allModules   = (modulePlan.modules ?? []).map(m => m.moduleId);

  // Merge: use brief roles if provided, supplement with sector defaults
  const roleIds = briefRoles.length > 0 ? [...new Set([...briefRoles, 'admin'])] : sectorRoles;

  const roles = roleIds.map(roleId => {
    const archetype       = ROLE_ARCHETYPES[roleId] ?? {
      label: roleId, icon: '👤',
      defaultPermissions: ['read:own'],
      navPattern: 'client-minimal',
    };
    const visibleModules    = resolveVisibleModules(roleId, allModules, brief);
    const restrictedModules = resolveRestrictedModules(roleId, allModules);

    return {
      roleId,
      name:            archetype.label,
      icon:            archetype.icon,
      permissions:     archetype.defaultPermissions,
      visibleModules,
      restrictedModules,
      navigation:      archetype.navPattern,
      actions:         archetype.defaultPermissions.filter(p => p.startsWith('write:')).map(p => p.replace('write:', '')),
      secureByDefault: true,
    };
  });

  const adminRole = roles.find(r => r.roleId === 'admin');
  if (!adminRole) {
    const adminArchetype = ROLE_ARCHETYPES.admin;
    roles.unshift({
      roleId: 'admin', name: adminArchetype.label, icon: adminArchetype.icon,
      permissions: adminArchetype.defaultPermissions,
      visibleModules: allModules, restrictedModules: [],
      navigation: adminArchetype.navPattern,
      actions: ['all'], secureByDefault: true,
    });
  }

  return {
    total: roles.length,
    roles,
    adminRole: roles.find(r => r.roleId === 'admin')?.roleId,
    clientRoles: roles.filter(r => ['client', 'student', 'owner', 'family'].includes(r.roleId)).map(r => r.roleId),
    professionalRoles: roles.filter(r => ['professional', 'veterinarian', 'teacher', 'lawyer'].includes(r.roleId)).map(r => r.roleId),
    secureByDefault: true,
    engineVersion: ROLE_ENGINE_VERSION,
  };
}
