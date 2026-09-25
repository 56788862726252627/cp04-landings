/**
 * Scope Builder
 * Unites diagnosis + requirements + commercial package to produce a defined scope.
 * Prevents scope creep via explicit included/excluded/deferred separation.
 */

import { LIMITS_REGISTRY }           from '../commercial/serviceLimits.js';
import { getPackage }                from '../commercial/packages.js';
import { getAddonById }              from '../commercial/addons.js';
import { getThirdPartyCostById }     from '../commercial/thirdPartyCosts.js';

export const SCOPE_BUILDER_VERSION = '1.0.0';

/**
 * @param {Object} requirements - from buildRequirements()
 * @param {Object} recommendation - from recommendCommercialPackage()
 * @param {Object} onboarding - validated onboarding
 * @returns {Object} ClientScope
 */
export function buildClientScope(requirements = {}, recommendation = {}, onboarding = {}) {
  const data        = onboarding.data ?? onboarding;
  const tier        = recommendation.recommendedPackage ?? 'PRO';
  const pkg         = getPackage(tier) ?? {};
  const limits      = LIMITS_REGISTRY[tier] ?? {};
  const reqList     = requirements.requirements ?? [];
  const addons      = recommendation.recommendedAddons ?? [];

  // --- Included scope ---
  const includedScope = [];

  // Always included: landing + admin + booking
  includedScope.push('Landing page comercial');
  includedScope.push('Panel de administración');
  includedScope.push('Sistema de reservas y calendario');
  includedScope.push('Gestión de clientes');
  includedScope.push('Notificaciones por email');
  includedScope.push(`Hasta ${limits.maxModules ?? 8} módulos funcionales`);
  includedScope.push(`Hasta ${limits.maxAutomations ?? 5} automatizaciones Make`);
  includedScope.push(`Hasta ${limits.maxRoles ?? 4} roles de usuario`);
  includedScope.push(`Despliegue en Cloudflare Pages`);
  includedScope.push(`${limits.includedSupportMonths ?? 3} mes(es) de soporte post-entrega`);

  if ((limits.maxAiAgents ?? 0) > 0) {
    includedScope.push(`Hasta ${limits.maxAiAgents} agente(s) IA`);
  }

  // P0 requirements always go into included
  const p0Reqs = reqList.filter(r => r.priority === 'P0');
  for (const r of p0Reqs) {
    if (!includedScope.some(s => s.toLowerCase().includes(r.description.slice(0, 20).toLowerCase()))) {
      includedScope.push(r.description);
    }
  }

  // --- Excluded scope ---
  const excludedScope = [
    'Contenido real (textos, fotos, vídeos propios del cliente)',
    'Fotografía o diseño gráfico no relacionado con el SaaS',
    'Gestión de redes sociales',
    'Campañas de publicidad (Google Ads, Meta Ads)',
    'Soporte legal o compliance externo',
    'Integraciones no especificadas en el scope',
    'Migraciones de datos no contempladas en el paquete',
    'Formación no incluida en el paquete seleccionado',
  ];

  // --- Optional scope (P2/P3 requirements) ---
  const optionalScope = [];
  const p2Reqs = reqList.filter(r => r.priority === 'P2');
  for (const r of p2Reqs) {
    optionalScope.push({ description: r.description, type: 'addon_required', reqId: r.id });
  }

  // --- Deferred scope ---
  const deferredScope = [];
  const p3Reqs = reqList.filter(r => r.priority === 'P3');
  for (const r of p3Reqs) {
    deferredScope.push({ description: r.description, reason: 'Fase 2 — baja prioridad' });
  }

  // --- Responsibilities ---
  const clientResponsibilities = [
    'Proveer contenido (textos, imágenes, logo)',
    'Confirmar requisitos funcionales en cada fase',
    'Disponibilidad para sesiones de validación (2-4h/semana)',
    'Crear y gestionar cuentas de terceros (Supabase, Make, dominio)',
    'Aprobar diseño antes de desarrollo',
    'Realizar pruebas de aceptación',
    'Proporcionar credenciales necesarias (sin compartir contraseñas)',
  ];

  const agencyResponsibilities = [
    'Diseño, desarrollo y configuración del SaaS',
    'Configuración de automatizaciones Make',
    'Despliegue en Cloudflare Pages',
    'QA funcional antes de entrega',
    'Documentación de uso básica',
    `${limits.includedSupportMonths ?? 3} mes(es) de soporte post-entrega incluido`,
  ];

  if ((limits.maxAiAgents ?? 0) > 0) {
    agencyResponsibilities.push('Configuración de agentes IA (el cliente provee API key)');
  }

  // --- Third-party dependencies ---
  const thirdPartyIds = ['supabase', 'smtp-email', 'domain', 'cloudflare-pages'];
  if ((limits.maxAutomations ?? 0) > 0) thirdPartyIds.push('make');
  if ((limits.maxAiAgents ?? 0) > 0)    thirdPartyIds.push('anthropic-api');
  if (data.requiredChannels?.includes('whatsapp')) thirdPartyIds.push('whatsapp-api');

  const thirdPartyDependencies = thirdPartyIds
    .map(id => getThirdPartyCostById(id))
    .filter(Boolean)
    .map(c => ({ id: c.id, name: c.name, responsibility: c.responsibility, monthlyEstimate: c.monthlyEstimate }));

  // --- Assumptions ---
  const assumptions = [
    'El scope se basa en la información del onboarding. Cambios significativos pueden requerir re-estimación.',
    'Los plazos asumen disponibilidad del cliente para validaciones semanales.',
    'Las automatizaciones dependen de una cuenta Make activa del cliente.',
    `El diseño sigue el estándar de la Factory (tier ${tier}).`,
    'Los módulos opcionales requieren add-on o están fuera del precio base.',
  ];

  // --- Add-ons included ---
  const includedAddons = addons
    .map(id => getAddonById(id))
    .filter(Boolean);

  // --- Scope summary ---
  const antiScopeCreep = [
    'Toda nueva funcionalidad no contemplada aquí requiere Change Request formal.',
    'Los cambios de diseño aprobados en producción se facturan como Change Request MINOR.',
    'Los módulos adicionales no incluidos requieren add-on o revisión de paquete.',
  ];

  return {
    tier,
    packageName:           pkg.name ?? tier,
    includedScope,
    excludedScope,
    optionalScope,
    deferredScope,
    clientResponsibilities,
    agencyResponsibilities,
    thirdPartyDependencies,
    assumptions,
    includedAddons,
    antiScopeCreep,
    limits: {
      modules:      limits.maxModules,
      automations:  limits.maxAutomations,
      roles:        limits.maxRoles,
      aiAgents:     limits.maxAiAgents,
      integrations: limits.maxIntegrations,
    },
    version: SCOPE_BUILDER_VERSION,
  };
}
