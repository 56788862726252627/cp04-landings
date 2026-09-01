// Role Experience Resolver — ADV-07

export const ROLE_TYPE = Object.freeze({
  ADMIN:        'ADMIN',
  STAFF:        'STAFF',
  SUPPORT:      'SUPPORT',
  USER:         'USER',
  PROFESSIONAL: 'PROFESSIONAL',
  MANAGER:      'MANAGER',
});

const ROLE_EXPERIENCE_SPECS = Object.freeze({
  ADMIN: {
    defaultHome:       'dashboard',
    navigationDensity: 'FULL',
    dashboardPriority: ['metrics', 'users', 'system', 'activity'],
    canSeeFinancials:  true,
    motionLevel:       'STANDARD',
  },
  MANAGER: {
    defaultHome:       'dashboard',
    navigationDensity: 'FULL',
    dashboardPriority: ['metrics', 'team', 'reports'],
    canSeeFinancials:  true,
    motionLevel:       'STANDARD',
  },
  STAFF: {
    defaultHome:       'agenda',
    navigationDensity: 'REDUCED',
    dashboardPriority: ['agenda', 'tasks', 'clients'],
    canSeeFinancials:  false,
    motionLevel:       'STANDARD',
  },
  PROFESSIONAL: {
    defaultHome:       'agenda',
    navigationDensity: 'REDUCED',
    dashboardPriority: ['agenda', 'patients', 'notes'],
    canSeeFinancials:  false,
    motionLevel:       'LOW',
  },
  SUPPORT: {
    defaultHome:       'clients',
    navigationDensity: 'MINIMAL',
    dashboardPriority: ['tickets', 'clients'],
    canSeeFinancials:  false,
    motionLevel:       'STANDARD',
  },
  USER: {
    defaultHome:       'home',
    navigationDensity: 'MINIMAL',
    dashboardPriority: ['appointments', 'services'],
    canSeeFinancials:  false,
    motionLevel:       'STANDARD',
  },
});

export function resolveRoleExperience(role = ROLE_TYPE.USER) {
  const spec = ROLE_EXPERIENCE_SPECS[role] ?? ROLE_EXPERIENCE_SPECS.USER;
  return Object.freeze({ role, ...spec, isReal: false });
}

export function buildRoleMatrix(roles = []) {
  return Object.freeze({
    roles,
    experiences: Object.fromEntries(roles.map(r => [r, resolveRoleExperience(r)])),
    isReal: false,
  });
}

export const ROLE_EXPERIENCE_RESOLVER_VERSION = '1.0.0';
