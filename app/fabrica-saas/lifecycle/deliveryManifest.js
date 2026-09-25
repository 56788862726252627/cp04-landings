/**
 * Delivery Manifest Generator
 * Produces a complete DELIVERY_MANIFEST for client handoff.
 * NO real secrets. NO real credentials. Credential plan only.
 */

import { recommendMaintenancePlan } from '../commercial/maintenancePlans.js';

export const DELIVERY_MANIFEST_VERSION = '1.0.0';

/**
 * @param {Object} productionBrief  - ClientProductionBrief from factoryHandoff
 * @param {Object} scope            - ClientScope
 * @param {Object} tracking         - ProductionTracking (final state)
 * @param {Object} estimate         - CommercialEstimate
 * @returns {Object} DeliveryManifest
 */
// eslint-disable-next-line no-unused-vars
export function generateDeliveryManifest(productionBrief = {}, scope = {}, tracking = {}, estimate = {}) {
  const brief = productionBrief.businessBrief ?? {};
  const tier  = productionBrief.commercialConstraints?.approvedTier ?? 'PRO';

  const modules = Object.values(tracking.components ?? {})
    .filter(c => c.status === 'DONE' && ['modules', 'landing', 'app'].includes(c.id))
    .map(c => c.id);

  const credentialsNeeded = [
    { service: 'Supabase', owner: 'CLIENT', action: 'Mantener cuenta activa', cost: '€0–25/mes' },
    { service: 'Make',     owner: 'CLIENT', action: 'Mantener plan activo', cost: '€9–29/mes' },
    { service: 'Dominio',  owner: 'CLIENT', action: 'Renovar anualmente', cost: '~€12–20/año' },
    { service: 'Cloudflare Pages', owner: 'AGENCY_MANAGED', action: 'Mantenido por agencia', cost: '€0' },
  ];
  if ((productionBrief.aiPlan ?? []).length > 0) {
    credentialsNeeded.push({ service: 'Anthropic API', owner: 'CLIENT', action: 'Mantener API key activa', cost: 'Uso variable' });
  }

  const maintenancePlan = recommendMaintenancePlan(tier);

  const futureImprovements = [
    ...(scope.deferredScope ?? []).map(d => `Fase 2: ${d.action}`),
    ...(scope.optionalScope ?? []).map(o => `Opcional: ${o.description}`),
  ].slice(0, 5);

  return {
    manifestType:   'DELIVERY_MANIFEST',
    disclaimer:     'Este documento NO incluye contraseñas, tokens, ni secretos. Las credenciales son propiedad del cliente y deben ser gestionadas directamente por el cliente.',
    version:        DELIVERY_MANIFEST_VERSION,

    projectSummary: {
      businessName: brief.businessName,
      sector:       brief.sector,
      tier,
      deliveredAt:  new Date().toISOString().split('T')[0],
    },

    deliveredScope:      scope.includedScope ?? [],
    modules,
    roles:               productionBrief.roles ?? ['admin', 'owner'],
    integrations:        (productionBrief.integrations ?? []).map(i => i.description),
    automationManifest:  (productionBrief.makePlan ?? []).map(m => m.automation),
    aiManifest:          (productionBrief.aiPlan ?? []).map(a => a.agent),

    credentialsNeeded,

    setupInstructions: [
      'El cliente debe confirmar acceso a su cuenta Supabase.',
      'Verificar dominio y DNS apuntan correctamente.',
      'Activar escenarios Make en la cuenta del cliente.',
      'El cliente debe introducir su API key de IA si aplica.',
    ],

    adminInstructions: [
      'Acceder al panel de administración en /admin.',
      'Crear usuarios con los roles correspondientes.',
      'Revisar configuración de notificaciones y recordatorios.',
    ],

    userInstructions: [
      'Los usuarios finales acceden por la landing page.',
      'El sistema de reservas está disponible 24/7.',
      'Las notificaciones se envían automáticamente por email.',
    ],

    knownLimitations: [
      'El sistema no incluye gestión de inventario físico.',
      'Las automatizaciones Make dependen del plan activo del cliente.',
      `El paquete ${tier} incluye máx. ${scope.limits?.modules ?? 8} módulos — módulos adicionales requieren add-on.`,
    ],

    thirdPartyCosts:    (scope.thirdPartyDependencies ?? []).map(d => ({
      service:     d.name,
      monthly:     d.monthlyEstimate,
      paidBy:      d.responsibility,
    })),

    maintenancePlan,
    supportWindow:      tier === 'PREMIUM' ? 30 : tier === 'PRO' ? 14 : 7,

    rollbackNotes: [
      'Supabase mantiene backups automáticos. Contactar soporte de Supabase para restore.',
      'Cloudflare Pages permite desplegar versiones anteriores desde el dashboard.',
    ],

    futureImprovements,
  };
}
