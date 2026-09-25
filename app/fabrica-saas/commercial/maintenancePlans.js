/**
 * Maintenance Plans
 * Service targets (not legal SLA). Describes response goals, included work and limits.
 */

export const MAINTENANCE_PLANS_VERSION = '1.0.0';

export const MAINTENANCE_CATALOG = Object.freeze({

  BASIC: {
    id:              'BASIC',
    name:            'Mantenimiento Básico',
    monthlyPriceRange:{ min: 70, max: 100, currency: 'EUR' },
    responseTarget:  '48h laborables',
    includedHours:   2,
    bugFixScope:     'Bugs críticos (app no arranca, data loss)',
    updates:         'Parches de seguridad urgentes',
    monitoring:      false,
    backupChecks:    'MENSUAL',
    securityChecks:  'MENSUAL',
    minorChanges:    false,
    supportChannels: ['email'],
    excludedWork:    ['Funcionalidad nueva', 'Cambios de diseño', 'Migraciones', 'Integraciones nuevas'],
    emergencyHandling:'Notificación en 48h. Sin SLA garantizado.',
    notes:           'Para negocios con bajo volumen y tolerancia a esperas. Cubre lo básico.',
  },

  PRO: {
    id:              'PRO',
    name:            'Mantenimiento Pro',
    monthlyPriceRange:{ min: 160, max: 220, currency: 'EUR' },
    responseTarget:  '24h laborables',
    includedHours:   5,
    bugFixScope:     'Bugs críticos y funcionales. Errores de datos.',
    updates:         'Seguridad + mejoras menores de librerías',
    monitoring:      true,
    backupChecks:    'SEMANAL',
    securityChecks:  'MENSUAL',
    minorChanges:    true,
    supportChannels: ['email', 'ticket'],
    excludedWork:    ['Funcionalidad nueva mayor', 'Rediseño', 'Migraciones complejas'],
    emergencyHandling:'Revisión en 24h. Protocolo de incidencias definido.',
    notes:           'El más equilibrado. Incluye horas para ajustes y cambios menores.',
  },

  PRIORITY: {
    id:              'PRIORITY',
    name:            'Mantenimiento Prioritario',
    monthlyPriceRange:{ min: 320, max: 420, currency: 'EUR' },
    responseTarget:  '4h laborables (críticos)',
    includedHours:   10,
    bugFixScope:     'Todos los bugs. Degradaciones de rendimiento.',
    updates:         'Seguridad + mejoras + actualizaciones proactivas',
    monitoring:      true,
    backupChecks:    'DIARIO',
    securityChecks:  'SEMANAL',
    minorChanges:    true,
    supportChannels: ['email', 'ticket', 'whatsapp_text'],
    excludedWork:    ['Proyecto nuevo no relacionado', 'Formación no acordada'],
    emergencyHandling:'Disponibilidad prioritaria. Objetivo: <4h respuesta crítica.',
    notes:           'Para negocios donde el SaaS es crítico para la operativa diaria.',
  },

});

export function getMaintenancePlan(planId) {
  return MAINTENANCE_CATALOG[planId] ?? null;
}

export function listMaintenancePlanIds() {
  return Object.keys(MAINTENANCE_CATALOG);
}

export function recommendMaintenancePlan(packageTier) {
  const map = { ESSENTIAL: 'BASIC', PRO: 'PRO', PREMIUM: 'PRIORITY' };
  return map[packageTier] ?? 'BASIC';
}
